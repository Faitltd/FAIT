# Testing Google OAuth Integration

This guide will walk you through testing the Google OAuth integration in your application.

## Prerequisites

Before you begin, make sure you have:

1. Configured Google OAuth in the Supabase dashboard
2. Added the correct redirect URI in the Google Cloud Console
3. Set up the environment variables in your `.env` file

## Step 1: Verify OAuth Configuration

Run the verification script to check if your OAuth configuration is working correctly:

```bash
npm run verify:oauth
```

This script will:
- Check if all required environment variables are set
- Attempt to generate a Google OAuth URL
- Verify that the URL contains your client ID

If successful, you should see output similar to:

```
=== Google OAuth Configuration Verification ===
Supabase URL: https://ydisdyadjupyswcpbxzu.supabase.co
Google Client ID: 526297187726-0g837h4s87e6lahtjl75a7rr1gi3veif.apps.googleusercontent.com
✅ Successfully generated Google OAuth URL
✅ OAuth URL contains client_id: true
```

## Step 2: Test the OAuth Flow in the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to http://localhost:5174 (or whatever port your app is running on)

3. Click on "Login" in the navigation bar

4. On the login page, click the "Sign in with Google" button

5. You should be redirected to Google's authentication page

6. After signing in with your Google account, you should be redirected back to your application

7. If you're a new user, you should be redirected to the "Complete Profile" page
   - Fill in your details
   - Select whether you're a client or contractor
   - Click "Complete Profile"

8. You should now be redirected to the appropriate dashboard based on your user type

## Step 3: Verify the Authentication State

To verify that you're properly authenticated:

1. Check that you can access protected routes (like the dashboard)
2. Try refreshing the page - you should remain logged in
3. Check the browser's developer console for any errors

## Troubleshooting

If you encounter issues:

### OAuth Redirect Issues

- Check that the redirect URI in Supabase matches the one in Google Cloud Console
- Verify that the redirect URI is correctly formatted: `https://ydisdyadjupyswcpbxzu.supabase.co/auth/v1/callback`
- Make sure your application is correctly handling the OAuth callback at `/oauth-callback`

### Authentication Errors

- Check the browser console for specific error messages
- Verify that your Supabase URL and anon key are correct in the `.env` file
- Make sure Google OAuth is enabled in your Supabase dashboard

### Profile Creation Issues

- Check if the `profiles` table exists in your Supabase database
- Verify that the schema matches what's expected in the `CompleteProfile` component
- Check for any database permission issues

## Next Steps

After successfully testing the Google OAuth integration:

1. Test the sign-out functionality
2. Test the authentication persistence (session should be maintained across page refreshes)
3. Test the protected routes to ensure they're only accessible to authenticated users
