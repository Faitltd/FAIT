export type AssetStatus = 'active' | 'removed' | 'replaced';

export type AssetCategory =
  | 'HVAC'
  | 'Water Heater'
  | 'Dishwasher'
  | 'Refrigerator'
  | 'Washer'
  | 'Dryer'
  | 'Garage Door Opener'
  | 'Sump Pump'
  | 'Other';

export type WarrantyCoverageType = 'manufacturer' | 'extended' | 'labor' | 'other';

export type ServiceEventType = 'maintenance' | 'repair' | 'inspection' | 'replacement';

export type AssetDocumentType = 'invoice' | 'warranty_pdf' | 'manual' | 'photo' | 'other';

export interface HomeAssetHome {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  year_built?: number | null;
  square_footage?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  home_id: string;
  category: string;
  display_name: string;
  brand?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  install_date?: string | null;
  installed_by?: string | null;
  location_in_home?: string | null;
  status: string;
  warranty_start_date?: string | null;
  warranty_end_date?: string | null;
  service_interval_months?: number | null;
  last_service_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarrantyCoverage {
  id: string;
  asset_id: string;
  coverage_type: string;
  provider?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  claim_instructions?: string | null;
  exclusions?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceEvent {
  id: string;
  home_id: string;
  asset_id?: string | null;
  event_type: string;
  performed_by?: string | null;
  event_date: string;
  notes?: string | null;
  cost_cents?: number | null;
  warranty_related: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssetDocument {
  id: string;
  asset_id: string;
  doc_type: string;
  file_name: string;
  file_url?: string | null;
  storage_path?: string | null;
  bucket?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  created_at: string;
}

export interface AssetComputedFields {
  next_service_due_date?: string | null;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  isDueSoon: boolean;
  overdueDays: number | null;
}

export type AssetWithComputed = Asset & AssetComputedFields;

export interface HomeAssetSummary {
  total: number;
  dueSoon: number;
  overdue: number;
  underWarranty: number;
  highRisk: number;
}

export interface HomeWithSummary {
  home: HomeAssetHome;
  summary: HomeAssetSummary;
}

export interface AssetDetail extends AssetWithComputed {
  warranty_coverages: WarrantyCoverage[];
  service_events: ServiceEvent[];
  documents: AssetDocument[];
}

export interface CreateHomeInput {
  name: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  year_built?: number | null;
  square_feet?: number | null;
}

export interface CreateAssetInput {
  category: string;
  display_name: string;
  brand?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  install_date?: string | null;
  installed_by?: string | null;
  location_in_home?: string | null;
  status?: string | null;
  warranty_start_date?: string | null;
  warranty_end_date?: string | null;
  service_interval_months?: number | null;
  last_service_date?: string | null;
  notes?: string | null;
}

export interface CreateWarrantyCoverageInput {
  coverage_type: string;
  provider?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  claim_instructions?: string | null;
  exclusions?: string | null;
}

export interface CreateServiceEventInput {
  asset_id?: string | null;
  event_type: string;
  performed_by?: string | null;
  event_date: string;
  notes?: string | null;
  cost_cents?: number | null;
  warranty_related?: boolean | null;
}

export interface CreateAssetDocumentInput {
  doc_type: string;
  file: File;
}
