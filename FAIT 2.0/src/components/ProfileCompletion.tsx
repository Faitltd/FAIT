import React from 'react';
import { Link } from 'react-router-dom';

interface ProfileCompletionProps {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    company: string | null;
    job_title: string | null;
  } | null;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ profile }) => {
  if (!profile) return null;
  
  // Calculate completion percentage
  const fields = [
    !!profile.full_name,
    !!profile.avatar_url,
    !!profile.phone,
    !!profile.company,
    !!profile.job_title
  ];
  
  const completedFields = fields.filter(Boolean).length;
  const totalFields = fields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  
  // Determine status color
  let statusColor = '#e74c3c'; // Red for low completion
  if (completionPercentage >= 80) {
    statusColor = '#2ecc71'; // Green for high completion
  } else if (completionPercentage >= 40) {
    statusColor = '#f39c12'; // Orange for medium completion
  }
  
  return (
    <div className="profile-completion-card">
      <h3>Profile Completion</h3>
      
      <div className="completion-bar-container">
        <div 
          className="completion-bar" 
          style={{ 
            width: `${completionPercentage}%`,
            backgroundColor: statusColor
          }}
        ></div>
      </div>
      
      <div className="completion-text">
        <span>{completionPercentage}% Complete</span>
        {completionPercentage < 100 && (
          <Link to="/profile" className="complete-profile-link">
            Complete Your Profile
          </Link>
        )}
      </div>
      
      {completionPercentage < 100 && (
        <div className="missing-fields">
          <p>Missing information:</p>
          <ul>
            {!profile.full_name && <li>Full Name</li>}
            {!profile.avatar_url && <li>Profile Picture</li>}
            {!profile.phone && <li>Phone Number</li>}
            {!profile.company && <li>Company</li>}
            {!profile.job_title && <li>Job Title</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;