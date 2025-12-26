import type { AssetWithComputed } from '../../types';
import type { MaintenanceRule } from '../../maintenanceTypes';
import {
  evaluateReminderDecisions,
  resolveIntervalMonths,
  shouldSkipReminder
} from '../maintenanceEngine';

const baseAsset: AssetWithComputed = {
  id: 'asset-1',
  home_id: 'home-1',
  category: 'HVAC',
  display_name: 'Main HVAC',
  status: 'active',
  service_interval_months: 12,
  last_service_date: '2024-01-01',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  riskScore: 0,
  riskLevel: 'low',
  isDueSoon: false,
  overdueDays: null
};

describe('maintenance engine', () => {
  it('prefers asset rule over category and home rule', () => {
    const rules: MaintenanceRule[] = [
      { id: 'home', home_id: 'home-1', scope: 'home', interval_months: 24, lead_days: 30, overdue_grace_days: 7, enabled: true, created_at: '', updated_at: '' },
      { id: 'cat', home_id: 'home-1', scope: 'category', category: 'HVAC', interval_months: 18, lead_days: 20, overdue_grace_days: 5, enabled: true, created_at: '', updated_at: '' },
      { id: 'asset', home_id: 'home-1', scope: 'asset', asset_id: 'asset-1', interval_months: 6, lead_days: 10, overdue_grace_days: 3, enabled: true, created_at: '', updated_at: '' }
    ];

    expect(resolveIntervalMonths(baseAsset, rules)).toBe(6);
  });

  it('falls back to asset service interval when no rules', () => {
    expect(resolveIntervalMonths(baseAsset, [])).toBe(12);
  });

  it('creates due soon reminder within lead window', () => {
    const runDate = new Date('2024-02-01');
    const asset = { ...baseAsset, service_interval_months: 1 };
    const decisions = evaluateReminderDecisions(asset, [], runDate);
    const dueSoon = decisions.find(decision => decision.reminder_type === 'due_soon');
    expect(dueSoon).toBeTruthy();
  });

  it('skips reminders when completed recently', () => {
    const existing = [{
      id: 'rem-1',
      home_id: 'home-1',
      asset_id: 'asset-1',
      reminder_type: 'due_soon',
      created_for_date: '2024-01-15',
      status: 'completed',
      created_at: '2024-01-15',
      updated_at: '2024-01-15'
    }];

    const skip = shouldSkipReminder(existing as any, 'due_soon', new Date('2024-02-01'));
    expect(skip).toBe(true);
  });
});
