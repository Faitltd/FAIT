import React from 'react';
import DirectLogin from './components/DirectLogin';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>FAIT 2.0</h1>
      <DirectLogin />
    </div>
  );
};

export default App;