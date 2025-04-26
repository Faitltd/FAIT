# Setting Up Google App Password for FAIT Co-op Password Reset

This guide will walk you through the process of creating a Google App Password for your admin@fait-coop.com account to enable password reset emails.

## Prerequisites

- Access to your admin@fait-coop.com Google Workspace account
- 2-Step Verification enabled on your Google account (required for App Passwords)

## Step 1: Enable 2-Step Verification (if not already enabled)

1. Go to your Google Account at [myaccount.google.com](https://myaccount.google.com)
2. In the navigation panel, select **Security**
3. Under "Signing in to Google," select **2-Step Verification**
4. Follow the steps to turn on 2-Step Verification
5. Complete the verification process

## Step 2: Create an App Password

1. Go to your Google Account at [myaccount.google.com](https://myaccount.google.com)
2. In the navigation panel, select **Security**
3. Under "Signing in to Google," select **App passwords**
   - Note: This option only appears if 2-Step Verification is enabled
4. At the bottom, click **Select app** and choose **Mail**
5. Click **Select device** and choose **Other (Custom name)**
6. Enter "FAIT Co-op Password Reset" as the name
7. Click **Generate**
8. The App Password is the 16-character code that appears on your screen
9. Copy this password (you won't be able to see it again)

## Step 3: Add the App Password to Supabase Configuration

1. Open the `supabase/.env` file in your project
2. Replace the placeholder with your actual App Password:

```
# Google Workspace SMTP configuration
GOOGLE_APP_PASSWORD=your_16_character_app_password_here
```

3. Save the file

## Step 4: Restart Supabase

1. Open a terminal in your project directory
2. Stop the current Supabase instance:
   ```
   supabase stop
   ```
3. Start Supabase again:
   ```
   supabase start
   ```

## Step 5: Test the Password Reset

1. Go to your application's login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for the password reset link
5. Follow the link to reset your password

## Troubleshooting

If you encounter issues:

### Check Supabase Logs

```
supabase logs
```

Look for any SMTP-related errors in the logs.

### Common Issues

1. **Authentication Failed**: Make sure you're using the correct App Password
2. **Connection Refused**: Ensure port 587 is not blocked by your firewall
3. **TLS Errors**: Verify TLS is enabled in your configuration

### Google Workspace Admin Settings

If emails still aren't sending, check your Google Workspace admin settings:

1. Log in to your Google Workspace admin console at [admin.google.com](https://admin.google.com)
2. Go to **Apps** > **Google Workspace** > **Gmail**
3. Click on **Advanced settings**
4. Ensure that SMTP relay service is enabled and properly configured

## Security Considerations

- Keep your App Password secure and don't share it
- The App Password grants access to your email account, so treat it like any other password
- Consider creating a dedicated service account for sending emails in production
- Regularly review and rotate your App Passwords

## Next Steps

Once password reset is working, you may want to:

1. Set up SPF, DKIM, and DMARC records to improve email deliverability
2. Create custom email templates for other notifications
3. Monitor email sending logs to ensure everything is working properly
