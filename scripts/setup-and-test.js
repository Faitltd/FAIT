#!/usr/bin/env node

/**
 * Setup and Test Script
 * 
 * This script sets up the FAIT Co-op platform and runs comprehensive tests.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class PlatformSetup {
  constructor() {
    this.processes = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '🔄'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      this.log(`Running: ${command} ${args.join(' ')}`, 'progress');
      
      const process = spawn(command, args, {
        cwd: rootDir,
        stdio: 'pipe',
        ...options
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });

      this.processes.push(process);
    });
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...', 'progress');

    // Check if Node.js is installed
    try {
      const { stdout } = await this.runCommand('node', ['--version']);
      this.log(`Node.js version: ${stdout.trim()}`, 'success');
    } catch (error) {
      this.log('Node.js is not installed or not in PATH', 'error');
      throw error;
    }

    // Check if npm is installed
    try {
      const { stdout } = await this.runCommand('npm', ['--version']);
      this.log(`npm version: ${stdout.trim()}`, 'success');
    } catch (error) {
      this.log('npm is not installed or not in PATH', 'error');
      throw error;
    }

    // Check if .env file exists
    const envPath = join(rootDir, '.env');
    if (!fs.existsSync(envPath)) {
      this.log('.env file not found, creating from template...', 'warning');
      
      const envExamplePath = join(rootDir, '.env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        this.log('.env file created from template', 'success');
      } else {
        this.log('.env.example file not found', 'error');
        throw new Error('No .env.example file found to create .env from');
      }
    } else {
      this.log('.env file exists', 'success');
    }

    this.log('Prerequisites check completed', 'success');
  }

  async installDependencies() {
    this.log('Installing dependencies...', 'progress');

    try {
      // Check if node_modules exists
      const nodeModulesPath = join(rootDir, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        this.log('node_modules not found, installing...', 'progress');
        await this.runCommand('npm', ['install']);
        this.log('Dependencies installed successfully', 'success');
      } else {
        this.log('node_modules exists, checking if up to date...', 'progress');
        
        // Check if package-lock.json is newer than node_modules
        const packageLockPath = join(rootDir, 'package-lock.json');
        const packageLockStats = fs.statSync(packageLockPath);
        const nodeModulesStats = fs.statSync(nodeModulesPath);
        
        if (packageLockStats.mtime > nodeModulesStats.mtime) {
          this.log('package-lock.json is newer, updating dependencies...', 'progress');
          await this.runCommand('npm', ['ci']);
          this.log('Dependencies updated successfully', 'success');
        } else {
          this.log('Dependencies are up to date', 'success');
        }
      }
    } catch (error) {
      this.log(`Failed to install dependencies: ${error.message}`, 'error');
      throw error;
    }
  }

  async seedDatabase() {
    this.log('Seeding database with sample data...', 'progress');

    try {
      // Check if seed script exists
      const seedScriptPath = join(rootDir, 'scripts', 'seed-database.js');
      if (!fs.existsSync(seedScriptPath)) {
        this.log('Seed script not found, skipping database seeding', 'warning');
        return;
      }

      await this.runCommand('node', ['scripts/seed-database.js']);
      this.log('Database seeded successfully', 'success');
    } catch (error) {
      this.log(`Failed to seed database: ${error.message}`, 'warning');
      // Don't throw here as the app can still work without seed data
    }
  }

  async runTests() {
    this.log('Running application tests...', 'progress');

    try {
      // Check if test script exists
      const testScriptPath = join(rootDir, 'scripts', 'test-application.js');
      if (!fs.existsSync(testScriptPath)) {
        this.log('Test script not found, skipping tests', 'warning');
        return;
      }

      await this.runCommand('node', ['scripts/test-application.js']);
      this.log('Tests completed successfully', 'success');
    } catch (error) {
      this.log(`Tests failed: ${error.message}`, 'error');
      // Don't throw here as we want to continue with the setup
    }
  }

  async buildApplication() {
    this.log('Building application...', 'progress');

    try {
      await this.runCommand('npm', ['run', 'build']);
      this.log('Application built successfully', 'success');
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async startDevServer() {
    this.log('Starting development server...', 'progress');

    return new Promise((resolve, reject) => {
      const devServer = spawn('npm', ['run', 'dev'], {
        cwd: rootDir,
        stdio: 'pipe'
      });

      let serverStarted = false;

      devServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Dev server:', output.trim());
        
        if ((output.includes('Local:') || output.includes('localhost:5173')) && !serverStarted) {
          serverStarted = true;
          this.log('Development server started successfully', 'success');
          this.log('Application is available at: http://localhost:5173', 'info');
          resolve(devServer);
        }
      });

      devServer.stderr.on('data', (data) => {
        console.error('Dev server error:', data.toString());
      });

      devServer.on('error', (error) => {
        this.log(`Failed to start dev server: ${error.message}`, 'error');
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverStarted) {
          devServer.kill();
          reject(new Error('Dev server startup timeout'));
        }
      }, 30000);

      this.processes.push(devServer);
    });
  }

  async cleanup() {
    this.log('Cleaning up processes...', 'progress');
    
    this.processes.forEach(process => {
      if (!process.killed) {
        process.kill();
      }
    });
    
    this.processes = [];
  }

  async run() {
    try {
      this.log('Starting FAIT Co-op Platform Setup', 'info');
      this.log('=====================================', 'info');

      await this.checkPrerequisites();
      await this.installDependencies();
      await this.seedDatabase();
      
      // Run tests in the background while we continue setup
      this.runTests().catch(error => {
        this.log(`Background tests failed: ${error.message}`, 'warning');
      });

      // Build the application
      await this.buildApplication();

      // Start the development server
      const devServer = await this.startDevServer();

      this.log('=====================================', 'info');
      this.log('Setup completed successfully!', 'success');
      this.log('=====================================', 'info');
      this.log('Next steps:', 'info');
      this.log('1. Open http://localhost:5173 in your browser', 'info');
      this.log('2. Register a new account or use test credentials', 'info');
      this.log('3. Explore the service search and booking features', 'info');
      this.log('4. Check the admin dashboard at /dashboard/admin', 'info');
      this.log('=====================================', 'info');
      this.log('Press Ctrl+C to stop the development server', 'info');

      // Keep the process running
      process.on('SIGINT', async () => {
        this.log('Shutting down...', 'info');
        await this.cleanup();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        this.log('Shutting down...', 'info');
        await this.cleanup();
        process.exit(0);
      });

    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new PlatformSetup();
  setup.run();
}

export { PlatformSetup };
