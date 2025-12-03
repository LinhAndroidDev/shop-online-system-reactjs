import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, message, Space, Tag, Card, Statistic, Alert } from 'antd';
import { EditOutlined, PlusOutlined, MinusOutlined, WarningOutlined, DatabaseOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import inventoryController from '../controllers/InventoryController';
import colors from '../config/colors';

const InventoryManagement = () => {
  const [inventories, setInventories] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [isOutOfStockReportVisible, setIsOutOfStockReportVisible] = useState(false);
  const [isLowStockReportVisible, setIsLowStockReportVisible] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [stockType, setStockType] = useState('in'); // 'in' or 'out'
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Đồng bộ inventory với sản phẩm mỗi khi load
    inventoryController.syncWithProducts();
    loadInventories();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadInventories = () => {
    const data = inventoryController.getAll();
    setInventories(data);
    setLowStockItems(inventoryController.getLowStockItems());
    setOutOfStockItems(inventoryController.getOutOfStockItems());
  };

  const handleUpdateQuantity = (record) => {
    setEditingInventory(record);
    form.setFieldsValue({ quantity: record.quantity });
    setIsModalVisible(true);
  };

  const handleStockIn = (record) => {
    setEditingInventory(record);
    setStockType('in');
    stockForm.resetFields();
    setIsStockModalVisible(true);
  };

  const handleStockOut = (record) => {
    setEditingInventory(record);
    setStockType('out');
    stockForm.resetFields();
    setIsStockModalVisible(true);
  };

  const handleUpdateQuantitySubmit = async () => {
    try {
      const values = await form.validateFields();
      inventoryController.updateQuantity(editingInventory.productId, values.quantity, 'set');
      message.success('Cập nhật số lượng thành công');
      setIsModalVisible(false);
      form.resetFields();
      loadInventories();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleStockSubmit = async () => {
    try {
      const values = await stockForm.validateFields();
      if (stockType === 'in') {
        inventoryController.stockIn(editingInventory.productId, values.quantity);
        message.success('Nhập kho thành công');
      } else {
        inventoryController.stockOut(editingInventory.productId, values.quantity);
        message.success('Xuất kho thành công');
      }
      setIsStockModalVisible(false);
      stockForm.resetFields();
      loadInventories();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        // Check stock status
        let color = colors.success;
        if (quantity === 0) color = colors.danger;
        else if (quantity <= record.minStock) color = colors.warning;
        
        return (
          <Tag color={color}>
            {quantity}
          </Tag>
        );
      },
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleUpdateQuantity(record)}
          >
            Sửa số lượng
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleStockIn(record)}
            style={{ backgroundColor: colors.success }}
          >
            Nhập kho
          </Button>
          <Button
            type="primary"
            icon={<MinusOutlined />}
            onClick={() => handleStockOut(record)}
            style={{ backgroundColor: colors.warning }}
          >
            Xuất kho
          </Button>
        </Space>
      ),
    },
  ];

  const handleShowOutOfStockReport = () => {
    setIsOutOfStockReportVisible(true);
  };

  const handleShowLowStockReport = () => {
    setIsLowStockReportVisible(true);
  };

  const outOfStockColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Tag color={colors.danger}>{quantity}</Tag>
      ),
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
  ];

  const lowStockColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Tag color={colors.warning}>{quantity}</Tag>
      ),
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
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
          <h2 style={{ margin: 0 }}>Quản lý Kho</h2>
          <Space wrap>
            <Button
              type="primary"
              danger
              icon={<ExclamationCircleOutlined />}
              onClick={handleShowOutOfStockReport}
              disabled={outOfStockItems.length === 0}
            >
              Báo cáo hết hàng ({outOfStockItems.length})
            </Button>
            <Button
              type="primary"
              icon={<WarningOutlined />}
              onClick={handleShowLowStockReport}
              disabled={lowStockItems.length === 0}
              style={{ backgroundColor: colors.warning }}
            >
              Cảnh báo tồn kho thấp ({lowStockItems.length})
            </Button>
          </Space>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: '20px' }}>
          <Card>
            <Statistic
              title="Tổng số sản phẩm"
              value={inventories.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>

          {outOfStockItems.length > 0 && (
            <Alert
              message="Cảnh báo: Hết hàng"
              description={`Có ${outOfStockItems.length} sản phẩm đã hết hàng`}
              type="error"
              icon={<WarningOutlined />}
              showIcon
            />
          )}

          {lowStockItems.length > 0 && (
            <Alert
              message="Cảnh báo: Tồn kho thấp"
              description={`Có ${lowStockItems.length} sản phẩm có tồn kho thấp`}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
            />
          )}
        </Space>

        <Table
          columns={columns}
          dataSource={inventories}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          size="small"
        />

        <Modal
          title="Cập nhật số lượng"
          open={isModalVisible}
          onOk={handleUpdateQuantitySubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={stockType === 'in' ? 'Nhập kho' : 'Xuất kho'}
          open={isStockModalVisible}
          onOk={handleStockSubmit}
          onCancel={() => {
            setIsStockModalVisible(false);
            stockForm.resetFields();
          }}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Form form={stockForm} layout="vertical">
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Báo cáo hết hàng"
          open={isOutOfStockReportVisible}
          onCancel={() => setIsOutOfStockReportVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsOutOfStockReportVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={isMobile ? '95%' : 800}
        >
          <Alert
            message={`Có tổng cộng ${outOfStockItems.length} sản phẩm đã hết hàng`}
            type="error"
            icon={<ExclamationCircleOutlined />}
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <Table
            columns={outOfStockColumns}
            dataSource={outOfStockItems}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Modal>

        <Modal
          title="Cảnh báo tồn kho thấp"
          open={isLowStockReportVisible}
          onCancel={() => setIsLowStockReportVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsLowStockReportVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={isMobile ? '95%' : 800}
        >
          <Alert
            message={`Có tổng cộng ${lowStockItems.length} sản phẩm có tồn kho thấp`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <Table
            columns={lowStockColumns}
            dataSource={lowStockItems}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Modal>
      </div>
    </MainLayout>
  );
};

export default InventoryManagement;

