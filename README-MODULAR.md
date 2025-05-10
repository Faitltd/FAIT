# FAIT Co-op Platform - Modular Architecture

This document describes the modular architecture of the FAIT Co-op platform.

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

### Core Module
Shared functionality used across all other modules including authentication, common UI components, and utilities.

### User Module
User management and role-specific dashboards for clients, service agents, and admins.

### Project Module
Project creation and management functionality including tasks, milestones, and documents.

### Booking Module
Service booking and scheduling with calendar integration and availability management.

### Communication Module
Messaging and notification systems for communication between users.

### Estimation Module
Service estimation and pricing tools including calculators and proposal generators.

### Payment Module
Payment processing and financial management with Stripe integration.

### Maps & Location Module
Location-based services and mapping with Google Maps integration.

### Warranty Module
Warranty management and claims processing.

## Usage

Import components and utilities from modules:

```typescript
// Import from a specific module
import { Button } from '@/modules/core/components/ui';
import { useAuth } from '@/modules/core/hooks';
import { ProjectList } from '@/modules/project/components';

// Or use the module index
import { core, project } from '@/modules';

function MyComponent() {
  const { user } = core.hooks.useAuth();
  
  return (
    <div>
      <core.components.ui.Button>Click Me</core.components.ui.Button>
      <project.components.ProjectList />
    </div>
  );
}
```

## Benefits of Modular Architecture

1. **Improved Code Organization**: Clearer separation of concerns makes the codebase more maintainable
2. **Team Collaboration**: Different teams can work on different modules simultaneously
3. **Easier Testing**: Modules can be tested independently
4. **Selective Loading**: Only load modules needed for specific user roles
5. **Scalability**: New features can be added to specific modules without affecting others
6. **Performance**: Smaller bundle sizes through code splitting
7. **Reusability**: Components can be reused across different parts of the application
8. **Deployment Flexibility**: Modules could potentially be deployed separately

## Development Guidelines

1. **Module Independence**: Modules should be as independent as possible.
2. **Dependency Direction**: Core module can be imported by any other module, but specialized modules should not import from each other directly.
3. **Shared Types**: Common types should be defined in the Core module.
4. **Context Usage**: Context providers should be used for state that needs to be shared across components within a module.
5. **Public API**: Only export what's needed through the module's index.ts file.

## Migration

For instructions on migrating existing code to the new modular architecture, see the [Migration Guide](src/modules/MIGRATION_GUIDE.md).

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the required variables
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run preview` - Preview the production build
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Learn More

For more information about each module, see the README.md file in each module directory.
