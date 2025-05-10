import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleTestApp from './SimpleTestApp';

function FixedApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleTestApp />} />
        <Route path="/login" element={<SimpleTestApp />} />
        <Route path="*" element={<SimpleTestApp />} />
      </Routes>
    </Router>
  );
}

export default FixedApp;
