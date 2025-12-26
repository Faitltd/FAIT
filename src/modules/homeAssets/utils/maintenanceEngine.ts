import type { AssetWithComputed } from '../types';
import type { MaintenanceReminder, MaintenanceRule, ReminderType } from '../maintenanceTypes';
import { computeAssetRisk, computeNextServiceDueDate } from './assetComputations';

const DEFAULT_INTERVALS: Record<string, number> = {
  hvac: 6,
  'water heater': 12,
  dishwasher: 12,
  refrigerator: 12,
  washer: 12,
  dryer: 12,
  'garage door opener': 12,
  'sump pump': 12
};

const normalize = (value?: string | null) => (value || '').trim().toLowerCase();

export const resolveIntervalMonths = (
  asset: AssetWithComputed,
  rules: MaintenanceRule[]
): number | null => {
  const enabledRules = rules.filter(rule => rule.enabled);
  const assetRule = enabledRules.find(rule => rule.scope === 'asset' && rule.asset_id === asset.id);
  if (assetRule?.interval_months) return assetRule.interval_months;

  const categoryRule = enabledRules.find(rule => rule.scope === 'category' && normalize(rule.category) === normalize(asset.category));
  if (categoryRule?.interval_months) return categoryRule.interval_months;

  const homeRule = enabledRules.find(rule => rule.scope === 'home');
  if (homeRule?.interval_months) return homeRule.interval_months;

  if (asset.service_interval_months) return asset.service_interval_months;

  return DEFAULT_INTERVALS[normalize(asset.category)] ?? null;
};

export const resolveLeadDays = (
  asset: AssetWithComputed,
  rules: MaintenanceRule[]
): number => {
  const enabledRules = rules.filter(rule => rule.enabled);
  const assetRule = enabledRules.find(rule => rule.scope === 'asset' && rule.asset_id === asset.id);
  if (assetRule?.lead_days) return assetRule.lead_days;

  const categoryRule = enabledRules.find(rule => rule.scope === 'category' && normalize(rule.category) === normalize(asset.category));
  if (categoryRule?.lead_days) return categoryRule.lead_days;

  const homeRule = enabledRules.find(rule => rule.scope === 'home');
  return homeRule?.lead_days ?? 30;
};

export const resolveOverdueGraceDays = (
  asset: AssetWithComputed,
  rules: MaintenanceRule[]
): number => {
  const enabledRules = rules.filter(rule => rule.enabled);
  const assetRule = enabledRules.find(rule => rule.scope === 'asset' && rule.asset_id === asset.id);
  if (assetRule?.overdue_grace_days) return assetRule.overdue_grace_days;

  const categoryRule = enabledRules.find(rule => rule.scope === 'category' && normalize(rule.category) === normalize(asset.category));
  if (categoryRule?.overdue_grace_days) return categoryRule.overdue_grace_days;

  const homeRule = enabledRules.find(rule => rule.scope === 'home');
  return homeRule?.overdue_grace_days ?? 7;
};

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

const diffInDays = (later: Date, earlier: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcLater = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  const utcEarlier = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  return Math.floor((utcLater - utcEarlier) / msPerDay);
};

export const computeNextServiceDueDateWithRule = (
  asset: AssetWithComputed,
  rules: MaintenanceRule[]
): string | null => {
  const intervalMonths = resolveIntervalMonths(asset, rules);
  if (!intervalMonths) return null;

  const overrideAsset = { ...asset, service_interval_months: intervalMonths };
  return computeNextServiceDueDate(overrideAsset);
};

export interface ReminderDecision {
  reminder_type: ReminderType;
  due_date?: string | null;
  meta: Record<string, unknown>;
}

export const evaluateReminderDecisions = (
  asset: AssetWithComputed,
  rules: MaintenanceRule[],
  runDate: Date
): ReminderDecision[] => {
  const decisions: ReminderDecision[] = [];
  const leadDays = resolveLeadDays(asset, rules);
  const graceDays = resolveOverdueGraceDays(asset, rules);
  const dueDateValue = computeNextServiceDueDateWithRule(asset, rules);
  const dueDate = parseDate(dueDateValue);

  if (dueDate) {
    const daysUntilDue = diffInDays(dueDate, runDate);
    if (daysUntilDue >= 0 && daysUntilDue <= leadDays) {
      decisions.push({
        reminder_type: 'due_soon',
        due_date: dueDateValue,
        meta: {
          interval_months: resolveIntervalMonths(asset, rules),
          lead_days: leadDays
        }
      });
    }

    const overdueThreshold = addDays(dueDate, graceDays);
    if (runDate > overdueThreshold) {
      decisions.push({
        reminder_type: 'overdue',
        due_date: dueDateValue,
        meta: {
          interval_months: resolveIntervalMonths(asset, rules),
          overdue_grace_days: graceDays
        }
      });
    }
  }

  const risk = computeAssetRisk(asset);
  if (risk.riskLevel === 'high') {
    decisions.push({
      reminder_type: 'high_risk',
      due_date: dueDateValue,
      meta: {
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel
      }
    });
  }

  return decisions;
};

export const shouldSkipReminder = (
  existing: MaintenanceReminder[],
  reminderType: ReminderType,
  runDate: Date
): boolean => {
  const recentWindowStart = addDays(runDate, -30);
  const recent = existing.filter(reminder => reminder.reminder_type === reminderType);

  return recent.some(reminder => {
    const createdFor = parseDate(reminder.created_for_date);
    if (!createdFor || createdFor < recentWindowStart) return false;
    return ['completed', 'dismissed'].includes(reminder.status);
  });
};
