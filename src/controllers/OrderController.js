// Order Controller
import Order from '../models/Order';
import inventoryController from './InventoryController';

class OrderController {
  constructor() {
    this.orders = this.loadFromStorage();
    this.initializeSampleData();
  }

  initializeSampleData() {
    if (this.orders.length === 0) {
      const sampleOrders = [
        {
          id: 'ORD-001',
          customerId: 'CUST-001',
          customerName: 'Nguyễn Văn An',
          customerEmail: 'nguyenvanan@email.com',
          items: [
            { productId: 'p1', productName: 'Áo thun nam', quantity: 2, price: 150000 },
            { productId: 'p2', productName: 'Quần jean', quantity: 1, price: 500000 }
          ],
          totalAmount: 800000,
          status: 'pending',
          shippingAddress: {
            address: '123 Đường ABC, Quận 1, TP.HCM',
            city: 'TP.HCM',
            district: 'Quận 1'
          },
          paymentMethod: 'bank_transfer',
          paymentStatus: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ORD-002',
          customerId: 'CUST-002',
          customerName: 'Trần Thị Bình',
          customerEmail: 'tranthibinh@email.com',
          items: [
            { productId: 'p3', productName: 'Váy đầm nữ', quantity: 1, price: 350000 }
          ],
          totalAmount: 350000,
          status: 'processing',
          shippingAddress: {
            address: '789 Đường DEF, Quận 5, TP.HCM',
            city: 'TP.HCM',
            district: 'Quận 5'
          },
          paymentMethod: 'e_wallet',
          paymentStatus: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ORD-003',
          customerId: 'CUST-001',
          customerName: 'Nguyễn Văn An',
          customerEmail: 'nguyenvanan@email.com',
          items: [
            { productId: 'p4', productName: 'Giày thể thao', quantity: 1, price: 800000 },
            { productId: 'p5', productName: 'Tất', quantity: 3, price: 50000 }
          ],
          totalAmount: 950000,
          status: 'shipping',
          shippingAddress: {
            address: '456 Đường XYZ, Quận 3, TP.HCM',
            city: 'TP.HCM',
            district: 'Quận 3'
          },
          paymentMethod: 'bank_transfer',
          paymentStatus: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ORD-004',
          customerId: 'CUST-003',
          customerName: 'Lê Văn Cường',
          customerEmail: 'levancuong@email.com',
          items: [
            { productId: 'p6', productName: 'Áo khoác', quantity: 1, price: 600000 }
          ],
          totalAmount: 600000,
          status: 'completed',
          shippingAddress: {
            address: '321 Đường GHI, Quận 7, TP.HCM',
            city: 'TP.HCM',
            district: 'Quận 7'
          },
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ORD-005',
          customerId: 'CUST-004',
          customerName: 'Phạm Thị Dung',
          customerEmail: 'phamthidung@email.com',
          items: [
            { productId: 'p7', productName: 'Túi xách', quantity: 1, price: 450000 }
          ],
          totalAmount: 450000,
          status: 'cancelled',
          shippingAddress: {
            address: '654 Đường JKL, Quận 10, TP.HCM',
            city: 'TP.HCM',
            district: 'Quận 10'
          },
          paymentMethod: 'e_wallet',
          paymentStatus: 'refunded',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ORD-006',
          customerId: 'CUST-005',
          customerName: 'Hoàng Văn Em',
          customerEmail: 'hoangvanem@email.com',
          items: [
            { productId: 'p8', productName: 'Đồng hồ', quantity: 1, price: 1200000 }
          ],
          totalAmount: 1200000,
          status: 'completed',
          shippingAddress: {
            address: '987 Đường MNO, Quận Bình Thạnh, TP.HCM',
            city: 'TP.HCM',
            district: 'Quận Bình Thạnh'
          },
          paymentMethod: 'bank_transfer',
          paymentStatus: 'completed',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.orders = sampleOrders;
      this.saveToStorage();
    }
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

