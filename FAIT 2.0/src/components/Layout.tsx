import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const appName = import.meta.env.VITE_APP_NAME || 'FAIT Platform';
  const enableMarketplace = import.meta.env.VITE_ENABLE_MARKETPLACE === 'true';
  const enableTraining = import.meta.env.VITE_ENABLE_TRAINING === 'true';
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <h1>{appName}</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            {enableMarketplace && (
              <li>
                <Link to="/marketplace">Marketplace</Link>
              </li>
            )}
            {enableTraining && (
              <li>
                <Link to="/training">Training</Link>
              </li>
            )}
            {enableAnalytics && (
              <li>
                <Link to="/analytics">Analytics</Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="user-menu">
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
          <div className="dropdown">
            <ul>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </header>
      
      <main className="app-content">
        <Outlet />
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} {appName}</p>
      </footer>
    </div>
  );
};

export default Layout;