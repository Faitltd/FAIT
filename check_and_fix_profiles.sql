-- Check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL,
            user_type TEXT NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created profiles table';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
END $$;

-- Check for profiles for test users
SELECT p.id, p.email, p.user_type, u.email as user_email
FROM public.profiles p
RIGHT JOIN auth.users u ON p.id = u.id
WHERE LOWER(u.email) IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com');

-- Create missing profiles for test users (uncomment if needed)
/*
DO $$
DECLARE
    admin_id UUID;
    client_id UUID;
    service_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM auth.users WHERE LOWER(email) = 'admin@itsfait.com';
    SELECT id INTO client_id FROM auth.users WHERE LOWER(email) = 'client@itsfait.com';
    SELECT id INTO service_id FROM auth.users WHERE LOWER(email) = 'service@itsfait.com';
    
    -- Create admin profile if needed
    IF admin_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id) THEN
        INSERT INTO public.profiles (id, email, user_type, full_name)
        VALUES (admin_id, 'admin@itsfait.com', 'admin', 'Admin User');
        RAISE NOTICE 'Created admin profile';
    END IF;
    
    -- Create client profile if needed
    IF client_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = client_id) THEN
        INSERT INTO public.profiles (id, email, user_type, full_name)
        VALUES (client_id, 'client@itsfait.com', 'client', 'Client User');
        RAISE NOTICE 'Created client profile';
    END IF;
    
    -- Create service agent profile if needed
    IF service_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = service_id) THEN
        INSERT INTO public.profiles (id, email, user_type, full_name)
        VALUES (service_id, 'service@itsfait.com', 'service_agent', 'Service Agent User');
        RAISE NOTICE 'Created service agent profile';
    END IF;
END $$;
*/
