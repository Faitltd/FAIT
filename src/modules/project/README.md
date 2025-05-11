# Project Module

The Project module handles project creation and management functionality for the FAIT Co-op platform.

## Features

- Project creation
- Project listing and filtering
- Project details view
- Task management
- Milestone tracking
- Document management
- Project progress tracking
- Project issues and resolution
- Project permits
- Project estimates

## Directory Structure

```
/project
  /components
    /creation      # Project creation components
    /details       # Project details components
    /tasks         # Task management components
    /milestones    # Milestone tracking components
    /documents     # Document management components
    /issues        # Issue tracking components
    /permits       # Permit management components
  /hooks           # Project-related hooks
  /services        # Project API services
  /types           # Project type definitions
  /utils           # Project utility functions
  /contexts        # Project context providers
  index.ts         # Public API exports
```

## Usage

Import components and utilities from the Project module:

```typescript
import { ProjectList } from '@/modules/project/components';
import { ProjectDetails } from '@/modules/project/components/details';
import { CreateProject } from '@/modules/project/components/creation';
import { TaskList } from '@/modules/project/components/tasks';
```

## Project Creation

The Project module provides components for creating new projects:

```typescript
import { CreateProject } from '@/modules/project/components/creation';

function NewProjectPage() {
  return <CreateProject />;
}
```

## Project Listing

Display a list of projects with filtering options:

```typescript
import { ProjectList } from '@/modules/project/components';

function ProjectsPage() {
  return <ProjectList />;
}
```

## Project Details

View detailed information about a specific project:

```typescript
import { ProjectDetails } from '@/modules/project/components/details';

function ProjectDetailsPage({ projectId }) {
  return <ProjectDetails projectId={projectId} />;
}
```

## Task Management

Manage tasks within a project:

```typescript
import { TaskList } from '@/modules/project/components/tasks';

function ProjectTasksPage({ projectId }) {
  return <TaskList projectId={projectId} />;
}
```

## Milestone Tracking

Track project milestones:

```typescript
import { MilestoneList } from '@/modules/project/components/milestones';

function ProjectMilestonesPage({ projectId }) {
  return <MilestoneList projectId={projectId} />;
}
```
