# Shop Online System

Hệ thống quản lý shop online được xây dựng bằng React và Vite, cung cấp đầy đủ các chức năng quản lý cho một cửa hàng trực tuyến.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Chạy dự án](#chạy-dự-án)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Endpoints](#api-endpoints)
- [Tính năng nổi bật](#tính-năng-nổi-bật)

## ✨ Tính năng

### 1. **Quản lý Danh mục** (`/categories`)
- Xem danh sách danh mục sản phẩm
- Thêm, sửa, xóa danh mục
- Hỗ trợ danh mục cha/con (parent/child categories)

### 2. **Quản lý Sản phẩm** (`/products`)
- Xem danh sách sản phẩm với hình ảnh
- Thêm, sửa, xóa sản phẩm
- Upload ảnh thumbnail và ảnh mô tả (hỗ trợ upload nhiều ảnh cùng lúc)
- Quản lý thông tin sản phẩm:
  - Tên, mô tả, giá
  - Danh mục
  - Xuất xứ (quốc gia với cờ)
  - Giảm giá (%)
  - Kích thước (S, M, L, XL...)
  - Màu sắc (với mã hex)
- Trạng thái sản phẩm (ACTIVE/INACTIVE)
- Cache hình ảnh để tối ưu hiệu suất

### 3. **Quản lý Kho** (`/inventory`)
- Xem tồn kho theo sản phẩm
- Nhập kho / Xuất kho
- Theo dõi số lượng tồn kho
- Cảnh báo hàng tồn kho thấp

### 4. **Quản lý Đơn hàng** (`/orders`)
- Xem danh sách đơn hàng
- Quản lý trạng thái đơn hàng
- Chi tiết đơn hàng

### 5. **Quản lý Khách hàng** (`/customers`)
- Xem danh sách khách hàng
- Thông tin khách hàng
- Lịch sử mua hàng

### 6. **Quản lý Vận chuyển** (`/shipping`)
- Theo dõi vận chuyển
- Trạng thái giao hàng
- Thông tin vận chuyển

### 7. **Quản lý Thanh toán** (`/payments`)
- Xem danh sách thanh toán
- Trạng thái thanh toán
- Phương thức thanh toán

## 🛠 Công nghệ sử dụng

### Frontend
- **React** 19.2.0 - UI framework
- **Vite** 7.2.4 - Build tool và dev server
- **React Router DOM** 7.9.6 - Routing
- **Ant Design** 6.0.0 - UI component library
- **Bootstrap** 5.3.8 - CSS framework
- **Day.js** 1.11.19 - Date manipulation

### Development Tools
- **ESLint** - Code linting
- **React Hooks** - State management
- **React Fast Refresh** - Hot module replacement

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 18.x
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd shop-online-system
```

2. **Cài đặt dependencies**
```bash
npm install
```

## 🚀 Chạy dự án

### Development mode
```bash
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng)

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

## 📁 Cấu trúc thư mục

```
shop-online-system/
├── public/                 # Static files
├── src/
│   ├── assets/            # Images, icons
│   ├── components/        # Reusable components
│   │   ├── Layout/       # Layout components (MainLayout, Sidebar)
│   │   └── ErrorBoundary.jsx
│   ├── config/           # Configuration files
│   │   └── colors.js     # Color theme configuration
│   ├── controllers/     # API controllers
│   │   ├── CategoryController.js
│   │   ├── ProductController.js
│   │   ├── InventoryController.js
│   │   ├── OrderController.js
│   │   ├── CustomerController.js
│   │   ├── ShippingController.js
│   │   └── PaymentController.js
│   ├── models/          # Data models
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Inventory.js
│   │   ├── Order.js
│   │   ├── Customer.js
│   │   ├── Shipping.js
│   │   └── Payment.js
│   ├── pages/           # Page components
│   │   ├── CategoryManagement.jsx
│   │   ├── ProductManagement.jsx
│   │   ├── InventoryManagement.jsx
│   │   ├── OrderManagement.jsx
│   │   ├── CustomerManagement.jsx
│   │   ├── ShippingManagement.jsx
│   │   └── PaymentManagement.jsx
│   ├── App.jsx          # Main app component
│   ├── App.css          # App styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── eslint.config.js     # ESLint configuration
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies và scripts
└── README.md           # Documentation
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### **Category**
- `GET /category` - Lấy danh sách danh mục
- `GET /category/:id` - Lấy danh mục theo ID
- `POST /category` - Tạo danh mục mới
- `PUT /category` - Cập nhật danh mục
- `DELETE /category/:id` - Xóa danh mục

#### **Product**
- `GET /product` - Lấy danh sách sản phẩm
- `GET /product/:id` - Lấy sản phẩm theo ID
- `POST /product` - Tạo sản phẩm mới
- `PUT /product` - Cập nhật sản phẩm
- `DELETE /product/:id` - Xóa sản phẩm

**Request body (POST/PUT):**
```json
{
  "categoryId": 1,
  "name": "Tên sản phẩm",
  "description": "Mô tả sản phẩm",
  "thumbnail": "https://...",
  "price": 125000,
  "discount": 10,
  "status": "ACTIVE",
  "images": ["https://...", "https://..."],
  "variant": {
    "origin": "Việt Nam",
    "size": ["S", "M", "L", "XL"],
    "color": [
      { "name": "Đỏ", "hexCode": "#FF0000" },
      { "name": "Xanh", "hexCode": "#0000FF" }
    ]
  }
}
```

#### **Upload**
- `POST /upload` - Upload hình ảnh
- `DELETE /upload?fileName=...` - Xóa hình ảnh

#### **Inventory**
- `GET /inventory` - Lấy danh sách tồn kho
- `PUT /inventory` - Cập nhật số lượng tồn kho

#### **Order**
- `GET /order` - Lấy danh sách đơn hàng
- `POST /order` - Tạo đơn hàng mới
- `PUT /order` - Cập nhật đơn hàng

#### **Customer**
- `GET /customer` - Lấy danh sách khách hàng
- `POST /customer` - Tạo khách hàng mới
- `PUT /customer` - Cập nhật khách hàng

#### **Shipping**
- `GET /shipping` - Lấy danh sách vận chuyển
- `POST /shipping` - Tạo vận chuyển mới
- `PUT /shipping` - Cập nhật vận chuyển

#### **Payment**
- `GET /payment` - Lấy danh sách thanh toán
- `POST /payment` - Tạo thanh toán mới
- `PUT /payment` - Cập nhật thanh toán

### Response Format
Tất cả API responses đều có format:
```json
{
  "status": 200,
  "message": "Thông báo",
  "data": { ... }
}
```

## 🌟 Tính năng nổi bật

### 1. **Upload ảnh tối ưu**
- Upload nhiều ảnh cùng lúc (tối đa 5 ảnh song song)
- Giữ nguyên thứ tự ảnh khi upload
- Preview ảnh trước khi upload
- Xóa ảnh từ server khi không cần thiết
- Cache ảnh để tối ưu hiệu suất

### 2. **Quản lý Variant sản phẩm**
- Xuất xứ: Chọn quốc gia với cờ và tìm kiếm
- Kích thước: Thêm/sửa/xóa kích thước động
- Màu sắc: Chọn màu từ color picker và đặt tên

### 3. **Responsive Design**
- Tối ưu cho desktop và mobile
- Table columns tự động điều chỉnh theo màn hình
- Tooltip hiển thị đầy đủ thông tin khi hover

### 4. **UI/UX**
- Giao diện hiện đại với Ant Design
- Màu sắc nhất quán theo theme
- Loading states và error handling
- Form validation
- Confirmation dialogs

### 5. **Performance**
- Image caching để giảm reload
- Lazy loading cho images
- Optimized re-renders với React hooks

## 📝 Ghi chú

- Đảm bảo backend API đang chạy tại `http://localhost:8080` trước khi sử dụng ứng dụng
- Tất cả dữ liệu được lưu trữ và quản lý qua API backend
- Hình ảnh được upload lên Supabase Storage

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License
