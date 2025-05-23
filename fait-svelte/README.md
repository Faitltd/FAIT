# FAIT SvelteKit Project

This is a SvelteKit project for the FAIT Cooperative platform.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Docker (for production deployment)

### Development

1. Clone the repository:

```bash
git clone <repository-url>
cd fait-svelte
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `build` directory with the compiled application.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Deployment

### Google Cloud Run Deployment

This project includes scripts for deploying to Google Cloud Run.

1. Make sure you have the Google Cloud SDK installed and configured.

2. Run the deployment script:

```bash
./scripts/deploy.sh
```

You can customize the deployment with the following options:

```bash
./scripts/deploy.sh --project <project-id> --service <service-name> --region <region> --env <environment>
```

### Setting Up Custom Domain

To set up a custom domain for your Cloud Run service:

```bash
./scripts/setup-domain.sh
```

You can customize the domain mapping with the following options:

```bash
./scripts/setup-domain.sh --project <project-id> --service <service-name> --region <region> --domain <domain>
```

## Project Structure

- `src/`: Source code
  - `routes/`: SvelteKit routes
  - `lib/`: Shared components and utilities
- `static/`: Static assets
- `scripts/`: Deployment and utility scripts
- `Dockerfile`: Docker configuration for production deployment

## Features

- Responsive design with TailwindCSS
- Service search and filtering
- Contact form
- About page with mission and values
- Clean, modern UI

## License

This project is licensed under the MIT License - see the LICENSE file for details.
