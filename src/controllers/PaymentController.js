// Payment Controller
import Payment from '../models/Payment';
import orderController from './OrderController';

class PaymentController {
  constructor() {
    this.payments = this.loadFromStorage();
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

