import type { Asset, AssetComputedFields } from '../types';

const DEFAULT_SERVICE_INTERVALS: Record<string, number> = {
  hvac: 6,
  'water heater': 12,
  dishwasher: 12,
  refrigerator: 12,
  washer: 12,
  dryer: 12,
  'garage door opener': 12,
  'sump pump': 12
};

const CATEGORY_LIFE_YEARS: Record<string, number> = {
  hvac: 15,
  'water heater': 10,
  dishwasher: 10,
  refrigerator: 12,
  washer: 11,
  dryer: 13,
  'garage door opener': 12,
  'sump pump': 7
};

const normalizeCategory = (category?: string | null) => (category || '').trim().toLowerCase();

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
};

const diffInDays = (later: Date, earlier: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcLater = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  const utcEarlier = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  return Math.floor((utcLater - utcEarlier) / msPerDay);
};

const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

const getIntervalMonths = (asset: Asset): number | null => {
  if (asset.service_interval_months && asset.service_interval_months > 0) {
    return asset.service_interval_months;
  }

  const normalized = normalizeCategory(asset.category);
  return DEFAULT_SERVICE_INTERVALS[normalized] ?? null;
};

const getLifeYears = (asset: Asset): number | null => {
  const normalized = normalizeCategory(asset.category);
  return CATEGORY_LIFE_YEARS[normalized] ?? null;
};

export const computeNextServiceDueDate = (asset: Asset): string | null => {
  const intervalMonths = getIntervalMonths(asset);
  if (!intervalMonths) return null;

  const lastService = parseDate(asset.last_service_date);
  if (lastService) {
    return formatDate(addMonths(lastService, intervalMonths));
  }

  const installDate = parseDate(asset.install_date);
  if (installDate) {
    return formatDate(addMonths(installDate, intervalMonths));
  }

  return null;
};

export const computeAssetRisk = (asset: Asset): AssetComputedFields => {
  const today = new Date();
  const warrantyEnd = parseDate(asset.warranty_end_date);
  const nextService = parseDate(computeNextServiceDueDate(asset));
  const installDate = parseDate(asset.install_date);
  const lifeYears = getLifeYears(asset);

  let riskScore = 0;
  let overdueDays: number | null = null;

  if (warrantyEnd && warrantyEnd < today) {
    riskScore += 2;
  }

  if (nextService) {
    overdueDays = diffInDays(today, nextService);
    if (overdueDays > 30) {
      riskScore += 2;
    } else if (overdueDays > 0) {
      riskScore += 1;
    } else {
      overdueDays = 0;
    }
  }

  if (installDate && lifeYears) {
    const ageDays = diffInDays(today, installDate);
    const ageYears = ageDays / 365;
    if (ageYears >= lifeYears) {
      riskScore += 2;
    } else if (ageYears >= lifeYears * 0.8) {
      riskScore += 1;
    }
  }

  const riskLevel = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';

  const isDueSoon = !!nextService && diffInDays(nextService, today) <= 30 && diffInDays(nextService, today) >= 0;

  return {
    next_service_due_date: formatDate(nextService),
    riskScore,
    riskLevel,
    isDueSoon,
    overdueDays: overdueDays && overdueDays > 0 ? overdueDays : null
  };
};
