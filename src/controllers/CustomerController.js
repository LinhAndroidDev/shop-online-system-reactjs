// Customer Controller
import Customer from '../models/Customer';
import orderController from './OrderController';

class CustomerController {
  constructor() {
    this.customers = this.loadFromStorage();
    this.initializeSampleData();
  }

  initializeSampleData() {
    if (this.customers.length === 0) {
      const sampleCustomers = [
        {
          id: 'CUST-001',
          name: 'Nguyễn Văn An',
          email: 'nguyenvanan@email.com',
          phone: '0901234567',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          shippingAddresses: [
            {
              id: 'addr-001',
              address: '123 Đường ABC, Quận 1, TP.HCM',
              city: 'TP.HCM',
              district: 'Quận 1',
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'addr-002',
              address: '456 Đường XYZ, Quận 3, TP.HCM',
              city: 'TP.HCM',
              district: 'Quận 3',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          status: 'active',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'CUST-002',
          name: 'Trần Thị Bình',
          email: 'tranthibinh@email.com',
          phone: '0912345678',
          address: '789 Đường DEF, Quận 5, TP.HCM',
          shippingAddresses: [
            {
              id: 'addr-003',
              address: '789 Đường DEF, Quận 5, TP.HCM',
              city: 'TP.HCM',
              district: 'Quận 5',
              createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          status: 'active',
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'CUST-003',
          name: 'Lê Văn Cường',
          email: 'levancuong@email.com',
          phone: '0923456789',
          address: '321 Đường GHI, Quận 7, TP.HCM',
          shippingAddresses: [],
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'CUST-004',
          name: 'Phạm Thị Dung',
          email: 'phamthidung@email.com',
          phone: '0934567890',
          address: '654 Đường JKL, Quận 10, TP.HCM',
          shippingAddresses: [
            {
              id: 'addr-004',
              address: '654 Đường JKL, Quận 10, TP.HCM',
              city: 'TP.HCM',
              district: 'Quận 10',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          status: 'locked',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'CUST-005',
          name: 'Hoàng Văn Em',
          email: 'hoangvanem@email.com',
          phone: '0945678901',
          address: '987 Đường MNO, Quận Bình Thạnh, TP.HCM',
          shippingAddresses: [],
          status: 'active',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.customers = sampleCustomers;
      this.saveToStorage();
    }
  }

  loadFromStorage() {
    const stored = localStorage.getItem('customers');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('customers', JSON.stringify(this.customers));
  }

  getAll() {
    return this.customers;
  }

  getById(id) {
    return this.customers.find(customer => customer.id === id);
  }

  create(data) {
    const customer = new Customer(data);
    this.customers.push(customer);
    this.saveToStorage();
    return customer;
  }

  update(id, data) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = {
        ...this.customers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.customers[index];
    }
    return null;
  }

  delete(id) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  toggleLock(id) {
    const customer = this.getById(id);
    if (customer) {
      customer.status = customer.status === 'active' ? 'locked' : 'active';
      customer.updatedAt = new Date().toISOString();
      this.saveToStorage();
      return customer;
    }
    return null;
  }

  getPurchaseHistory(customerId) {
    return orderController.getAll().filter(order => order.customerId === customerId);
  }

  addShippingAddress(customerId, address) {
    const customer = this.getById(customerId);
    if (customer) {
      if (!customer.shippingAddresses) {
        customer.shippingAddresses = [];
      }
      customer.shippingAddresses.push({
        id: Date.now().toString(),
        ...address,
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage();
      return customer;
    }
    return null;
  }

  removeShippingAddress(customerId, addressId) {
    const customer = this.getById(customerId);
    if (customer && customer.shippingAddresses) {
      customer.shippingAddresses = customer.shippingAddresses.filter(
        addr => addr.id !== addressId
      );
      this.saveToStorage();
      return customer;
    }
    return null;
  }
}

export default new CustomerController();

