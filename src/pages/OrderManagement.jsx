import { useState, useEffect } from 'react';
import { Table, Button, Modal, Select, message, Space, Tag, Descriptions } from 'antd';
import { EyeOutlined, MailOutlined, BellOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import orderController from '../controllers/OrderController';
import colors from '../config/colors';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = () => {
    let data = orderController.getAll();
    if (statusFilter !== 'all') {
      data = data.filter(order => order.status === statusFilter);
    }
    setOrders(data);
  };

  const handleViewDetail = (record) => {
    setSelectedOrder(record);
    setIsDetailModalVisible(true);
  };

  const handleStatusChange = (orderId, newStatus) => {
    orderController.updateStatus(orderId, newStatus);
    message.success('Cập nhật trạng thái đơn hàng thành công');
    loadOrders();
  };

  const handleSendEmail = (orderId) => {
    if (orderController.sendNotification(orderId, 'email')) {
      message.success('Đã gửi email cho khách hàng');
    } else {
      message.error('Gửi email thất bại');
    }
  };

  const handleSendNotification = (orderId) => {
    if (orderController.sendNotification(orderId, 'notification')) {
      message.success('Đã gửi thông báo cho khách hàng');
    } else {
      message.error('Gửi thông báo thất bại');
    }
  };

  const getStatusColor = (status) => {
    return colors.orderStatus[status] || colors.dark;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${amount.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Chi tiết
          </Button>
          <Select
            value={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: isMobile ? 120 : 150 }}
            size="small"
          >
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="processing">Đang xử lý</Select.Option>
            <Select.Option value="shipping">Đang giao hàng</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
          <Button
            icon={<MailOutlined />}
            onClick={() => handleSendEmail(record.id)}
            size="small"
          >
            Email
          </Button>
          <Button
            icon={<BellOutlined />}
            onClick={() => handleSendNotification(record.id)}
            size="small"
          >
            Thông báo
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Quản lý Đơn hàng</h2>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: isMobile ? '100%' : 200 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="processing">Đang xử lý</Select.Option>
            <Select.Option value="shipping">Đang giao hàng</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          size="small"
        />

        <Modal
          title="Chi tiết đơn hàng"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={isMobile ? '95%' : 800}
        >
          {selectedOrder && (
            <div>
              <Descriptions bordered column={isMobile ? 1 : 2}>
                <Descriptions.Item label="Mã đơn hàng">
                  {selectedOrder.id}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                  {selectedOrder.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedOrder.customerEmail}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  {selectedOrder.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                  {selectedOrder.shippingAddress?.address || 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Sản phẩm trong đơn:</h3>
              <Table
                columns={[
                  { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
                  { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                  {
                    title: 'Giá',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `${price.toLocaleString('vi-VN')} đ`,
                  },
                  {
                    title: 'Thành tiền',
                    key: 'total',
                    render: (_, record) =>
                      `${(record.price * record.quantity).toLocaleString('vi-VN')} đ`,
                  },
                ]}
                dataSource={selectedOrder.items}
                rowKey="productId"
                pagination={false}
                size="small"
              />
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default OrderManagement;

