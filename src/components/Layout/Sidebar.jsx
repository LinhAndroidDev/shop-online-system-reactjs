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

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: collapsed ? '' : 'Quản lý Danh mục',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: collapsed ? '' : 'Quản lý Sản phẩm',
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: collapsed ? '' : 'Quản lý Kho',
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: collapsed ? '' : 'Quản lý Đơn hàng',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: collapsed ? '' : 'Quản lý Khách hàng',
    },
    {
      key: '/shipping',
      icon: <TruckOutlined />,
      label: collapsed ? '' : 'Quản lý Vận chuyển',
    },
    {
      key: '/payments',
      icon: <DollarOutlined />,
      label: collapsed ? '' : 'Quản lý Thanh toán',
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
      inlineCollapsed={collapsed}
    />
  );
};

export default Sidebar;

