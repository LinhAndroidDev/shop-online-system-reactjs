// Category Controller
import Category from '../models/Category';

class CategoryController {
  constructor() {
    this.categories = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('categories');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  getAll() {
    // Trả về một bản sao mới để đảm bảo React nhận ra sự thay đổi
    return [...this.categories];
  }

  getById(id) {
    return this.categories.find(cat => cat.id === id);
  }

  create(data) {
    const category = new Category(data);
    this.categories.push(category);
    this.saveToStorage();
    return category;
  }

  update(id, data) {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      this.categories[index] = {
        ...this.categories[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.categories[index];
    }
    return null;
  }

  delete(id) {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }
}

export default new CategoryController();

