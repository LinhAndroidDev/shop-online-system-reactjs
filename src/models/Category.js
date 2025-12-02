// Category Model
export class Category {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || '';
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export default Category;

