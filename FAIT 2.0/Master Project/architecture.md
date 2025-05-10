# FAIT Platform Architecture

## Tech Stack
- **Frontend**: React 18 + TailwindCSS + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel
- **Auth**: Supabase Auth (email/password + magic link)
- **CI/CD**: GitHub Actions
- **Payment**: Stripe
- **Maps**: Google Maps
- **Background Checks**: Checkr

## Project Structure
- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/pages` - Page components for each route
  - `/hooks` - Custom React hooks
  - `/context` - React context providers
  - `/utils` - Utility functions
  - `/api` - API client functions
  - `/types` - TypeScript type definitions
- `/public` - Static assets
- `/supabase` - Supabase configuration and migrations
- `/.github/workflows` - CI/CD configuration