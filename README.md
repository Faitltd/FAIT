# FAIT Coop Platform

The FAIT Coop Platform is a comprehensive web application that provides various tools and services for the FAIT Cooperative.

## Project Structure

The FAIT Coop platform is organized as follows:

- **Main Site**: The main FAIT Coop website, deployed to the `fait-444705` Google Cloud project
- **GearGrab**: A separate component, deployed to the `fait-geargrab` Google Cloud project
- **Scrapers**: Various scrapers, deployed to the `fait-scrapers` Google Cloud project
- **Utilities**: Utility functions, deployed to the `fait-utilities` Google Cloud project

Each component is deployed as a separate Google Cloud project to ensure clean separation.

## Application Versions

The application supports multiple versions:

- **Simple**: A basic version with minimal features
- **Minimal**: A lightweight version with essential features
- **Enhanced**: An enhanced version with additional features
- **Full**: The complete version with all features
- **Modular**: A modular version with dynamically loaded components

## Development

### Prerequisites

- Node.js 20.x
- npm 9.x
- Docker

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/fait-coop.git
cd fait-coop
```

2. Install dependencies:

```bash
npm ci
```

3. Start the development server:

```bash
npm run dev
```

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run build:full`: Build the full version of the application
- `npm run preview`: Preview the production build
- `npm run lint`: Lint the code
- `npm test`: Run tests

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Environment Configuration

The application supports multiple environments:

- **Production**: Configuration in `.env.production`
- **Staging**: Configuration in `.env.staging`
- **Development**: Default configuration

## Project Components

### Main Site

The main site includes:

- User authentication and authorization
- Dashboard for different user types
- Service search and booking
- Project management
- Estimate calculators
- Warranty management

### GearGrab

GearGrab is a separate component that provides:

- Gear inventory management
- Gear rental and tracking
- Gear maintenance scheduling

### Scrapers

The scrapers component includes:

- Home Depot scraper
- Other retail store scrapers
- Price comparison tools

### Utilities

The utilities component includes:

- Data processing tools
- Reporting tools
- Administrative utilities

## Contributing

1. Create a feature branch from the appropriate base branch:
   - For production features: `git checkout -b feature/your-feature main`
   - For staging features: `git checkout -b feature/your-feature staging`
   - For development features: `git checkout -b feature/your-feature development`

2. Make your changes and commit them:
   ```bash
   git commit -m "Add your feature"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```

4. Create a pull request to the appropriate base branch.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

This project uses Sweep AI.
