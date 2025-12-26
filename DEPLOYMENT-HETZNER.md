# FAIT Hetzner Cloud Deployment Guide

This guide covers deploying the FAIT application to a Hetzner Cloud VPS server.

## Server Information

- **Server IP:** `65.21.246.15`
- **SSH User:** `root`
- **Repository Path:** `/srv/itsfait.com`
- **Repository URL:** `https://github.com/Faitltd/FAIT.git`
- **Branch:** `main`
- **Application Port:** `3000`

## Prerequisites

1. SSH access to your Hetzner server (verify with `ssh root@65.21.246.15`)
2. Git installed on your local machine
3. SSH key configured for passwordless login (recommended)

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the `deploy-hetzner.sh` script for automated deployment:

```bash
# Make the script executable
chmod +x deploy-hetzner.sh

# Run the script
./deploy-hetzner.sh
```

The script will:
- ✅ Check SSH connection
- ✅ Install Docker and Git on the server (if needed)
- ✅ Clone or update the repository
- ✅ Build the Docker image
- ✅ Stop and remove old containers
- ✅ Start the new container
- ✅ Display deployment status

**Script Options:**
1. Deploy/Update application - Full deployment process
2. View logs - Stream container logs
3. Check status - View current deployment status
4. Exit

### Method 2: Manual Deployment

#### Step 1: Connect to Server

```bash
ssh root@65.21.246.15
```

#### Step 2: Install Dependencies

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Git (if not already installed)
apt-get update
apt-get install -y git
```

#### Step 3: Clone Repository

```bash
# Create directory and clone
mkdir -p /srv/itsfait.com
git clone https://github.com/Faitltd/FAIT.git /srv/itsfait.com
cd /srv/itsfait.com
git checkout main
```

#### Step 4: Configure Environment Variables

Create a `.env` file at `/srv/itsfait.com/.env`:

```bash
nano /srv/itsfait.com/.env
```

Copy contents from `.env.example` and fill in your production values:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Stripe
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key

# JWT
JWT_SECRET=your-jwt-secret

# Other
NODE_ENV=production
```

#### Step 5: Build and Run Docker Container

```bash
# Build the image
cd /srv/itsfait.com
docker build -f docker/frontend/Dockerfile -t fait-frontend:latest .

# Run the container
docker run -d \
    --name fait-frontend \
    -p 3000:3000 \
    --restart unless-stopped \
    --env-file /srv/itsfait.com/.env \
    fait-frontend:latest
```

#### Step 6: Verify Deployment

```bash
# Check container status
docker ps | grep fait-frontend

# View logs
docker logs -f fait-frontend

# Test the application
curl http://localhost:3000
```

## Supabase Migrations

After deploying the application, run the database migrations:

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI on the server
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
cd /srv/itsfait.com
supabase db push
```

### Option 2: Manual Migration

Run these migrations in order via the Supabase dashboard (SQL Editor):

1. **Home Asset Profile** (`supabase/migrations/20250701000000_home_asset_profile.sql`)
2. **RLS Hardening** (`supabase/migrations/20250701000001_home_asset_profile_hardening.sql`)
3. **Maintenance Engine** (`supabase/migrations/20250701000000_maintenance_engine.sql`)

### Option 3: Using apply_migrations.sh

If the `apply_migrations.sh` script exists in your scripts folder:

```bash
cd /srv/itsfait.com
./scripts/apply_migrations.sh
```

### Verify Storage Bucket

Ensure the `asset_documents` storage bucket exists and is configured as private:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset_documents', 'asset_documents', false)
ON CONFLICT (id) DO NOTHING;
```

## Container Management

### View Logs

```bash
# Follow logs in real-time
docker logs -f fait-frontend

# View last 100 lines
docker logs --tail 100 fait-frontend
```

### Restart Container

```bash
docker restart fait-frontend
```

### Stop Container

```bash
docker stop fait-frontend
```

### Remove Container

```bash
docker stop fait-frontend
docker rm fait-frontend
```

### Update Deployment

```bash
# Pull latest changes
cd /srv/itsfait.com
git pull origin main

# Rebuild and restart
docker stop fait-frontend
docker rm fait-frontend
docker rmi fait-frontend:latest
docker build -f docker/frontend/Dockerfile -t fait-frontend:latest .
docker run -d \
    --name fait-frontend \
    -p 3000:3000 \
    --restart unless-stopped \
    --env-file /srv/itsfait.com/.env \
    fait-frontend:latest
```

Or simply run the deployment script again:

```bash
./deploy-hetzner.sh
```

## Setting Up HTTPS with Caddy (Optional but Recommended)

### Install Caddy

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

### Configure Caddy

Edit `/etc/caddy/Caddyfile`:

```
itsfait.com {
    reverse_proxy localhost:3000
}
```

### Start Caddy

```bash
systemctl enable caddy
systemctl start caddy
```

Caddy will automatically obtain and renew SSL certificates from Let's Encrypt.

## Setting Up Cron Job for Maintenance Reminders

Add a cron job to generate maintenance reminders:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 8 AM
0 8 * * * cd /srv/itsfait.com && node scripts/generate-maintenance-reminders.js >> /var/log/fait-reminders.log 2>&1
```

## DNS Configuration

Point your domain to the server:

```
A Record: itsfait.com -> 65.21.246.15
CNAME: www.itsfait.com -> itsfait.com
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs fait-frontend

# Check .env file exists and is valid
cat /srv/itsfait.com/.env

# Verify Docker is running
systemctl status docker
```

### Can't connect to application

```bash
# Check if container is running
docker ps | grep fait-frontend

# Check if port 3000 is accessible
curl http://localhost:3000

# Check firewall rules
ufw status
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a

# Check disk usage
df -h
```

### Database connection errors

```bash
# Verify Supabase credentials in .env
# Check VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY

# Test connection from server
curl https://your-project.supabase.co
```

## Monitoring and Maintenance

### Check Resource Usage

```bash
# CPU and memory usage
docker stats fait-frontend

# Disk usage
docker system df
```

### Regular Updates

```bash
# Pull latest code and redeploy
cd /srv/itsfait.com
git pull origin main
./deploy-hetzner.sh  # Choose option 1
```

### Backup Important Data

```bash
# Backup .env file
cp /srv/itsfait.com/.env /root/backups/env-$(date +%Y%m%d).backup

# Backup Supabase (use Supabase dashboard for automatic backups)
```

## Security Recommendations

1. **Use SSH keys** instead of passwords
2. **Set up a firewall** (UFW):
   ```bash
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```
3. **Keep system updated**:
   ```bash
   apt update && apt upgrade -y
   ```
4. **Use environment variables** for sensitive data (never commit .env to git)
5. **Enable automatic security updates**
6. **Monitor logs** regularly for suspicious activity

## Support

For issues or questions:
- Check GitHub Issues: https://github.com/Faitltd/FAIT/issues
- Review deployment logs: `docker logs fait-frontend`
- Check Supabase dashboard for database errors

## Quick Reference Commands

```bash
# Deployment
./deploy-hetzner.sh

# View logs
docker logs -f fait-frontend

# Restart
docker restart fait-frontend

# SSH to server
ssh root@65.21.246.15

# Update application
cd /srv/itsfait.com && git pull && docker restart fait-frontend

# Check status
docker ps | grep fait-frontend
```
