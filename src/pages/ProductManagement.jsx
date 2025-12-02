import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Tag, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import productController from '../controllers/ProductController';
import categoryController from '../controllers/CategoryController';
import colors from '../config/colors';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = () => {
    const data = productController.getAll();
    // Tạo array mới để đảm bảo React nhận ra sự thay đổi
    setProducts([...data]);
  };

  const loadCategories = () => {
    const data = categoryController.getAll();
    setCategories(data);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      images: record.images || [],
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      onOk: () => {
        if (productController.delete(id)) {
          message.success('Xóa sản phẩm thành công');
          loadProducts();
        } else {
          message.error('Xóa sản phẩm thất bại');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        productController.update(editingProduct.id, values);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        productController.create(values);
        message.success('Thêm sản phẩm thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadProducts();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleImageUpload = (file, fileList, field) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (field === 'thumbnail') {
        form.setFieldsValue({ thumbnail: e.target.result });
      } else {
        const currentImages = form.getFieldValue('images') || [];
        form.setFieldsValue({ images: [...currentImages, e.target.result] });
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleRemoveImage = (index) => {
    const currentImages = form.getFieldValue('images') || [];
    currentImages.splice(index, 1);
    form.setFieldsValue({ images: currentImages });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      render: (text) => (
        <Image
          width={50}
          height={50}
          src={text || 'https://via.placeholder.com/50'}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? colors.status.active : colors.status.inactive}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
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
          <h2>Quản lý Sản phẩm</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ backgroundColor: colors.primary }}
          >
            Thêm sản phẩm
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          okText="Lưu"
          cancelText="Hủy"
          width={800}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={4} placeholder="Nhập mô tả" />
            </Form.Item>
            <Form.Item
              name="price"
              label="Giá"
              rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập giá"
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="inactive">Không hoạt động</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="thumbnail"
              label="Ảnh thumbnail"
            >
              <Upload
                beforeUpload={(file) => handleImageUpload(file, [], 'thumbnail')}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh thumbnail</Button>
              </Upload>
              {form.getFieldValue('thumbnail') && (
                <div style={{ marginTop: 10 }}>
                  <Image
                    width={100}
                    src={form.getFieldValue('thumbnail')}
                    alt="thumbnail"
                  />
                </div>
              )}
            </Form.Item>
            <Form.Item
              name="images"
              label="Ảnh mô tả (có thể thêm nhiều)"
            >
              <Upload
                beforeUpload={(file) => handleImageUpload(file, [], 'images')}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Thêm ảnh mô tả</Button>
              </Upload>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(form.getFieldValue('images') || []).map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <Image
                      width={100}
                      height={100}
                      src={img}
                      style={{ objectFit: 'cover' }}
                    />
                    <Button
                      danger
                      size="small"
                      style={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProductManagement;

