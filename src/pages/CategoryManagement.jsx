import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import categoryController from '../controllers/CategoryController';
import colors from '../config/colors';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const data = categoryController.getAll();
    // Tạo array mới để đảm bảo React nhận ra sự thay đổi
    setCategories([...data]);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa danh mục này?',
      onOk: async () => {
        try {
          if (categoryController.delete(id)) {
            message.success('Xóa danh mục thành công');
            // Đảm bảo state được cập nhật ngay lập tức
            loadCategories();
          } else {
            message.error('Xóa danh mục thất bại');
          }
        } catch (error) {
          console.error('Delete error:', error);
          message.error('Xóa danh mục thất bại');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        categoryController.update(editingCategory.id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        categoryController.create(values);
        message.success('Thêm danh mục thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadCategories();
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
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
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

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản lý Danh mục</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ backgroundColor: colors.primary }}
          >
            Thêm danh mục
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
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
              name="name"
              label="Tên danh mục"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={4} placeholder="Nhập mô tả" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default CategoryManagement;

