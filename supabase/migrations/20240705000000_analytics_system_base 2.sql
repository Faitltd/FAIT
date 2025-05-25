-- Analytics System Base Migration

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_type VARCHAR(50),
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_dashboards table
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  layout JSONB,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  query TEXT NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_charts table
CREATE TABLE IF NOT EXISTS analytics_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  query TEXT NOT NULL,
  options JSONB,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_ab_tests table
CREATE TABLE IF NOT EXISTS analytics_ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  target_metric VARCHAR(100) NOT NULL,
  target_audience JSONB,
  variants JSONB NOT NULL,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_ab_test_assignments table
CREATE TABLE IF NOT EXISTS analytics_ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES analytics_ab_tests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  variant_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

-- Create analytics_ab_test_conversions table
CREATE TABLE IF NOT EXISTS analytics_ab_test_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES analytics_ab_tests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  variant_id VARCHAR(100) NOT NULL,
  conversion_type VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_resource_type ON analytics_events(resource_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_ab_test_assignments_test_id ON analytics_ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ab_test_assignments_user_id ON analytics_ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ab_test_conversions_test_id ON analytics_ab_test_conversions(test_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ab_test_conversions_user_id ON analytics_ab_test_conversions(user_id);

-- Set up RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ab_test_conversions ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Analytics dashboards policies
CREATE POLICY "Anyone can view public dashboards"
  ON analytics_dashboards FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can view all dashboards"
  ON analytics_dashboards FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert dashboards"
  ON analytics_dashboards FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update dashboards"
  ON analytics_dashboards FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Analytics metrics policies
CREATE POLICY "Anyone can view metrics for public dashboards"
  ON analytics_metrics FOR SELECT
  USING (
    dashboard_id IN (
      SELECT id FROM analytics_dashboards WHERE is_public = true
    )
  );

CREATE POLICY "Admins can view all metrics"
  ON analytics_metrics FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert metrics"
  ON analytics_metrics FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update metrics"
  ON analytics_metrics FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Analytics charts policies
CREATE POLICY "Anyone can view charts for public dashboards"
  ON analytics_charts FOR SELECT
  USING (
    dashboard_id IN (
      SELECT id FROM analytics_dashboards WHERE is_public = true
    )
  );

CREATE POLICY "Admins can view all charts"
  ON analytics_charts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert charts"
  ON analytics_charts FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update charts"
  ON analytics_charts FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- A/B test policies
CREATE POLICY "Anyone can view running A/B tests"
  ON analytics_ab_tests FOR SELECT
  USING (status = 'running' OR status = 'completed');

CREATE POLICY "Admins can view all A/B tests"
  ON analytics_ab_tests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert A/B tests"
  ON analytics_ab_tests FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update A/B tests"
  ON analytics_ab_tests FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- A/B test assignments policies
CREATE POLICY "Users can view their own A/B test assignments"
  ON analytics_ab_test_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all A/B test assignments"
  ON analytics_ab_test_assignments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert A/B test assignments"
  ON analytics_ab_test_assignments FOR INSERT
  WITH CHECK (true);

-- A/B test conversions policies
CREATE POLICY "Users can view their own A/B test conversions"
  ON analytics_ab_test_conversions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all A/B test conversions"
  ON analytics_ab_test_conversions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert A/B test conversions"
  ON analytics_ab_test_conversions FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamp on analytics_dashboards
CREATE OR REPLACE FUNCTION update_analytics_dashboards_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_analytics_dashboards_timestamp
BEFORE UPDATE ON analytics_dashboards
FOR EACH ROW
EXECUTE FUNCTION update_analytics_dashboards_timestamp();

-- Create function to update timestamp on analytics_metrics
CREATE OR REPLACE FUNCTION update_analytics_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_analytics_metrics_timestamp
BEFORE UPDATE ON analytics_metrics
FOR EACH ROW
EXECUTE FUNCTION update_analytics_metrics_timestamp();

-- Create function to update timestamp on analytics_charts
CREATE OR REPLACE FUNCTION update_analytics_charts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_analytics_charts_timestamp
BEFORE UPDATE ON analytics_charts
FOR EACH ROW
EXECUTE FUNCTION update_analytics_charts_timestamp();

-- Create function to update timestamp on analytics_ab_tests
CREATE OR REPLACE FUNCTION update_analytics_ab_tests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_analytics_ab_tests_timestamp
BEFORE UPDATE ON analytics_ab_tests
FOR EACH ROW
EXECUTE FUNCTION update_analytics_ab_tests_timestamp();
