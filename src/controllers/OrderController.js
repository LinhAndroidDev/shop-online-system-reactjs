// Order Controller
import Order from '../models/Order';
import inventoryController from './InventoryController';

class OrderController {
  constructor() {
    this.orders = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('orders');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  getAll() {
    return this.orders;
  }

  getById(id) {
    return this.orders.find(order => order.id === id);
  }

  getByStatus(status) {
    return this.orders.filter(order => order.status === status);
  }

  create(data) {
    const order = new Order(data);
    this.orders.push(order);
    this.saveToStorage();
    return order;
  }

  updateStatus(id, status) {
    const order = this.getById(id);
    if (order) {
      const oldStatus = order.status;
      order.status = status;
      order.updatedAt = new Date().toISOString();
      
      // Update inventory when order is completed or cancelled
      if (status === 'completed' && oldStatus !== 'completed') {
        // Inventory already reduced when order was created
      } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
        // Restore inventory
        order.items.forEach(item => {
          inventoryController.stockIn(item.productId, item.quantity);
        });
      }
      
      this.saveToStorage();
      return order;
    }
    return null;
  }

  delete(id) {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.orders.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  sendNotification(orderId, type = 'email') {
    const order = this.getById(orderId);
    if (order) {
      // Simulate sending notification
      console.log(`Sending ${type} notification to ${order.customerEmail} for order ${orderId}`);
      return true;
    }
    return false;
  }
}

export default new OrderController();

