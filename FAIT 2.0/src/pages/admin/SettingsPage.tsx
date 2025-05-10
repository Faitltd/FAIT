import React from 'react';
import { Typography, Form, Input, Button, Card, Switch, Divider } from 'antd';
import AdminLayout from '../../layouts/AdminLayout';

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('Settings form submitted:', values);
    // In a real app, you would save these settings to your backend
  };

  return (
    <AdminLayout>
      <div className="settings-container">
        <Title level={2}>Settings</Title>
        
        <Card title="General Settings">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              siteName: 'FAIT Admin',
              siteUrl: 'https://fait-admin.example.com',
              enableNotifications: true,
              enableAnalytics: true
            }}
          >
            <Form.Item
              name="siteName"
              label="Site Name"
              rules={[{ required: true, message: 'Please enter the site name' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="siteUrl"
              label="Site URL"
              rules={[{ required: true, message: 'Please enter the site URL' }]}
            >
              <Input />
            </Form.Item>
            
            <Divider />
            
            <Form.Item name="enableNotifications" valuePropName="checked" label="Enable Email Notifications">
              <Switch />
            </Form.Item>
            
            <Form.Item name="enableAnalytics" valuePropName="checked" label="Enable Analytics">
              <Switch />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
