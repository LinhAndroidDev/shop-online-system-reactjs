import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import colors from '../config/colors';

const CATEGORY_API = 'http://localhost:8080/api/category';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORY_API);
      const json = await res.json();
      if (json.status === 200 && Array.isArray(json.data)) {
        setCategories(json.data);
      } else {
        message.error(json.message || 'Không thể tải danh mục');
      }
    } catch (error) {
      message.error('Lỗi khi gọi API danh mục');
      // eslint-disable-next-line no-console
      console.error('Fetch categories error:', error);
    }
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
          const res = await fetch(`${CATEGORY_API}/${id}`, {
            method: 'DELETE',
          });
          const json = await res.json();
          if (json.status === 200) {
            message.success('Xóa danh mục thành công');
            await fetchCategories();
          } else {
            message.error(json.message || 'Xóa danh mục thất bại');
          }
        } catch (error) {
          // eslint-disable-next-line no-console
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
        const res = await fetch(CATEGORY_API, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingCategory.id,
            name: values.name,
          }),
        });
        const json = await res.json();
        if (json.status === 200) {
          message.success('Cập nhật danh mục thành công');
        } else {
          message.error(json.message || 'Cập nhật danh mục thất bại');
          return;
        }
      } else {
        const res = await fetch(CATEGORY_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.name,
          }),
        });
        const json = await res.json();
        if (json.status === 200) {
          message.success('Thêm danh mục thành công');
        } else {
          message.error(json.message || 'Thêm danh mục thất bại');
          return;
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      await fetchCategories();
    } catch (error) {
      // eslint-disable-next-line no-console
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
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Quản lý Danh mục</h2>
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
          scroll={{ x: 'max-content' }}
          size="small"
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

