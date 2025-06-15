import React from 'react';
import { User, Mail, Phone, Camera } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface BasicInfoStepProps {
  profile: any;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
}

/**
 * Basic information step in the profile setup wizard
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ profile, onChange, errors }) => {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(profile.avatar_url);
  
  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    try {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // Upload the file
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the profile
      onChange('avatar_url', data.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <p className="mt-1 text-sm text-gray-600">
          Let's start with your basic information.
        </p>
      </div>
      
      {/* Avatar Upload */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700"
          >
            <Camera className="h-4 w-4 text-white" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Click the camera icon to upload a profile photo
        </p>
      </div>
      
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={profile.full_name || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.full_name ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="John Doe"
          />
        </div>
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="john.doe@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="(123) 456-7890"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          We'll use this number to send you booking confirmations and updates.
        </p>
      </div>
      
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <div className="mt-1">
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={profile.bio || ''}
            onChange={(e) => onChange('bio', e.target.value)}
            className={`block w-full px-3 py-2 border ${
              errors.bio ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Tell us a bit about yourself..."
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          A brief description that will be visible on your profile.
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;
