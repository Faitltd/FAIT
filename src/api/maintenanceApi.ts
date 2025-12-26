import { supabase } from '../lib/supabaseClient';
import { maintenanceRuleSchema, reminderStatusUpdateSchema } from '../schemas/maintenance.schema';
import type { MaintenanceReminder, MaintenanceRule } from '../modules/homeAssets/maintenanceTypes';

const ensureValid = <T>(schema: { parse: (value: unknown) => T }, value: unknown): T => schema.parse(value);

export async function listMaintenanceReminders(
  userId: string,
  homeId: string,
  status?: string
): Promise<MaintenanceReminder[]> {
  let query = supabase
    .from('maintenance_reminders')
    .select('*, homes!inner(owner_id)')
    .eq('home_id', homeId)
    .eq('homes.owner_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(({ homes, ...reminder }) => reminder as MaintenanceReminder);
}

export async function updateReminderStatus(
  userId: string,
  reminderId: string,
  updates: { status: string; snoozed_until?: string | null }
): Promise<MaintenanceReminder> {
  const payload = ensureValid(reminderStatusUpdateSchema, updates);

  const { data: reminder, error: reminderError } = await supabase
    .from('maintenance_reminders')
    .select('id, home_id, homes!inner(owner_id)')
    .eq('id', reminderId)
    .eq('homes.owner_id', userId)
    .single();

  if (reminderError) throw reminderError;

  const { data, error } = await supabase
    .from('maintenance_reminders')
    .update({
      status: payload.status,
      snoozed_until: payload.snoozed_until ?? null
    })
    .eq('id', reminder.id)
    .select()
    .single();

  if (error) throw error;
  return data as MaintenanceReminder;
}

export async function listMaintenanceRules(userId: string, homeId: string): Promise<MaintenanceRule[]> {
  const { data, error } = await supabase
    .from('maintenance_rules')
    .select('*, homes!inner(owner_id)')
    .eq('home_id', homeId)
    .eq('homes.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(({ homes, ...rule }) => rule as MaintenanceRule);
}

export async function upsertMaintenanceRule(
  userId: string,
  homeId: string,
  rule: Partial<MaintenanceRule>
): Promise<MaintenanceRule> {
  const payload = ensureValid(maintenanceRuleSchema, rule);

  const { data, error } = await supabase
    .from('maintenance_rules')
    .upsert({
      home_id: homeId,
      scope: payload.scope,
      category: payload.category ?? null,
      asset_id: payload.asset_id ?? null,
      interval_months: payload.interval_months ?? null,
      lead_days: payload.lead_days,
      overdue_grace_days: payload.overdue_grace_days,
      enabled: payload.enabled
    })
    .select()
    .single();

  if (error) throw error;
  return data as MaintenanceRule;
}

export async function deleteMaintenanceRule(userId: string, ruleId: string): Promise<void> {
  const { data: rule, error: ruleError } = await supabase
    .from('maintenance_rules')
    .select('id, home_id, homes!inner(owner_id)')
    .eq('id', ruleId)
    .eq('homes.owner_id', userId)
    .single();

  if (ruleError) throw ruleError;

  const { error } = await supabase
    .from('maintenance_rules')
    .delete()
    .eq('id', rule.id);

  if (error) throw error;
}
