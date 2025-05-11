# OAuth Authentication Troubleshooting Guide

This guide provides solutions for common OAuth authentication issues in the FAIT Co-Op application.

## Common Issues and Solutions

### "No session found" Error

If you're seeing a "No session found" error when trying to log in with Google, try these solutions:

1. **Clear Browser Cache and Cookies**:
   - Clear your browser cache and cookies, especially for the application domain
   - Try using a private/incognito window

2. **Check Redirect URLs**:
   - Ensure the redirect URLs in Supabase configuration match your application URLs
   - For local development, both `localhost` and `127.0.0.1` should be allowed

3. **Verify Google OAuth Configuration**:
   - Check that your Google Client ID is correctly set in the `.env` file
   - Verify that the Google OAuth credentials are properly configured in the Google Cloud Console

4. **Restart Supabase**:
   - Run the restart script: `./scripts/restart-supabase.sh`
   - This will apply any configuration changes to Supabase

### Third-Party Cookies Issues

Some browsers block third-party cookies, which can cause OAuth to fail:

1. **Enable Third-Party Cookies**:
   - In Chrome: Settings > Privacy and Security > Cookies > Allow all cookies
   - In Firefox: Options > Privacy & Security > Cookies and Site Data > Accept third-party cookies

2. **Use a Different Browser**:
   - Try using a different browser that doesn't block third-party cookies

### CORS Issues

Cross-Origin Resource Sharing (CORS) issues can prevent OAuth from working:

1. **Check Network Tab**:
   - Open browser developer tools (F12)
   - Look for CORS errors in the Network tab

2. **Update Supabase Configuration**:
   - Ensure the `site_url` and `additional_redirect_urls` in `supabase/config.toml` include all necessary URLs

## Technical Details

### OAuth Flow

The application uses the PKCE (Proof Key for Code Exchange) flow for OAuth authentication:

1. User clicks "Sign in with Google"
2. Application redirects to Google authentication page
3. User authenticates with Google
4. Google redirects back to the application with a code
5. Application exchanges the code for a session
6. User is logged in and redirected to the appropriate dashboard

### Debugging OAuth Issues

To debug OAuth issues:

1. **Check Browser Console**:
   - Open browser developer tools (F12)
   - Look for errors in the Console tab

2. **Check Network Requests**:
   - In the Network tab, filter for "oauth" or "auth"
   - Look for the redirect from Google and the subsequent API calls

3. **Check Supabase Logs**:
   - Run `supabase logs` to see any errors in the Supabase logs

## Configuration Reference

### Supabase Auth Configuration

The key settings in `supabase/config.toml`:

```toml
[auth]
site_url = "http://localhost:5173"
additional_redirect_urls = [
  "http://localhost:5173", 
  "http://localhost:5173/oauth-callback", 
  "http://127.0.0.1:5173", 
  "http://127.0.0.1:5173/oauth-callback"
]
```

### Supabase Client Configuration

The key settings in `src/lib/supabase.ts`:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});
```

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [PKCE Flow Explanation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce)
