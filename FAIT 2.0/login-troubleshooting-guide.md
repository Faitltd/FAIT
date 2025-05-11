# FAIT 2.0 Login Troubleshooting Guide

This guide will help you diagnose and fix login issues with the FAIT 2.0 platform.

## Common Login Issues

### 1. Environment Variables Missing

**Symptoms:**
- "Missing Supabase environment variables" error in console
- Login attempts fail with no specific error message

**Solution:**
1. Create or update your `.env` file with the following variables:
   ```
   VITE_SUPABASE_URL=https://ydisdyadjupyswcpbxzu.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY
   ```
2. Restart your development server

### 2. Local Authentication Mode Enabled

**Symptoms:**
- Login works in the diagnostic tool but not in the application
- Console shows "Using local authentication"

**Solution:**
1. Open your Supabase configuration file (usually `src/lib/supabase.ts`)
2. Find the line that sets `useLocalAuth` or `DEFAULT_LOCAL_AUTH` and set it to `false`
3. Or run the fix script which will do this automatically:
   ```
   ./fix-login-issues.sh
   ```

### 3. Browser Storage Issues

**Symptoms:**
- Intermittent login failures
- "Session not found" errors
- Login works in incognito mode but not in regular browser

**Solution:**
1. Clear your browser's local storage:
   - Open Developer Tools (F12)
   - Go to Application tab
   - Select Local Storage on the left
   - Right-click on your site and select "Clear"
   - Do the same for Session Storage and Cookies
2. Refresh the page and try logging in again

### 4. Supabase Client Initialization Issues

**Symptoms:**
- "Failed to initialize Supabase client" error in console
- Login button does nothing when clicked

**Solution:**
1. Check that you're using the correct Supabase URL and key
2. Ensure you're using a compatible version of the Supabase JS client
3. Run the diagnostic tool to test your Supabase connection:
   ```
   open auth-diagnostic.html
   ```

### 5. CORS Issues

**Symptoms:**
- Login fails with CORS errors in the console
- "Network Error" when trying to authenticate

**Solution:**
1. Check your Supabase project settings and ensure your domain is in the allowed origins
2. For local development, add `http://localhost:3000` (or your port) to allowed origins
3. If using a custom domain, add that as well

## Using the Diagnostic Tools

### Authentication Diagnostic Tool

The `auth-diagnostic.html` file provides a simple interface to test authentication directly with Supabase, bypassing your application code. This helps determine if the issue is with Supabase or your application.

To use it:
1. Open `auth-diagnostic.html` in your browser
2. Enter test credentials (default: admin@itsfait.com / admin123)
3. Click "Test Login" to attempt authentication
4. Check the logs for any errors

### Fix Login Issues Script

The `fix-login-issues.sh` script automates several common fixes:

1. Creates/updates `.env` file with correct Supabase variables
2. Checks/creates Supabase client configuration
3. Disables local authentication mode
4. Creates authentication diagnostic tool

To run it:
```
./fix-login-issues.sh
```

## Test Credentials

The following test credentials should work with your Supabase instance:

| Email | Password | User Type |
|-------|----------|-----------|
| admin@itsfait.com | admin123 | Admin |
| client@itsfait.com | client123 | Client |
| service@itsfait.com | service123 | Service Agent |

## Still Having Issues?

If you're still experiencing login problems after trying these solutions:

1. Check the browser console for specific error messages
2. Look at the Supabase dashboard for authentication logs
3. Verify that the test users exist in your Supabase instance
4. Try creating a new user through the Supabase dashboard
5. Check if your Supabase project has reached its free tier limits
