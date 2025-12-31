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
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadProducts();
    loadCategories();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productController.getAll();
      // Tạo array mới để đảm bảo React nhận ra sự thay đổi
      setProducts(data.map(product => ({ ...product })));
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryController.getAll();
      setCategories(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách danh mục: ' + error.message);
    }
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
    
    // Convert status từ ACTIVE/INACTIVE về active/inactive cho form
    const statusForForm = record.status?.toLowerCase() || 'active';
    
    form.setFieldsValue({
      ...record,
      status: statusForForm,
      thumbnail: thumbnail,
      images: images,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      onOk: async () => {
        try {
          const result = await productController.delete(id);
          if (result && result.success) {
            message.success(result.message || 'Xóa sản phẩm thành công');
          } else {
            message.success('Xóa sản phẩm thành công');
          }
          loadProducts();
        } catch (error) {
          message.error('Xóa sản phẩm thất bại: ' + error.message);
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
        categoryId: values.categoryId,
        name: values.name,
        description: values.description || '',
        thumbnail: thumbnailPreview !== undefined ? (thumbnailPreview || '') : (values.thumbnail || ''),
        price: values.price,
        status: values.status || 'active', // Sẽ được convert sang ACTIVE/INACTIVE trong controller
        images: imagesPreview.length > 0 ? imagesPreview : (values.images || []), // Thêm trường images
      };
      
      if (editingProduct) {
        await productController.update(editingProduct.id, submitData);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productController.create(submitData);
        message.success('Thêm sản phẩm thành công');
      }
      setIsModalVisible(false);
      setThumbnailPreview(null);
      setImagesPreview([]);
      form.resetFields();
      // Reload danh sách sản phẩm
      await loadProducts();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi lưu sản phẩm';
      message.error(errorMessage);
    }
  };

  const handleImageUpload = async (file, fileList, field) => {
    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return false;
    }
    
    // Upload ảnh lên server
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      message.loading({ content: 'Đang upload ảnh...', key: 'upload' });
      
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        const imageUrl = result.data;
        message.success({ content: result.message || 'Upload thành công', key: 'upload' });
        
        // Cập nhật state với URL ảnh từ server
        if (field === 'thumbnail') {
          setThumbnailPreview(imageUrl);
          form.setFieldsValue({ thumbnail: imageUrl });
        } else if (field === 'images') {
          setImagesPreview((prevImages) => {
            const newImages = [...prevImages, imageUrl];
            setTimeout(() => {
              form.setFieldsValue({ images: newImages });
            }, 0);
            return newImages;
          });
        }
      } else {
        message.error({ content: result.message || 'Upload thất bại', key: 'upload' });
      }
    } catch (error) {
      message.error({ content: 'Lỗi khi upload ảnh: ' + error.message, key: 'upload' });
    }
    
    return false; // Prevent auto upload
  };

  const extractFileNameFromUrl = (url) => {
    if (!url) return null;
    // Lấy phần cuối cùng sau dấu / cuối cùng
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const handleRemoveImage = async (index) => {
    const imageUrl = imagesPreview[index];
    
    // Nếu ảnh đã được upload lên server (có URL từ server), xóa trên server
    if (imageUrl && imageUrl.startsWith('http')) {
      const fileName = extractFileNameFromUrl(imageUrl);
      
      if (fileName) {
        try {
          message.loading({ content: 'Đang xóa ảnh...', key: 'delete' });
          
          const response = await fetch(`http://localhost:8080/api/upload?fileName=${encodeURIComponent(fileName)}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          
          if (result.status === 200) {
            message.success({ content: result.message || 'Xóa thành công', key: 'delete' });
          } else {
            message.error({ content: result.message || 'Xóa thất bại', key: 'delete' });
          }
        } catch (error) {
          message.error({ content: 'Lỗi khi xóa ảnh: ' + error.message, key: 'delete' });
        }
      }
    }
    
    // Xóa ảnh khỏi state
    setImagesPreview((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
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
      render: (status) => {
        const statusLower = status?.toLowerCase();
        return (
          <Tag color={statusLower === 'active' ? colors.status.active : colors.status.inactive}>
            {statusLower === 'active' ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
        );
      },
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
          <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
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
          scroll={{ x: 'max-content' }}
          size="small"
          loading={loading}
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
          width={isMobile ? '95%' : 800}
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
                      onClick={async () => {
                        // Nếu ảnh đã được upload lên server, xóa trên server
                        if (thumbnailPreview && thumbnailPreview.startsWith('http')) {
                          const fileName = extractFileNameFromUrl(thumbnailPreview);
                          
                          if (fileName) {
                            try {
                              message.loading({ content: 'Đang xóa ảnh...', key: 'deleteThumbnail' });
                              
                              const response = await fetch(`http://localhost:8080/api/upload?fileName=${encodeURIComponent(fileName)}`, {
                                method: 'DELETE',
                              });
                              
                              const result = await response.json();
                              
                              if (result.status === 200) {
                                message.success({ content: result.message || 'Xóa thành công', key: 'deleteThumbnail' });
                              } else {
                                message.error({ content: result.message || 'Xóa thất bại', key: 'deleteThumbnail' });
                              }
                            } catch (error) {
                              message.error({ content: 'Lỗi khi xóa ảnh: ' + error.message, key: 'deleteThumbnail' });
                            }
                          }
                        }
                        
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

