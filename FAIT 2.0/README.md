# FAIT Platform 2.0

The FAIT (Fair, Accountable, Inclusive, Transparent) Platform is a cooperative platform designed to enable contractors, clients, and allied service providers to collaborate through standardized pricing, streamlined communication, automated workflows, and behavioral incentives.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker and Docker Compose
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and update the variables with your own values:
   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your Supabase credentials and other configuration options.

### Development

#### Using Docker

1. Start the development environment:
   ```bash
   docker-compose up
   ```
2. The application will be available at http://localhost:3000

#### Using Local Development Server

1. Start the development server:
   ```bash
   npm run dev
   ```
2. The application will be available at http://localhost:3000

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist` directory

### Deployment

#### Using Docker

1. Build and start the production environment:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Project Structure

```
├── api/                 # API service
├── docker/              # Docker configuration
│   ├── api/             # API service Docker configuration
│   ├── db/              # Database Docker configuration
│   ├── frontend/        # Frontend Docker configuration
│   └── worker/          # Worker Docker configuration
├── public/              # Static assets
├── src/                 # Frontend source code
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── layouts/         # Layout components
│   ├── lib/             # Utility libraries
│   ├── pages/           # Application pages
│   └── utils/           # Helper utilities
├── worker/              # Background worker service
└── supabase/            # Supabase configuration
    └── migrations/      # Database migrations
```

## Features

### Core Platform Features
- User authentication and role-based access control
- User roles (Client, Contractor, Ally, Admin)
- Project Dashboard with milestone tracking
- Estimate Builder with tiered pricing (Good, Better, Best)
- Scope of Work Generator
- Client and Trade Partner Portals
- Document Management
- Punchlist Management
- RFP (Request for Proposal) System

### Behavioral Incentives Engine
- Mastery Score System (Skill, Communication, Reliability)
- Badge and Achievement System
- Token Economy for Rewards
- Training Modules with Token Rewards

### Marketplace & Resource Library
- Contractor and Ally Profiles
- Marketplace for Tools and Services
- Grant Database
- Training Resources

### Communication Tools
- In-app Messaging System with real-time chat
- Community Forum with categories, threads, and posts
- Notification Center for system-wide alerts
- Project-based Communication

### Admin + Back Office Tools
- User Management with role assignment
- Verification Request Processing
- System Settings Configuration
- Analytics Dashboard with key metrics
- Audit Logging for system activities

## Implemented Modules

The FAIT platform consists of six core modules:

### 1. Member Onboarding & Identity
- User registration and authentication
- Profile management
- Identity verification

### 2. Member Ledger & Governance
- Governance role management
- Dividend eligibility tracking
- Bylaws acknowledgment

### 3. Project Status Tracker
- Project milestone tracking
- Project timeline visualization
- Status updates and notifications
- Issue tracking and resolution

### 4. Token & Reward Engine
- Token balance display
- Rewards system
- Badges and achievements

### 5. Community + Communication
- Direct messaging system
- Community forum with categories and threads
- Notification center for system alerts

### 6. Admin + Back Office Tools
- User management and role assignment
- Verification request processing
- System settings configuration
- Analytics dashboard

## Database Setup

The FAIT Platform uses Supabase as its database and authentication provider. To set up the database:

1. Create a new Supabase project
2. Run the migration scripts in the `supabase/migrations` directory
3. Run the seed script in `supabase/seed.sql` to populate initial data

## Pre-Launch Checklist

Before launching the FAIT Platform, ensure you have completed the following:

1. **Authentication System**
   - Verify Supabase Auth is properly configured
   - Test all authentication flows (signup, login, password reset)

2. **Database Implementation**
   - Run all migrations
   - Verify table structure and relationships
   - Set up proper indexes for performance

3. **Core Components**
   - Replace all placeholder components with real implementations
   - Test all user flows for each role (Client, Contractor, Ally, Admin)

4. **Testing**
   - Run unit tests with Jest: `npm test`
   - Run end-to-end tests with Cypress: `npm run cypress:open` (interactive) or `npm run cypress:run` (headless)
   - Use the convenience script to start the server and run tests: `./run-tests.sh`
   - The test suite includes comprehensive tests for:
     - Authentication flows (login, register, forgot password)
     - Project management (creation, details, milestones)
     - Profile management
     - Community features
     - Admin dashboard functionality
   - CI/CD pipeline with GitHub Actions for automated testing and deployment

5. **Documentation**
   - Create user guides for each role
   - Document API endpoints
   - Prepare admin documentation

## License

This project is licensed under the terms of the MIT license.

See [LICENSE](LICENSE)
