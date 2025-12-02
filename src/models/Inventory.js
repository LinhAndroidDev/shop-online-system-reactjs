// Inventory Model
export class Inventory {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.productId = data.productId || '';
    this.productName = data.productName || '';
    this.quantity = data.quantity || 0;
    this.minStock = data.minStock || 10; // Minimum stock threshold
    this.maxStock = data.maxStock || 1000;
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
  }
  
  isLowStock() {
    return this.quantity <= this.minStock;
  }
  
  isOutOfStock() {
    return this.quantity === 0;
  }
}

export default Inventory;

