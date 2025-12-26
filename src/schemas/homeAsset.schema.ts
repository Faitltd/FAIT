import { z } from 'zod';

export const homeInputSchema = z.object({
  name: z.string().min(1),
  address_line1: z.string().min(1),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  year_built: z.number().int().optional().nullable(),
  square_feet: z.number().int().optional().nullable()
});

export const assetInputSchema = z.object({
  category: z.string().min(1),
  display_name: z.string().min(1),
  brand: z.string().trim().max(64).optional().nullable(),
  model_number: z.string().trim().max(64).optional().nullable(),
  serial_number: z.string().trim().max(64).optional().nullable(),
  install_date: z.string().optional().nullable(),
  installed_by: z.string().optional().nullable(),
  location_in_home: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  warranty_start_date: z.string().optional().nullable(),
  warranty_end_date: z.string().optional().nullable(),
  service_interval_months: z.number().int().min(1).max(60).optional().nullable(),
  last_service_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
}).superRefine((value, context) => {
  if (value.warranty_start_date && value.warranty_end_date) {
    const start = new Date(value.warranty_start_date);
    const end = new Date(value.warranty_end_date);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'warranty_end_date must be on or after warranty_start_date',
        path: ['warranty_end_date']
      });
    }
  }
});

export const warrantyCoverageInputSchema = z.object({
  coverage_type: z.string().min(1),
  provider: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  claim_instructions: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable()
});

export const serviceEventInputSchema = z.object({
  asset_id: z.string().uuid().optional().nullable(),
  event_type: z.string().min(1),
  performed_by: z.string().optional().nullable(),
  event_date: z.string().min(1),
  notes: z.string().optional().nullable(),
  cost_cents: z.number().int().optional().nullable(),
  warranty_related: z.boolean().optional().nullable()
});
