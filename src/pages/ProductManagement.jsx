import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Tag, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import productController from '../controllers/ProductController';
import categoryController from '../controllers/CategoryController';
import colors from '../config/colors';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);


  const loadProducts = () => {
    const data = productController.getAll();
    // Tạo array mới để đảm bảo React nhận ra sự thay đổi
    // Map lại để đảm bảo mỗi object là một instance mới
    setProducts(data.map(product => ({ ...product })));
  };

  const loadCategories = () => {
    const data = categoryController.getAll();
    setCategories(data);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setThumbnailPreview(null);
    setImagesPreview([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    const thumbnail = record.thumbnail || null;
    const images = Array.isArray(record.images) ? record.images : [];
    setThumbnailPreview(thumbnail);
    setImagesPreview(images);
    form.setFieldsValue({
      ...record,
      thumbnail: thumbnail,
      images: images,
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
      // Đảm bảo thumbnail và images từ preview state được lưu
      // Sử dụng thumbnailPreview nếu có, nếu không thì dùng values.thumbnail
      // Nếu thumbnailPreview được set thành null (đã xóa), thì dùng empty string
      const submitData = {
        ...values,
        thumbnail: thumbnailPreview !== undefined ? (thumbnailPreview || '') : (values.thumbnail || ''),
        images: imagesPreview.length > 0 ? imagesPreview : (values.images || []),
      };
      
      if (editingProduct) {
        productController.update(editingProduct.id, submitData);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        productController.create(submitData);
        message.success('Thêm sản phẩm thành công');
      }
      setIsModalVisible(false);
      setThumbnailPreview(null);
      setImagesPreview([]);
      form.resetFields();
      // Force reload để đảm bảo UI được cập nhật
      setTimeout(() => {
        loadProducts();
      }, 100);
    } catch (error) {
      // Validation failed
    }
  };

  const handleImageUpload = (file, fileList, field) => {
    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return false;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      
      // Sử dụng setTimeout để đảm bảo cập nhật state ngoài quá trình render
      setTimeout(() => {
        if (field === 'thumbnail') {
          setThumbnailPreview(imageData);
          form.setFieldsValue({ thumbnail: imageData });
        } else if (field === 'images') {
          // Sử dụng functional update để đảm bảo lấy state mới nhất
          setImagesPreview((prevImages) => {
            const newImages = [...prevImages, imageData];
            // Cập nhật form value sau khi state đã được cập nhật
            setTimeout(() => {
              form.setFieldsValue({ images: newImages });
            }, 0);
            return newImages;
          });
        }
      }, 0);
    };
    reader.onerror = () => {
      message.error('Lỗi khi đọc file ảnh');
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleRemoveImage = (index) => {
    // Sử dụng functional update để tránh lỗi state transition
    setImagesPreview((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      // Cập nhật form value sau khi state đã được cập nhật
      setTimeout(() => {
        form.setFieldsValue({ images: newImages });
      }, 0);
      return newImages;
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
            setThumbnailPreview(null);
            setImagesPreview([]);
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Upload
                  beforeUpload={(file) => handleImageUpload(file, [], 'thumbnail')}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh thumbnail</Button>
                </Upload>
                {thumbnailPreview && (
                  <div 
                    style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget.querySelector('button');
                      if (btn) btn.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget.querySelector('button');
                      if (btn) btn.style.opacity = '0.6';
                    }}
                  >
                    <Image
                      width={120}
                      height={120}
                      src={thumbnailPreview}
                      alt="thumbnail"
                      style={{ 
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #d9d9d9',
                        display: 'block'
                      }}
                    />
                    <Button
                      size="small"
                      icon={<CloseOutlined style={{ color: '#fff' }} />}
                      style={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        minWidth: '28px',
                        height: '28px',
                        padding: 0,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        border: 'none',
                        opacity: 0.6,
                        transition: 'opacity 0.3s ease',
                        zIndex: 10
                      }}
                      onClick={() => {
                        setThumbnailPreview(null);
                        form.setFieldsValue({ thumbnail: '' });
                      }}
                    />
                  </div>
                )}
              </div>
            </Form.Item>
            <Form.Item
              name="images"
              label="Ảnh mô tả (có thể thêm nhiều)"
            >
              <Upload
                beforeUpload={(file) => handleImageUpload(file, [], 'images')}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Thêm ảnh mô tả</Button>
              </Upload>
              <div style={{ marginTop: 10 }} key={`images-preview-${imagesPreview.length}`}>
                {Array.isArray(imagesPreview) && imagesPreview.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {imagesPreview.map((img, index) => {
                      if (!img) return null;
                      return (
                        <div 
                          key={`img-preview-${index}-${Date.now()}`} 
                          style={{ 
                            position: 'relative', 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '4px', 
                            padding: '4px', 
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.primary;
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#d9d9d9';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Image
                            width={100}
                            height={100}
                            src={img}
                            style={{ 
                              objectFit: 'cover', 
                              borderRadius: '4px', 
                              display: 'block',
                              cursor: 'pointer',
                            }}
                            preview={{
                              mask: 'Xem ảnh',
                            }}
                            alt={`Ảnh mô tả ${index + 1}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <Button
                            danger
                            size="small"
                            type="primary"
                            style={{ position: 'absolute', top: 4, right: 4, minWidth: '24px', height: '24px', padding: 0, zIndex: 10 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: '#999', fontSize: '12px', marginTop: 5 }}>
                    Chưa có ảnh mô tả. Click nút "Thêm ảnh mô tả" để thêm.
                  </div>
                )}
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProductManagement;

