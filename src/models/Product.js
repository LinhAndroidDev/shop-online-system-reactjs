// Product Model
export class Product {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || '';
    this.description = data.description || '';
    this.categoryId = data.categoryId || '';
    this.categoryName = data.categoryName || '';
    this.price = data.price || 0;
    this.thumbnail = data.thumbnail || '';
    this.images = data.images || [];
    this.status = data.status || 'active'; // active, inactive
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export default Product;

