// Shipping Controller
import Shipping from '../models/Shipping';

class ShippingController {
  constructor() {
    this.shipments = this.loadFromStorage();
    this.initializeSampleData();
  }

  initializeSampleData() {
    if (this.shipments.length === 0) {
      const sampleShipments = [
        {
          id: 'SHIP-001',
          orderId: 'ORD-002',
          shipperName: 'Nguyễn Văn Giao',
          shipperPhone: '0901111111',
          status: 'picking',
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredTime: null,
          trackingNumber: 'TRK-20240102001',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'SHIP-002',
          orderId: 'ORD-003',
          shipperName: 'Trần Văn Vận',
          shipperPhone: '0902222222',
          status: 'shipping',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredTime: null,
          trackingNumber: 'TRK-20240103002',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'SHIP-003',
          orderId: 'ORD-004',
          shipperName: 'Lê Văn Chuyển',
          shipperPhone: '0903333333',
          status: 'delivered',
          startTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          trackingNumber: 'TRK-20240104003',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'SHIP-004',
          orderId: 'ORD-005',
          shipperName: 'Phạm Văn Hủy',
          shipperPhone: '0904444444',
          status: 'cancelled',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredTime: null,
          trackingNumber: 'TRK-20240105004',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'SHIP-005',
          orderId: 'ORD-006',
          shipperName: 'Hoàng Văn Nhanh',
          shipperPhone: '0905555555',
          status: 'delivered',
          startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          trackingNumber: 'TRK-20240106005',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.shipments = sampleShipments;
      this.saveToStorage();
    }
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

