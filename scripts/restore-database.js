#!/usr/bin/env node

/**
 * Database restore script for Supabase
 * 
 * This script restores a backup of the Supabase database using the Supabase CLI.
 * 
 * Usage:
 *   node scripts/restore-database.js <backup-file> [options]
 * 
 * Arguments:
 *   backup-file          Path to the backup file (.sql or .sql.gz)
 * 
 * Options:
 *   --project-id <id>    Supabase project ID (default: from .env)
 *   --verbose            Enable verbose output
 *   --dry-run            Show what would be done without making changes
 *   --force              Skip confirmation prompt
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  backupFile: '',
  projectId: process.env.SUPABASE_PROJECT_ID || '',
  verbose: false,
  dryRun: false,
  force: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--')) {
    if (arg === '--project-id' && i + 1 < args.length) {
      options.projectId = args[++i];
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    }
  } else if (!options.backupFile) {
    options.backupFile = arg;
  }
}

// Validate options
if (!options.backupFile) {
  console.error('Error: Backup file is required.');
  console.error('Usage: node scripts/restore-database.js <backup-file> [options]');
  process.exit(1);
}

if (!options.projectId) {
  console.error('Error: Supabase project ID is required. Provide it via --project-id or SUPABASE_PROJECT_ID environment variable.');
  process.exit(1);
}

if (!fs.existsSync(options.backupFile)) {
  console.error(`Error: Backup file not found: ${options.backupFile}`);
  process.exit(1);
}

// Function to ask for confirmation
async function confirm(message) {
  if (options.force) {
    return true;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(`${message} (y/N) `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Function to decompress gzip file if needed
async function prepareBackupFile(backupFile) {
  if (backupFile.endsWith('.gz')) {
    const decompressedFile = backupFile.slice(0, -3);
    console.log(`Decompressing ${backupFile}...`);
    
    if (options.dryRun) {
      console.log(`[DRY RUN] Would decompress ${backupFile} to ${decompressedFile}`);
      return decompressedFile;
    }
    
    await pipeline(
      fs.createReadStream(backupFile),
      createGunzip(),
      fs.createWriteStream(decompressedFile)
    );
    
    console.log(`Decompressed to ${decompressedFile}`);
    return decompressedFile;
  }
  
  return backupFile;
}

// Main function
async function main() {
  console.log(`Preparing to restore database from ${options.backupFile}`);
  
  if (options.dryRun) {
    console.log('[DRY RUN] No changes will be made');
  }
  
  // Ask for confirmation
  const confirmed = await confirm('WARNING: This will overwrite the current database. Are you sure you want to continue?');
  
  if (!confirmed) {
    console.log('Restore cancelled.');
    process.exit(0);
  }
  
  try {
    // Prepare backup file (decompress if needed)
    const preparedFile = await prepareBackupFile(options.backupFile);
    
    // Run Supabase CLI to restore backup
    const command = `supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres`;
    
    if (options.verbose) {
      console.log(`Executing command: ${command}`);
    }
    
    if (options.dryRun) {
      console.log(`[DRY RUN] Would execute: ${command}`);
      console.log(`[DRY RUN] Would restore from ${preparedFile}`);
    } else {
      console.log('Resetting database...');
      execSync(command, { stdio: options.verbose ? 'inherit' : 'pipe' });
      
      console.log(`Restoring from ${preparedFile}...`);
      execSync(`psql -h localhost -p 54322 -U postgres -d postgres -f ${preparedFile}`, {
        stdio: options.verbose ? 'inherit' : 'pipe'
      });
    }
    
    // Clean up decompressed file if it was created
    if (preparedFile !== options.backupFile && !options.dryRun) {
      fs.unlinkSync(preparedFile);
      console.log(`Cleaned up temporary file: ${preparedFile}`);
    }
    
    console.log('Database restore completed successfully.');
  } catch (error) {
    console.error('Error restoring database:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
