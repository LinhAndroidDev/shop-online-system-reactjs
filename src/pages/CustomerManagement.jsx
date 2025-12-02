import { useState, useEffect } from 'react';
import { Table, Button, Modal, Tag, Descriptions, message, Space, Tabs } from 'antd';
import { EyeOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import customerController from '../controllers/CustomerController';
import colors from '../config/colors';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const data = customerController.getAll();
    // Tạo array mới để đảm bảo React nhận ra sự thay đổi
    setCustomers([...data]);
  };

  const handleViewDetail = (record) => {
    setSelectedCustomer(record);
    const history = customerController.getPurchaseHistory(record.id);
    setPurchaseHistory(history);
    setIsDetailModalVisible(true);
  };

  const handleToggleLock = (id) => {
    const customer = customerController.toggleLock(id);
    if (customer) {
      message.success(
        customer.status === 'locked'
          ? 'Đã khóa tài khoản khách hàng'
          : 'Đã mở khóa tài khoản khách hàng'
      );
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(customer);
      }
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa khách hàng này?',
      onOk: () => {
        if (customerController.delete(id)) {
          message.success('Xóa khách hàng thành công');
          loadCustomers();
        } else {
          message.error('Xóa khách hàng thất bại');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? colors.status.active : colors.status.inactive}>
          {status === 'active' ? 'Hoạt động' : 'Đã khóa'}
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
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type={record.status === 'active' ? 'default' : 'primary'}
            icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleLock(record.id)}
            danger={record.status === 'active'}
          >
            {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const purchaseHistoryColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
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
        <Tag color={colors.orderStatus[status] || colors.dark}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
  ];

  return (
    <MainLayout>
      <div>
        <h2 style={{ marginBottom: '20px' }}>Quản lý Khách hàng</h2>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Chi tiết khách hàng"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedCustomer && (
            <Tabs
              items={[
                {
                  key: 'info',
                  label: 'Thông tin',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="ID">
                        {selectedCustomer.id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tên">
                        {selectedCustomer.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {selectedCustomer.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {selectedCustomer.phone}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        {selectedCustomer.address}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag
                          color={
                            selectedCustomer.status === 'active'
                              ? colors.status.active
                              : colors.status.inactive
                          }
                        >
                          {selectedCustomer.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">
                        {new Date(selectedCustomer.createdAt).toLocaleString('vi-VN')}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: 'addresses',
                  label: 'Địa chỉ giao hàng',
                  children: (
                    <div>
                      {selectedCustomer.shippingAddresses &&
                      selectedCustomer.shippingAddresses.length > 0 ? (
                        selectedCustomer.shippingAddresses.map((addr, index) => (
                          <div
                            key={addr.id || index}
                            style={{
                              padding: '10px',
                              marginBottom: '10px',
                              border: `1px solid ${colors.border.light}`,
                              borderRadius: '4px',
                            }}
                          >
                            <p>
                              <strong>Địa chỉ:</strong> {addr.address}
                            </p>
                            <p>
                              <strong>Thành phố:</strong> {addr.city || 'N/A'}
                            </p>
                            <p>
                              <strong>Quận/Huyện:</strong> {addr.district || 'N/A'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>Chưa có địa chỉ giao hàng</p>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'history',
                  label: 'Lịch sử mua hàng',
                  children: (
                    <Table
                      columns={purchaseHistoryColumns}
                      dataSource={purchaseHistory}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  ),
                },
              ]}
            />
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default CustomerManagement;

