import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import colors from './config/colors';

// Pages
import CategoryManagement from './pages/CategoryManagement';
import ProductManagement from './pages/ProductManagement';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import ShippingManagement from './pages/ShippingManagement';
import PaymentManagement from './pages/PaymentManagement';

function App() {
  try {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colors.primary,
            colorSuccess: colors.success,
            colorWarning: colors.warning,
            colorError: colors.danger,
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/categories" replace />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/shipping" element={<ShippingManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
          </Routes>
        </Router>
      </ConfigProvider>
    );
  } catch (error) {
    console.error('App Error:', error);
    return (
      <div style={{ padding: '20px' }}>
        <h1>Lỗi: {error.message}</h1>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}

export default App;
