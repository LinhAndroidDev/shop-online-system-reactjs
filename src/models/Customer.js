// Customer Model
export class Customer {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.shippingAddresses = data.shippingAddresses || [];
    this.status = data.status || 'active'; // active, locked
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export default Customer;

