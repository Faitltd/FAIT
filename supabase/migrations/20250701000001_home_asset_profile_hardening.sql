-- Home Asset Profile hardening migration

-- Ensure RLS is enabled
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_coverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_documents ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_home_id ON assets(home_id);
CREATE INDEX IF NOT EXISTS idx_service_events_home_id ON service_events(home_id);
CREATE INDEX IF NOT EXISTS idx_warranty_coverages_asset_id ON warranty_coverages(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_documents_asset_id ON asset_documents(asset_id);

-- Align foreign key constraints and delete behaviors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assets_home_id_fkey'
  ) THEN
    ALTER TABLE assets
      ADD CONSTRAINT assets_home_id_fkey
      FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'warranty_coverages_asset_id_fkey'
  ) THEN
    ALTER TABLE warranty_coverages
      ADD CONSTRAINT warranty_coverages_asset_id_fkey
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_events_home_id_fkey'
  ) THEN
    ALTER TABLE service_events
      ADD CONSTRAINT service_events_home_id_fkey
      FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_events_asset_id_fkey'
  ) THEN
    ALTER TABLE service_events
      ADD CONSTRAINT service_events_asset_id_fkey
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_documents_asset_id_fkey'
  ) THEN
    ALTER TABLE asset_documents
      ADD CONSTRAINT asset_documents_asset_id_fkey
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Harden asset_documents storage metadata
ALTER TABLE asset_documents
  ADD COLUMN IF NOT EXISTS bucket TEXT DEFAULT 'asset_documents',
  ADD COLUMN IF NOT EXISTS content_type TEXT,
  ADD COLUMN IF NOT EXISTS size_bytes INTEGER;

ALTER TABLE asset_documents
  ALTER COLUMN file_url DROP NOT NULL;

-- Replace policies with ownership-through-home checks
DROP POLICY IF EXISTS "Users can view assets in their homes" ON assets;
DROP POLICY IF EXISTS "Users can insert assets in their homes" ON assets;
DROP POLICY IF EXISTS "Users can update assets in their homes" ON assets;
DROP POLICY IF EXISTS "Users can delete assets in their homes" ON assets;

CREATE POLICY "Users can view assets in their homes"
  ON assets FOR SELECT
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert assets in their homes"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update assets in their homes"
  ON assets FOR UPDATE
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete assets in their homes"
  ON assets FOR DELETE
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view warranty coverages for their assets" ON warranty_coverages;
DROP POLICY IF EXISTS "Users can insert warranty coverages for their assets" ON warranty_coverages;
DROP POLICY IF EXISTS "Users can update warranty coverages for their assets" ON warranty_coverages;
DROP POLICY IF EXISTS "Users can delete warranty coverages for their assets" ON warranty_coverages;

CREATE POLICY "Users can view warranty coverages for their assets"
  ON warranty_coverages FOR SELECT
  TO authenticated
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert warranty coverages for their assets"
  ON warranty_coverages FOR INSERT
  TO authenticated
  WITH CHECK (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update warranty coverages for their assets"
  ON warranty_coverages FOR UPDATE
  TO authenticated
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete warranty coverages for their assets"
  ON warranty_coverages FOR DELETE
  TO authenticated
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view service events for their homes" ON service_events;
DROP POLICY IF EXISTS "Users can insert service events for their homes" ON service_events;
DROP POLICY IF EXISTS "Users can update service events for their homes" ON service_events;
DROP POLICY IF EXISTS "Users can delete service events for their homes" ON service_events;

CREATE POLICY "Users can view service events for their homes"
  ON service_events FOR SELECT
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert service events for their homes"
  ON service_events FOR INSERT
  TO authenticated
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update service events for their homes"
  ON service_events FOR UPDATE
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete service events for their homes"
  ON service_events FOR DELETE
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view documents for their assets" ON asset_documents;
DROP POLICY IF EXISTS "Users can insert documents for their assets" ON asset_documents;
DROP POLICY IF EXISTS "Users can delete documents for their assets" ON asset_documents;

CREATE POLICY "Users can view documents for their assets"
  ON asset_documents FOR SELECT
  TO authenticated
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their assets"
  ON asset_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for their assets"
  ON asset_documents FOR DELETE
  TO authenticated
  USING (
    asset_id IN (
      SELECT a.id FROM assets a
      JOIN homes h ON a.home_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- Storage bucket and policies for asset documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset_documents', 'asset_documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their asset documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their asset documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their asset documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their asset documents" ON storage.objects;

CREATE POLICY "Users can upload their asset documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'asset_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their asset documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'asset_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their asset documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'asset_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their asset documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'asset_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
