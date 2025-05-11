-- Check for test users with exact email match
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com');

-- Check for test users with case-insensitive email match (to find case mismatches)
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE LOWER(email) IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com')
  AND email NOT IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com');

-- Fix any case mismatches found (uncomment and modify as needed)
-- UPDATE auth.users SET email = 'admin@itsfait.com' WHERE email = 'Admin@itsfait.com';
-- UPDATE auth.users SET email = 'client@itsfait.com' WHERE email = 'Client@itsfait.com';
-- UPDATE auth.users SET email = 'service@itsfait.com' WHERE email = 'Service@itsfait.com';

-- Create test users if they don't exist (uncomment if needed)
/*
DO $$
BEGIN
    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = 'admin@itsfait.com') THEN
        -- Create admin user
        INSERT INTO auth.users (
            email, 
            encrypted_password, 
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            'admin@itsfait.com',
            -- This is a placeholder. You should use proper password hashing
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"], "user_type": "admin"}',
            '{"user_type": "admin"}'
        );
        
        RAISE NOTICE 'Created admin user';
    END IF;
    
    -- Check if client user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = 'client@itsfait.com') THEN
        -- Create client user
        INSERT INTO auth.users (
            email, 
            encrypted_password, 
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            'client@itsfait.com',
            crypt('client123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"], "user_type": "client"}',
            '{"user_type": "client"}'
        );
        
        RAISE NOTICE 'Created client user';
    END IF;
    
    -- Check if service agent user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = 'service@itsfait.com') THEN
        -- Create service agent user
        INSERT INTO auth.users (
            email, 
            encrypted_password, 
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            'service@itsfait.com',
            crypt('service123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"], "user_type": "service_agent"}',
            '{"user_type": "service_agent"}'
        );
        
        RAISE NOTICE 'Created service agent user';
    END IF;
END $$;
*/
