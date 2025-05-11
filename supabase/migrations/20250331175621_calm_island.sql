/*
  # Rewards System Schema

  1. New Tables
    - `rewards`
      - Stores available rewards that users can redeem
    - `reward_redemptions`
      - Tracks when users redeem rewards
*/

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  points_cost integer NOT NULL CHECK (points_cost > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent integer NOT NULL CHECK (points_spent > 0),
  redeemed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled'))
);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for rewards
CREATE POLICY "Anyone can view active rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Only admins can manage rewards"
  ON rewards
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS policies for reward_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can redeem rewards"
  ON reward_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can update redemptions"
  ON reward_redemptions
  FOR UPDATE
  TO authenticated
  USING (is_admin());

