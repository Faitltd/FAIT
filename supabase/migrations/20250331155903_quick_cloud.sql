/*
  # Add external reviews support

  1. Changes
    - Add external_reviews table to store links to reviews from third-party platforms
    - Add RLS policies for contractors to manage their external review links
    - Add indexes for efficient querying

  2. Security
    - Enable RLS on external_reviews table
    - Only allow contractors to manage their own external reviews
    - Allow authenticated users to view external reviews
*/

CREATE TABLE IF NOT EXISTS external_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform = ANY (ARRAY['google', 'yelp', 'nextdoor'])),
  url text NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  review_count integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (contractor_id, platform)
);

-- Enable RLS
ALTER TABLE external_reviews ENABLE ROW LEVEL SECURITY;

-- Update trigger
CREATE TRIGGER update_external_reviews_updated_at
  BEFORE UPDATE ON external_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Policies
CREATE POLICY "Anyone can view external reviews"
  ON external_reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contractors can manage their external reviews"
  ON external_reviews
  FOR ALL
  TO authenticated
  USING (contractor_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid)
  WITH CHECK (contractor_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- Index for efficient querying
CREATE INDEX external_reviews_contractor_id_idx ON external_reviews(contractor_id);