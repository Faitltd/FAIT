import { z } from 'zod';

export const maintenanceRuleSchema = z.object({
  scope: z.enum(['home', 'category', 'asset']),
  category: z.string().optional().nullable(),
  asset_id: z.string().uuid().optional().nullable(),
  interval_months: z.number().int().min(1).max(60).optional().nullable(),
  lead_days: z.number().int().min(1).max(365).default(30),
  overdue_grace_days: z.number().int().min(0).max(90).default(7),
  enabled: z.boolean().default(true)
}).superRefine((value, context) => {
  if (value.scope === 'category' && !value.category) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'category is required for category scope',
      path: ['category']
    });
  }

  if (value.scope === 'asset' && !value.asset_id) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'asset_id is required for asset scope',
      path: ['asset_id']
    });
  }
});

export const reminderStatusUpdateSchema = z.object({
  status: z.enum(['open', 'snoozed', 'completed', 'dismissed']),
  snoozed_until: z.string().optional().nullable()
}).superRefine((value, context) => {
  if (value.status === 'snoozed' && !value.snoozed_until) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'snoozed_until is required when status is snoozed',
      path: ['snoozed_until']
    });
  }
});
