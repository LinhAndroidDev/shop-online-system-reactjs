// Order Model
export class Order {
  constructor(data = {}) {
    this.id = data.id || `ORD-${Date.now()}`;
    this.customerId = data.customerId || '';
    this.customerName = data.customerName || '';
    this.customerEmail = data.customerEmail || '';
    this.items = data.items || []; // Array of {productId, productName, quantity, price}
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || 'pending'; // pending, processing, shipping, completed, cancelled
    this.shippingAddress = data.shippingAddress || {};
    this.paymentMethod = data.paymentMethod || '';
    this.paymentStatus = data.paymentStatus || 'pending';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export default Order;

