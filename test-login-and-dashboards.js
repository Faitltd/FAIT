/**
 * Test script to verify login functionality and dashboard access
 * 
 * This script will:
 * 1. Test login with admin, client, and service agent credentials
 * 2. Verify that each user is redirected to the appropriate dashboard
 * 3. Verify that users cannot access dashboards they don't have permission for
 * 
 * Run this script manually to test the login functionality and dashboard access.
 */

// Test credentials
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin', dashboardPath: '/dashboard/admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client', dashboardPath: '/dashboard/client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent', dashboardPath: '/dashboard/service-agent' }
];

// Test login function
async function testLogin(email, password, type, dashboardPath) {
  console.log(`Testing ${type} login: ${email} / ${password}`);
  
  try {
    // Navigate to login page
    window.location.href = '/login';
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill in login form
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.error('Login form elements not found');
      return false;
    }
    
    emailInput.value = email;
    passwordInput.value = password;
    
    // Submit form
    submitButton.click();
    
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if redirected to dashboard
    const currentPath = window.location.pathname;
    const success = currentPath.includes(dashboardPath);
    
    console.log(`Login ${success ? 'successful' : 'failed'}: redirected to ${currentPath}`);
    
    return success;
  } catch (error) {
    console.error(`Error testing ${type} login:`, error);
    return false;
  }
}

// Test dashboard access function
async function testDashboardAccess(dashboardPath, shouldHaveAccess) {
  console.log(`Testing access to ${dashboardPath} (should ${shouldHaveAccess ? 'have' : 'not have'} access)`);
  
  try {
    // Navigate to dashboard
    window.location.href = dashboardPath;
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if access was granted or denied
    const currentPath = window.location.pathname;
    const hasAccess = currentPath === dashboardPath;
    const success = hasAccess === shouldHaveAccess;
    
    console.log(`Access ${success ? 'correctly' : 'incorrectly'} ${hasAccess ? 'granted' : 'denied'}`);
    
    return success;
  } catch (error) {
    console.error(`Error testing access to ${dashboardPath}:`, error);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = {
    login: {},
    access: {}
  };
  
  // Test login for each user type
  for (const cred of TEST_CREDENTIALS) {
    results.login[cred.type] = await testLogin(cred.email, cred.password, cred.type, cred.dashboardPath);
    
    // If login successful, test dashboard access
    if (results.login[cred.type]) {
      results.access[cred.type] = {};
      
      // Test access to all dashboards
      for (const targetCred of TEST_CREDENTIALS) {
        // Should have access to own dashboard, but not others
        const shouldHaveAccess = targetCred.type === cred.type;
        results.access[cred.type][targetCred.type] = await testDashboardAccess(targetCred.dashboardPath, shouldHaveAccess);
      }
      
      // Logout
      const logoutButton = document.querySelector('button:contains("Logout")') || 
                           document.querySelector('a:contains("Logout")') ||
                           document.querySelector('[aria-label="Logout"]');
      
      if (logoutButton) {
        logoutButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.warn('Logout button not found, navigating to login page');
        window.location.href = '/login';
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Print summary
  console.log('\n=== TEST RESULTS ===\n');
  
  console.log('Login Tests:');
  for (const [type, success] of Object.entries(results.login)) {
    console.log(`  ${type}: ${success ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log('\nDashboard Access Tests:');
  for (const [userType, accessResults] of Object.entries(results.access)) {
    console.log(`  ${userType}:`);
    for (const [dashboardType, success] of Object.entries(accessResults)) {
      console.log(`    ${dashboardType} Dashboard: ${success ? '✅ PASS' : '❌ FAIL'}`);
    }
  }
}

// Execute tests when script is loaded in browser console
console.log('Login and Dashboard Access Test Script loaded');
console.log('Run tests by calling runTests() in the browser console');
