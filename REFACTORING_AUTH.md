# Authentication System Refactoring

This document outlines the refactoring of the authentication system in the FAIT Co-op platform.

## Overview

The authentication system has been refactored to improve maintainability, scalability, and code organization. The new system follows the modular architecture pattern and provides a clean, consistent API for authentication.

## Key Changes

1. **Modular Architecture**: Authentication code has been moved to the `src/modules/core/auth` directory, following the modular architecture pattern.

2. **Unified Authentication Provider**: Created a single, unified authentication provider that can be used throughout the application.

3. **Separation of Concerns**: Separated Supabase and local authentication implementations behind a common interface.

4. **Improved Error Handling**: Added consistent error handling for authentication operations.

5. **Better Type Safety**: Added comprehensive TypeScript types for authentication-related code.

6. **Enhanced Session Management**: Implemented better session management with auto-refresh and timeout warnings.

## Directory Structure

```
src/modules/core/auth/
  ├── components/           # Authentication-related components
  │   ├── LoginForm.tsx     # Login form component
  │   ├── ProtectedRoute.tsx # Protected route component
  │   ├── SessionTimeoutWarning.tsx # Session timeout warning component
  │   └── index.ts          # Components barrel file
  ├── contexts/             # Authentication contexts
  │   ├── AuthContext.tsx   # Main authentication context
  │   └── index.ts          # Contexts barrel file
  ├── hooks/                # Authentication hooks
  │   ├── useAuth.ts        # Hook to access auth context
  │   ├── useProtectedRoute.ts # Hook for protected routes
  │   ├── useSessionManager.ts # Hook for session management
  │   └── index.ts          # Hooks barrel file
  ├── services/             # Authentication services
  │   ├── supabaseAuth.ts   # Supabase authentication implementation
  │   ├── localAuth.ts      # Local authentication implementation
  │   └── index.ts          # Services barrel file
  ├── types/                # Authentication types
  │   └── index.ts          # Types definitions
  ├── index.ts              # Module barrel file
  └── README.md             # Module documentation
```

## Usage

### Basic Authentication

```tsx
import { useAuth } from '@/modules/core/auth';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn('user@example.com', 'password')}>Sign In</button>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from '@/modules/core/auth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredUserType="admin">
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

### Login Form

```tsx
import { LoginForm } from '@/modules/core/auth';

function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <LoginForm 
        onSuccess={() => console.log('Logged in!')}
        onError={(error) => console.error('Login error:', error)}
        redirectTo="/dashboard"
      />
    </div>
  );
}
```

### Session Management

```tsx
import { useSessionManager, SessionTimeoutWarning } from '@/modules/core/auth';

function App() {
  const { signOut } = useAuth();
  
  return (
    <div>
      {/* Your app content */}
      <SessionTimeoutWarning 
        warningTime={5 * 60 * 1000} // 5 minutes before expiry
        autoRefreshTime={10 * 60 * 1000} // 10 minutes before expiry
        onSignOut={signOut}
      />
    </div>
  );
}
```

## Migration Guide

To migrate existing code to use the new authentication system:

1. Replace imports from `./contexts/UnifiedAuthContext` or `./contexts/AuthContext` with imports from `@/modules/core/auth`.

2. Replace the `AuthProvider` component with the new one from `@/modules/core/auth`.

3. Update any custom authentication logic to use the new hooks and components.

## Example

A complete example of the new authentication system can be found at `/demo/auth`.

## Next Steps

1. Migrate all existing authentication code to use the new system.

2. Add comprehensive tests for the authentication system.

3. Implement additional authentication methods (e.g., magic link, phone authentication).

4. Enhance the session management with more features (e.g., concurrent session handling, device management).
