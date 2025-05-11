import React from 'react';
import { Typography, Table, Tag, Button, Card, Space } from 'antd';
import AdminLayout from '../../layouts/AdminLayout';

const { Title } = Typography;

// Sample data for the payments table
const paymentsData = [
  {
    id: '1',
    customer: 'John Doe',
    amount: 125.50,
    status: 'completed',
    date: '2023-05-15',
  },
  {
    id: '2',
    customer: 'Jane Smith',
    amount: 75.00,
    status: 'pending',
    date: '2023-05-16',
  },
  {
    id: '3',
    customer: 'Bob Johnson',
    amount: 200.00,
    status: 'completed',
    date: '2023-05-14',
  },
  {
    id: '4',
    customer: 'Alice Brown',
    amount: 50.25,
    status: 'failed',
    date: '2023-05-13',
  },
];

const PaymentsPage: React.FC = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
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
      <div className="payments-container">
        <Title level={2}>Payments</Title>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary">New Payment</Button>
          </div>
          <Table 
            dataSource={paymentsData} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PaymentsPage;
