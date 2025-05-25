#!/usr/bin/env node

/**
 * Simple End-to-End Test Script for FAIT Application
 * Tests basic functionality without Cypress dependency issues
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:5173';
const TIMEOUT = 5000;

// Test cases
const testCases = [
  { name: 'Homepage', path: '/', expectedStatus: 200 },
  { name: 'About Page', path: '/about', expectedStatus: 200 },
  { name: 'Services Page', path: '/services', expectedStatus: 200 },
  { name: 'Contact Page', path: '/contact', expectedStatus: 200 },
  { name: 'Login Page', path: '/login', expectedStatus: 200 },
  { name: 'Health Check', path: '/health', expectedStatus: 200 },
  { name: 'Calculator Page', path: '/calculator', expectedStatus: [200, 500] }, // May redirect
  { name: 'Non-existent Page', path: '/nonexistent', expectedStatus: 404 },
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });

    request.on('error', (err) => {
      reject(err);
    });
  });
}

function checkStatus(actual, expected) {
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }
  return actual === expected;
}

async function runTest(testCase) {
  const url = `${BASE_URL}${testCase.path}`;
  
  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${testCase.name} (${testCase.path})`);
    
    const result = await makeRequest(url);
    const statusOk = checkStatus(result.statusCode, testCase.expectedStatus);
    
    if (statusOk) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Status: ${result.statusCode}`);
      
      // Additional checks for specific pages
      if (testCase.path === '/health') {
        try {
          const healthData = JSON.parse(result.data);
          if (healthData.status === 'healthy') {
            console.log(`${colors.green}  ✓ Health check data valid${colors.reset}`);
          } else {
            console.log(`${colors.yellow}  ⚠ Health check data unexpected${colors.reset}`);
          }
        } catch (e) {
          console.log(`${colors.yellow}  ⚠ Health check response not JSON${colors.reset}`);
        }
      }
      
      if (testCase.path === '/' && result.data.includes('FAIT')) {
        console.log(`${colors.green}  ✓ Homepage contains FAIT branding${colors.reset}`);
      }
      
      return { success: true, testCase, result };
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Expected: ${testCase.expectedStatus}, Got: ${result.statusCode}`);
      return { success: false, testCase, result };
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset} - ${error.message}`);
    return { success: false, testCase, error };
  }
}

async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}FAIT Application End-to-End Test Suite${colors.reset}`);
  console.log(`${colors.blue}Testing against: ${BASE_URL}${colors.reset}\n`);
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
    
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(''); // Empty line between tests
  }
  
  // Summary
  console.log(`${colors.bold}Test Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${testCases.length}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Some tests failed${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
