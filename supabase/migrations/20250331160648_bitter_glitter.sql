/*
  # Add Checkr integration fields

  1. Changes
    - Add Checkr-related fields to contractor_verifications table
    - Add new background check status options

  2. Security
    - Maintain existing RLS policies
*/

-- Add Checkr-related fields to contractor_verifications
ALTER TABLE contractor_verifications
ADD COLUMN IF NOT EXISTS checkr_candidate_id text,
ADD COLUMN IF NOT EXISTS checkr_report_id text;

-- Ensure background_check_status column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'contractor_verifications'
    AND column_name = 'background_check_status'
  ) THEN
    ALTER TABLE contractor_verifications
    ADD COLUMN background_check_status text;
  END IF;
END $$;

-- Update background_check_status check constraint
ALTER TABLE contractor_verifications
DROP CONSTRAINT IF EXISTS contractor_verifications_background_check_status_check;

ALTER TABLE contractor_verifications
ADD CONSTRAINT contractor_verifications_background_check_status_check
CHECK (background_check_status = ANY (ARRAY[
  'pending'::text,
  'in_progress'::text,
  'clear'::text,
  'consider'::text,
  'suspended'::text,
  'dispute'::text,
  'failed'::text
]));