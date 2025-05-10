import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button, Card, Alert, Spin, Typography, Space, Divider, Tag, Statistic, Row, Col } from 'antd';
import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface StripeConnectDashboardProps {
  userId?: string; // Optional: If provided, admin is viewing another user's dashboard
  isAdmin?: boolean;
}

const StripeConnectDashboard: React.FC<StripeConnectDashboardProps> = ({ userId, isAdmin = false }) => {
  const supabase = useSupabaseClient();
  const currentUser = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectAccount, setConnectAccount] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Use the current user's ID if userId is not provided
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchConnectAccount();
      fetchPayouts();
    }
  }, [targetUserId]);

  const fetchConnectAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the user's profile to check if they have a Stripe Connect account
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_connect_id, stripe_connect_status')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      if (profile?.stripe_connect_id) {
        // Fetch account details from the Edge Function
        const { data: accountData, error: accountError } = await supabase.functions.invoke('stripe-connect', {
          body: {
            action: 'get_account_details',
            userId: targetUserId,
          },
        });

        if (accountError) throw accountError;
        setConnectAccount(accountData.account);

        // Fetch account balance
        const { data: balanceData, error: balanceError } = await supabase.functions.invoke('stripe-connect', {
          body: {
            action: 'get_account_balance',
            userId: targetUserId,
          },
        });

        if (balanceError) throw balanceError;
        setBalance(balanceData.balance);
      }
    } catch (err: any) {
      console.error('Error fetching Connect account:', err);
      setError(err.message || 'Failed to fetch Stripe Connect account');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (err: any) {
      console.error('Error fetching payouts:', err);
      // Don't set error state here to avoid blocking the whole component
    }
  };

  const handleCreateConnectAccount = async () => {
    try {
      setActionLoading(true);
      setError(null);

      // Get user profile for email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      // Create Connect account via Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: {
          action: 'create_connect_account',
          userId: targetUserId,
          country: 'US',
          email: profile.email || currentUser?.email,
          business_type: 'individual',
        },
      });

      if (error) throw error;

      if (data.success) {
        // Create account link for onboarding
        await handleCreateAccountLink();
        await fetchConnectAccount(); // Refresh account data
      } else {
        setError(data.message || 'Failed to create Connect account');
      }
    } catch (err: any) {
      console.error('Error creating Connect account:', err);
      setError(err.message || 'Failed to create Stripe Connect account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAccountLink = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const origin = window.location.origin;
      const returnPath = isAdmin 
        ? `/admin/users/${targetUserId}` 
        : '/dashboard/payments';

      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: {
          action: 'create_account_link',
          userId: targetUserId,
          return_url: `${origin}${returnPath}?setup=success`,
          refresh_url: `${origin}${returnPath}?setup=refresh`,
        },
      });

      if (error) throw error;

      if (data.success && data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      } else {
        setError('Failed to create account link');
      }
    } catch (err: any) {
      console.error('Error creating account link:', err);
      setError(err.message || 'Failed to create account link');
    } finally {
      setActionLoading(false);
    }
  };

  const renderAccountStatus = () => {
    if (!connectAccount) return null;

    const isComplete = connectAccount.details_submitted;
    const isPayoutsEnabled = connectAccount.payouts_enabled;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={4}>Stripe Connect Account</Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="Account Status" 
                  value={isComplete ? "Complete" : "Incomplete"} 
                  valueStyle={{ color: isComplete ? '#52c41a' : '#faad14' }}
                  prefix={isComplete ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Payouts" 
                  value={isPayoutsEnabled ? "Enabled" : "Disabled"} 
                  valueStyle={{ color: isPayoutsEnabled ? '#52c41a' : '#ff4d4f' }}
                  prefix={<BankOutlined />}
                />
              </Col>
            </Row>

            {balance && (
              <>
                <Divider />
                <Title level={5}>Available Balance</Title>
                <Row gutter={16}>
                  {balance.available.map((item: any, index: number) => (
                    <Col key={index} span={8}>
                      <Statistic 
                        title={`Available (${item.currency.toUpperCase()})`} 
                        value={(item.amount / 100).toFixed(2)} 
                        precision={2}
                        prefix={<DollarOutlined />}
                      />
                    </Col>
                  ))}
                </Row>
              </>
            )}

            <Divider />
            <Space>
              <Button 
                type="primary" 
                onClick={handleCreateAccountLink}
                loading={actionLoading}
              >
                {isComplete ? 'View Dashboard' : 'Complete Onboarding'}
              </Button>
            </Space>
          </Space>
        </Card>
      </motion.div>
    );
  };

  const renderPayouts = () => {
    if (payouts.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card style={{ marginTop: 16 }}>
          <Title level={4}>Recent Payouts</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {payouts.map((payout) => (
              <Card key={payout.id} size="small" style={{ marginBottom: 8 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>${payout.amount.toFixed(2)} {payout.currency.toUpperCase()}</Text>
                    <br />
                    <Text type="secondary">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </Text>
                  </Col>
                  <Col>
                    <Tag color={getStatusColor(payout.status)}>
                      {payout.status.toUpperCase()}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Card>
      </motion.div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'available':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {!connectAccount ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={4}>Stripe Connect</Title>
              <Paragraph>
                Set up a Stripe Connect account to receive payments directly to your bank account.
                This allows you to get paid for your work through the FAIT platform.
              </Paragraph>
              <Button 
                type="primary" 
                icon={<BankOutlined />} 
                size="large"
                onClick={handleCreateConnectAccount}
                loading={actionLoading}
              >
                Set Up Stripe Connect
              </Button>
            </Space>
          </Card>
        </motion.div>
      ) : (
        <>
          {renderAccountStatus()}
          {renderPayouts()}
        </>
      )}
    </div>
  );
};

export default StripeConnectDashboard;
