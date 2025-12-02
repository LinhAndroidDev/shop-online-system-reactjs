import { Layout } from 'antd';
import Sidebar from './Sidebar';
import colors from '../../config/colors';

const { Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        style={{
          backgroundColor: colors.background.white,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            borderBottom: `1px solid ${colors.border.light}`,
            marginBottom: '10px',
          }}
        >
          <h2 style={{ margin: 0, color: colors.primary }}>
            Hệ thống Bán hàng
          </h2>
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            backgroundColor: colors.background.light,
            borderRadius: '8px',
            minHeight: 'calc(100vh - 48px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

