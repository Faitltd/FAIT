export type UserRole = 'client' | 'contractor' | 'admin' | 'ally';

export interface Profile {
  id: string;
  user_role: UserRole;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  avatar_url: string;
  bio: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
