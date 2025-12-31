// Product Controller
import Product from '../models/Product';
import categoryController from './CategoryController';
import inventoryController from './InventoryController';

class ProductController {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/product';
  }

  async getAll() {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      
      if (result.status === 200 && Array.isArray(result.data)) {
        // Map dữ liệu từ API để thêm categoryName
        // Sử dụng category từ API response, không cần gọi getById
        return result.data.map(product => {
          return {
            ...product,
            categoryId: product.category?.id || product.categoryId,
            categoryName: product.category?.name || 'N/A',
            status: product.status?.toLowerCase() || product.status, // Convert ACTIVE -> active for UI
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        const product = result.data;
        // Sử dụng category từ API response
        return {
          ...product,
          categoryId: product.category?.id || product.categoryId,
          categoryName: product.category?.name || 'N/A',
          status: product.status?.toLowerCase() || product.status,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  getByCategoryId(categoryId) {
    // Có thể cần API riêng hoặc filter từ getAll
    return this.getAll().then(products => 
      products.filter(p => p.categoryId === categoryId)
    );
  }

  async create(data) {
    try {
      // Convert status: "active" hoặc "Hoạt động" → "ACTIVE", còn lại → "INACTIVE"
      const statusValue = data.status?.toLowerCase() || '';
      const statusForAPI = (statusValue === 'active' || statusValue === 'hoạt động') 
        ? 'ACTIVE' 
        : 'INACTIVE';
      
      // Đảm bảo categoryId là số nếu có thể
      const requestData = {
        categoryId: Number(data.categoryId) || data.categoryId,
        name: data.name,
        description: data.description || '',
        thumbnail: data.thumbnail || '',
        price: Number(data.price) || data.price,
        status: statusForAPI,
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (result.status === 200) {
        // Response có thể là array hoặc object
        const productData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (productData) {
          // Tự động tạo inventory cho sản phẩm mới
          const productId = productData.id;
          if (productId) {
            inventoryController.getByProductId(productId);
          }
          
          return productData;
        }
        
        // Nếu không có data nhưng status là 200, vẫn trả về success
        return result.data || {};
      }
      
      // Nếu status không phải 200, throw error với message từ API
      throw new Error(result.message || `Tạo sản phẩm thất bại (Status: ${result.status})`);
    } catch (error) {
      console.error('Error creating product:', error);
      // Nếu là network error, giữ nguyên message
      if (error.message) {
        throw error;
      }
      throw new Error('Lỗi kết nối đến server');
    }
  }

  async update(id, data) {
    try {
      // Convert status: "active" hoặc "Hoạt động" → "ACTIVE", còn lại → "INACTIVE"
      const statusValue = data.status?.toLowerCase() || '';
      const statusForAPI = (statusValue === 'active' || statusValue === 'hoạt động') 
        ? 'ACTIVE' 
        : 'INACTIVE';
      
      // Request body phải bao gồm id
      const requestData = {
        id: String(id), // Đảm bảo id là string
        categoryId: Number(data.categoryId) || data.categoryId,
        name: data.name,
        description: data.description || '',
        thumbnail: data.thumbnail || '',
        price: Number(data.price) || data.price,
        status: statusForAPI,
      };

      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (result.status === 200) {
        // Response có thể là array hoặc object
        const productData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (productData) {
          // Cập nhật tên sản phẩm trong inventory nếu có thay đổi
          if (data.name) {
            const inventory = inventoryController.getByProductId(id);
            if (inventory) {
              inventory.productName = data.name;
              inventoryController.saveToStorage();
            }
          }
          
          return productData;
        }
        
        // Nếu không có data nhưng status là 200, vẫn trả về success
        return result.data || {};
      }
      
      // Nếu status không phải 200, throw error với message từ API
      throw new Error(result.message || `Cập nhật sản phẩm thất bại (Status: ${result.status})`);
    } catch (error) {
      console.error('Error updating product:', error);
      // Nếu là network error, giữ nguyên message
      if (error.message) {
        throw error;
      }
      throw new Error('Lỗi kết nối đến server');
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.status === 200) {
        // Xóa inventory khi xóa sản phẩm
        inventoryController.deleteByProductId(id);
        // Trả về message từ API để hiển thị cho user
        return {
          success: true,
          message: result.message || 'Xóa sản phẩm thành công',
          data: result.data
        };
      }
      
      throw new Error(result.message || 'Xóa sản phẩm thất bại');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

export default new ProductController();

