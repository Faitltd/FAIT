# Troubleshooting Profile Creation Issues

If you're encountering the "An error occurred while completing your profile" error when trying to create a profile after Google OAuth login, follow this guide to diagnose and fix the issue.

## Common Causes

1. **Missing Database Tables**: The required tables (profiles, contractor_verifications, points_transactions) might not exist in your Supabase database.
2. **Permission Issues**: Row Level Security (RLS) policies might be preventing the insertion of new records.
3. **Constraint Violations**: There might be constraint violations when inserting data.
4. **Existing Profile**: You might already have a profile in the database.

## Step 1: Run the Diagnostic Tool

We've created a diagnostic tool to help identify and fix profile creation issues:

```bash
npm run fix:profile
```

This tool will:
- Check if you're authenticated
- Verify if the required tables exist
- Check if you already have a profile
- Provide recommendations for fixing the issue

## Step 2: Delete Existing Profile (If Needed)

If the diagnostic tool indicates that you already have a profile, you can delete it to start fresh:

```bash
npm run fix:profile -- --delete-profile
```

This will delete your existing profile and related records, allowing you to create a new profile.

## Step 3: Test Profile Creation

You can test profile creation directly from the command line:

```bash
npm run fix:profile -- --test-create
```

This will attempt to create a new profile and points transaction, which can help identify specific errors.

## Step 4: Check Supabase Database

If the issues persist, you may need to check your Supabase database directly:

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to the "Table Editor" section
4. Verify that the following tables exist:
   - `profiles`
   - `contractor_verifications`
   - `points_transactions`
5. If any tables are missing, you'll need to create them using the SQL editor

## Step 5: Run Database Migrations

If tables are missing, you can run the database migrations to create them:

1. Navigate to the "SQL Editor" section in the Supabase Dashboard
2. Open the migration files from the `supabase/migrations` directory in your project
3. Execute the SQL statements to create the missing tables

## Step 6: Check RLS Policies

Row Level Security (RLS) policies might be preventing you from inserting records:

1. In the Supabase Dashboard, navigate to the "Authentication" > "Policies" section
2. Verify that the policies for the `profiles`, `contractor_verifications`, and `points_transactions` tables allow insertions for authenticated users
3. If needed, add or modify policies to allow insertions

## Step 7: Try Again

After making the necessary changes:

1. Log out of the application
2. Log back in with Google OAuth
3. Try completing your profile again

## Still Having Issues?

If you're still encountering issues after following these steps, check the browser console for specific error messages, which can provide more detailed information about what's going wrong.
