# Authentication System Documentation

This document provides an overview of the authentication system implemented in the FAIT Co-op platform.

## Overview

The authentication system is designed to be robust and reliable, with support for both Supabase authentication and a local authentication fallback. This ensures that the application can function even when Supabase is not available or during development and testing.

## Authentication Modes

The system supports two authentication modes:

1. **Supabase Authentication**: Uses Supabase's authentication service for production environments.
2. **Local Authentication**: Uses a local implementation that mimics Supabase's API but stores data in localStorage. This is particularly useful for development, testing, and as a fallback mechanism.

## Test Credentials

The following test credentials are guaranteed to work in both authentication modes:

| Type | Email | Password |
|------|-------|----------|
| Admin | admin@itsfait.com | admin123 |
| Client | client@itsfait.com | client123 |
| Service Agent | service@itsfait.com | service123 |

## Switching Authentication Modes

You can switch between authentication modes in several ways:

1. **Programmatically**: Use the `toggleAuthMode()` function from `src/lib/supabase.ts`.
2. **UI**: Use the AuthModeSelector component that appears at the bottom of the screen.
3. **localStorage**: Set `useLocalAuth` to `'true'` or `'false'` in localStorage.

## Testing Authentication

Several test scripts are available to verify that authentication is working correctly:

1. **Basic Auth Test**: `npm run test:auth-credentials`
2. **Local Auth Test**: `npm run test:local-auth-credentials`
3. **Comprehensive Auth Test**: `npm run test:auth-comprehensive`

You can also manually test authentication by visiting the `/test-auth-credentials` page in the application.

## Authentication Flow

1. User enters credentials on the login page.
2. The `AuthContext` handles the authentication request using either Supabase or local authentication.
3. Upon successful authentication, the user is redirected to the appropriate dashboard based on their user type.
4. The user's session is stored in localStorage and managed by the `AuthContext`.

## Implementation Details

### Key Files

- `src/lib/supabase.ts`: Configures the Supabase client and handles authentication mode switching.
- `src/lib/localAuth.ts`: Implements the local authentication system.
- `src/lib/localSupabase.ts`: Provides a Supabase-compatible API for local authentication.
- `src/contexts/AuthContext.tsx`: Manages authentication state and provides authentication methods to the application.
- `src/components/auth/LoginForm.tsx`: Handles user login UI and interactions.

### Authentication Context

The `AuthContext` provides the following key features:

- User authentication state
- Login, logout, and registration methods
- Password reset functionality
- User type detection
- Authentication mode status

## Troubleshooting

If you encounter authentication issues:

1. Check the browser console for error messages.
2. Verify that you're using the correct credentials.
3. Try switching to local authentication mode for testing.
4. Clear localStorage and cookies, then try again.
5. Run the authentication tests to verify system functionality.

## Security Considerations

- The local authentication system is intended for development and testing only.
- In production, always use Supabase authentication.
- Never store sensitive credentials in code or version control.
- Always use HTTPS in production environments.

## Future Improvements

- Add support for social authentication providers.
- Implement multi-factor authentication.
- Add more granular role-based access control.
- Improve error handling and user feedback during authentication.
