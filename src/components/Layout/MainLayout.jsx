import { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';
import colors from '../../config/colors';

const { Sider, Content, Header } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          backgroundColor: colors.background.white,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          position: isMobile ? 'fixed' : undefined,
          left: isMobile ? 0 : undefined,
          top: isMobile ? 0 : undefined,
          bottom: isMobile ? 0 : undefined,
          zIndex: isMobile ? 1000 : undefined,
        }}
        trigger={null}
      >
        <div
          style={{
            padding: collapsed ? '20px 10px' : '20px',
            textAlign: 'center',
            borderBottom: `1px solid ${colors.border.light}`,
            marginBottom: '10px',
          }}
        >
          {!collapsed && (
            <h2 style={{ margin: 0, color: colors.primary, fontSize: isMobile ? '16px' : '18px' }}>
              Hệ thống Bán hàng
            </h2>
          )}
          {collapsed && (
            <div style={{ color: colors.primary, fontSize: '20px', fontWeight: 'bold' }}>
              HT
            </div>
          )}
        </div>
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout 
        style={{ 
          marginLeft: isMobile ? 0 : undefined,
          transition: 'all 0.2s',
        }}
      >
        {isMobile && (
          <Header
            style={{
              padding: '0 16px',
              background: colors.background.white,
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          </Header>
        )}
        <Content
          style={{
            margin: isMobile ? '8px' : '24px',
            padding: isMobile ? '12px' : '24px',
            backgroundColor: colors.background.light,
            borderRadius: '8px',
            minHeight: isMobile ? 'calc(100vh - 64px)' : 'calc(100vh - 48px)',
            transition: 'all 0.2s',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

