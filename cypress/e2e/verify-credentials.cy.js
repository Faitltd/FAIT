/// <reference types="cypress" />

describe('Verify Login Credentials', () => {
  const testCredentials = [
    { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
    { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
    { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
  ];

  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit login page
    cy.visit('/login');
    
    // Enable local auth
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
  });

  testCredentials.forEach((cred) => {
    it(`should verify ${cred.type} credentials work`, () => {
      // Enter credentials
      cy.get('input[type="email"]').clear().type(cred.email);
      cy.get('input[type="password"]').clear().type(cred.password);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for login process
      cy.wait(2000);
      
      // Check if login was successful by verifying localStorage
      cy.window().then(win => {
        // Check for userType and userEmail in localStorage
        const userEmail = win.localStorage.getItem('userEmail');
        const userType = win.localStorage.getItem('userType');
        
        // Log what we found
        cy.log(`User email in localStorage: ${userEmail}`);
        cy.log(`User type in localStorage: ${userType}`);
        
        // Verify credentials worked
        expect(userEmail).to.equal(cred.email);
        
        // Verify correct user type
        if (cred.type === 'Admin') {
          expect(userType).to.equal('admin');
        } else if (cred.type === 'Client') {
          expect(userType).to.equal('client');
        } else if (cred.type === 'Service Agent') {
          expect(userType).to.equal('service_agent');
        }
      });
    });
  });
});
