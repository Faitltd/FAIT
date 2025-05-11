# Authentication Module

This module provides a unified authentication system for the FAIT Co-op platform. It handles user authentication, session management, and user permissions.

## Features

- User authentication (email/password, OAuth)
- Session management
- User permissions and roles
- Multi-factor authentication
- Development mode with test users

## Directory Structure

```
/auth
  /components     # Authentication-related components
  /contexts       # Authentication context providers
  /hooks          # Authentication hooks
  /services       # Authentication services
  /types          # Authentication type definitions
  /utils          # Authentication utility functions
  index.ts        # Public API exports
```

## Usage

Import and use the authentication hooks and components:

```tsx
import { useAuth } from '@/modules/core/auth/hooks';
import { LoginForm } from '@/modules/core/auth/components';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <LoginForm onSuccess={() => console.log('Logged in!')} />
      )}
    </div>
  );
}
```

## Authentication Modes

The authentication system supports two modes:

1. **Supabase Authentication**: Uses Supabase Auth for production use
2. **Local Authentication**: Uses a local implementation for development and testing

The mode can be toggled using the `toggleAuthMode` function from the auth context.

## User Types and Permissions

The authentication system defines the following user types:

- **Admin**: Platform administrators
- **Client**: Property owners who need services
- **Service Agent**: Service providers who offer services

Each user type has specific permissions that determine what actions they can perform in the application.
