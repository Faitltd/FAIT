/**
 * Common validation utilities
 */

/**
 * Validates a US ZIP code
 * Accepts 5-digit (12345) or 9-digit (12345-6789) formats
 */
export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

/**
 * Validates a US state code (2-letter abbreviation)
 */
export function isValidStateCode(stateCode: string): boolean {
  const stateCodes = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'AS', 'GU', 'MP', 'PR', 'VI'
  ];
  return stateCodes.includes(stateCode.toUpperCase());
}

/**
 * Validates a tax ID (EIN) format
 * Accepts 9-digit format with or without hyphens (12-3456789 or 123456789)
 */
export function isValidTaxId(taxId: string): boolean {
  // Remove hyphens for validation
  const cleanTaxId = taxId.replace(/-/g, '');
  
  // Check if it's 9 digits
  if (!/^\d{9}$/.test(cleanTaxId)) {
    return false;
  }
  
  // Additional validation could be added here
  // Note: Real EIN validation would require IRS database access
  
  return true;
}

/**
 * Validates a license number format
 * This is a basic validation that can be customized based on specific license types
 */
export function isValidLicenseNumber(licenseNumber: string, licenseType?: string): boolean {
  // Basic validation - non-empty string with at least 4 characters
  if (!licenseNumber || licenseNumber.trim().length < 4) {
    return false;
  }
  
  // Add specific validations based on license type if needed
  if (licenseType) {
    switch (licenseType.toLowerCase()) {
      case 'contractor':
        // Example: Contractor licenses often have specific formats
        return /^[A-Z0-9]{6,12}$/.test(licenseNumber);
      case 'plumber':
        // Example: Plumber licenses might have a different format
        return /^P-\d{6}$/.test(licenseNumber);
      case 'electrician':
        // Example: Electrician licenses might have another format
        return /^E-\d{6}$/.test(licenseNumber);
      default:
        // Default validation for other license types
        return true;
    }
  }
  
  return true;
}

/**
 * Validates an insurance policy number
 * This is a basic validation that can be customized based on specific insurance providers
 */
export function isValidInsurancePolicy(policyNumber: string, provider?: string): boolean {
  // Basic validation - non-empty string with at least 5 characters
  if (!policyNumber || policyNumber.trim().length < 5) {
    return false;
  }
  
  // Add specific validations based on insurance provider if needed
  if (provider) {
    // Example provider-specific validations could be added here
  }
  
  return true;
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a password strength
 * Requires at least 8 characters, one uppercase letter, one lowercase letter, and one number
 */
export function isStrongPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Gets password strength score (0-4)
 * 0: Very weak, 1: Weak, 2: Medium, 3: Strong, 4: Very strong
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  
  // Variety check
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;
  
  return Math.min(4, Math.floor(score));
}

export default {
  isValidZipCode,
  isValidStateCode,
  isValidTaxId,
  isValidLicenseNumber,
  isValidInsurancePolicy,
  isValidUrl,
  isValidEmail,
  isStrongPassword,
  getPasswordStrength,
};
