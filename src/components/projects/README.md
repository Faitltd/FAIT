# FAIT Co-op Project Management Components

This directory contains the project management components for the FAIT Co-op platform. These components enable project listing, progress tracking, task completion monitoring, and other project management features.

## Available Components

### Project Management
- `ProjectList`: Displays a list of projects with filtering options
- `ProjectDetails`: Shows detailed information about a specific project
- `CreateProject`: Form for creating a new project
- `ProjectProgress`: Visual representation of project progress

### Task Management
- `TaskList`: Displays a list of tasks with status update functionality
- `MilestoneList`: Displays a list of project milestones

## Usage

Import components from the project management library:

```tsx
import { 
  ProjectList, 
  ProjectDetails, 
  CreateProject, 
  TaskList 
} from '../components/projects';
```

### Example

```tsx
// Projects page
<div className="container mx-auto px-4 py-8">
  <Heading level={1} className="mb-8">Projects</Heading>
  <ProjectList />
</div>

// Project details page
<div className="container mx-auto px-4 py-8">
  <ProjectDetails />
</div>

// Create project page
<div className="container mx-auto px-4 py-8">
  <CreateProject />
</div>
```

## Routes

The project management system uses the following routes:

- `/projects`: List all projects
- `/projects/create`: Create a new project
- `/projects/:projectId`: View project details

## Data Model

The project management system uses the following data model:

- `Project`: Main project entity with title, description, status, etc.
- `Milestone`: Key project milestones with due dates
- `Task`: Individual tasks with status, priority, and assignee
- `ProjectIssue`: Issues or problems that need to be addressed
- `ProjectDocument`: Documents associated with a project
- `ProjectPermit`: Permits required for a project
- `ProjectActivity`: Activity log for project events
- `ProjectComment`: Comments on projects, milestones, tasks, or issues
- `ProjectMember`: Users associated with a project and their roles
