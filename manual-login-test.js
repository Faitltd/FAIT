/**
 * Manual test script for login functionality
 * 
 * This script can be pasted into the browser console to test login functionality.
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill in login form
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.error('Login form elements not found');
      return false;
    }
    
    // Clear and fill inputs
    emailInput.value = '';
    passwordInput.value = '';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    emailInput.value = email;
    passwordInput.value = password;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Submit form
    submitButton.click();
    
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 5000));
    
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

// Run test for a specific user type
async function runTest(userType) {
  const cred = TEST_CREDENTIALS.find(c => c.type === userType);
  if (!cred) {
    console.error(`Unknown user type: ${userType}`);
    return;
  }
  
  const success = await testLogin(cred.email, cred.password, cred.type, cred.dashboardPath);
  console.log(`Test result for ${cred.type}: ${success ? 'PASS' : 'FAIL'}`);
}

// Run all tests
async function runAllTests() {
  const results = {};
  
  for (const cred of TEST_CREDENTIALS) {
    results[cred.type] = await testLogin(cred.email, cred.password, cred.type, cred.dashboardPath);
    
    // Wait before testing next credential
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n=== TEST RESULTS ===\n');
  for (const [type, success] of Object.entries(results)) {
    console.log(`${type}: ${success ? '✅ PASS' : '❌ FAIL'}`);
  }
}

// Export functions to global scope
window.testLogin = testLogin;
window.runTest = runTest;
window.runAllTests = runAllTests;

console.log('Login test script loaded. Run tests with:');
console.log('- runTest("Admin") - Test admin login');
console.log('- runTest("Client") - Test client login');
console.log('- runTest("Service Agent") - Test service agent login');
console.log('- runAllTests() - Test all logins');
