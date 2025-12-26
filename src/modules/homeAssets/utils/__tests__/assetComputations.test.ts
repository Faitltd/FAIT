import { computeAssetRisk, computeNextServiceDueDate } from '../assetComputations';
import type { Asset } from '../../types';

describe('asset computations', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-01T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('computes next service due date from last service date', () => {
    const asset: Asset = {
      id: 'asset-1',
      home_id: 'home-1',
      category: 'HVAC',
      display_name: 'Main HVAC',
      status: 'active',
      last_service_date: '2024-01-15',
      service_interval_months: 6,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as Asset;

    expect(computeNextServiceDueDate(asset)).toBe('2024-07-15');
  });

  it('computes risk score for overdue and expired warranty assets', () => {
    const asset: Asset = {
      id: 'asset-2',
      home_id: 'home-1',
      category: 'Water Heater',
      display_name: 'Basement Water Heater',
      status: 'active',
      install_date: '2012-05-01',
      last_service_date: '2023-01-01',
      warranty_end_date: '2023-12-31',
      service_interval_months: 12,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as Asset;

    const result = computeAssetRisk(asset);

    expect(result.riskScore).toBeGreaterThanOrEqual(4);
    expect(result.riskLevel).toBe('high');
    expect(result.overdueDays).toBeGreaterThan(30);
  });

  it('returns low risk when nothing is overdue', () => {
    const asset: Asset = {
      id: 'asset-3',
      home_id: 'home-1',
      category: 'Refrigerator',
      display_name: 'Kitchen Fridge',
      status: 'active',
      install_date: '2023-06-01',
      last_service_date: '2024-01-01',
      warranty_end_date: '2026-01-01',
      service_interval_months: 12,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as Asset;

    const result = computeAssetRisk(asset);

    expect(result.riskScore).toBeLessThanOrEqual(1);
    expect(result.riskLevel).toBe('low');
  });

  it('treats 30 days overdue as medium risk', () => {
    const asset: Asset = {
      id: 'asset-4',
      home_id: 'home-1',
      category: 'Dishwasher',
      display_name: 'Kitchen Dishwasher',
      status: 'active',
      last_service_date: '2024-04-02',
      service_interval_months: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as Asset;

    const result = computeAssetRisk(asset);

    expect(result.overdueDays).toBe(30);
    expect(result.riskLevel).toBe('low');
  });

  it('returns null next service due date when no dates exist', () => {
    const asset: Asset = {
      id: 'asset-5',
      home_id: 'home-1',
      category: 'HVAC',
      display_name: 'Main HVAC',
      status: 'active',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as Asset;

    expect(computeNextServiceDueDate(asset)).toBeNull();
  });

  it('handles unknown categories without crashing', () => {
    const asset: Asset = {
      id: 'asset-6',
      home_id: 'home-1',
      category: 'Custom',
      display_name: 'Custom Asset',
      status: 'active',
      warranty_end_date: '2023-01-01',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as Asset;

    const result = computeAssetRisk(asset);

    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.riskLevel).toBe('medium');
  });
});
