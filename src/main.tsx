import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ViteBanner from './components/ViteBanner';

// Create a wrapper component that includes the ViteBanner
const ViteApp = () => (
  <>
    <ViteBanner />
    <App />
  </>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ViteApp />
  </StrictMode>
);
