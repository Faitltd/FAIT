import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from './components/common';

const CheckComponents: React.FC = () => {
  console.log('Button component:', Button);
  console.log('Card component:', Card);
  console.log('CardHeader component:', CardHeader);
  console.log('CardTitle component:', CardTitle);
  console.log('CardContent component:', CardContent);
  console.log('Badge component:', Badge);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Component Check</h1>
      <div>
        <h2>Button</h2>
        {Button ? <Button>Test Button</Button> : 'Button component not found'}
      </div>
      <div>
        <h2>Card</h2>
        {Card ? (
          <Card>
            {CardHeader ? (
              <CardHeader>
                {CardTitle ? <CardTitle>Test Card</CardTitle> : 'CardTitle component not found'}
              </CardHeader>
            ) : 'CardHeader component not found'}
            {CardContent ? (
              <CardContent>
                <p>Test content</p>
              </CardContent>
            ) : 'CardContent component not found'}
          </Card>
        ) : 'Card component not found'}
      </div>
      <div>
        <h2>Badge</h2>
        {Badge ? <Badge>Test Badge</Badge> : 'Badge component not found'}
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <CheckComponents />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

export default CheckComponents;
