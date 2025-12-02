// Inventory Controller
import Inventory from '../models/Inventory';
import productController from './ProductController';

class InventoryController {
  constructor() {
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

  getAll() {
    // Khởi tạo nếu chưa khởi tạo
    this.initializeInventories();
    
    // Chỉ hiển thị inventory của các sản phẩm còn tồn tại
    const products = productController.getAll();
    const productIds = new Set(products.map(p => p.id));
    
    return this.inventories
      .filter(inv => productIds.has(inv.productId))
      .map(inv => {
        const product = productController.getById(inv.productId);
        return {
          ...inv,
          productName: product ? product.name : 'N/A',
        };
      });
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

  updateQuantity(productId, quantity, type = 'set') {
    let inventory = this.getByProductId(productId);
    if (inventory) {
      if (type === 'set') {
        inventory.quantity = quantity;
      } else if (type === 'add') {
        inventory.quantity += quantity;
      } else if (type === 'subtract') {
        inventory.quantity = Math.max(0, inventory.quantity - quantity);
      }
      inventory.lastUpdated = new Date().toISOString();
      this.saveToStorage();
      return inventory;
    }
    return null;
  }

  stockIn(productId, quantity) {
    return this.updateQuantity(productId, quantity, 'add');
  }

  stockOut(productId, quantity) {
    return this.updateQuantity(productId, quantity, 'subtract');
  }

  getLowStockItems() {
    // Khởi tạo nếu chưa khởi tạo
    this.initializeInventories();
    
    // Chỉ lấy sản phẩm còn tồn tại
    const products = productController.getAll();
    const productIds = new Set(products.map(p => p.id));
    
    return this.inventories.filter(inv => {
      return productIds.has(inv.productId) && inv.quantity > 0 && inv.quantity <= inv.minStock;
    });
  }

  getOutOfStockItems() {
    // Khởi tạo nếu chưa khởi tạo
    this.initializeInventories();
    
    // Chỉ lấy sản phẩm còn tồn tại
    const products = productController.getAll();
    const productIds = new Set(products.map(p => p.id));
    
    return this.inventories.filter(inv => {
      return productIds.has(inv.productId) && inv.quantity === 0;
    });
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

