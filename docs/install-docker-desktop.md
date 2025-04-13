# Installing Docker Desktop for Supabase Local Development

This guide will help you install Docker Desktop, which is required for running Supabase locally.

## For macOS

1. **Download Docker Desktop**:
   - Go to [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - Click "Download for Mac"
   - Choose the appropriate version for your Mac (Intel chip or Apple chip)

2. **Install Docker Desktop**:
   - Open the downloaded `.dmg` file
   - Drag Docker to your Applications folder
   - Open Docker from your Applications folder

3. **Start Docker Desktop**:
   - Docker Desktop will start automatically
   - You'll see the Docker icon in the menu bar when it's running

4. **Verify Installation**:
   - Open Terminal
   - Run `docker --version` to verify Docker is installed
   - Run `docker ps` to verify Docker daemon is running

## For Windows

1. **Download Docker Desktop**:
   - Go to [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Click "Download for Windows"

2. **Install Docker Desktop**:
   - Run the downloaded installer
   - Follow the installation wizard
   - Enable WSL 2 if prompted (recommended)

3. **Start Docker Desktop**:
   - Docker Desktop will start automatically after installation
   - You'll see the Docker icon in the system tray when it's running

4. **Verify Installation**:
   - Open Command Prompt or PowerShell
   - Run `docker --version` to verify Docker is installed
   - Run `docker ps` to verify Docker daemon is running

## For Linux

Docker Desktop is available for Ubuntu, Debian, and Fedora:

1. **Download Docker Desktop**:
   - Go to [Docker Desktop for Linux](https://www.docker.com/products/docker-desktop)
   - Click "Download for Linux"
   - Choose your distribution

2. **Install Docker Desktop**:
   - Follow the installation instructions for your distribution
   - Typically involves running a `.deb` or `.rpm` package

3. **Start Docker Desktop**:
   - Run `systemctl --user start docker-desktop`
   - Or find Docker Desktop in your applications menu

4. **Verify Installation**:
   - Open Terminal
   - Run `docker --version` to verify Docker is installed
   - Run `docker ps` to verify Docker daemon is running

## After Installing Docker Desktop

Once Docker Desktop is installed and running:

1. **Restart Supabase**:
   ```bash
   supabase stop
   supabase start
   ```

2. **Apply Database Fixes**:
   ```bash
   ./scripts/fix-supabase-auth.sh
   ```

3. **Try Logging In Again**:
   - Go to http://localhost:5173/login
   - Try logging in with your credentials

## Troubleshooting

If you encounter issues with Docker Desktop:

1. **Check System Requirements**:
   - macOS: macOS 10.15 or newer
   - Windows: Windows 10 64-bit or newer with WSL 2
   - Linux: Ubuntu 18.04+, Debian 10+, or Fedora 32+

2. **Restart Your Computer**:
   - Sometimes a restart is needed after installation

3. **Check Docker Settings**:
   - Open Docker Desktop
   - Go to Settings/Preferences
   - Ensure you have enough resources allocated (CPU, Memory)

4. **Docker Desktop Alternatives**:
   - If you can't install Docker Desktop, consider using [Colima](https://github.com/abiosoft/colima) (macOS/Linux)
   - Or use Docker Engine directly on Linux
