import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: number;
  tip?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  tip = 'Loading...', 
  fullScreen = false 
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size }} spin />;
  
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin indicator={antIcon} tip={tip} size="large" />
      </div>
    );
  }
  
  return <Spin indicator={antIcon} tip={tip} />;
};

export default LoadingSpinner;
