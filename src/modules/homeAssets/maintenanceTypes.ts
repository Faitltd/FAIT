export type MaintenanceRuleScope = 'home' | 'category' | 'asset';

export interface MaintenanceRule {
  id: string;
  home_id: string;
  scope: MaintenanceRuleScope | string;
  category?: string | null;
  asset_id?: string | null;
  interval_months?: number | null;
  lead_days: number;
  overdue_grace_days: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ReminderType = 'due_soon' | 'overdue' | 'high_risk';
export type ReminderStatus = 'open' | 'snoozed' | 'completed' | 'dismissed';

export interface MaintenanceReminder {
  id: string;
  home_id: string;
  asset_id?: string | null;
  reminder_type: ReminderType | string;
  due_date?: string | null;
  created_for_date: string;
  status: ReminderStatus | string;
  snoozed_until?: string | null;
  last_notified_at?: string | null;
  meta?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationOutbox {
  id: string;
  home_id: string;
  reminder_id?: string | null;
  channel: 'email' | 'sms' | 'push' | string;
  to: string;
  template_key: string;
  payload: Record<string, unknown>;
  status: 'queued' | 'sent' | 'failed' | 'skipped' | string;
  error?: string | null;
  created_at: string;
  updated_at: string;
}
