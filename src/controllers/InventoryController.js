// Inventory Controller
import Inventory from '../models/Inventory';
import productController from './ProductController';

class InventoryController {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/inventory';
    this.inventories = this.loadFromStorage();
    this._initialized = false;
  }

  loadFromStorage() {
    const stored = localStorage.getItem('inventories');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('inventories', JSON.stringify(this.inventories));
  }

  initializeInventories() {
    if (this._initialized) return;
    
    try {
      // Lazy initialization để tránh circular dependency
      const products = productController.getAll();
      if (products && Array.isArray(products)) {
        products.forEach(product => {
          if (!this.inventories.find(inv => inv.productId === product.id)) {
            const inventory = new Inventory({
              productId: product.id,
              productName: product.name,
              quantity: 0,
            });
            this.inventories.push(inventory);
          }
        });
        this.saveToStorage();
        this._initialized = true;
      }
    } catch (error) {
      // Nếu productController chưa sẵn sàng, sẽ retry ở lần gọi tiếp theo
      console.warn('Inventory initialization delayed:', error.message);
    }
  }

  async getAll() {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      
      if (result.status === 200 && Array.isArray(result.data)) {
        // Map dữ liệu từ API - productName lấy từ product object trong response
        return result.data.map((item) => {
          return {
            ...item,
            productId: item.product?.id || item.productId,
            productName: item.product?.name || 'N/A',
            lastUpdated: item.updatedAt || item.lastUpdated,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching inventories:', error);
      return [];
    }
  }

  getByProductId(productId) {
    // Khởi tạo nếu chưa khởi tạo
    this.initializeInventories();
    
    let inventory = this.inventories.find(inv => inv.productId === productId);
    if (!inventory) {
      const product = productController.getById(productId);
      if (product) {
        inventory = new Inventory({
          productId: product.id,
          productName: product.name,
          quantity: 0,
        });
        this.inventories.push(inventory);
        this.saveToStorage();
      }
    }
    return inventory;
  }

  async updateQuantity(inventoryId, quantity) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: inventoryId,
          quantity: Number(quantity),
        }),
      });

      const result = await response.json();
      
      if (result.status === 200) {
        // Response có thể là array hoặc object
        const inventoryData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (inventoryData) {
          // Map với productName từ product object trong response
          return {
            ...inventoryData,
            productId: inventoryData.product?.id || inventoryData.productId,
            productName: inventoryData.product?.name || 'N/A',
            lastUpdated: inventoryData.updatedAt || inventoryData.lastUpdated,
          };
        }
        
        return result.data || {};
      }
      
      throw new Error(result.message || `Cập nhật số lượng thất bại (Status: ${result.status})`);
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      throw error;
    }
  }

  async stockIn(inventoryId, quantity) {
    // Lấy inventory hiện tại để tính số lượng mới
    const inventories = await this.getAll();
    const currentInventory = inventories.find(inv => inv.id === inventoryId);
    
    if (currentInventory) {
      const newQuantity = currentInventory.quantity + Number(quantity);
      return await this.updateQuantity(inventoryId, newQuantity);
    }
    throw new Error('Không tìm thấy inventory');
  }

  async stockOut(inventoryId, quantity) {
    // Lấy inventory hiện tại để tính số lượng mới
    const inventories = await this.getAll();
    const currentInventory = inventories.find(inv => inv.id === inventoryId);
    
    if (currentInventory) {
      const newQuantity = Math.max(0, currentInventory.quantity - Number(quantity));
      return await this.updateQuantity(inventoryId, newQuantity);
    }
    throw new Error('Không tìm thấy inventory');
  }

  async getLowStockItems() {
    const inventories = await this.getAll();
    return inventories.filter(inv => {
      return inv.quantity > 0 && inv.quantity <= (inv.minStock || 0);
    });
  }

  async getOutOfStockItems() {
    const inventories = await this.getAll();
    return inventories.filter(inv => inv.quantity === 0);
  }

  deleteByProductId(productId) {
    const index = this.inventories.findIndex(inv => inv.productId === productId);
    if (index !== -1) {
      this.inventories.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  syncWithProducts() {
    // Khởi tạo nếu chưa khởi tạo
    this.initializeInventories();
    
    // Đồng bộ inventory với danh sách sản phẩm hiện tại
    const products = productController.getAll();
    const productIds = new Set(products.map(p => p.id));
    
    // Xóa inventory của sản phẩm không còn tồn tại
    this.inventories = this.inventories.filter(inv => productIds.has(inv.productId));
    
    // Tạo inventory cho sản phẩm mới
    products.forEach(product => {
      if (!this.inventories.find(inv => inv.productId === product.id)) {
        const inventory = new Inventory({
          productId: product.id,
          productName: product.name,
          quantity: 0,
        });
        this.inventories.push(inventory);
      } else {
        // Cập nhật tên sản phẩm trong inventory
        const inventory = this.inventories.find(inv => inv.productId === product.id);
        if (inventory) {
          inventory.productName = product.name;
        }
      }
    });
    
    this.saveToStorage();
  }
}

export default new InventoryController();

