# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Fait-Coop application.

## Prerequisites

- Google Cloud Platform account
- Access to the Supabase dashboard for your project

## Google OAuth Credentials

You have already created Google OAuth credentials with the following details:

- **Client ID**: `526297187726-0g837h4s87e6lahtjl75a7rr1gi3veif.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Creation Date**: April 6, 2025

## Configuring Supabase Authentication

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to **Authentication** > **Providers** in the sidebar
4. Find **Google** in the list of providers and click on it
5. Toggle the **Enable** switch to ON
6. Enter the following details:
   - **Client ID**: `526297187726-0g837h4s87e6lahtjl75a7rr1gi3veif.apps.googleusercontent.com`
   - **Client Secret**: `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`
7. For **Authorized Redirect URLs**, use the following format:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   
   Replace `[YOUR_PROJECT_REF]` with your Supabase project reference (e.g., `ydisdyadjupyswcpbxzu`)

8. Click **Save**

## Configuring Google Cloud Platform

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID and click on it
5. Under **Authorized redirect URIs**, add:
   - `https://ydisdyadjupyswcpbxzu.supabase.co/auth/v1/callback`
6. Click **Save**

## Testing the Integration

1. Run your application locally with `npm run dev`
2. Navigate to the login page
3. Click the "Sign in with Google" button
4. You should be redirected to Google's authentication page
5. After successful authentication, you should be redirected back to your application

## Troubleshooting

If you encounter any issues:

1. Check that the Client ID and Client Secret are correctly entered in both Supabase and your .env file
2. Verify that the redirect URIs are correctly configured in Google Cloud Console
3. Check the browser console for any error messages
4. Ensure your Supabase project is on a plan that supports OAuth providers

## Security Notes

- Never commit your Client Secret to version control
- For production, consider using environment variables for all sensitive credentials
- Regularly rotate your Client Secret for enhanced security
