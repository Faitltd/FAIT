describe('System Settings', () => {
  beforeEach(() => {
    // Mock admin user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/admin_login_success.json',
    }).as('loginAdmin');

    // Mock system settings list
    cy.intercept('GET', '**/rest/v1/admin/settings', {
      fixture: 'admin/system_settings.json',
    }).as('getSystemSettings');

    // Mock update setting
    cy.intercept('PATCH', '**/rest/v1/admin/settings/*', {
      statusCode: 200,
      body: { success: true }
    }).as('updateSetting');

    // Login as admin and navigate to system settings
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');
    
    cy.visit('/admin/settings');
    cy.wait('@getSystemSettings');
  });

  it('should display the system settings', () => {
    cy.get('[data-testid="system-settings"]').should('be.visible');
    cy.get('[data-testid="settings-group"]').should('have.length.at.least', 1);
    cy.get('[data-testid="setting-item"]').should('have.length.at.least', 1);
  });

  it('should update a boolean setting', () => {
    // Find a boolean setting
    cy.get('[data-testid="setting-item"]').contains('registration_enabled').parent().as('registrationSetting');
    
    // Change the value
    cy.get('@registrationSetting').find('select').select('false');
    
    // Save changes
    cy.get('[data-testid="save-settings-button"]').click();
    cy.wait('@updateSetting');
    
    // Should show success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should update a text setting', () => {
    // Find a text setting
    cy.get('[data-testid="setting-item"]').contains('platform_name').parent().as('platformNameSetting');
    
    // Change the value
    cy.get('@platformNameSetting').find('input[type="text"]').clear().type('Updated Platform Name');
    
    // Save changes
    cy.get('[data-testid="save-settings-button"]').click();
    cy.wait('@updateSetting');
    
    // Should show success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should update a number setting', () => {
    // Find a number setting
    cy.get('[data-testid="setting-item"]').contains('token_reward_amount').parent().as('tokenRewardSetting');
    
    // Change the value
    cy.get('@tokenRewardSetting').find('input[type="number"]').clear().type('50');
    
    // Save changes
    cy.get('[data-testid="save-settings-button"]').click();
    cy.wait('@updateSetting');
    
    // Should show success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should validate number settings', () => {
    // Find a number setting
    cy.get('[data-testid="setting-item"]').contains('token_reward_amount').parent().as('tokenRewardSetting');
    
    // Try to enter invalid value
    cy.get('@tokenRewardSetting').find('input[type="number"]').clear().type('invalid');
    
    // Save changes
    cy.get('[data-testid="save-settings-button"]').click();
    
    // Should show validation error
    cy.get('[data-testid="validation-error"]').should('be.visible');
  });

  it('should update multiple settings at once', () => {
    // Find settings to update
    cy.get('[data-testid="setting-item"]').contains('platform_name').parent().as('platformNameSetting');
    cy.get('[data-testid="setting-item"]').contains('contact_email').parent().as('contactEmailSetting');
    
    // Change values
    cy.get('@platformNameSetting').find('input[type="text"]').clear().type('New Platform Name');
    cy.get('@contactEmailSetting').find('input[type="text"]').clear().type('new@example.com');
    
    // Save changes
    cy.get('[data-testid="save-settings-button"]').click();
    
    // Should make multiple API calls
    cy.wait('@updateSetting');
    cy.wait('@updateSetting');
    
    // Should show success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle API errors when updating settings', () => {
    // Mock API error
    cy.intercept('PATCH', '**/rest/v1/admin/settings/*', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('updateSettingError');
    
    // Find a setting
    cy.get('[data-testid="setting-item"]').contains('platform_name').parent().as('platformNameSetting');
    
    // Change the value
    cy.get('@platformNameSetting').find('input[type="text"]').clear().type('Error Test');
    
    // Save changes
    cy.get('[data-testid="save-settings-button"]').click();
    cy.wait('@updateSettingError');
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should group settings by category', () => {
    // Check that settings are grouped
    cy.get('[data-testid="settings-group"]').should('have.length.at.least', 2);
    
    // Each group should have a title
    cy.get('[data-testid="settings-group-title"]').should('have.length.at.least', 2);
    
    // Each group should contain settings
    cy.get('[data-testid="settings-group"]').each(($group) => {
      cy.wrap($group).find('[data-testid="setting-item"]').should('have.length.at.least', 1);
    });
  });

  it('should show loading state while fetching settings', () => {
    // Reload the page to see loading state
    cy.intercept('GET', '**/rest/v1/admin/settings', (req) => {
      // Delay the response to show loading state
      req.on('response', (res) => {
        res.setDelay(1000);
      });
    }).as('getSettingsDelayed');
    
    cy.visit('/admin/settings');
    
    // Should show loading state
    cy.get('[data-testid="settings-loading"]').should('be.visible');
    
    // Wait for settings to load
    cy.wait('@getSettingsDelayed');
    
    // Loading state should be gone
    cy.get('[data-testid="settings-loading"]').should('not.exist');
    cy.get('[data-testid="system-settings"]').should('be.visible');
  });
});
