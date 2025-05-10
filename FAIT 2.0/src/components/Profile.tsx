import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/AuthContext';

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string;
  company: string;
  job_title: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    id: user?.id || '',
    full_name: '',
    avatar_url: null,
    phone: '',
    company: '',
    job_title: '',
  });
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Check if profiles table exists and has user data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfile({
            id: user.id,
            full_name: data.full_name || '',
            avatar_url: data.avatar_url,
            phone: data.phone || '',
            company: data.company || '',
            job_title: data.job_title || '',
          });
          
          if (data.avatar_url) {
            setAvatarPreview(data.avatar_url);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, avatarFile);
    
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);
      
      let avatarUrl = profile.avatar_url;
      
      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          avatar_url: avatarUrl,
          phone: profile.phone,
          company: profile.company,
          job_title: profile.job_title,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      
      if (error) {
        throw error;
      }
      
      // Update email if changed
      if (user.email !== profile.id) {
        // This would require email verification
        // Not implementing here as it requires more complex flow
      }
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Profile updated successfully!</div>}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile avatar" />
            ) : (
              <div className="avatar-placeholder">
                {profile.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="avatar-upload">
            <label htmlFor="avatar">Profile Picture</label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <small>Max size: 2MB. Recommended: 200x200px</small>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
            />
            <small>Email cannot be changed directly</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Professional Information</h2>
          
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={profile.company}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="job_title">Job Title</label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={profile.job_title}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={updating} className="btn-primary">
            {updating ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div className="security-section">
        <h2>Security</h2>
        <a href="/reset-password" className="btn-secondary">Change Password</a>
      </div>
    </div>
  );
};

export default Profile;