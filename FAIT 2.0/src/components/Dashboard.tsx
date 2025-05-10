import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const appName = import.meta.env.VITE_APP_NAME || 'FAIT Platform';
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, company, job_title')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="dashboard-container">
      <h1>Welcome to {appName}</h1>
      
      <div className="welcome-card">
        <div className="user-profile-summary">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="user-info">
            <h2>Hello, {displayName}</h2>
            {profile?.job_title && profile?.company && (
              <p className="user-position">{profile.job_title} at {profile.company}</p>
            )}
            <Link to="/profile" className="profile-link">Edit Profile</Link>
          </div>
        </div>
        
        <p className="dashboard-intro">
          This is your personal dashboard where you can manage your account and access platform features.
        </p>
      </div>
      
      <div className="dashboard-grid">
        {/* Feature cards would go here based on enabled features */}
        {import.meta.env.VITE_ENABLE_MARKETPLACE === 'true' && (
          <div className="feature-card">
            <h3>Marketplace</h3>
            <p>Browse and purchase items from our marketplace.</p>
            <Link to="/marketplace" className="btn-secondary">Go to Marketplace</Link>
          </div>
        )}
        
        {import.meta.env.VITE_ENABLE_TRAINING === 'true' && (
          <div className="feature-card">
            <h3>Training</h3>
            <p>Access training materials and courses.</p>
            <Link to="/training" className="btn-secondary">Go to Training</Link>
          </div>
        )}
        
        {import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && (
          <div className="feature-card">
            <h3>Analytics</h3>
            <p>View your analytics and reports.</p>
            <Link to="/analytics" className="btn-secondary">Go to Analytics</Link>
          </div>
        )}
        
        {/* Always show profile management card */}
        <div className="feature-card">
          <h3>Profile Management</h3>
          <p>Update your personal information and preferences.</p>
          <Link to="/profile" className="btn-secondary">Manage Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
