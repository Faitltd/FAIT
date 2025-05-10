# Enhanced Authentication Features

This document provides an overview of the enhanced authentication features implemented in the FAIT Co-op platform.

## Table of Contents

1. [OAuth Authentication](#oauth-authentication)
2. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
3. [Session Management](#session-management)
4. [Error Handling](#error-handling)
5. [Testing](#testing)

## OAuth Authentication

OAuth authentication allows users to sign in using their existing accounts from providers like Google and Facebook.

### Features

- Google OAuth integration
- Facebook OAuth integration
- Automatic profile creation for new OAuth users
- Seamless login experience

### Implementation Details

OAuth authentication is implemented using Supabase's OAuth providers. The configuration is in `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
redirect_uri = "http://localhost:5173/oauth-callback"
skip_nonce_check = true

[auth.external.facebook]
enabled = true
client_id = "env(SUPABASE_AUTH_FACEBOOK_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_FACEBOOK_SECRET)"
redirect_uri = "http://localhost:5173/oauth-callback"
```

The OAuth flow is handled by:

1. `OAuthButtons.tsx` - UI component for OAuth login buttons
2. `OAuthCallback.tsx` - Handles OAuth redirects and session creation
3. `UnifiedAuthContext.tsx` - Provides OAuth authentication methods

### Usage

To use OAuth authentication in a component:

```tsx
import { useAuth } from '../../contexts/AuthContext';
import OAuthButtons from './OAuthButtons';

const LoginPage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Regular login form */}
      <LoginForm />
      
      {/* OAuth buttons */}
      <OAuthButtons 
        onSuccess={() => console.log('OAuth login successful')}
        onError={(error) => console.error('OAuth error:', error)}
      />
    </div>
  );
};
```

## Multi-Factor Authentication (MFA)

Multi-Factor Authentication adds an extra layer of security by requiring a second verification step during login.

### Features

- Time-based One-Time Password (TOTP) support
- QR code generation for authenticator apps
- SMS verification (requires Twilio configuration)
- MFA enrollment and verification flows

### Implementation Details

MFA is implemented using Supabase's MFA features. The configuration is in `supabase/config.toml`:

```toml
[auth.mfa]
max_enrolled_factors = 10

[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true

[auth.mfa.phone]
enroll_enabled = true
verify_enabled = true
otp_length = 6
template = "Your FAIT Co-op verification code is {{ .Code }}"
max_frequency = "5s"
```

The MFA flow is handled by:

1. `MFASetup.tsx` - UI component for setting up MFA
2. `MFAVerification.tsx` - UI component for verifying MFA during login
3. `UnifiedAuthContext.tsx` - Provides MFA methods

### Usage

To set up MFA:

```tsx
import { useAuth } from '../../contexts/AuthContext';
import MFASetup from './MFASetup';

const SecuritySettings = () => {
  const [showMFASetup, setShowMFASetup] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowMFASetup(true)}>
        Enable Two-Factor Authentication
      </button>
      
      {showMFASetup && (
        <MFASetup 
          onComplete={() => {
            setShowMFASetup(false);
            alert('MFA setup complete!');
          }}
          onCancel={() => setShowMFASetup(false)}
        />
      )}
    </div>
  );
};
```

## Session Management

Session management handles token refresh, session timeout, and user notifications about session status.

### Features

- Automatic token refresh
- Session timeout warnings
- Configurable warning and refresh times
- Graceful session expiration handling

### Implementation Details

Session management is implemented using:

1. `SessionManager.tsx` - Component that manages session state and UI
2. `UnifiedAuthContext.tsx` - Provides session management methods

The SessionManager is added to the application root in `App.tsx`:

```tsx
<SessionManager 
  warningTime={5 * 60 * 1000}  // Show warning 5 minutes before expiry
  autoRefreshTime={10 * 60 * 1000}  // Auto-refresh 10 minutes before expiry
>
  {/* App content */}
</SessionManager>
```

### Configuration

Session timeouts are configured in `supabase/config.toml`:

```toml
[auth.sessions]
timebox = "24h"
inactivity_timeout = "2h"
```

## Error Handling

Enhanced error handling provides better user feedback and debugging for authentication issues.

### Features

- Categorized authentication errors
- User-friendly error messages
- Detailed error logging
- Consistent error handling across the application

### Implementation Details

Error handling is implemented using:

1. `authErrorHandler.ts` - Utility for handling authentication errors
2. Error handling in authentication components

### Usage

```tsx
import { handleAuthError } from '../utils/authErrorHandler';

try {
  // Authentication code
} catch (err) {
  const formattedError = handleAuthError(err);
  console.error(`[${formattedError.category}] ${formattedError.message}`);
  setError(formattedError.message);
}
```

## Testing

Comprehensive tests ensure the authentication features work correctly.

### Test Files

- `cypress/e2e/auth/oauth-login.cy.js` - Tests for OAuth authentication
- `cypress/e2e/auth/mfa.cy.js` - Tests for MFA setup and verification
- `cypress/e2e/auth/session-management.cy.js` - Tests for session management

### Running Tests

```bash
# Run all authentication tests
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"

# Run specific test
npx cypress run --spec "cypress/e2e/auth/oauth-login.cy.js"
```
