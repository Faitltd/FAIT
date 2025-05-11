import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AnimationDemoPage from '../../pages/AnimationDemoPage';

/**
 * Animation Demo Route Component
 * 
 * This component sets up the routes for the animation demo pages.
 */
const AnimationDemoRoute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AnimationDemoPage />} />
    </Routes>
  );
};

export default AnimationDemoRoute;
