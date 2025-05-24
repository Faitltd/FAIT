# FAIT Co-op Modular Architecture

This directory contains the modular components of the FAIT Co-op platform. Each module is designed to be self-contained with its own components, hooks, services, and types.

## Module Structure

Each module follows a similar structure:

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

## Usage Guidelines

1. **Module Independence**: Modules should be as independent as possible, with clear interfaces.
2. **Dependency Direction**: Core module can be imported by any other module, but specialized modules should not import from each other directly.
3. **Shared Types**: Common types should be defined in the Core module.
4. **Context Usage**: Context providers should be used for state that needs to be shared across components within a module.
5. **Public API**: Only export what's needed through the module's index.ts file.
