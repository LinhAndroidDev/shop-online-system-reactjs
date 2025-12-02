import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TruckOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import colors from '../../config/colors';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: 'Quản lý Danh mục',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Quản lý Sản phẩm',
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: 'Quản lý Kho',
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý Đơn hàng',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: 'Quản lý Khách hàng',
    },
    {
      key: '/shipping',
      icon: <TruckOutlined />,
      label: 'Quản lý Vận chuyển',
    },
    {
      key: '/payments',
      icon: <DollarOutlined />,
      label: 'Quản lý Thanh toán',
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{
        height: '100%',
        borderRight: 0,
        backgroundColor: colors.background.white,
      }}
    />
  );
};

export default Sidebar;

