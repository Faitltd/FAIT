# Fixing the OAuth Database Error

This guide addresses the specific OAuth error: `unable to fetch records: sql: Scan error on column index 8, name "email_change": converting NULL to string is unsupported`.

## Understanding the Issue

This error occurs due to a schema mismatch in the Supabase auth tables. Specifically, the `email_change` column in the `auth.users` table is expecting a string value but is receiving NULL values, which causes the error during the OAuth flow.

## Solution 1: Fix the Database Schema

### Step 1: Apply the Database Migration

We've created a migration script to fix this issue. Run:

```bash
./scripts/fix-auth-schema.sh
```

This script will:
1. Apply the migration to fix the `email_change` column in the `auth.users` table
2. Restart Supabase to apply the changes

### Step 2: Test OAuth Login Again

After applying the migration, try the OAuth login again to see if the issue is resolved.

## Solution 2: Use Direct Login (Workaround)

If the database fix doesn't resolve the issue, we've added a direct login option that bypasses OAuth:

1. Go to the login page: http://localhost:5173/login
2. Click on "Direct Login (Bypass OAuth)"
3. Enter your email and password
4. Click "Sign in"

This method uses the standard email/password authentication flow instead of OAuth.

## Technical Details

### The Database Issue

The error occurs because:

1. The `auth.users` table has a column named `email_change`
2. This column is defined as a string (text) type that doesn't allow NULL values
3. During the OAuth flow, Supabase tries to insert a NULL value into this column
4. The database rejects this operation, causing the error

### The Migration Fix

Our migration script:

1. Alters the `email_change` column to allow NULL values
2. Ensures the column is of type text
3. Adds a comment to explain the purpose of the column

```sql
-- Make sure the column allows NULL values
ALTER TABLE auth.users ALTER COLUMN email_change DROP NOT NULL;
```

## Preventing Future Issues

To prevent similar issues in the future:

1. **Keep Supabase Updated**: Regularly update your Supabase instance to get the latest schema fixes
2. **Test OAuth Thoroughly**: Test OAuth flows after any database schema changes
3. **Monitor Auth Logs**: Regularly check Supabase auth logs for errors

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [OAuth Troubleshooting Guide](./oauth-troubleshooting.md)
