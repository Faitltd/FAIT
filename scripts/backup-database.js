#!/usr/bin/env node

/**
 * Database backup script for Supabase
 * 
 * This script creates a backup of the Supabase database using the Supabase CLI.
 * It can be run manually or scheduled as a cron job.
 * 
 * Usage:
 *   node scripts/backup-database.js [options]
 * 
 * Options:
 *   --output-dir <dir>   Directory to store backups (default: ./backups)
 *   --retention <days>   Number of days to keep backups (default: 30)
 *   --project-id <id>    Supabase project ID (default: from .env)
 *   --verbose            Enable verbose output
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  outputDir: './backups',
  retention: 30,
  projectId: process.env.SUPABASE_PROJECT_ID || '',
  verbose: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--output-dir' && i + 1 < args.length) {
    options.outputDir = args[++i];
  } else if (arg === '--retention' && i + 1 < args.length) {
    options.retention = parseInt(args[++i], 10);
  } else if (arg === '--project-id' && i + 1 < args.length) {
    options.projectId = args[++i];
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
}

// Validate options
if (!options.projectId) {
  console.error('Error: Supabase project ID is required. Provide it via --project-id or SUPABASE_PROJECT_ID environment variable.');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(options.outputDir)) {
  fs.mkdirSync(options.outputDir, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `supabase-backup-${timestamp}.sql`;
const backupPath = path.join(options.outputDir, backupFilename);

// Log start
console.log(`Starting database backup to ${backupPath}`);

try {
  // Run Supabase CLI to create backup
  const command = `supabase db dump -f ${backupPath} --db-url postgresql://postgres:postgres@localhost:54322/postgres`;
  
  if (options.verbose) {
    console.log(`Executing command: ${command}`);
  }
  
  execSync(command, { stdio: options.verbose ? 'inherit' : 'pipe' });
  
  // Compress the backup
  console.log('Compressing backup...');
  execSync(`gzip ${backupPath}`, { stdio: options.verbose ? 'inherit' : 'pipe' });
  
  console.log(`Backup created successfully: ${backupPath}.gz`);
  
  // Clean up old backups
  if (options.retention > 0) {
    console.log(`Cleaning up backups older than ${options.retention} days...`);
    
    const files = fs.readdirSync(options.outputDir);
    const now = Date.now();
    
    for (const file of files) {
      if (file.startsWith('supabase-backup-') && file.endsWith('.sql.gz')) {
        const filePath = path.join(options.outputDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (fileAge > options.retention) {
          if (options.verbose) {
            console.log(`Deleting old backup: ${file} (${Math.floor(fileAge)} days old)`);
          }
          fs.unlinkSync(filePath);
        }
      }
    }
  }
  
  console.log('Backup process completed successfully.');
} catch (error) {
  console.error('Error creating database backup:');
  console.error(error.message);
  process.exit(1);
}
