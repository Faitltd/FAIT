# Modular Architecture Usage Guide

This guide provides practical examples of how to use the modular architecture in your application.

## Importing Components

There are several ways to import components from modules:

### Direct Import from Component File

```tsx
// Import directly from component file
import { Button } from '@/modules/core/components/ui/Button';
```

### Import from Component Category Index

```tsx
// Import from component category index
import { Button } from '@/modules/core/components/ui';
```

### Import from Module Components Index

```tsx
// Import from module components index
import { Button } from '@/modules/core/components';
```

### Import from Module Index

```tsx
// Import from module index
import { core } from '@/modules';

function MyComponent() {
  return <core.components.ui.Button>Click Me</core.components.ui.Button>;
}
```

## Creating Pages with Multiple Modules

Pages can use components from multiple modules. Here's an example:

```tsx
import React from 'react';

// Import from core module
import { PageLayout } from '@/modules/core/components/layout';
import { Button } from '@/modules/core/components/ui';

// Import from project module
import { ProjectList } from '@/modules/project/components';

// Import from booking module
import { BookingCalendar } from '@/modules/booking/components/calendar';

function DashboardPage() {
  return (
    <PageLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Projects</h2>
          <ProjectList />
          <Button className="mt-4">Create Project</Button>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
          <BookingCalendar />
        </div>
      </div>
    </PageLayout>
  );
}

export default DashboardPage;
```

## Using Hooks

Import and use hooks from modules:

```tsx
import { useMediaQuery } from '@/modules/core/hooks';
import { useProjectList } from '@/modules/project/hooks';

function ResponsiveProjectList() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { projects, isLoading } = useProjectList();
  
  return (
    <div>
      {isMobile ? (
        <MobileProjectList projects={projects} isLoading={isLoading} />
      ) : (
        <DesktopProjectList projects={projects} isLoading={isLoading} />
      )}
    </div>
  );
}
```

## Using Services

Import and use services from modules:

```tsx
import { projectService } from '@/modules/project/services';

async function createNewProject(projectData) {
  try {
    const project = await projectService.createProject(projectData);
    return project;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}
```

## Using Types

Import and use types from modules:

```tsx
import { Project } from '@/modules/project/types';
import { Booking } from '@/modules/booking/types';

interface ProjectWithBookings {
  project: Project;
  bookings: Booking[];
}

function ProjectDetails({ project, bookings }: ProjectWithBookings) {
  // Component implementation
}
```

## Using Context Providers

Import and use context providers from modules:

```tsx
import { ProjectProvider } from '@/modules/project/contexts';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BookingProvider>
          <Router>
            {/* Routes */}
          </Router>
        </BookingProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
```

## Creating New Components

When creating new components, place them in the appropriate module:

```tsx
// src/modules/project/components/details/ProjectTimeline.tsx
import React from 'react';
import { Project } from '../../types';

export interface ProjectTimelineProps {
  project: Project;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project }) => {
  // Component implementation
};
```

Then export it from the appropriate index files:

```tsx
// src/modules/project/components/details/index.ts
export * from './ProjectTimeline';

// src/modules/project/components/index.ts
export * from './details';
```

## Module Communication

Modules should communicate through well-defined interfaces:

1. **Core Module**: Can be imported by any other module
2. **Specialized Modules**: Should not import from each other directly
3. **Page Components**: Can import from multiple modules to compose functionality

If you need to share state between modules, use a higher-level context provider or state management solution.

## Code Splitting

The modular architecture supports code splitting for better performance:

```tsx
import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/modules/core/components/common';

// Lazy load module components
const ProjectList = lazy(() => import('@/modules/project/components/ProjectList'));
const BookingCalendar = lazy(() => import('@/modules/booking/components/calendar/BookingCalendar'));

function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectList />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <BookingCalendar />
      </Suspense>
    </div>
  );
}
```

## Testing

Each module can be tested independently:

```tsx
// src/modules/project/components/__tests__/ProjectList.test.tsx
import { render, screen } from '@testing-library/react';
import { ProjectList } from '../ProjectList';

describe('ProjectList', () => {
  it('renders projects correctly', () => {
    const projects = [/* mock projects */];
    render(<ProjectList projects={projects} />);
    
    expect(screen.getByText('Project 1')).toBeInTheDocument();
  });
});
```
