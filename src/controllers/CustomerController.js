// Customer Controller
import Customer from '../models/Customer';
import orderController from './OrderController';

class CustomerController {
  constructor() {
    this.customers = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('customers');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('customers', JSON.stringify(this.customers));
  }

  getAll() {
    return this.customers;
  }

  getById(id) {
    return this.customers.find(customer => customer.id === id);
  }

  create(data) {
    const customer = new Customer(data);
    this.customers.push(customer);
    this.saveToStorage();
    return customer;
  }

  update(id, data) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = {
        ...this.customers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.customers[index];
    }
    return null;
  }

  delete(id) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  toggleLock(id) {
    const customer = this.getById(id);
    if (customer) {
      customer.status = customer.status === 'active' ? 'locked' : 'active';
      customer.updatedAt = new Date().toISOString();
      this.saveToStorage();
      return customer;
    }
    return null;
  }

  getPurchaseHistory(customerId) {
    return orderController.getAll().filter(order => order.customerId === customerId);
  }

  addShippingAddress(customerId, address) {
    const customer = this.getById(customerId);
    if (customer) {
      if (!customer.shippingAddresses) {
        customer.shippingAddresses = [];
      }
      customer.shippingAddresses.push({
        id: Date.now().toString(),
        ...address,
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage();
      return customer;
    }
    return null;
  }

  removeShippingAddress(customerId, addressId) {
    const customer = this.getById(customerId);
    if (customer && customer.shippingAddresses) {
      customer.shippingAddresses = customer.shippingAddresses.filter(
        addr => addr.id !== addressId
      );
      this.saveToStorage();
      return customer;
    }
    return null;
  }
}

export default new CustomerController();

