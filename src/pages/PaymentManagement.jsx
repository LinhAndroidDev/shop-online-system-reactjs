import { useState, useEffect } from 'react';
import { Table, Card, Statistic, DatePicker, Select, Row, Col, message } from 'antd';
import { DollarOutlined, ShoppingOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import paymentController from '../controllers/PaymentController';
import orderController from '../controllers/OrderController';
import productController from '../controllers/ProductController';
import colors from '../config/colors';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [revenueByProduct, setRevenueByProduct] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    refundedAmount: 0,
    cancelledRevenue: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadPayments();
    loadSummary();
    loadRevenueByProduct();
  }, [dateRange]);

  const loadPayments = () => {
    const data = paymentController.getAll();
    setPayments(data);
  };

  const loadSummary = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;
    
    const startDate = dateRange[0].startOf('day').toISOString();
    const endDate = dateRange[1].endOf('day').toISOString();
    
    const totalRevenue = paymentController.getRevenueByDate(startDate, endDate);
    const refundedAmount = paymentController.getRefundedAmount();
    const cancelledRevenue = paymentController.getCancelledOrdersRevenue();
    const totalProfit = paymentController.getTotalProfit();

    setSummary({
      totalRevenue,
      refundedAmount,
      cancelledRevenue,
      totalProfit,
    });
  };

  const loadRevenueByProduct = () => {
    const products = productController.getAll();
    const revenueData = products.map(product => ({
      productId: product.id,
      productName: product.name,
      revenue: paymentController.getRevenueByProduct(product.id),
    })).filter(item => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    setRevenueByProduct(revenueData);
  };

  const getMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'Chuyển khoản',
      e_wallet: 'Ví điện tử',
      cash: 'Tiền mặt',
    };
    return labels[method] || method;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ thanh toán',
      completed: 'Đã thanh toán',
      refunded: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  };

  const paymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (method) => getMethodLabel(method),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: colors.orderStatus[status] || colors.dark }}>
          {getStatusLabel(status)}
        </span>
      ),
    },
    {
      title: 'Ngày giao dịch',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
  ];

  const revenueColumns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `${revenue.toLocaleString('vi-VN')} đ`,
    },
  ];

  return (
    <MainLayout>
      <div>
        <h2 style={{ marginBottom: '20px' }}>Quản lý Thanh toán</h2>

        <div style={{ marginBottom: '20px' }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0].startOf('day'), dates[1].endOf('day')]);
              } else {
                setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
              }
            }}
            format="DD/MM/YYYY"
            style={{ width: isMobile ? '100%' : 'auto' }}
          />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={summary.totalRevenue}
                prefix={<DollarOutlined />}
                suffix="đ"
                valueStyle={{ color: colors.success }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã hoàn tiền"
                value={summary.refundedAmount}
                prefix={<WarningOutlined />}
                suffix="đ"
                valueStyle={{ color: colors.danger }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đơn hàng hủy"
                value={summary.cancelledRevenue}
                prefix={<ShoppingOutlined />}
                suffix="đ"
                valueStyle={{ color: colors.warning }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Lợi nhuận"
                value={summary.totalProfit}
                prefix={<CheckCircleOutlined />}
                suffix="đ"
                valueStyle={{ color: colors.primary }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Báo cáo doanh thu theo sản phẩm" style={{ marginBottom: '20px' }}>
              <Table
                columns={revenueColumns}
                dataSource={revenueByProduct}
                rowKey="productId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Danh sách thanh toán">
              <Table
                columns={paymentColumns}
                dataSource={payments}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default PaymentManagement;

