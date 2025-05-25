/**
 * Utility for validating user profile data
 */

import { z } from 'zod';
import { isValidZipCode } from './validators';

// Simple phone number validation function
function isValidPhoneNumber(phone: string): boolean {
  // Basic US phone number validation (10 digits, optionally formatted)
  const phoneRegex = /^(\+1|1)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

// Define the base profile schema
const baseProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100, 'Full name is too long'),
  email: z.string().email('Invalid email address'),
  user_type: z.enum(['client', 'service_agent', 'admin'], {
    errorMap: () => ({ message: 'Invalid user type' }),
  }),
});

// Define the client profile schema
const clientProfileSchema = baseProfileSchema.extend({
  phone: z.string().optional().refine(
    (val) => !val || isValidPhoneNumber(val, 'US'),
    { message: 'Invalid phone number' }
  ),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional().refine(
    (val) => !val || isValidZipCode(val),
    { message: 'Invalid ZIP code' }
  ),
  bio: z.string().optional(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
});

// Define the service agent profile schema
const serviceAgentProfileSchema = baseProfileSchema.extend({
  phone: z.string().refine(
    (val) => isValidPhoneNumber(val, 'US'),
    { message: 'Valid phone number is required for service agents' }
  ),
  address: z.string().min(5, 'Address is required for service agents'),
  city: z.string().min(2, 'City is required for service agents'),
  state: z.string().min(2, 'State is required for service agents'),
  zip_code: z.string().refine(
    isValidZipCode,
    { message: 'Valid ZIP code is required for service agents' }
  ),
  bio: z.string().min(20, 'Please provide a detailed bio (minimum 20 characters)').optional(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
  business_name: z.string().min(2, 'Business name is required').optional(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  license_number: z.string().optional(),
  license_type: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  tax_id: z.string().optional(),
});

// Define the admin profile schema
const adminProfileSchema = baseProfileSchema.extend({
  phone: z.string().refine(
    (val) => isValidPhoneNumber(val, 'US'),
    { message: 'Valid phone number is required for admins' }
  ),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
});

/**
 * Validates a profile based on user type
 */
export function validateProfile(profile: any): { success: boolean; errors?: Record<string, string> } {
  try {
    // Determine which schema to use based on user type
    let schema;
    switch (profile.user_type) {
      case 'client':
        schema = clientProfileSchema;
        break;
      case 'service_agent':
        schema = serviceAgentProfileSchema;
        break;
      case 'admin':
        schema = adminProfileSchema;
        break;
      default:
        return {
          success: false,
          errors: { user_type: 'Invalid user type' },
        };
    }

    // Validate the profile
    schema.parse(profile);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a more user-friendly format
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { _general: 'An unknown error occurred during validation' },
    };
  }
}

/**
 * Calculates the completion percentage of a profile
 */
export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const requiredFields = ['full_name', 'email', 'user_type'];
  const recommendedFields = ['phone', 'address', 'city', 'state', 'zip_code', 'bio', 'avatar_url'];

  // Additional fields based on user type
  const serviceAgentFields = profile.user_type === 'service_agent'
    ? ['business_name', 'website', 'license_number', 'license_type', 'insurance_provider', 'insurance_policy_number']
    : [];

  const allFields = [...requiredFields, ...recommendedFields, ...serviceAgentFields];

  // Count completed fields
  let completedFields = 0;
  allFields.forEach(field => {
    if (profile[field] && profile[field].toString().trim() !== '') {
      completedFields++;
    }
  });

  return Math.round((completedFields / allFields.length) * 100);
}

/**
 * Gets missing required fields for a profile
 */
export function getMissingRequiredFields(profile: any): string[] {
  if (!profile) return [];

  const requiredFields: Record<string, string> = {
    full_name: 'Full Name',
    email: 'Email',
    user_type: 'User Type',
  };

  // Add service agent specific required fields
  if (profile.user_type === 'service_agent') {
    requiredFields.phone = 'Phone Number';
    requiredFields.address = 'Address';
    requiredFields.city = 'City';
    requiredFields.state = 'State';
    requiredFields.zip_code = 'ZIP Code';
  }

  const missingFields: string[] = [];

  Object.entries(requiredFields).forEach(([field, label]) => {
    if (!profile[field] || profile[field].toString().trim() === '') {
      missingFields.push(label);
    }
  });

  return missingFields;
}

export default {
  validateProfile,
  calculateProfileCompletion,
  getMissingRequiredFields,
};
