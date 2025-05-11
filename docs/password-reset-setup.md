# Setting Up Password Reset Emails

This guide will help you set up password reset emails for your FAIT Co-Op application using SendGrid.

## Prerequisites

1. A SendGrid account (you can sign up for free at [SendGrid](https://sendgrid.com/))
2. Access to your Supabase project

## Steps to Configure SendGrid

### 1. Create a SendGrid API Key

1. Log in to your SendGrid account
2. Navigate to Settings > API Keys
3. Click "Create API Key"
4. Name your key (e.g., "FAIT Co-Op Password Reset")
5. Select "Restricted Access" and ensure "Mail Send" permissions are enabled
6. Click "Create & View"
7. Copy your API key (you won't be able to see it again)

### 2. Configure Sender Authentication

SendGrid requires sender authentication to prevent spam:

1. In SendGrid, go to Settings > Sender Authentication
2. Choose either Domain Authentication or Single Sender Verification
   - Domain Authentication is recommended for production
   - Single Sender Verification is quicker for testing
3. Follow the steps provided by SendGrid to complete the authentication

### 3. Update Supabase Configuration

1. Edit the `supabase/.env` file and add your SendGrid API key:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```

2. The SMTP configuration in `supabase/config.toml` has already been updated:
   ```toml
   [auth.email.smtp]
   enabled = true
   host = "smtp.sendgrid.net"
   port = 587
   user = "apikey"
   pass = "env(SENDGRID_API_KEY)"
   admin_email = "admin@fait-coop.com"
   sender_name = "FAIT Co-Op"
   ```

### 4. Restart Supabase

1. Stop your local Supabase instance:
   ```
   supabase stop
   ```

2. Start Supabase again:
   ```
   supabase start
   ```

### 5. Test Password Reset

1. Go to your application's login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for the password reset link
5. Follow the link to reset your password

## Troubleshooting

If you're not receiving password reset emails:

1. Check your spam/junk folder
2. Verify your SendGrid API key is correct
3. Ensure your sender email is authenticated in SendGrid
4. Check Supabase logs for any SMTP errors:
   ```
   supabase logs
   ```

## Production Setup

For production environments:

1. Set the SendGrid API key as an environment variable on your hosting platform
2. Consider using a dedicated transactional email template in SendGrid for password resets
3. Ensure your domain is properly authenticated in SendGrid
4. Monitor email deliverability in the SendGrid dashboard

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
