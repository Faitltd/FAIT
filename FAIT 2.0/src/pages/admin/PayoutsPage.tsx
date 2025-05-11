import React from 'react';
import { Typography, Table, Tag, Button, Card, Space } from 'antd';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPayoutManager from '../../components/StripeConnect/AdminPayoutManager';

const { Title } = Typography;

// Sample data for the payouts table
const payoutsData = [
  {
    id: '1',
    recipient: 'John Doe',
    amount: 125.50,
    status: 'completed',
    date: '2023-05-15',
  },
  {
    id: '2',
    recipient: 'Jane Smith',
    amount: 75.00,
    status: 'pending',
    date: '2023-05-16',
  },
  {
    id: '3',
    recipient: 'Bob Johnson',
    amount: 200.00,
    status: 'processing',
    date: '2023-05-14',
  },
  {
    id: '4',
    recipient: 'Alice Brown',
    amount: 50.25,
    status: 'failed',
    date: '2023-05-13',
  },
];

const PayoutsPage: React.FC = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'pending') {
          color = 'gold';
        } else if (status === 'processing') {
          color = 'blue';
        } else if (status === 'failed') {
          color = 'volcano';
        }
        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button size="small">View</Button>
          {record.status === 'pending' && (
            <Button size="small" type="primary">Process</Button>
          )}
          {record.status === 'failed' && (
            <Button size="small" danger>Retry</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="payouts-container">
        <Title level={2}>Payouts</Title>
        <AdminPayoutManager />
        <Card style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary">Create Payout</Button>
          </div>
          <Table 
            dataSource={payoutsData} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PayoutsPage;
