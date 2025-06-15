/**
 * Common type definitions used across the application
 */

/**
 * User roles in the system
 */
export enum UserRole {
  CLIENT = 'client',
  SERVICE_AGENT = 'service_agent',
  ADMIN = 'admin',
  ALLY = 'ally'
}

/**
 * Base user interface
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status types for various entities
 */
export enum Status {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

/**
 * Base address interface
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Base location interface
 */
export interface Location {
  latitude: number;
  longitude: number;
  address?: Address;
}

/**
 * Base pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Base pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Base sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Base filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | null;
}

/**
 * Base query parameters
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filter?: FilterParams;
}

/**
 * Base API response
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Base API error
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Base notification
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

/**
 * Base file
 */
export interface File {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  createdBy: string;
}

/**
 * Base comment
 */
export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base rating
 */
export interface Rating {
  id: string;
  score: number; // 1-5
  comment?: string;
  userId: string;
  createdAt: string;
}

/**
 * Base date range
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Base time range
 */
export interface TimeRange {
  startTime: string;
  endTime: string;
}

/**
 * Base price
 */
export interface Price {
  amount: number;
  currency: string;
}

/**
 * Base contact information
 */
export interface ContactInfo {
  email: string;
  phone?: string;
  address?: Address;
}

/**
 * Base social media links
 */
export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

/**
 * Base settings
 */
export interface Settings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

/**
 * Base metadata
 */
export interface Metadata {
  [key: string]: string | number | boolean | null;
}
