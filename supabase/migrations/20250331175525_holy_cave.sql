/*
  # Governance System Schema

  1. New Tables
    - `governance_proposals`
      - Stores community proposals for voting
      - Includes title, description, category, status, and voting requirements
      - Tracks voting results and deadlines

    - `governance_votes`
      - Records individual votes on proposals
      - Links users to proposals with their vote choice
      - Ensures one vote per user per proposal

  2. Security
    - Enable RLS on all tables
    - Policies for proposal creation and voting
    - Point requirements for participation

  3. Changes
    - No modifications to existing tables
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create governance proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ends_at timestamptz NOT NULL,
  min_points_required integer NOT NULL,
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,

  -- Validate category values
  CONSTRAINT governance_proposals_category_check CHECK (
    category IN ('policy', 'feature', 'community', 'other')
  ),

  -- Validate status values
  CONSTRAINT governance_proposals_status_check CHECK (
    status IN ('active', 'passed', 'failed', 'pending')
  ),

  -- Ensure minimum points requirement is reasonable
  CONSTRAINT governance_proposals_min_points_check CHECK (
    min_points_required >= 100
  )
);

-- Create ENUM type for vote values
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_enum') THEN
    CREATE TYPE vote_enum AS ENUM ('for', 'against');
  END IF;
END $$;

-- Create governance votes table
CREATE TABLE IF NOT EXISTS governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES governance_proposals(id) ON DELETE CASCADE,
  vote vote_enum NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure valid vote values
  CONSTRAINT governance_votes_vote_check CHECK (
    vote IN ('for', 'against')
  ),

  -- Ensure one vote per user per proposal
  CONSTRAINT governance_votes_user_proposal_unique UNIQUE (user_id, proposal_id)
);

-- Enable RLS
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

-- Policies for governance_proposals

-- Anyone can view active proposals
-- This policy allows all authenticated users to view proposals in the governance_proposals table.
-- It ensures that proposals are publicly accessible for transparency and community engagement.
CREATE POLICY "Anyone can view proposals"
  ON governance_proposals
  FOR SELECT
  TO authenticated
  USING (true);

-- Users with enough points can create proposals
CREATE POLICY "Users with 500+ points can create proposals"
  ON governance_proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM points_transactions
      WHERE user_id = auth.uid()
      GROUP BY user_id
      HAVING SUM(
        CASE
          WHEN transaction_type = 'earned' THEN points_amount
          ELSE -points_amount
        END
      ) >= 500
    )
  );

-- Users can update their own proposals if still active
-- Note: If a proposal transitions to a non-active state during an update, the update will fail as the status must remain 'active'.
CREATE POLICY "Users can update own active proposals"
  ON governance_proposals
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    status = 'active'
  )
  WITH CHECK (
    created_by = auth.uid() AND
    status = 'active'
  );

-- Policies for governance_votes

-- Users can view all votes
CREATE POLICY "Anyone can view votes"
  ON governance_votes
  FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Users with required points can vote"
  ON governance_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM points_transactions pt
      CROSS JOIN governance_proposals gp
      WHERE pt.user_id = auth.uid()
      AND gp.id = governance_votes.proposal_id
      GROUP BY gp.min_points_required
      HAVING SUM(
        CASE
          WHEN pt.transaction_type = 'earned' THEN pt.points_amount
          ELSE -pt.points_amount
        END
      ) >= gp.min_points_required
    )
  );

-- Users can update their own votes on active proposals
CREATE POLICY "Users can update own votes on active proposals"
  ON governance_votes
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM governance_proposals
      WHERE id = governance_votes.proposal_id
      AND status = 'active'
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM governance_proposals
      WHERE id = governance_votes.proposal_id
      AND status = 'active'
    )
  );

CREATE OR REPLACE FUNCTION increment_vote_count(proposal_id uuid, vote vote_enum)
RETURNS VOID AS $$
BEGIN
  UPDATE governance_proposals
  SET
    votes_for = CASE WHEN vote = 'for' THEN votes_for + 1 ELSE votes_for END,
    votes_against = CASE WHEN vote = 'against' THEN votes_against + 1 ELSE votes_against END
  WHERE id = proposal_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_vote_count(proposal_id uuid, old_vote vote_enum, new_vote vote_enum)
RETURNS VOID AS $$
BEGIN
  UPDATE governance_proposals
  SET
    votes_for = votes_for + CASE
      WHEN new_vote = 'for' THEN 1
      WHEN old_vote = 'for' THEN -1
      ELSE 0
    END,
    votes_against = votes_against + CASE
      WHEN new_vote = 'against' THEN 1
      WHEN old_vote = 'against' THEN -1
      ELSE 0
    END
  WHERE id = proposal_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_vote_count(proposal_id uuid, vote vote_enum)
RETURNS VOID AS $$
BEGIN
  UPDATE governance_proposals
  SET
    votes_for = CASE WHEN vote = 'for' THEN votes_for - 1 ELSE votes_for END,
    votes_against = CASE WHEN vote = 'against' THEN votes_against - 1 ELSE votes_against END
  WHERE id = proposal_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_vote_count(NEW.proposal_id, NEW.vote);
  ELSIF TG_OP = 'UPDATE' AND OLD.vote != NEW.vote THEN
    PERFORM update_vote_count(NEW.proposal_id, OLD.vote, NEW.vote);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_vote_count(OLD.proposal_id, OLD.vote);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for vote counts
CREATE MATERIALIZED VIEW governance_vote_counts AS
SELECT
  proposal_id,
  SUM(CASE WHEN vote = 'for' THEN 1 ELSE 0 END) AS votes_for,
  SUM(CASE WHEN vote = 'against' THEN 1 ELSE 0 END) AS votes_against
FROM governance_votes
GROUP BY proposal_id;

-- Refresh materialized view periodically
-- This can be done using a scheduled job or manually as needed

-- Create function to check proposal status
CREATE OR REPLACE FUNCTION check_proposal_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if proposal has ended
  IF NEW.ends_at <= NOW() AND NEW.status = 'active' THEN
    -- Calculate total votes and update status
    UPDATE governance_proposals
    SET status = CASE
      WHEN votes_for > votes_against THEN 'passed'
      ELSE 'failed'
    END
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposal status
CREATE TRIGGER check_proposal_status
  AFTER UPDATE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_status();