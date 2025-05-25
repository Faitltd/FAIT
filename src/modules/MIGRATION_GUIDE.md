# Migration Guide: Moving to Modular Architecture

This guide provides instructions for migrating code from the current structure to the new modular architecture.

## Overview

The FAIT Co-op platform has been restructured into modular components to improve maintainability, scalability, and code organization. Each module is designed to be self-contained with its own components, hooks, services, and types.

## Module Structure

Each module follows this structure:

```
/module-name
  /components     # UI components specific to this module
  /hooks          # Custom React hooks
  /services       # API services and business logic
  /types          # TypeScript type definitions
  /utils          # Utility functions
  /contexts       # Context providers (if needed)
  index.ts        # Public API exports
  README.md       # Module documentation
```

## Available Modules

- **Core**: Shared functionality used across all other modules
- **User**: User management and role-specific dashboards
- **Project**: Project creation and management
- **Booking**: Service booking and scheduling
- **Communication**: Messaging and notification systems
- **Estimation**: Service estimation and pricing tools
- **Payment**: Payment processing and financial management
- **Maps**: Location-based services and mapping
- **Warranty**: Warranty management and claims processing

## Migration Steps

### 1. Identify Component Category

First, identify which module your component belongs to based on its functionality:

- UI components → Core module
- Authentication → Core module
- User profiles → User module
- Dashboards → User module
- Projects → Project module
- Bookings → Booking module
- Messages → Communication module
- Calculators → Estimation module
- Payments → Payment module
- Maps → Maps module
- Warranties → Warranty module

### 2. Move Component Files

Move your component files to the appropriate module directory:

```bash
# Example: Moving a project component
mv src/components/projects/ProjectList.tsx src/modules/project/components/ProjectList.tsx
```

### 3. Update Imports

Update import statements in your files to use the new module structure:

```typescript
// Before
import { ProjectList } from '@/components/projects';

// After
import { ProjectList } from '@/modules/project/components';
```

Or use the module index:

```typescript
import { project } from '@/modules';

function MyComponent() {
  return <project.components.ProjectList />;
}
```

### 4. Update Context Usage

Move context providers to their respective modules and update imports:

```typescript
// Before
import { useAuth } from '@/contexts/AuthContext';

// After
import { useAuth } from '@/modules/core/hooks';
```

### 5. Update Service Calls

Move service files to their respective modules and update imports:

```typescript
// Before
import { projectService } from '@/services/projectService';

// After
import { projectService } from '@/modules/project/services';
```

### 6. Update Types

Move type definitions to their respective modules and update imports:

```typescript
// Before
import { Project } from '@/types/project';

// After
import { Project } from '@/modules/project/types';
```

## Best Practices

1. **Module Independence**: Modules should be as independent as possible.
2. **Dependency Direction**: Core module can be imported by any other module, but specialized modules should not import from each other directly.
3. **Shared Types**: Common types should be defined in the Core module.
4. **Context Usage**: Context providers should be used for state that needs to be shared across components within a module.
5. **Public API**: Only export what's needed through the module's index.ts file.

## Example Migration

### Before

```typescript
// src/components/projects/ProjectList.tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { Project } from '@/types/project';

export function ProjectList() {
  // Component implementation
}
```

### After

```typescript
// src/modules/project/components/ProjectList.tsx
import React from 'react';
import { useAuth } from '@/modules/core/hooks';
import { projectService } from '@/modules/project/services';
import { Project } from '@/modules/project/types';

export function ProjectList() {
  // Component implementation
}
```

## Gradual Migration

You don't need to migrate everything at once. Follow these steps for a gradual migration:

1. Start with the Core module
2. Migrate one feature module at a time
3. Update imports as you go
4. Run tests after each module migration
5. Update documentation

## Need Help?

If you have questions about which module a component should belong to or how to structure your code, refer to the README.md file in each module directory or ask for guidance from the team.
