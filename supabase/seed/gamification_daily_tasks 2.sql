-- Initial Daily Tasks Seed Data

-- Common daily tasks for all users
INSERT INTO daily_tasks (title, description, points, action, target_count, is_active)
VALUES
  ('Daily Login', 'Log in to the platform', 5, 'login', 1, true),
  ('Browse Services', 'View at least 3 service listings', 5, 'service_view', 3, true),
  ('Check Messages', 'Check your messages inbox', 5, 'message_check', 1, true),
  ('Visit Forum', 'Visit the community forum', 5, 'forum_view', 1, true);

-- Client-specific daily tasks
INSERT INTO daily_tasks (title, description, points, action, target_count, is_active)
VALUES
  ('Service Search', 'Search for a service', 5, 'service_search', 1, true),
  ('Save Favorite', 'Save a service to your favorites', 10, 'service_favorite', 1, true),
  ('Read Reviews', 'Read reviews for services', 5, 'review_read', 3, true);

-- Service agent-specific daily tasks
INSERT INTO daily_tasks (title, description, points, action, target_count, is_active)
VALUES
  ('Check Bookings', 'Check your upcoming bookings', 5, 'booking_check', 1, true),
  ('Update Availability', 'Update your service availability', 10, 'availability_update', 1, true),
  ('Respond to Inquiries', 'Respond to client inquiries', 15, 'inquiry_respond', 1, true);

-- Create function to assign daily tasks to users
CREATE OR REPLACE FUNCTION assign_daily_tasks()
RETURNS void AS $$
DECLARE
    v_user RECORD;
    v_task RECORD;
    v_user_type TEXT;
BEGIN
    -- Loop through all users
    FOR v_user IN SELECT id FROM auth.users
    LOOP
        -- Get user type
        SELECT user_type INTO v_user_type FROM profiles WHERE id = v_user.id;
        
        -- Assign common tasks to all users
        FOR v_task IN SELECT id FROM daily_tasks WHERE action IN ('login', 'message_check', 'forum_view')
        LOOP
            INSERT INTO user_daily_tasks (user_id, task_id, progress, is_completed, created_at)
            VALUES (v_user.id, v_task.id, 0, false, CURRENT_DATE)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Assign client-specific tasks
        IF v_user_type = 'client' THEN
            FOR v_task IN SELECT id FROM daily_tasks WHERE action IN ('service_search', 'service_view', 'service_favorite', 'review_read')
            LOOP
                INSERT INTO user_daily_tasks (user_id, task_id, progress, is_completed, created_at)
                VALUES (v_user.id, v_task.id, 0, false, CURRENT_DATE)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
        
        -- Assign service agent-specific tasks
        IF v_user_type = 'service_agent' OR v_user_type = 'contractor' THEN
            FOR v_task IN SELECT id FROM daily_tasks WHERE action IN ('booking_check', 'availability_update', 'inquiry_respond')
            LOOP
                INSERT INTO user_daily_tasks (user_id, task_id, progress, is_completed, created_at)
                VALUES (v_user.id, v_task.id, 0, false, CURRENT_DATE)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset daily tasks
CREATE OR REPLACE FUNCTION reset_daily_tasks()
RETURNS void AS $$
BEGIN
    -- Delete all user daily tasks
    DELETE FROM user_daily_tasks;
    
    -- Reassign daily tasks
    PERFORM assign_daily_tasks();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically assign daily tasks to new users
CREATE OR REPLACE FUNCTION assign_daily_tasks_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_task RECORD;
    v_user_type TEXT;
BEGIN
    -- Get user type
    SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.id;
    
    -- Assign common tasks to all users
    FOR v_task IN SELECT id FROM daily_tasks WHERE action IN ('login', 'message_check', 'forum_view')
    LOOP
        INSERT INTO user_daily_tasks (user_id, task_id, progress, is_completed, created_at)
        VALUES (NEW.id, v_task.id, 0, false, CURRENT_DATE)
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Assign client-specific tasks
    IF v_user_type = 'client' THEN
        FOR v_task IN SELECT id FROM daily_tasks WHERE action IN ('service_search', 'service_view', 'service_favorite', 'review_read')
        LOOP
            INSERT INTO user_daily_tasks (user_id, task_id, progress, is_completed, created_at)
            VALUES (NEW.id, v_task.id, 0, false, CURRENT_DATE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    
    -- Assign service agent-specific tasks
    IF v_user_type = 'service_agent' OR v_user_type = 'contractor' THEN
        FOR v_task IN SELECT id FROM daily_tasks WHERE action IN ('booking_check', 'availability_update', 'inquiry_respond')
        LOOP
            INSERT INTO user_daily_tasks (user_id, task_id, progress, is_completed, created_at)
            VALUES (NEW.id, v_task.id, 0, false, CURRENT_DATE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user creation
CREATE TRIGGER trigger_assign_daily_tasks_to_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION assign_daily_tasks_to_new_user();

-- Create a scheduled function to reset daily tasks at midnight
CREATE OR REPLACE FUNCTION schedule_daily_task_reset()
RETURNS void AS $$
BEGIN
    PERFORM cron.schedule(
        'reset-daily-tasks',
        '0 0 * * *', -- Run at midnight every day
        $$SELECT reset_daily_tasks()$$
    );
END;
$$ LANGUAGE plpgsql;
