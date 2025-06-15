# FAIT Co-op Platform Docker Setup

This document provides instructions for setting up, running, and managing the FAIT Co-op platform using Docker Compose.

## Architecture

The FAIT Co-op platform consists of the following services:

- **Frontend**: React application served by Nginx in production
- **API**: Node.js backend service
- **Database**: PostgreSQL database
- **Redis**: For caching and message queuing
- **Worker**: Background worker for scheduled tasks

Only the frontend service exposes a port to the host machine (port 3000), following security best practices.

## Prerequisites

- Docker Engine (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/fait-coop-platform.git
cd fait-coop-platform
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration values.

### 3. Build and Start the Services

```bash
docker-compose up -d
```

This command builds the images (if they don't exist) and starts all services in detached mode.

### 4. Check Service Status

```bash
docker-compose ps
```

### 5. Access the Application

Once all services are running, you can access the application at:

```
http://localhost:3000
```

## Common Operations

### Viewing Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for a specific service:

```bash
docker-compose logs -f frontend
```

### Stopping the Services

```bash
docker-compose down
```

To stop the services and remove volumes (this will delete all data):

```bash
docker-compose down -v
```

### Rebuilding Services

If you make changes to the code or Dockerfiles:

```bash
docker-compose build
```

To rebuild a specific service:

```bash
docker-compose build frontend
```

### Restarting Services

Restart all services:

```bash
docker-compose restart
```

Restart a specific service:

```bash
docker-compose restart api
```

## Updating the Application

### 1. Pull the Latest Code

```bash
git pull origin main
```

### 2. Rebuild and Restart

```bash
docker-compose build
docker-compose up -d
```

## Migrating to Another Machine

### 1. Export Data (Optional)

If you need to migrate your data:

```bash
# Create a backup of the database
docker-compose exec db pg_dump -U postgres fait_coop > fait_coop_backup.sql
```

### 2. Transfer Files

Transfer the following files to the new machine:

- The entire project directory
- Your `.env` file
- Any database backups (if applicable)

### 3. Set Up on the New Machine

On the new machine:

```bash
# Navigate to the project directory
cd fait-coop-platform

# Copy your .env file
cp /path/to/your/.env .

# Start the services
docker-compose up -d
```

### 4. Import Data (Optional)

If you have a database backup:

```bash
# Wait for the database to be ready
docker-compose exec db pg_isready -U postgres

# Import the backup
cat fait_coop_backup.sql | docker-compose exec -T db psql -U postgres fait_coop
```

## Production Deployment Considerations

For production deployments, consider the following:

1. **Use Production Mode**: Set `NODE_ENV=production` in your `.env` file.

2. **Use Docker Swarm or Kubernetes**: For high availability and better scaling.

3. **Set Up SSL**: Configure SSL certificates for secure communication.

4. **Configure Backups**: Set up automated database backups.

5. **Monitoring**: Implement monitoring and alerting.

## Troubleshooting

### Services Won't Start

Check the logs for errors:

```bash
docker-compose logs
```

### Database Connection Issues

Ensure the database is running and accessible:

```bash
docker-compose exec api wget --spider --quiet http://db:5432
```

### Container Health Checks

Check the health status of containers:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## Security Best Practices

1. **Never commit your `.env` file** to version control.

2. **Regularly update base images** to get security patches.

3. **Use non-root users** inside containers (already configured).

4. **Limit exposed ports** (only frontend port 3000 is exposed).

5. **Use volume mounts** for persistent data.

## Performance Optimization

1. **Use volume mounts for node_modules** to improve build times.

2. **Enable caching** in the Nginx configuration.

3. **Configure connection pooling** for database connections.

4. **Use Redis** for caching frequently accessed data.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
