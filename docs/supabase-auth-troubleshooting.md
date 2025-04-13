# Supabase Auth Troubleshooting Guide

This guide provides solutions for authentication issues in the FAIT Co-Op application, particularly focusing on database-related errors.

## Common Auth Errors and Solutions

### 1. "email_change: converting NULL to string is unsupported"

This error occurs due to a schema mismatch in the Supabase auth tables. The `email_change` column in the `auth.users` table is expecting a string value but is receiving NULL values.

#### Solution:

Run our comprehensive fix script:

```bash
./scripts/fix-supabase-auth.sh
```

This script provides several options:
- Apply database migration to fix auth schema
- Restart Supabase services
- Reset Supabase database (if needed)
- Apply fix and restart (recommended)

### 2. "Database error querying schema"

This is a more general error indicating issues with the Supabase database schema or connectivity.

#### Solutions:

1. **Check Database Connection**:
   - Verify that your Supabase instance is running
   - Check for any network issues

2. **Apply Schema Fix**:
   - Run `./scripts/fix-supabase-auth.sh` and select option 4 (Apply fix and restart)

3. **Reset Database** (last resort):
   - Run `./scripts/fix-supabase-auth.sh` and select option 5 (Reset database and apply fix)
   - Note: This will delete all data in your local Supabase instance

### 3. Authentication Bypass Options

If you're unable to fix the database issues, we've implemented several authentication bypass options:

1. **Direct Login**:
   - Go to `/direct-login`
   - Uses Supabase auth but bypasses OAuth

2. **Emergency Login**:
   - Go to `/emergency-login`
   - Completely bypasses the database
   - Uses hardcoded credentials:
     - Admin: admin@itsfait.com / admin123
     - Client: client@itsfait.com / client123
     - Service Agent: service@itsfait.com / service123

## Technical Details

### Database Schema Issues

The main issues occur in the `auth.users` table, where several columns have incorrect NULL constraints:

- `email_change`: Should allow NULL values
- `email_change_token_new`: Should allow NULL values
- `email_change_token_current`: Should allow NULL values
- `phone_change`: Should allow NULL values
- `phone_change_token`: Should allow NULL values

Our migration script fixes these issues by:

1. Altering the columns to be of type `text`
2. Allowing NULL values for these columns
3. Adding appropriate comments to explain the purpose of each column

### Emergency Authentication Mode

The emergency authentication mode:

1. Stores user information in localStorage (not secure, but works for development)
2. Bypasses all database interactions
3. Provides access based on hardcoded user types
4. Integrates with the existing route protection system

## Preventing Future Issues

To prevent similar issues in the future:

1. **Keep Supabase Updated**: Regularly update your Supabase instance
2. **Test Authentication Flows**: Test all authentication flows after any database changes
3. **Use Migration Scripts**: Always use migration scripts for database changes
4. **Backup Before Changes**: Create backups before making any changes to the database

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
