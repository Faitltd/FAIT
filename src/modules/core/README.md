# Core Module

The Core module provides shared functionality used across all other modules in the FAIT Co-op platform.

## Features

- Authentication system
- Common UI components
- Shared utilities and hooks
- Base layout components
- Navigation system
- Error handling
- Toast notifications
- Service worker registration
- Web worker management

## Directory Structure

```
/core
  /components     # Common UI components
    /ui           # Base UI components (buttons, inputs, etc.)
    /layout       # Layout components (header, footer, etc.)
    /common       # Shared components (loaders, error boundaries, etc.)
  /hooks          # Shared React hooks
  /services       # Core API services
  /types          # Common TypeScript type definitions
  /utils          # Utility functions
  /contexts       # Core context providers
  index.ts        # Public API exports
```

## Usage

Import components and utilities from the Core module:

```typescript
import { Button, Card, Input } from '@/modules/core/components/ui';
import { useAuth } from '@/modules/core/hooks/useAuth';
import { formatDate } from '@/modules/core/utils/dateUtils';
```

## Authentication

The Core module provides authentication functionality through the AuthContext:

```typescript
import { useAuth } from '@/modules/core/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  // Use authentication functions
}
```

## UI Components

The Core module includes base UI components that follow the design system:

```typescript
import { Button, Card, Input } from '@/modules/core/components/ui';

function MyForm() {
  return (
    <Card>
      <Input type="text" placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Layout Components

Use layout components for consistent page structure:

```typescript
import { PageLayout } from '@/modules/core/components/layout';

function MyPage() {
  return (
    <PageLayout title="My Page">
      {/* Page content */}
    </PageLayout>
  );
}
```
