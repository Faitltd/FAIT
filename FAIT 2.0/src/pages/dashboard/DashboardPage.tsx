import React from 'react';
import { Typography, Row, Col, Card, Statistic } from 'antd';
import { DollarOutlined, UserOutlined, ShoppingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AdminLayout from '../../layouts/AdminLayout';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  // In a real app, you would fetch this data from your API
  const stats = {
    totalRevenue: 15420.50,
    totalUsers: 243,
    totalOrders: 1024,
    pendingPayouts: 12
  };

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <Title level={2}>Dashboard</Title>
        
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                valueStyle={{ color: '#722ed1' }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Payouts"
                value={stats.pendingPayouts}
                valueStyle={{ color: stats.pendingPayouts > 0 ? '#faad14' : '#52c41a' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <div className="recent-activity" style={{ marginTop: '24px' }}>
          <Card title="Recent Activity">
            <p>No recent activity to display.</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
