-- Home Asset Profile module schema

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  display_name TEXT NOT NULL,
  brand TEXT,
  model_number TEXT,
  serial_number TEXT,
  install_date DATE,
  installed_by TEXT,
  location_in_home TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  warranty_start_date DATE,
  warranty_end_date DATE,
  service_interval_months INTEGER,
  last_service_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warranty_coverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  coverage_type TEXT NOT NULL,
  provider TEXT,
  start_date DATE,
  end_date DATE,
  claim_instructions TEXT,
  exclusions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  performed_by TEXT,
  event_date DATE NOT NULL,
  notes TEXT,
  cost_cents INTEGER,
  warranty_related BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_home_id ON assets(home_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_warranty_coverages_asset_id ON warranty_coverages(asset_id);
CREATE INDEX IF NOT EXISTS idx_service_events_home_id ON service_events(home_id);
CREATE INDEX IF NOT EXISTS idx_service_events_asset_id ON service_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_documents_asset_id ON asset_documents(asset_id);

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warranty_coverages_updated_at ON warranty_coverages;
CREATE TRIGGER update_warranty_coverages_updated_at
BEFORE UPDATE ON warranty_coverages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_events_updated_at ON service_events;
CREATE TRIGGER update_service_events_updated_at
BEFORE UPDATE ON service_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_coverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_documents ENABLE ROW LEVEL SECURITY;

-- Assets policies
CREATE POLICY "Users can view assets in their homes"
  ON assets FOR SELECT
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert assets in their homes"
  ON assets FOR INSERT
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update assets in their homes"
  ON assets FOR UPDATE
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete assets in their homes"
  ON assets FOR DELETE
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

-- Warranty coverages policies
CREATE POLICY "Users can view warranty coverages for their assets"
  ON warranty_coverages FOR SELECT
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert warranty coverages for their assets"
  ON warranty_coverages FOR INSERT
  WITH CHECK (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update warranty coverages for their assets"
  ON warranty_coverages FOR UPDATE
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete warranty coverages for their assets"
  ON warranty_coverages FOR DELETE
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- Service events policies
CREATE POLICY "Users can view service events for their homes"
  ON service_events FOR SELECT
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert service events for their homes"
  ON service_events FOR INSERT
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update service events for their homes"
  ON service_events FOR UPDATE
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete service events for their homes"
  ON service_events FOR DELETE
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

-- Asset documents policies
CREATE POLICY "Users can view documents for their assets"
  ON asset_documents FOR SELECT
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their assets"
  ON asset_documents FOR INSERT
  WITH CHECK (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for their assets"
  ON asset_documents FOR DELETE
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );
