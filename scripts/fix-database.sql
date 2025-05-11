-- Fix Database Script for FAIT Co-op
-- This script fixes authentication issues and ensures proper user setup

-- 1. Check if the auth schema exists, create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA IF NOT EXISTS auth;
    END IF;
END
$$;

-- 2. Create or update the auth.users table if needed
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN,
    role TEXT,
    confirmation_token TEXT,
    recovery_token TEXT,
    email_change_token TEXT,
    email_change TEXT,
    confirmation_sent_at TIMESTAMPTZ,
    recovery_sent_at TIMESTAMPTZ,
    email_change_sent_at TIMESTAMPTZ,
    banned_until TIMESTAMPTZ,
    reauthentication_token TEXT,
    reauthentication_sent_at TIMESTAMPTZ,
    is_sso_user BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- 3. Create or update the profiles table if needed
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    full_name TEXT,
    user_type TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT
);

-- 4. Create RLS policies for the profiles table
-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can read their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 5. Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create or update the service agent user
-- First, check if the service agent exists
DO $$
DECLARE
    service_agent_id UUID;
    service_agent_email TEXT := 'service@itsfait.com';
BEGIN
    -- Check if service agent exists in auth.users
    SELECT id INTO service_agent_id FROM auth.users WHERE email = service_agent_email;
    
    IF service_agent_id IS NULL THEN
        -- Service agent doesn't exist, create a new UUID
        service_agent_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            service_agent_id,
            service_agent_email,
            -- This is a placeholder. In a real scenario, you'd use Supabase's auth API to set the password
            -- as it needs to be properly encrypted
            'PLACEHOLDER_PASSWORD',
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Service Agent", "user_type": "service_agent"}',
            NOW(),
            NOW()
        );
        
        -- Insert into profiles
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            user_type,
            created_at,
            updated_at
        ) VALUES (
            service_agent_id,
            service_agent_email,
            'Service Agent',
            'service_agent',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created service agent user with ID: %', service_agent_id;
    ELSE
        -- Service agent exists, update the profile
        UPDATE public.profiles
        SET 
            full_name = 'Service Agent',
            user_type = 'service_agent',
            updated_at = NOW()
        WHERE id = service_agent_id;
        
        RAISE NOTICE 'Updated existing service agent user with ID: %', service_agent_id;
    END IF;
END
$$;

-- 7. Create or update the client user
DO $$
DECLARE
    client_id UUID;
    client_email TEXT := 'client@itsfait.com';
BEGIN
    -- Check if client exists in auth.users
    SELECT id INTO client_id FROM auth.users WHERE email = client_email;
    
    IF client_id IS NULL THEN
        -- Client doesn't exist, create a new UUID
        client_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            client_id,
            client_email,
            -- This is a placeholder. In a real scenario, you'd use Supabase's auth API to set the password
            'PLACEHOLDER_PASSWORD',
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Client User", "user_type": "client"}',
            NOW(),
            NOW()
        );
        
        -- Insert into profiles
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            user_type,
            created_at,
            updated_at
        ) VALUES (
            client_id,
            client_email,
            'Client User',
            'client',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created client user with ID: %', client_id;
    ELSE
        -- Client exists, update the profile
        UPDATE public.profiles
        SET 
            full_name = 'Client User',
            user_type = 'client',
            updated_at = NOW()
        WHERE id = client_id;
        
        RAISE NOTICE 'Updated existing client user with ID: %', client_id;
    END IF;
END
$$;

-- 8. Create or update the admin user
DO $$
DECLARE
    admin_id UUID;
    admin_email TEXT := 'admin@itsfait.com';
BEGIN
    -- Check if admin exists in auth.users
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
    
    IF admin_id IS NULL THEN
        -- Admin doesn't exist, create a new UUID
        admin_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            is_super_admin
        ) VALUES (
            admin_id,
            admin_email,
            -- This is a placeholder. In a real scenario, you'd use Supabase's auth API to set the password
            'PLACEHOLDER_PASSWORD',
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin User", "user_type": "admin"}',
            NOW(),
            NOW(),
            TRUE
        );
        
        -- Insert into profiles
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            user_type,
            created_at,
            updated_at
        ) VALUES (
            admin_id,
            admin_email,
            'Admin User',
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin user with ID: %', admin_id;
    ELSE
        -- Admin exists, update the profile
        UPDATE public.profiles
        SET 
            full_name = 'Admin User',
            user_type = 'admin',
            updated_at = NOW()
        WHERE id = admin_id;
        
        -- Make sure admin is a super admin
        UPDATE auth.users
        SET is_super_admin = TRUE
        WHERE id = admin_id;
        
        RAISE NOTICE 'Updated existing admin user with ID: %', admin_id;
    END IF;
END
$$;

-- 9. Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Add the admin user to the admin_users table
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@itsfait.com';
    
    IF admin_id IS NOT NULL THEN
        -- Check if admin exists in admin_users
        IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = admin_id) THEN
            -- Insert admin into admin_users
            INSERT INTO public.admin_users (user_id, is_active)
            VALUES (admin_id, TRUE);
            
            RAISE NOTICE 'Added admin user to admin_users table';
        ELSE
            -- Update admin in admin_users
            UPDATE public.admin_users
            SET is_active = TRUE, updated_at = NOW()
            WHERE user_id = admin_id;
            
            RAISE NOTICE 'Updated admin user in admin_users table';
        END IF;
    END IF;
END
$$;

-- 11. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Enable RLS on the notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies for the notifications table
-- Allow users to read their own notifications
CREATE POLICY IF NOT EXISTS "Users can read their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY IF NOT EXISTS "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 14. Create forum_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Create forum_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id INTEGER REFERENCES public.forum_categories(id),
    user_id UUID REFERENCES auth.users(id),
    is_sticky BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Create forum_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES public.forum_threads(id),
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Create get_forum_stats function
CREATE OR REPLACE FUNCTION public.get_forum_stats()
RETURNS TABLE (
    total_threads INTEGER,
    total_posts INTEGER,
    total_users INTEGER,
    latest_thread_id INTEGER,
    latest_thread_title TEXT,
    latest_thread_created_at TIMESTAMPTZ,
    latest_post_id INTEGER,
    latest_post_thread_id INTEGER,
    latest_post_thread_title TEXT,
    latest_post_created_at TIMESTAMPTZ,
    latest_post_user_id UUID,
    latest_post_user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.forum_threads)::INTEGER AS total_threads,
        (SELECT COUNT(*) FROM public.forum_posts)::INTEGER AS total_posts,
        (SELECT COUNT(*) FROM public.profiles)::INTEGER AS total_users,
        t.id AS latest_thread_id,
        t.title AS latest_thread_title,
        t.created_at AS latest_thread_created_at,
        p.id AS latest_post_id,
        pt.id AS latest_post_thread_id,
        pt.title AS latest_post_thread_title,
        p.created_at AS latest_post_created_at,
        p.user_id AS latest_post_user_id,
        prof.full_name AS latest_post_user_name
    FROM
        (SELECT id, title, created_at FROM public.forum_threads ORDER BY created_at DESC LIMIT 1) t,
        (SELECT id, thread_id, user_id, created_at FROM public.forum_posts ORDER BY created_at DESC LIMIT 1) p
        LEFT JOIN public.forum_threads pt ON p.thread_id = pt.id
        LEFT JOIN public.profiles prof ON p.user_id = prof.id;
END;
$$ LANGUAGE plpgsql;

-- 18. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 19. Final message
DO $$
BEGIN
    RAISE NOTICE 'Database update completed successfully!';
    RAISE NOTICE 'Note: The passwords in auth.users are placeholders and need to be set using Supabase Auth API.';
    RAISE NOTICE 'Use the create-service-agent.js script to set the proper passwords.';
END
$$;
