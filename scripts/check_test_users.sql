-- Check for test users with exact email match
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com');

-- Check for test users with case-insensitive email match (to find case mismatches)
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE LOWER(email) IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com')
  AND email NOT IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com');
