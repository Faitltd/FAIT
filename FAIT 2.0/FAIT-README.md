# FAIT Platform

The FAIT Platform is a cooperative marketplace that connects contractors, clients, and allied service providers. It standardizes pricing, streamlines communication, automates workflows, and rewards participation through behavioral design.

## Core Features

### User Roles & Access

- **Client (Homeowner/Property Owner)**: View project dashboard, submit requests, sign contracts, view progress, and communicate directly.
- **Contractor/Builder (FAIT Member)**: Input estimates, receive RFPs, upload documents, and participate in member forums.
- **FAIT Admin (Internal Team)**: Manage onboarding, configure automation, oversee compliance, and handle disputes.
- **Ally Role (Architects, Designers, Inspectors)**: Add drawings, join projects, and upload relevant files.

### Functional Modules

1. **Project Dashboard**: Track milestones, visualize timelines, and manage punchlists.
2. **Estimate Builder**: Create "Good/Better/Best" tiered pricing, pull SKU pricing via supplier APIs, and generate proposals.
3. **Scope of Work Generator**: Auto-populate structured scope documents from call notes, site visits, and estimates.
4. **Client Portal**: Access document repository, view scope/contracts/plans, and use messaging features.
5. **Trade Partner Portal**: Receive and accept RFPs, upload documents, and submit change orders.
6. **Behavioral Incentives Engine**: Track participation, award tokens, and develop Mastery Scores.
7. **Marketplace & Resource Library**: Access training modules, tool discounts, and government grants.

## Project Structure

```
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   │   ├── dashboard/   # Dashboard components for different user roles
│   │   ├── estimates/   # Estimate builder components
│   │   ├── incentives/  # Mastery score and incentives components
│   │   ├── projects/    # Project management components
│   │   └── ...          # Other component categories
│   ├── contexts/        # React context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── FAITContext.tsx    # FAIT-specific context
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components
│   └── types/           # TypeScript type definitions
├── supabase/            # Supabase configuration
│   └── migrations/      # Database migrations
└── cleanup.sh           # Cleanup script for maintenance
```

## Database Schema

The FAIT Platform uses a comprehensive database schema that includes:

- User profiles with role-based access
- Projects with milestones and punchlists
- Estimates with tiered pricing
- Scope of work documents
- Document management
- Trade partner relationships
- Behavioral incentives (mastery scores, badges, tokens)
- Marketplace and training modules

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-org/fait-platform.git
   cd fait-platform
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your Supabase credentials.

4. Run database migrations
   ```
   npm run db:migrate
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser to `http://localhost:3000`

## Demo Accounts

For demonstration purposes, you can use the following accounts:

- **Client**: client@example.com / password
- **Contractor**: contractor@example.com / password
- **Admin**: admin@example.com / password
- **Ally**: ally@example.com / password

## Development

### Code Organization

- **Components**: Reusable UI components are organized by feature area
- **Contexts**: Global state management using React Context API
- **Pages**: Top-level page components
- **Types**: TypeScript type definitions

### Adding New Features

1. Create new components in the appropriate directory
2. Update database schema if needed (add migration)
3. Add routes in App.tsx
4. Update relevant context providers

### Maintenance

Use the cleanup script to remove duplicate files and maintain code quality:

```
./cleanup.sh
```

## Future Enhancements

1. **Mobile Companion App**: Create a mobile version for on-site access
2. **AI Assistant Integration**: Implement transcription and summarization for scopes
3. **Dispute Mediation Engine**: Add automated evidence generation and mediation workflows
4. **Enhanced Analytics**: Add detailed reporting and insights
5. **Integration with External Services**: Connect with more supplier APIs and service providers
