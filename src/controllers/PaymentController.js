// Payment Controller
import Payment from '../models/Payment';
import orderController from './OrderController';

class PaymentController {
  constructor() {
    this.payments = this.loadFromStorage();
    this.initializeSampleData();
  }

  initializeSampleData() {
    if (this.payments.length === 0) {
      const samplePayments = [
        {
          id: 'PAY-001',
          orderId: 'ORD-001',
          amount: 800000,
          method: 'bank_transfer',
          status: 'pending',
          transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'PAY-002',
          orderId: 'ORD-002',
          amount: 350000,
          method: 'e_wallet',
          status: 'completed',
          transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'PAY-003',
          orderId: 'ORD-003',
          amount: 950000,
          method: 'bank_transfer',
          status: 'completed',
          transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'PAY-004',
          orderId: 'ORD-004',
          amount: 600000,
          method: 'cash',
          status: 'completed',
          transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'PAY-005',
          orderId: 'ORD-005',
          amount: 450000,
          method: 'e_wallet',
          status: 'refunded',
          transactionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'PAY-006',
          orderId: 'ORD-006',
          amount: 1200000,
          method: 'bank_transfer',
          status: 'completed',
          transactionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.payments = samplePayments;
      this.saveToStorage();
    }
  }

  loadFromStorage() {
    const stored = localStorage.getItem('payments');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('payments', JSON.stringify(this.payments));
  }

  getAll() {
    return this.payments;
  }

  getById(id) {
    return this.payments.find(payment => payment.id === id);
  }

  getByOrderId(orderId) {
    return this.payments.find(payment => payment.orderId === orderId);
  }

  create(data) {
    const payment = new Payment(data);
    this.payments.push(payment);
    this.saveToStorage();
    return payment;
  }

  updateStatus(id, status) {
    const payment = this.getById(id);
    if (payment) {
      payment.status = status;
      this.saveToStorage();
      return payment;
    }
    return null;
  }

  getRevenueByDate(startDate, endDate) {
    return this.payments
      .filter(p => {
        const date = new Date(p.transactionDate);
        return date >= new Date(startDate) && date <= new Date(endDate) && p.status === 'completed';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getRevenueByMonth(year, month) {
    return this.payments
      .filter(p => {
        const date = new Date(p.transactionDate);
        return date.getFullYear() === year && 
               date.getMonth() === month - 1 && 
               p.status === 'completed';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getRevenueByProduct(productId) {
    const orders = orderController.getAll();
    return orders
      .filter(order => {
        return order.items.some(item => item.productId === productId) && 
               order.status === 'completed';
      })
      .reduce((sum, order) => {
        const productTotal = order.items
          .filter(item => item.productId === productId)
          .reduce((s, item) => s + (item.price * item.quantity), 0);
        return sum + productTotal;
      }, 0);
  }

  getRefundedAmount() {
    return this.payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getCancelledOrdersRevenue() {
    const orders = orderController.getByStatus('cancelled');
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  getTotalProfit() {
    const totalRevenue = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const refunded = this.getRefundedAmount();
    return totalRevenue - refunded;
  }
}

export default new PaymentController();

