import { Status, User, Comment, File } from '../../core/types/common';

/**
 * Project status
 */
export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Project priority
 */
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Project category
 */
export enum ProjectCategory {
  REMODELING = 'remodeling',
  RENOVATION = 'renovation',
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  NEW_CONSTRUCTION = 'new_construction',
  OTHER = 'other'
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  category: ProjectCategory;
  clientId: string;
  client?: User;
  serviceAgentId?: string;
  serviceAgent?: User;
  budget?: number;
  startDate?: string;
  endDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  progress: number;
  tasks?: Task[];
  milestones?: Milestone[];
  documents?: File[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Task status
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  assignee?: User;
  dueDate?: string;
  priority: ProjectPriority;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Milestone interface
 */
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project issue status
 */
export enum ProjectIssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

/**
 * Project issue priority
 */
export enum ProjectIssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Project issue interface
 */
export interface ProjectIssue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: ProjectIssueStatus;
  priority: ProjectIssuePriority;
  reporterId: string;
  reporter?: User;
  assigneeId?: string;
  assignee?: User;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project permit status
 */
export enum PermitStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Project permit interface
 */
export interface ProjectPermit {
  id: string;
  projectId: string;
  type: string;
  description: string;
  status: PermitStatus;
  submissionDate?: string;
  approvalDate?: string;
  expirationDate?: string;
  permitNumber?: string;
  issuingAuthority: string;
  documents?: File[];
  createdAt: string;
  updatedAt: string;
}
