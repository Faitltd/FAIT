#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const parseRunDate = () => {
  const input = process.argv.find(arg => arg.startsWith('--date='));
  if (input) {
    const value = input.split('=')[1];
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const formatDate = (date) => date.toISOString().split('T')[0];

const DEFAULT_INTERVALS = {
  hvac: 6,
  'water heater': 12,
  dishwasher: 12,
  refrigerator: 12,
  washer: 12,
  dryer: 12,
  'garage door opener': 12,
  'sump pump': 12
};

const CATEGORY_LIFE_YEARS = {
  hvac: 15,
  'water heater': 10,
  dishwasher: 10,
  refrigerator: 12,
  washer: 11,
  dryer: 13,
  'garage door opener': 12,
  'sump pump': 7
};

const normalize = (value) => (value || '').trim().toLowerCase();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addMonths = (date, months) => {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

const diffInDays = (later, earlier) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcLater = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  const utcEarlier = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  return Math.floor((utcLater - utcEarlier) / msPerDay);
};

const resolveIntervalMonths = (asset, rules) => {
  const enabled = rules.filter(rule => rule.enabled);
  const assetRule = enabled.find(rule => rule.scope === 'asset' && rule.asset_id === asset.id);
  if (assetRule?.interval_months) return assetRule.interval_months;

  const categoryRule = enabled.find(rule => rule.scope === 'category' && normalize(rule.category) === normalize(asset.category));
  if (categoryRule?.interval_months) return categoryRule.interval_months;

  const homeRule = enabled.find(rule => rule.scope === 'home');
  if (homeRule?.interval_months) return homeRule.interval_months;

  if (asset.service_interval_months) return asset.service_interval_months;

  return DEFAULT_INTERVALS[normalize(asset.category)] ?? null;
};

const resolveLeadDays = (asset, rules) => {
  const enabled = rules.filter(rule => rule.enabled);
  const assetRule = enabled.find(rule => rule.scope === 'asset' && rule.asset_id === asset.id);
  if (assetRule?.lead_days) return assetRule.lead_days;

  const categoryRule = enabled.find(rule => rule.scope === 'category' && normalize(rule.category) === normalize(asset.category));
  if (categoryRule?.lead_days) return categoryRule.lead_days;

  const homeRule = enabled.find(rule => rule.scope === 'home');
  return homeRule?.lead_days ?? 30;
};

const resolveOverdueGraceDays = (asset, rules) => {
  const enabled = rules.filter(rule => rule.enabled);
  const assetRule = enabled.find(rule => rule.scope === 'asset' && rule.asset_id === asset.id);
  if (assetRule?.overdue_grace_days) return assetRule.overdue_grace_days;

  const categoryRule = enabled.find(rule => rule.scope === 'category' && normalize(rule.category) === normalize(asset.category));
  if (categoryRule?.overdue_grace_days) return categoryRule.overdue_grace_days;

  const homeRule = enabled.find(rule => rule.scope === 'home');
  return homeRule?.overdue_grace_days ?? 7;
};

const computeNextServiceDueDate = (asset, intervalMonths) => {
  if (!intervalMonths) return null;
  const lastService = parseDate(asset.last_service_date);
  if (lastService) return formatDate(addMonths(lastService, intervalMonths));
  const installDate = parseDate(asset.install_date);
  if (installDate) return formatDate(addMonths(installDate, intervalMonths));
  return null;
};

const computeAssetRisk = (asset, dueDateValue) => {
  const today = new Date();
  const warrantyEnd = parseDate(asset.warranty_end_date);
  const nextService = parseDate(dueDateValue);
  const installDate = parseDate(asset.install_date);
  const lifeYears = CATEGORY_LIFE_YEARS[normalize(asset.category)];

  let riskScore = 0;
  let overdueDays = null;

  if (warrantyEnd && warrantyEnd < today) riskScore += 2;

  if (nextService) {
    overdueDays = diffInDays(today, nextService);
    if (overdueDays > 30) riskScore += 2;
    else if (overdueDays > 0) riskScore += 1;
    else overdueDays = 0;
  }

  if (installDate && lifeYears) {
    const ageYears = diffInDays(today, installDate) / 365;
    if (ageYears >= lifeYears) riskScore += 2;
    else if (ageYears >= lifeYears * 0.8) riskScore += 1;
  }

  const riskLevel = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';
  return { riskScore, riskLevel, overdueDays };
};

const getTemplateKey = (type) => {
  switch (type) {
    case 'due_soon':
      return 'maintenance_due_soon';
    case 'overdue':
      return 'maintenance_overdue';
    case 'high_risk':
      return 'maintenance_high_risk';
    default:
      return 'maintenance_due_soon';
  }
};

const shouldSkipRecent = (reminders, type, runDate) => {
  const windowStart = new Date(runDate);
  windowStart.setDate(windowStart.getDate() - 30);
  return reminders.some(reminder => {
    if (reminder.reminder_type !== type) return false;
    const createdFor = new Date(reminder.created_for_date);
    if (Number.isNaN(createdFor.getTime()) || createdFor < windowStart) return false;
    return ['open', 'snoozed', 'completed', 'dismissed'].includes(reminder.status);
  });
};

const enqueueOutbox = async ({ home, asset, reminder, decision }) => {
  const to = home?.profiles?.email || '';
  const payload = {
    homeName: home?.name || '',
    address: home?.address || '',
    city: home?.city || '',
    state: home?.state || '',
    zip: home?.zip_code || '',
    assetName: asset?.display_name || '',
    assetCategory: asset?.category || '',
    dueDate: decision.due_date || null,
    reminderType: decision.reminder_type,
    portalLink: `/portal/homes/${home.id}/reminders`
  };

  const status = to ? 'queued' : 'skipped';
  const error = to ? null : 'Missing recipient email';

  await supabase
    .from('notification_outbox')
    .insert({
      home_id: home.id,
      reminder_id: reminder.id,
      channel: 'email',
      to: to || 'unknown',
      template_key: getTemplateKey(decision.reminder_type),
      payload,
      status,
      error
    });

  await supabase
    .from('maintenance_reminders')
    .update({ last_notified_at: new Date().toISOString() })
    .eq('id', reminder.id);
};

const reopenSnoozedReminders = async (homeId, runDate) => {
  const { data: snoozed } = await supabase
    .from('maintenance_reminders')
    .select('*')
    .eq('home_id', homeId)
    .eq('status', 'snoozed')
    .lte('snoozed_until', formatDate(runDate));

  if (!snoozed?.length) return [];

  const ids = snoozed.map(reminder => reminder.id);
  await supabase
    .from('maintenance_reminders')
    .update({ status: 'open', snoozed_until: null })
    .in('id', ids);

  return snoozed;
};

async function generateReminders() {
  const runDate = parseRunDate();
  const runDateString = formatDate(runDate);

  console.log(`Generating reminders for ${runDateString}`);

  const { data: homes, error: homesError } = await supabase
    .from('homes')
    .select('id, name, address, city, state, zip_code, owner_id, profiles(email)');

  if (homesError) {
    console.error('Error fetching homes:', homesError);
    process.exit(1);
  }

  for (const home of homes || []) {
    const [rulesResponse, assetsResponse, remindersResponse] = await Promise.all([
      supabase.from('maintenance_rules').select('*').eq('home_id', home.id),
      supabase.from('assets').select('*').eq('home_id', home.id),
      supabase.from('maintenance_reminders').select('*').eq('home_id', home.id)
    ]);

    if (rulesResponse.error || assetsResponse.error || remindersResponse.error) {
      console.error('Error loading data for home', home.id, rulesResponse.error || assetsResponse.error || remindersResponse.error);
      continue;
    }

    const rules = rulesResponse.data || [];
    const assets = assetsResponse.data || [];
    const reminders = remindersResponse.data || [];

    const reopened = await reopenSnoozedReminders(home.id, runDate);
    for (const reminder of reopened) {
      const asset = assets.find(item => item.id === reminder.asset_id) || null;
      await enqueueOutbox({
        home,
        asset,
        reminder,
        decision: { reminder_type: reminder.reminder_type, due_date: reminder.due_date }
      });
    }

    for (const asset of assets) {
      const intervalMonths = resolveIntervalMonths(asset, rules);
      const leadDays = resolveLeadDays(asset, rules);
      const graceDays = resolveOverdueGraceDays(asset, rules);
      const dueDateValue = computeNextServiceDueDate(asset, intervalMonths);
      const dueDate = parseDate(dueDateValue);
      const risk = computeAssetRisk(asset, dueDateValue);

      const decisions = [];
      if (dueDate) {
        const daysUntilDue = diffInDays(dueDate, runDate);
        if (daysUntilDue >= 0 && daysUntilDue <= leadDays) {
          decisions.push({
            reminder_type: 'due_soon',
            due_date: dueDateValue,
            meta: { interval_months: intervalMonths, lead_days: leadDays }
          });
        }

        const overdueThreshold = addDays(dueDate, graceDays);
        if (runDate > overdueThreshold) {
          decisions.push({
            reminder_type: 'overdue',
            due_date: dueDateValue,
            meta: { interval_months: intervalMonths, overdue_grace_days: graceDays }
          });
        }
      }

      if (risk.riskLevel === 'high') {
        decisions.push({
          reminder_type: 'high_risk',
          due_date: dueDateValue,
          meta: { riskScore: risk.riskScore, riskLevel: risk.riskLevel }
        });
      }
      for (const decision of decisions) {
        const existsForDate = reminders.some(reminder =>
          reminder.asset_id === asset.id &&
          reminder.reminder_type === decision.reminder_type &&
          reminder.created_for_date === runDateString
        );

        if (existsForDate) continue;

        if (decision.reminder_type === 'high_risk' && shouldSkipRecent(reminders, 'high_risk', runDate)) {
          continue;
        }

        if (decision.reminder_type !== 'high_risk' && shouldSkipRecent(reminders, decision.reminder_type, runDate)) {
          continue;
        }

        const { data: reminder, error } = await supabase
          .from('maintenance_reminders')
          .insert({
            home_id: home.id,
            asset_id: asset.id,
            reminder_type: decision.reminder_type,
            due_date: decision.due_date || null,
            created_for_date: runDateString,
            status: 'open',
            meta: {
              ...decision.meta,
              assetDisplayName: asset.display_name,
              assetCategory: asset.category
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to insert reminder', error);
          continue;
        }

        await enqueueOutbox({ home, asset, reminder, decision });
        reminders.push(reminder);
      }
    }
  }

  console.log('Reminder generation complete.');
}

generateReminders().catch((error) => {
  console.error('Reminder generation failed:', error);
  process.exit(1);
});
