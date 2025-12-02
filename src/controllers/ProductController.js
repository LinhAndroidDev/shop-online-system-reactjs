// Product Controller
import Product from '../models/Product';
import categoryController from './CategoryController';
import inventoryController from './InventoryController';

class ProductController {
  constructor() {
    this.products = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  getAll() {
    return this.products.map(product => {
      const category = categoryController.getById(product.categoryId);
      return {
        ...product,
        categoryName: category ? category.name : 'N/A',
      };
    });
  }

  getById(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      const category = categoryController.getById(product.categoryId);
      return {
        ...product,
        categoryName: category ? category.name : 'N/A',
      };
    }
    return null;
  }

  getByCategoryId(categoryId) {
    return this.products.filter(p => p.categoryId === categoryId);
  }

  create(data) {
    const product = new Product(data);
    this.products.push(product);
    this.saveToStorage();
    
    // Tự động tạo inventory cho sản phẩm mới
    inventoryController.getByProductId(product.id);
    
    return product;
  }

  update(id, data) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      
      // Cập nhật tên sản phẩm trong inventory nếu có thay đổi
      if (data.name) {
        const inventory = inventoryController.getByProductId(id);
        if (inventory) {
          inventory.productName = data.name;
          inventoryController.saveToStorage();
        }
      }
      
      return this.products[index];
    }
    return null;
  }

  delete(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveToStorage();
      
      // Xóa inventory khi xóa sản phẩm
      inventoryController.deleteByProductId(id);
      
      return true;
    }
    return false;
  }
}

export default new ProductController();

