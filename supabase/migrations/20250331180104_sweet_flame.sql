/*
  # Add Governance System Triggers and Functions

  1. Changes
    - Drop existing triggers and functions
    - Recreate vote counting function and trigger
    - Recreate proposal status check function and trigger

  2. Features
    - Automatic vote counting
    - Automatic proposal status updates based on end date and vote counts
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS governance_votes_count ON governance_votes;
DROP TRIGGER IF EXISTS check_proposal_status ON governance_proposals;
DROP FUNCTION IF EXISTS update_proposal_vote_counts();
DROP FUNCTION IF EXISTS check_proposal_status();

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment vote count
    UPDATE governance_proposals
    SET 
      votes_for = CASE WHEN NEW.vote = 'for' THEN votes_for + 1 ELSE votes_for END,
      votes_against = CASE WHEN NEW.vote = 'against' THEN votes_against + 1 ELSE votes_against END
    WHERE id = NEW.proposal_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.vote != NEW.vote THEN
    -- Update vote counts when vote changes
    UPDATE governance_proposals
    SET 
      votes_for = votes_for + CASE 
        WHEN NEW.vote = 'for' THEN 1
        WHEN OLD.vote = 'for' THEN -1
        ELSE 0
      END,
      votes_against = votes_against + CASE
        WHEN NEW.vote = 'against' THEN 1
        WHEN OLD.vote = 'against' THEN -1
        ELSE 0
      END
    WHERE id = NEW.proposal_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement vote count
    UPDATE governance_proposals
    SET 
      votes_for = CASE WHEN OLD.vote = 'for' THEN votes_for - 1 ELSE votes_for END,
      votes_against = CASE WHEN OLD.vote = 'against' THEN votes_against - 1 ELSE votes_against END
    WHERE id = OLD.proposal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
CREATE TRIGGER governance_votes_count
  AFTER INSERT OR UPDATE OR DELETE ON governance_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_vote_counts();

-- Create function to check proposal status
CREATE OR REPLACE FUNCTION check_proposal_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if proposal has ended
  IF NEW.ends_at <= NOW() AND NEW.status = 'active' THEN
    -- Calculate total votes
    NEW.status := CASE
      WHEN NEW.votes_for > NEW.votes_against THEN 'passed'
      ELSE 'failed'
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposal status
CREATE TRIGGER check_proposal_status
  BEFORE UPDATE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_status();