import { useState, useEffect, useRef } from 'react';
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
  const [uploadingImages, setUploadingImages] = useState(new Map()); // Map<fileKey, { status: 'uploading'|'success'|'error', url?: string, file?: File }>
  const processedFilesRef = useRef(new Set()); // Ref để track các file đã được xử lý
  const lastFileListLengthRef = useRef(0); // Track số lượng file lần trước để tránh xử lý trùng
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
    setUploadingImages(new Map());
    processedFilesRef.current.clear();
    lastFileListLengthRef.current = 0;
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
      setUploadingImages(new Map());
      processedFilesRef.current.clear();
      form.resetFields();
      // Reload danh sách sản phẩm
      await loadProducts();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi lưu sản phẩm';
      message.error(errorMessage);
    }
  };

  // Upload một ảnh đơn lẻ
  const uploadSingleImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.status === 200 && result.data) {
      return { success: true, url: result.data };
    } else {
      throw new Error(result.message || 'Upload thất bại');
    }
  };

  // Upload nhiều ảnh song song với giới hạn 5 concurrent
  const uploadImagesInParallel = async (files, maxConcurrent = 5) => {
    const results = [];
    const queue = [...files];
    const activeUploads = new Set();
    // Map để lưu thứ tự và kết quả upload: Map<index, { file, url?, error? }>
    const uploadResults = new Map();
    // Map để lưu thứ tự URL đã thêm: Map<url, index>
    const urlOrderMap = new Map();
    
    const processNext = async () => {
      if (queue.length === 0 && activeUploads.size === 0) {
        // Tất cả đã upload xong, sắp xếp lại theo thứ tự ban đầu
        const sortedResults = Array.from(uploadResults.entries())
          .sort(([indexA], [indexB]) => indexA - indexB)
          .filter(([_, result]) => result.success && result.url)
          .map(([_, result]) => result.url);
        
        if (sortedResults.length > 0) {
          // Sắp xếp lại imagesPreview theo thứ tự ban đầu
          setImagesPreview((prevImages) => {
            // Tách các URL cũ (không có trong sortedResults) và URL mới
            const oldUrls = prevImages.filter(url => !sortedResults.includes(url));
            
            // Kết hợp: URL cũ + URL mới đã sắp xếp theo thứ tự
            const finalImages = [...oldUrls, ...sortedResults];
            setTimeout(() => {
              form.setFieldsValue({ images: finalImages });
            }, 0);
            return finalImages;
          });
        }
        
        return;
      }
      
      while (queue.length > 0 && activeUploads.size < maxConcurrent) {
        const file = queue.shift();
        const fileIndex = files.indexOf(file); // Lưu index ban đầu
        // Tạo key duy nhất cho file dựa trên name, size và lastModified
        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        
        // Kiểm tra xem file đã được xử lý chưa (sử dụng ref để có giá trị mới nhất)
        if (processedFilesRef.current.has(fileKey)) {
          continue; // Bỏ qua file đã được xử lý
        }
        
        // Đánh dấu file đã được xử lý NGAY TRƯỚC KHI bắt đầu upload
        processedFilesRef.current.add(fileKey);
        
        // Đánh dấu đang upload
        setUploadingImages(prev => {
          const newMap = new Map(prev);
          newMap.set(fileKey, { status: 'uploading', file, index: fileIndex });
          return newMap;
        });
        
        activeUploads.add(fileKey);
        
        uploadSingleImage(file)
          .then((result) => {
            // Đánh dấu thành công
            setUploadingImages(prev => {
              const newMap = new Map(prev);
              newMap.set(fileKey, { status: 'success', url: result.url, file, index: fileIndex });
              return newMap;
            });
            
            // Lưu kết quả với index
            uploadResults.set(fileIndex, { file, success: true, url: result.url, index: fileIndex });
            urlOrderMap.set(result.url, fileIndex);
            
            // Thêm vào imagesPreview ngay (để UX tốt), nhưng sẽ sắp xếp lại sau
            setImagesPreview((prevImages) => {
              // Kiểm tra xem URL đã tồn tại chưa
              if (prevImages.includes(result.url)) {
                return prevImages;
              }
              // Thêm vào cuối tạm thời, sẽ sắp xếp lại khi tất cả xong
              const newImages = [...prevImages, result.url];
              setTimeout(() => {
                form.setFieldsValue({ images: newImages });
              }, 0);
              return newImages;
            });
            
            results.push({ file, success: true, url: result.url });
          })
          .catch((error) => {
            // Đánh dấu lỗi
            setUploadingImages(prev => {
              const newMap = new Map(prev);
              newMap.set(fileKey, { status: 'error', error: error.message, file, index: fileIndex });
              return newMap;
            });
            
            // Lưu kết quả lỗi với index
            uploadResults.set(fileIndex, { file, success: false, error: error.message, index: fileIndex });
            
            // Xóa khỏi processedFiles nếu lỗi để có thể thử lại
            processedFilesRef.current.delete(fileKey);
            
            results.push({ file, success: false, error: error.message });
            message.error(`Upload ảnh ${file.name} thất bại: ${error.message}`);
          })
          .finally(() => {
            activeUploads.delete(fileKey);
            // Xử lý ảnh tiếp theo
            processNext();
          });
      }
    };
    
    processNext();
    return results;
  };

  const handleImageUpload = async (file, fileList, field) => {
    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return false;
    }
    
    // Nếu là thumbnail, upload đơn lẻ như cũ
    if (field === 'thumbnail') {
      try {
        message.loading({ content: 'Đang upload ảnh...', key: 'uploadThumbnail' });
        
        const result = await uploadSingleImage(file);
        
        if (result.success) {
          message.success({ content: 'Upload thành công', key: 'uploadThumbnail' });
          setThumbnailPreview(result.url);
          form.setFieldsValue({ thumbnail: result.url });
        }
      } catch (error) {
        message.error({ content: 'Lỗi khi upload ảnh: ' + error.message, key: 'uploadThumbnail' });
      }
    }
    // Nếu là ảnh mô tả, không xử lý ở đây, sẽ xử lý trong onChange
    
    return false; // Prevent auto upload
  };

  // Xử lý khi chọn nhiều ảnh
  const handleMultipleImageUpload = async (fileList) => {
    // Lọc file hợp lệ - KHÔNG kiểm tra processed ở đây vì đã check ở onChange
    // File đến đây đã được xác nhận là chưa processed
    const imageFiles = fileList.filter(file => {
      if (!file || !file.type) {
        return false;
      }
      return file.type.startsWith('image/');
    });
    
    if (imageFiles.length === 0) {
      return;
    }
    
    message.info(`Đang upload ${imageFiles.length} ảnh...`);
    await uploadImagesInParallel(imageFiles, 5);
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
                customRequest={({ file, onSuccess, onError }) => {
                  // Không làm gì ở đây, chỉ để ngăn auto upload
                  // File sẽ được xử lý trong onChange
                }}
                beforeUpload={(file) => {
                  // Chỉ kiểm tra file type
                  if (!file.type.startsWith('image/')) {
                    message.error('Vui lòng chọn file ảnh');
                    return false;
                  }
                  return false; // Prevent auto upload
                }}
                onChange={({ fileList }) => {
                  // Chỉ xử lý khi có file mới được thêm vào (fileList tăng)
                  // Lấy tất cả file có originFileObj hoặc file trực tiếp
                  const allFiles = fileList
                    .map(file => {
                      const fileObj = file.originFileObj || file;
                      return fileObj;
                    })
                    .filter(file => {
                      return file && file.type && file.type.startsWith('image/');
                    });
                  
                  if (allFiles.length > 0) {
                    // Lọc các file chưa được xử lý - CHỈ CHECK, KHÔNG ĐÁNH DẤU
                    const newFiles = allFiles.filter(file => {
                      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
                      return !processedFilesRef.current.has(fileKey);
                    });
                    
                    if (newFiles.length > 0) {
                      // Gọi upload - file sẽ được đánh dấu processed TRONG uploadImagesInParallel
                      handleMultipleImageUpload(newFiles);
                    }
                  }
                }}
                showUploadList={false}
                accept="image/*"
                multiple
              >
                <Button icon={<UploadOutlined />}>Thêm ảnh mô tả (có thể chọn nhiều)</Button>
              </Upload>
              <div style={{ marginTop: 10 }} key={`images-preview-${imagesPreview.length}-${uploadingImages.size}`}>
                {/* Hiển thị ảnh đang upload */}
                {Array.from(uploadingImages.entries()).map(([key, uploadInfo]) => {
                  if (uploadInfo.status === 'uploading') {
                    return (
                      <div 
                        key={key}
                        style={{ 
                          display: 'inline-block',
                          position: 'relative', 
                          border: '1px solid #d9d9d9', 
                          borderRadius: '4px', 
                          padding: '4px', 
                          backgroundColor: '#f0f0f0',
                          marginRight: 10,
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#999' }}>Đang upload...</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                
                {/* Hiển thị ảnh đã upload thành công */}
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
                ) : uploadingImages.size === 0 && (
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

