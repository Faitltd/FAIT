# FAIT Co-op MVP

This is the MVP (Minimum Viable Product) for the FAIT Co-op platform, a cooperative marketplace connecting clients with contractors.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

## Google OAuth Setup

This project uses Google OAuth for authentication. Follow these steps to set it up:

1. Configure your Google OAuth credentials in the Supabase dashboard:
   - Go to Authentication > Providers > Google
   - Enable Google authentication
   - Enter your Google Client ID and Client Secret
   - Set the authorized redirect URL to: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`

2. Make sure your Google OAuth credentials are properly configured in the Google Cloud Console:
   - Add the Supabase callback URL to the authorized redirect URIs

For detailed instructions, see the [Google OAuth Setup Guide](docs/google-oauth-setup.md).

### Testing OAuth Integration

To verify your OAuth configuration is working correctly:

```bash
npm run verify:oauth
```

To test the full OAuth flow in the application:

1. Start the development server: `npm run dev`
2. Navigate to the login page and click "Sign in with Google"
3. Complete the Google authentication process

For a comprehensive testing guide, see [Testing OAuth Integration](docs/testing-oauth.md).

## Features

- User authentication (email/password and Google OAuth)
- Client and contractor profiles
- Service booking system
- Contractor verification
- Admin dashboard
- Points and rewards system
- Governance and voting

## Tech Stack

- React
- TypeScript
- Vite
- Supabase (Auth, Database, Storage)
- Tailwind CSS

## Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `lib/` - Utility functions and libraries
  - `pages/` - Application pages
- `public/` - Static assets
- `supabase/` - Supabase functions and migrations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
