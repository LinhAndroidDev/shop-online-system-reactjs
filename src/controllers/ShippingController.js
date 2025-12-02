// Shipping Controller
import Shipping from '../models/Shipping';

class ShippingController {
  constructor() {
    this.shipments = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('shipments');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('shipments', JSON.stringify(this.shipments));
  }

  getAll() {
    return this.shipments;
  }

  getById(id) {
    return this.shipments.find(shipment => shipment.id === id);
  }

  getByOrderId(orderId) {
    return this.shipments.find(shipment => shipment.orderId === orderId);
  }

  getByStatus(status) {
    return this.shipments.filter(shipment => shipment.status === status);
  }

  create(data) {
    const shipping = new Shipping(data);
    this.shipments.push(shipping);
    this.saveToStorage();
    return shipping;
  }

  updateStatus(id, status) {
    const shipment = this.getById(id);
    if (shipment) {
      shipment.status = status;
      shipment.updatedAt = new Date().toISOString();
      
      if (status === 'delivered') {
        shipment.deliveredTime = new Date().toISOString();
      }
      
      this.saveToStorage();
      return shipment;
    }
    return null;
  }

  update(id, data) {
    const index = this.shipments.findIndex(s => s.id === id);
    if (index !== -1) {
      this.shipments[index] = {
        ...this.shipments[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.shipments[index];
    }
    return null;
  }

  delete(id) {
    const index = this.shipments.findIndex(s => s.id === id);
    if (index !== -1) {
      this.shipments.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }
}

export default new ShippingController();

