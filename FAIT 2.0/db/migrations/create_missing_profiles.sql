-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, full_name, user_type, created_at, updated_at)
SELECT 
  id, 
  '', -- Empty full_name as default
  'standard', -- Default user_type
  now(), 
  now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Output the number of profiles created
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  RAISE NOTICE 'Total profiles after migration: %', profile_count;
END $$;