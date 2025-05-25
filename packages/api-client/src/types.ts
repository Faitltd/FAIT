import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['client', 'service_agent', 'admin']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Project schema
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  clientId: z.string().uuid(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']),
  budget: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Service schema
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number().optional(),
  priceUnit: z.enum(['hourly', 'fixed', 'daily']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Service = z.infer<typeof ServiceSchema>;

// Profile schema
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// API Error schema
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Paginated response schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};
