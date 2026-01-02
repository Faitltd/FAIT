-- Admin access to home asset data
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_coverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage homes" ON homes;
CREATE POLICY "Admins can manage homes"
  ON homes
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage assets" ON assets;
CREATE POLICY "Admins can manage assets"
  ON assets
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage warranty coverages" ON warranty_coverages;
CREATE POLICY "Admins can manage warranty coverages"
  ON warranty_coverages
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage service events" ON service_events;
CREATE POLICY "Admins can manage service events"
  ON service_events
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage asset documents" ON asset_documents;
CREATE POLICY "Admins can manage asset documents"
  ON asset_documents
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage maintenance rules" ON maintenance_rules;
CREATE POLICY "Admins can manage maintenance rules"
  ON maintenance_rules
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage maintenance reminders" ON maintenance_reminders;
CREATE POLICY "Admins can manage maintenance reminders"
  ON maintenance_reminders
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage notification outbox" ON notification_outbox;
CREATE POLICY "Admins can manage notification outbox"
  ON notification_outbox
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
