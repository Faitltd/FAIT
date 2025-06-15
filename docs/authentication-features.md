# Authentication Features

This document describes the authentication features implemented in the FAIT Co-op platform.

## Overview

The authentication system provides secure user authentication with the following features:

- Email/password authentication
- OAuth authentication with Google and Facebook
- Multi-factor authentication (MFA)
- Session management with automatic refresh and expiry
- Secure password reset

## Authentication Methods

### Email/Password Authentication

The standard authentication method using email and password:

- Secure password storage with bcrypt hashing
- Password strength requirements
- Account lockout after multiple failed attempts
- Email verification for new accounts

### OAuth Authentication

OAuth authentication allows users to sign in using their existing accounts:

- Google OAuth integration
- Facebook OAuth integration
- Automatic profile creation for new OAuth users
- Profile linking for existing users

### Multi-Factor Authentication (MFA)

MFA provides an additional layer of security:

- Time-based one-time password (TOTP) with authenticator apps
- SMS-based verification codes via Twilio
- WebAuthn support for hardware security keys
- Backup codes for account recovery

## Session Management

Session management ensures secure and convenient user sessions:

- 24-hour maximum session duration
- 2-hour inactivity timeout
- Automatic session refresh
- Session expiry warnings
- Multiple device sessions

## Configuration

### OAuth Provider Configuration

OAuth providers are configured in the Supabase configuration file:

```toml
# Google OAuth configuration
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
redirect_uri = "http://localhost:5173/oauth-callback"
skip_nonce_check = true
scopes = "email,profile"

# Facebook OAuth configuration
[auth.external.facebook]
enabled = true
client_id = "env(SUPABASE_AUTH_FACEBOOK_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_FACEBOOK_SECRET)"
redirect_uri = "http://localhost:5173/oauth-callback"
scopes = "email,public_profile"
```

### MFA Configuration

MFA is configured in the Supabase configuration file. **Note: Phone MFA is disabled to reduce costs.**

```toml
# Control MFA via App Authenticator (TOTP) - Primary MFA method
[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true

# Configure MFA via Phone Messaging - DISABLED to reduce costs
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your FAIT Co-op verification code is {{ .Code }}"
max_frequency = "5s"

# Configure Twilio for SMS-based MFA - DISABLED to reduce costs
[auth.sms.twilio]
enabled = false
account_sid = "env(TWILIO_ACCOUNT_SID)"
message_service_sid = "env(TWILIO_MESSAGE_SERVICE_SID)"
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"
```

**Cost Optimization:**
- Phone/SMS MFA is disabled to avoid high Supabase Auth MFA Phone Hours charges
- TOTP (Time-based One-Time Password) via authenticator apps is the primary MFA method
- This reduces costs from ~$76/month to $0 for MFA phone usage

### Session Configuration

Session management is configured in the Supabase configuration file:

```toml
# Configure logged in session timeouts.
[auth.sessions]
# Force log out after the specified duration.
timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
inactivity_timeout = "2h"
# Allow users to have multiple active sessions.
multiple_sessions = true
```

## Testing

Authentication features can be tested using Cypress:

```bash
# Run all authentication tests
./test-auth-features.sh

# Run specific authentication tests
npx cypress run --spec "cypress/e2e/auth/oauth-login.cy.js"
npx cypress run --spec "cypress/e2e/auth/mfa.cy.js"
npx cypress run --spec "cypress/e2e/auth/session-management.cy.js"
```

## Implementation Details

### OAuth Flow

1. User clicks on OAuth provider button
2. User is redirected to provider's authentication page
3. User authenticates with the provider
4. Provider redirects back to the application with an authorization code
5. Application exchanges the code for an access token
6. Application creates or retrieves the user profile
7. User is redirected to the appropriate dashboard

### MFA Flow

1. User enables MFA in account settings
2. User scans QR code with authenticator app
3. User enters verification code to confirm setup
4. MFA is enabled for the account
5. On subsequent logins, user is prompted for MFA code
6. User enters code from authenticator app
7. Authentication is completed

### Session Management Flow

1. User logs in and receives a session token
2. Session token has an expiry time (1 hour by default)
3. Session is automatically refreshed before expiry
4. If session is about to expire, user is shown a warning
5. User can choose to stay logged in or log out
6. If session exceeds maximum duration (24 hours), user is logged out

## Security Considerations

- OAuth providers should be configured with the correct redirect URIs
- MFA should be encouraged for all users, especially administrators
- Session timeouts should be adjusted based on security requirements
- Failed authentication attempts should be monitored and limited
- Password reset emails should expire after a short period
