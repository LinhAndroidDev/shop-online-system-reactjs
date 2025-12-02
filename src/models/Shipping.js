// Shipping Model
export class Shipping {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.orderId = data.orderId || '';
    this.shipperName = data.shipperName || '';
    this.shipperPhone = data.shipperPhone || '';
    this.status = data.status || 'picking'; // picking, shipping, delivered, cancelled
    this.startTime = data.startTime || new Date().toISOString();
    this.deliveredTime = data.deliveredTime || null;
    this.trackingNumber = data.trackingNumber || `TRK-${Date.now()}`;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export default Shipping;

