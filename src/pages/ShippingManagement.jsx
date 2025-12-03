import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Descriptions } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import shippingController from '../controllers/ShippingController';
import orderController from '../controllers/OrderController';
import colors from '../config/colors';

const ShippingManagement = () => {
  const [shipments, setShipments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadShipments();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadShipments = () => {
    const data = shippingController.getAll();
    setShipments(data);
  };

  const handleViewDetail = (record) => {
    setSelectedShipment(record);
    setIsDetailModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingShipment(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleStatusChange = (id, status) => {
    shippingController.updateStatus(id, status);
    message.success('Cập nhật trạng thái vận chuyển thành công');
    loadShipments();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingShipment) {
        shippingController.update(editingShipment.id, values);
        message.success('Cập nhật thông tin vận chuyển thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadShipments();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getStatusColor = (status) => {
    return colors.shipmentStatus[status] || colors.dark;
  };

  const getStatusLabel = (status) => {
    const labels = {
      picking: 'Đang lấy hàng',
      shipping: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Mã vận đơn',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
    },
    {
      title: 'Người vận chuyển',
      dataIndex: 'shipperName',
      key: 'shipperName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'shipperPhone',
      key: 'shipperPhone',
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
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
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
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Select
            value={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 150 }}
          >
            <Select.Option value="picking">Đang lấy hàng</Select.Option>
            <Select.Option value="shipping">Đang vận chuyển</Select.Option>
            <Select.Option value="delivered">Đã giao hàng</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        <h2 style={{ marginBottom: '20px' }}>Quản lý Vận chuyển</h2>

        <Table
          columns={columns}
          dataSource={shipments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          size="small"
        />

        <Modal
          title="Sửa thông tin vận chuyển"
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="shipperName"
              label="Tên người vận chuyển"
              rules={[{ required: true, message: 'Vui lòng nhập tên người vận chuyển' }]}
            >
              <Input placeholder="Nhập tên người vận chuyển" />
            </Form.Item>
            <Form.Item
              name="shipperPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              name="trackingNumber"
              label="Mã vận đơn"
            >
              <Input placeholder="Nhập mã vận đơn" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Chi tiết vận chuyển"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={isMobile ? '95%' : 700}
        >
          {selectedShipment && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID">
                {selectedShipment.id}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">
                {selectedShipment.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn">
                {selectedShipment.trackingNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedShipment.status)}>
                  {getStatusLabel(selectedShipment.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người vận chuyển">
                {selectedShipment.shipperName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedShipment.shipperPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu">
                {new Date(selectedShipment.startTime).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian giao hàng">
                {selectedShipment.deliveredTime
                  ? new Date(selectedShipment.deliveredTime).toLocaleString('vi-VN')
                  : 'Chưa giao hàng'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ShippingManagement;

