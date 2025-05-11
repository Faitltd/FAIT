-- Check for existing users
SELECT id, email, created_at
FROM auth.users
LIMIT 10;
