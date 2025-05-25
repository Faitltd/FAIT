/**
 * Console test script for login functionality
 * 
 * To use this script:
 * 1. Open the browser console on the login page
 * 2. Copy and paste this entire script into the console
 * 3. Call the test functions as needed
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
    // Check if we're on the login page
    if (!window.location.pathname.includes('/login')) {
      console.log('Not on login page, navigating...');
      window.location.href = '/login';
      return false;
    }
    
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
    
    console.log('Login form submitted, waiting for redirect...');
    
    // Set up a listener to check for redirect
    return new Promise(resolve => {
      let checkCount = 0;
      const maxChecks = 20; // Check for 10 seconds (20 * 500ms)
      
      const checkInterval = setInterval(() => {
        checkCount++;
        
        // Check if URL has changed
        if (window.location.pathname.includes(dashboardPath)) {
          clearInterval(checkInterval);
          console.log(`Login successful! Redirected to: ${window.location.pathname}`);
          resolve(true);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          console.error(`Login timed out. Current path: ${window.location.pathname}`);
          resolve(false);
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Error testing ${type} login:`, error);
    return false;
  }
}

// Test function for a specific user type
async function testUserLogin(userType) {
  const cred = TEST_CREDENTIALS.find(c => c.type === userType);
  if (!cred) {
    console.error(`Unknown user type: ${userType}`);
    return;
  }
  
  const success = await testLogin(cred.email, cred.password, cred.type, cred.dashboardPath);
  console.log(`Test result for ${cred.type}: ${success ? 'PASS' : 'FAIL'}`);
  return success;
}

// Export functions to global scope
window.testLogin = testLogin;
window.testUserLogin = testUserLogin;
window.TEST_CREDENTIALS = TEST_CREDENTIALS;

console.log('Login test script loaded. Run tests with:');
console.log('- testUserLogin("Admin") - Test admin login');
console.log('- testUserLogin("Client") - Test client login');
console.log('- testUserLogin("Service Agent") - Test service agent login');
