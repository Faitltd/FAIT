-- Check if user with email Admin@itsfait.com exists
SELECT id, email 
FROM auth.users 
WHERE email = 'Admin@itsfait.com';
