/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text): notification category
      - `title` (text): short notification title
      - `message` (text): detailed notification message
      - `data` (jsonb): additional context data
      - `read` (boolean): whether notification has been read
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on notifications table
    - Add policies for user access
    - Add function to create notifications
    - Add triggers for various events
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Validate notification type
  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'proposal_created',
      'proposal_ended',
      'vote_recorded',
      'points_earned',
      'points_spent',
      'reward_redeemed',
      'reward_fulfilled',
      'warranty_updated',
      'verification_updated'
    )
  )
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger for proposal status changes
CREATE OR REPLACE FUNCTION notify_proposal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Notify proposal creator
    PERFORM create_notification(
      NEW.created_by,
      'proposal_ended',
      CASE 
        WHEN NEW.status = 'passed' THEN 'Your proposal has passed!'
        ELSE 'Your proposal has ended'
      END,
      CASE 
        WHEN NEW.status = 'passed' 
        THEN 'Your proposal "' || NEW.title || '" has been approved by the community.'
        ELSE 'Your proposal "' || NEW.title || '" did not receive enough votes to pass.'
      END,
      jsonb_build_object(
        'proposal_id', NEW.id,
        'votes_for', NEW.votes_for,
        'votes_against', NEW.votes_against
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_proposal_status_change
  AFTER UPDATE OF status ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION notify_proposal_status_change();

-- Trigger for reward redemptions
CREATE OR REPLACE FUNCTION notify_reward_redemption()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify user of successful redemption
    PERFORM create_notification(
      NEW.user_id,
      'reward_redeemed',
      'Reward Redeemed Successfully',
      'Your reward has been redeemed and will be processed soon.',
      jsonb_build_object(
        'redemption_id', NEW.id,
        'reward_id', NEW.reward_id
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'fulfilled' THEN
    -- Notify user when reward is fulfilled
    PERFORM create_notification(
      NEW.user_id,
      'reward_fulfilled',
      'Reward Fulfilled',
      'Your reward has been fulfilled and is ready for use.',
      jsonb_build_object(
        'redemption_id', NEW.id,
        'reward_id', NEW.reward_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_reward_redemption
  AFTER INSERT OR UPDATE OF status ON reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_reward_redemption();

-- Trigger for warranty claim updates
CREATE OR REPLACE FUNCTION notify_warranty_claim_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Notify claim creator
    PERFORM create_notification(
      NEW.client_id,
      'warranty_updated',
      'Warranty Claim Updated',
      CASE 
        WHEN NEW.status = 'reviewing' THEN 'Your warranty claim is being reviewed'
        WHEN NEW.status = 'approved' THEN 'Your warranty claim has been approved'
        WHEN NEW.status = 'rejected' THEN 'Your warranty claim has been rejected'
        WHEN NEW.status = 'resolved' THEN 'Your warranty claim has been resolved'
        ELSE 'Your warranty claim status has been updated'
      END,
      jsonb_build_object(
        'claim_id', NEW.id,
        'status', NEW.status,
        'resolution_notes', NEW.resolution_notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_warranty_claim_update
  AFTER UPDATE OF status ON warranty_claims
  FOR EACH ROW
  EXECUTE FUNCTION notify_warranty_claim_update();

-- Trigger for points transactions
CREATE OR REPLACE FUNCTION notify_points_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify user of points change
  PERFORM create_notification(
    NEW.user_id,
    CASE 
      WHEN NEW.transaction_type = 'earned' THEN 'points_earned'
      ELSE 'points_spent'
    END,
    CASE 
      WHEN NEW.transaction_type = 'earned' THEN 'Points Earned'
      ELSE 'Points Spent'
    END,
    CASE 
      WHEN NEW.transaction_type = 'earned' 
      THEN 'You earned ' || NEW.points_amount || ' points: ' || NEW.description
      ELSE 'You spent ' || NEW.points_amount || ' points: ' || NEW.description
    END,
    jsonb_build_object(
      'transaction_id', NEW.id,
      'points_amount', NEW.points_amount,
      'booking_id', NEW.booking_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_points_transaction
  AFTER INSERT ON points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_points_transaction();

-- Trigger for verification status changes
CREATE OR REPLACE FUNCTION notify_verification_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.background_check_status != OLD.background_check_status 
  OR NEW.is_verified != OLD.is_verified THEN
    -- Notify contractor
    PERFORM create_notification(
      NEW.contractor_id,
      'verification_updated',
      CASE 
        WHEN NEW.is_verified THEN 'Verification Approved!'
        WHEN NEW.background_check_status = 'failed' THEN 'Verification Failed'
        ELSE 'Verification Status Updated'
      END,
      CASE 
        WHEN NEW.is_verified THEN 'Your contractor verification has been approved.'
        WHEN NEW.background_check_status = 'failed' THEN 'Your verification could not be completed.'
        ELSE 'Your verification status has been updated to: ' || NEW.background_check_status
      END,
      jsonb_build_object(
        'status', NEW.background_check_status,
        'is_verified', NEW.is_verified
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_verification_update
  AFTER UPDATE OF background_check_status, is_verified ON contractor_verifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_verification_update();