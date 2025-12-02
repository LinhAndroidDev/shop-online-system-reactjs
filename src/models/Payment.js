// Payment Model
export class Payment {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.orderId = data.orderId || '';
    this.amount = data.amount || 0;
    this.method = data.method || ''; // bank_transfer, e_wallet, cash
    this.status = data.status || 'pending'; // pending, completed, refunded
    this.transactionDate = data.transactionDate || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

export default Payment;

