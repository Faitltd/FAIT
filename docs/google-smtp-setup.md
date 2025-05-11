# Setting Up Google Workspace SMTP for Password Reset Emails

This guide will help you configure your Google Workspace (formerly G Suite) account to send password reset emails for your FAIT Co-Op application.

## Prerequisites

1. A Google Workspace account (paid Google business account)
2. Admin access to your Google Workspace
3. Access to your Supabase project

## Step 1: Configure Google Workspace

### Enable SMTP Access

1. Log in to your Google Workspace admin console at [admin.google.com](https://admin.google.com)
2. Go to **Apps** > **Google Workspace** > **Gmail**
3. Click on **Advanced settings**
4. Scroll down to **SMTP relay service** and ensure it's enabled
5. Configure the settings:
   - Allowed senders: **Only addresses in my domains**
   - Authentication: **Require SMTP Authentication**
   - Encryption: **Require TLS encryption**

### Create an App Password (Recommended)

If you have 2-Step Verification enabled on your account (recommended):

1. Go to your Google Account settings at [myaccount.google.com](https://myaccount.google.com)
2. Click on **Security**
3. Under "Signing in to Google," click on **App passwords**
   - If you don't see this option, you may need to enable 2-Step Verification first
4. Select **Mail** as the app and **Other** as the device
5. Enter a name like "FAIT Co-Op Password Reset"
6. Click **Generate**
7. Copy the 16-character password that appears (you'll need this for Supabase configuration)

### Alternative: Enable Less Secure Apps (Not Recommended)

If you cannot use App Passwords for some reason:

1. Go to your Google Account settings
2. Click on **Security**
3. Scroll down to "Less secure app access" and turn it on
   - Note: This is less secure and not recommended for production environments

## Step 2: Update Supabase Configuration

### Edit the Supabase Configuration File

1. Open `supabase/config.toml` in your project
2. Update the SMTP configuration section:

```toml
# Use Google Workspace SMTP server
[auth.email.smtp]
enabled = true
host = "smtp.gmail.com"
port = 587
user = "your.email@yourdomain.com"  # Replace with your Google Workspace email
pass = "env(GOOGLE_APP_PASSWORD)"   # Will be set in .env file
admin_email = "admin@fait-coop.com" # Can be the same as your user email
sender_name = "FAIT Co-Op"
# Make sure TLS is enabled
tls = true
```

### Set Up Environment Variables

1. Create or edit `supabase/.env` file:

```
# Google Workspace SMTP configuration
GOOGLE_APP_PASSWORD=your_google_app_password_here
```

2. Replace `your_google_app_password_here` with the App Password you generated earlier

## Step 3: Restart Supabase

1. Stop your local Supabase instance:
   ```
   supabase stop
   ```

2. Start Supabase again:
   ```
   supabase start
   ```

## Step 4: Test Password Reset

1. Go to your application's login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for the password reset link
5. Follow the link to reset your password

## Troubleshooting

If you're not receiving password reset emails:

### Check Supabase Logs

```
supabase logs
```

Look for any SMTP-related errors in the logs.

### Verify Google Workspace Settings

1. Make sure SMTP relay service is enabled
2. Confirm your App Password is correct
3. Check that the email address in the configuration matches your Google Workspace account

### Test SMTP Connection

You can test your SMTP connection using a tool like `swaks` or an online SMTP tester.

Example with `swaks`:

```
swaks --to recipient@example.com --from your.email@yourdomain.com --server smtp.gmail.com:587 --auth LOGIN --auth-user your.email@yourdomain.com --auth-password your_app_password --tls
```

### Common Issues

1. **Authentication Failed**: Double-check your App Password
2. **Connection Refused**: Make sure port 587 is not blocked by your firewall
3. **TLS Errors**: Ensure TLS is enabled in your configuration
4. **Rate Limiting**: Google may limit the number of emails you can send per day

## Production Considerations

For production environments:

1. Use a dedicated email address for sending password resets
2. Consider setting up SPF, DKIM, and DMARC records to improve deliverability
3. Monitor email sending logs regularly
4. Consider using a dedicated email service provider for high-volume applications

## Additional Resources

- [Google Workspace SMTP Relay Service Documentation](https://support.google.com/a/answer/2956491)
- [Google App Passwords Documentation](https://support.google.com/accounts/answer/185833)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
