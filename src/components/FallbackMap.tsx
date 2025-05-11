import React from 'react';

interface FallbackMapProps {
  className?: string;
  style?: React.CSSProperties;
  message?: string;
}

/**
 * A fallback component to display when Google Maps fails to load
 * This provides a simple visual placeholder with a message
 */
const FallbackMap: React.FC<FallbackMapProps> = ({ 
  className = '', 
  style = {}, 
  message = 'Map unavailable. Please try again later.'
}) => {
  return (
    <div 
      className={`fallback-map ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '20px',
        minHeight: '200px',
        ...style
      }}
    >
      <div 
        style={{
          width: '64px',
          height: '64px',
          marginBottom: '16px',
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23666666\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\'/%3E%3C/svg%3E") center/contain no-repeat'
        }}
      />
      <p style={{ margin: 0, textAlign: 'center', color: '#666' }}>
        {message}
      </p>
      <div 
        style={{ 
          marginTop: '16px',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center'
        }}
      >
        You can still search for services by entering your zip code
      </div>
    </div>
  );
};

export default FallbackMap;
