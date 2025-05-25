# User Module

The User module handles user management and role-specific dashboards for the FAIT Co-op platform.

## Features

- User profiles
- Role management
- Admin dashboard
- Client dashboard
- Service agent dashboard
- Ally dashboard
- User verification
- Onboarding flows
- Profile settings
- Account management

## Directory Structure

```
/user
  /components
    /admin          # Admin-specific components
    /client         # Client-specific components
    /service-agent  # Service agent-specific components
    /ally           # Ally-specific components
    /profile        # Profile components
    /verification   # Verification components
    /onboarding     # Onboarding components
  /hooks            # User-related hooks
  /services         # User API services
  /types            # User type definitions
  /utils            # User utility functions
  /contexts         # User context providers
  index.ts          # Public API exports
```

## Usage

Import components and utilities from the User module:

```typescript
import { AdminDashboard } from '@/modules/user/components/admin';
import { ClientDashboard } from '@/modules/user/components/client';
import { ServiceAgentDashboard } from '@/modules/user/components/service-agent';
import { ProfileSettings } from '@/modules/user/components/profile';
```

## User Types

The User module defines the following user types:

- **Client**: Property owners who need services
- **Service Agent**: Service providers who offer services
- **Admin**: Platform administrators
- **Ally**: Supporting professionals (architects, designers, etc.)

## Dashboards

Each user type has a specific dashboard:

```typescript
import { ClientDashboard } from '@/modules/user/components/client';
import { ServiceAgentDashboard } from '@/modules/user/components/service-agent';
import { AdminDashboard } from '@/modules/user/components/admin';
import { AllyDashboard } from '@/modules/user/components/ally';

function DashboardRouter() {
  const { userType } = useAuth();
  
  switch (userType) {
    case 'client':
      return <ClientDashboard />;
    case 'service_agent':
      return <ServiceAgentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'ally':
      return <AllyDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}
```

## Verification

The User module includes verification components for service agents:

```typescript
import { VerificationProcess } from '@/modules/user/components/verification';

function VerificationPage() {
  return <VerificationProcess />;
}
```
