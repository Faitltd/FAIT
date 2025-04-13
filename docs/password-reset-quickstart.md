# Password Reset Quick Start Guide

This guide provides quick steps to test the password reset functionality with your Google Workspace account.

## Quick Setup

1. **Generate Google App Password**:
   - Go to [myaccount.google.com](https://myaccount.google.com) → Security → App passwords
   - Create a new App Password for "Mail" named "FAIT Password Reset"
   - Copy the 16-character password

2. **Update Environment File**:
   - Edit `supabase/.env`
   - Replace the placeholder with your actual App Password:
     ```
     GOOGLE_APP_PASSWORD=your_16_character_app_password_here
     ```

3. **Restart Supabase**:
   ```
   supabase stop
   supabase start
   ```

4. **Test Password Reset**:
   - Go to http://localhost:5173/forgot-password
   - Enter your email address
   - Check your email for the reset link

## Configuration Summary

- **SMTP Server**: smtp.gmail.com
- **Port**: 587
- **Username**: admin@itsfait.com
- **From Email**: admin@itsfait.com
- **Sender Name**: FAIT
- **TLS**: Enabled
- **Custom Template**: Enabled (./supabase/templates/password-reset.html)

## Need Help?

See the detailed guides:
- [Google App Password Setup](./google-app-password-setup.md)
- [Google SMTP Setup](./google-smtp-setup.md)
- [Secure Password Reset](./secure-password-reset.md)
