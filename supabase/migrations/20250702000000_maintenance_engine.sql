-- Maintenance Engine v1

CREATE TABLE IF NOT EXISTS maintenance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  category TEXT,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  interval_months INTEGER,
  lead_days INTEGER NOT NULL DEFAULT 30,
  overdue_grace_days INTEGER NOT NULL DEFAULT 7,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  reminder_type TEXT NOT NULL,
  due_date DATE,
  created_for_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  snoozed_until DATE,
  last_notified_at TIMESTAMPTZ,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_maintenance_reminders_unique
  ON maintenance_reminders(home_id, asset_id, reminder_type, created_for_date);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES maintenance_reminders(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  to TEXT NOT NULL,
  template_key TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_rules_home_id ON maintenance_rules(home_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_home_id ON maintenance_reminders(home_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_status ON maintenance_reminders(status);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_home_id ON notification_outbox(home_id);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_status ON notification_outbox(status);

DROP TRIGGER IF EXISTS update_maintenance_rules_updated_at ON maintenance_rules;
CREATE TRIGGER update_maintenance_rules_updated_at
BEFORE UPDATE ON maintenance_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_reminders_updated_at ON maintenance_reminders;
CREATE TRIGGER update_maintenance_reminders_updated_at
BEFORE UPDATE ON maintenance_reminders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_outbox_updated_at ON notification_outbox;
CREATE TRIGGER update_notification_outbox_updated_at
BEFORE UPDATE ON notification_outbox
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage maintenance rules for their homes" ON maintenance_rules;
CREATE POLICY "Users can manage maintenance rules for their homes"
  ON maintenance_rules FOR ALL
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()))
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view maintenance reminders for their homes" ON maintenance_reminders;
DROP POLICY IF EXISTS "Users can update maintenance reminders for their homes" ON maintenance_reminders;
DROP POLICY IF EXISTS "Users can insert maintenance reminders for their homes" ON maintenance_reminders;
DROP POLICY IF EXISTS "Users can delete maintenance reminders for their homes" ON maintenance_reminders;

CREATE POLICY "Users can view maintenance reminders for their homes"
  ON maintenance_reminders FOR SELECT
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update maintenance reminders for their homes"
  ON maintenance_reminders FOR UPDATE
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert maintenance reminders for their homes"
  ON maintenance_reminders FOR INSERT
  TO authenticated
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete maintenance reminders for their homes"
  ON maintenance_reminders FOR DELETE
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view notification outbox for their homes" ON notification_outbox;
DROP POLICY IF EXISTS "Users can manage notification outbox for their homes" ON notification_outbox;

CREATE POLICY "Users can view notification outbox for their homes"
  ON notification_outbox FOR SELECT
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage notification outbox for their homes"
  ON notification_outbox FOR ALL
  TO authenticated
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()))
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));
