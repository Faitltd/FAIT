-- Function to disable message triggers
CREATE OR REPLACE FUNCTION disable_message_triggers()
RETURNS void AS $$
BEGIN
  -- Disable the notify_new_message_trigger
  ALTER TABLE messages DISABLE TRIGGER notify_new_message_trigger;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable message triggers
CREATE OR REPLACE FUNCTION enable_message_triggers()
RETURNS void AS $$
BEGIN
  -- Enable the notify_new_message_trigger
  ALTER TABLE messages ENABLE TRIGGER notify_new_message_trigger;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
