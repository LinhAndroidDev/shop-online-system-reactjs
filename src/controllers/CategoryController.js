// Category Controller
import Category from '../models/Category';

class CategoryController {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/category';
    this.categories = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('categories');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  async getAll() {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      
      if (result.status === 200 && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to localStorage if API fails
      return [...this.categories];
    }
  }

  async getById(id) {
    try {
      // First try to get from API
      const allCategories = await this.getAll();
      const category = allCategories.find(cat => cat.id === id);
      if (category) {
        return category;
      }
    } catch (error) {
      console.error('Error fetching category by id:', error);
    }
    // Fallback to localStorage
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

