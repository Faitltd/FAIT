import React, { ReactNode, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="header-content">
          <h1>FAIT Admin</h1>
          {user && (
            <div className="user-info">
              <span>{user.email}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </header>
      <div className="admin-content-wrapper">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/dashboard/payments">Payments</Link></li>
              <li><Link to="/admin/payouts">Payouts</Link></li>
              <li><Link to="/admin/settings">Settings</Link></li>
            </ul>
          </nav>
        </aside>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
