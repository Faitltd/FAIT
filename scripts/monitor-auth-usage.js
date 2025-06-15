#!/usr/bin/env node

/**
 * Auth Usage Monitor
 * 
 * This script helps monitor authentication usage patterns to identify
 * potential cost optimization opportunities.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOG_FILE = path.join(__dirname, '../logs/auth-usage.log');
const REPORT_FILE = path.join(__dirname, '../logs/auth-usage-report.json');

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Usage tracking
let usageStats = {
  sessionRefreshes: 0,
  mfaAttempts: 0,
  signInAttempts: 0,
  signUpAttempts: 0,
  oauthAttempts: 0,
  errors: 0,
  startTime: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
};

// Load existing stats if available
if (fs.existsSync(REPORT_FILE)) {
  try {
    const existingStats = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
    usageStats = { ...usageStats, ...existingStats };
  } catch (error) {
    console.warn('Could not load existing usage stats:', error.message);
  }
}

/**
 * Log auth event
 */
function logAuthEvent(eventType, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    details
  };

  // Append to log file
  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(LOG_FILE, logLine);

  // Update stats
  switch (eventType) {
    case 'session_refresh':
      usageStats.sessionRefreshes++;
      break;
    case 'mfa_attempt':
      usageStats.mfaAttempts++;
      break;
    case 'sign_in':
      usageStats.signInAttempts++;
      break;
    case 'sign_up':
      usageStats.signUpAttempts++;
      break;
    case 'oauth':
      usageStats.oauthAttempts++;
      break;
    case 'error':
      usageStats.errors++;
      break;
  }

  usageStats.lastUpdated = timestamp;

  // Save updated stats
  fs.writeFileSync(REPORT_FILE, JSON.stringify(usageStats, null, 2));

  console.log(`[Auth Monitor] ${eventType}:`, details);
}

/**
 * Generate usage report
 */
function generateReport() {
  const now = new Date();
  const startTime = new Date(usageStats.startTime);
  const durationHours = (now - startTime) / (1000 * 60 * 60);

  const report = {
    ...usageStats,
    durationHours: Math.round(durationHours * 100) / 100,
    averageRefreshesPerHour: Math.round((usageStats.sessionRefreshes / durationHours) * 100) / 100,
    totalApiCalls: usageStats.sessionRefreshes + usageStats.mfaAttempts + 
                   usageStats.signInAttempts + usageStats.signUpAttempts + 
                   usageStats.oauthAttempts,
    errorRate: usageStats.errors / (usageStats.sessionRefreshes + usageStats.mfaAttempts + 
                                   usageStats.signInAttempts + usageStats.signUpAttempts + 
                                   usageStats.oauthAttempts + usageStats.errors) * 100
  };

  console.log('\n=== Auth Usage Report ===');
  console.log(`Duration: ${report.durationHours} hours`);
  console.log(`Total API Calls: ${report.totalApiCalls}`);
  console.log(`Session Refreshes: ${report.sessionRefreshes} (${report.averageRefreshesPerHour}/hour)`);
  console.log(`MFA Attempts: ${report.mfaAttempts}`);
  console.log(`Sign In Attempts: ${report.signInAttempts}`);
  console.log(`Sign Up Attempts: ${report.signUpAttempts}`);
  console.log(`OAuth Attempts: ${report.oauthAttempts}`);
  console.log(`Errors: ${report.errors} (${Math.round(report.errorRate * 100) / 100}%)`);
  console.log('========================\n');

  return report;
}

/**
 * Reset stats
 */
function resetStats() {
  usageStats = {
    sessionRefreshes: 0,
    mfaAttempts: 0,
    signInAttempts: 0,
    signUpAttempts: 0,
    oauthAttempts: 0,
    errors: 0,
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(usageStats, null, 2));
  console.log('Usage stats reset.');
}

/**
 * Check for high usage patterns
 */
function checkForHighUsage() {
  const report = generateReport();
  
  // Alert thresholds
  const HIGH_REFRESH_RATE = 10; // per hour
  const HIGH_ERROR_RATE = 5; // percentage
  
  if (report.averageRefreshesPerHour > HIGH_REFRESH_RATE) {
    console.warn(`⚠️  HIGH USAGE ALERT: ${report.averageRefreshesPerHour} session refreshes per hour (threshold: ${HIGH_REFRESH_RATE})`);
  }
  
  if (report.errorRate > HIGH_ERROR_RATE) {
    console.warn(`⚠️  HIGH ERROR RATE: ${Math.round(report.errorRate * 100) / 100}% (threshold: ${HIGH_ERROR_RATE}%)`);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'log':
    const eventType = process.argv[3];
    const details = process.argv[4] ? JSON.parse(process.argv[4]) : {};
    logAuthEvent(eventType, details);
    break;
    
  case 'report':
    generateReport();
    break;
    
  case 'check':
    checkForHighUsage();
    break;
    
  case 'reset':
    resetStats();
    break;
    
  default:
    console.log('Usage:');
    console.log('  node monitor-auth-usage.js log <eventType> [details]');
    console.log('  node monitor-auth-usage.js report');
    console.log('  node monitor-auth-usage.js check');
    console.log('  node monitor-auth-usage.js reset');
    console.log('');
    console.log('Event types: session_refresh, mfa_attempt, sign_in, sign_up, oauth, error');
    break;
}

// Export for use in other modules
module.exports = {
  logAuthEvent,
  generateReport,
  resetStats,
  checkForHighUsage
};
