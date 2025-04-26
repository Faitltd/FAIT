/// <reference types="cypress" />

describe('Client Payments and Billing', () => {
  // Test user credentials
  const testUser = {
    email: 'test-payment-client@example.com',
    password: 'TestPassword123!'
  };

  beforeEach(() => {
    // Log in before each test
    cy.session(testUser.email, () => {
      cy.visit('/login');
      cy.get('[data-cy=login-email]').type(testUser.email);
      cy.get('[data-cy=login-password]').type(testUser.password);
      cy.get('[data-cy=login-submit]').click();
      cy.url().should('include', '/dashboard');
    }, {
      validate: () => {
        // Set a flag to indicate the user is logged in
        Cypress.env('userLoggedIn', true);
      }
    });
  });

  it('should navigate to the billing section', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=billing-settings]').click();

    // Should be on billing page
    cy.url().should('include', '/billing');
    cy.contains('Billing & Payments').should('be.visible');
  });

  it('should add a payment method', () => {
    cy.visit('/billing');
    cy.get('[data-cy=add-payment-method]').click();

    // Add credit card
    cy.get('[data-cy=payment-method-type]').select('Credit Card');
    cy.get('[data-cy=card-holder-name]').type('Test Client');
    cy.get('[data-cy=card-number]').type('4242424242424242');
    cy.get('[data-cy=card-expiry]').type('12/25');
    cy.get('[data-cy=card-cvc]').type('123');
    cy.get('[data-cy=billing-address-line1]').type('123 Main St');
    cy.get('[data-cy=billing-city]').type('Denver');
    cy.get('[data-cy=billing-state]').select('Colorado');
    cy.get('[data-cy=billing-zip]').type('80202');
    cy.get('[data-cy=billing-country]').select('United States');

    // Save payment method
    cy.get('[data-cy=save-payment-method]').click();

    // Confirmation
    cy.contains('Payment method added successfully').should('be.visible');

    // Card should be in the list
    cy.get('[data-cy=payment-methods]').contains('Visa ending in 4242').should('be.visible');
  });

  it('should set a default payment method', () => {
    cy.visit('/billing');

    // Add another payment method
    cy.get('[data-cy=add-payment-method]').click();
    cy.get('[data-cy=payment-method-type]').select('Credit Card');
    cy.get('[data-cy=card-holder-name]').type('Test Client');
    cy.get('[data-cy=card-number]').type('5555555555554444');
    cy.get('[data-cy=card-expiry]').type('12/25');
    cy.get('[data-cy=card-cvc]').type('123');
    cy.get('[data-cy=billing-address-line1]').type('123 Main St');
    cy.get('[data-cy=billing-city]').type('Denver');
    cy.get('[data-cy=billing-state]').select('Colorado');
    cy.get('[data-cy=billing-zip]').type('80202');
    cy.get('[data-cy=billing-country]').select('United States');
    cy.get('[data-cy=save-payment-method]').click();

    // Both cards should be in the list
    cy.get('[data-cy=payment-methods]').contains('Visa ending in 4242').should('be.visible');
    cy.get('[data-cy=payment-methods]').contains('Mastercard ending in 4444').should('be.visible');

    // Set Mastercard as default
    cy.get('[data-cy=payment-methods]').contains('Mastercard ending in 4444').parent().find('[data-cy=payment-options]').click();
    cy.get('[data-cy=set-default]').click();

    // Confirmation
    cy.contains('Default payment method updated').should('be.visible');

    // Mastercard should be marked as default
    cy.get('[data-cy=payment-methods]').contains('Mastercard ending in 4444').parent().find('[data-cy=default-indicator]').should('be.visible');
  });

  it('should delete a payment method', () => {
    cy.visit('/billing');

    // Delete Visa card
    cy.get('[data-cy=payment-methods]').contains('Visa ending in 4242').parent().find('[data-cy=payment-options]').click();
    cy.get('[data-cy=delete-payment-method]').click();
    cy.get('[data-cy=confirm-delete]').click();

    // Confirmation
    cy.contains('Payment method deleted').should('be.visible');

    // Only Mastercard should remain
    cy.get('[data-cy=payment-methods]').contains('Mastercard ending in 4444').should('be.visible');
    cy.get('[data-cy=payment-methods]').contains('Visa ending in 4242').should('not.exist');
  });

  it('should view payment history', () => {
    cy.visit('/billing');
    cy.get('[data-cy=payment-history]').click();

    // Simulate payment history
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:payment-history', {
        detail: {
          payments: [
            {
              id: '1',
              date: '2023-12-01',
              amount: 2500,
              description: 'Initial payment for Kitchen Renovation',
              status: 'completed',
              paymentMethod: 'Mastercard ending in 4444'
            },
            {
              id: '2',
              date: '2023-11-15',
              amount: 1800,
              description: 'Plumbing consultation',
              status: 'completed',
              paymentMethod: 'Visa ending in 4242'
            }
          ]
        }
      }));
    });

    // Refresh to see payment history
    cy.reload();

    // Payment history should be visible
    cy.get('[data-cy=payment-list]').should('be.visible');
    cy.get('[data-cy=payment-list]').contains('Kitchen Renovation').should('be.visible');
    cy.get('[data-cy=payment-list]').contains('Plumbing consultation').should('be.visible');

    // View payment details
    cy.get('[data-cy=payment-list]').contains('Kitchen Renovation').click();

    // Payment details should be visible
    cy.get('[data-cy=payment-details]').should('be.visible');
    cy.get('[data-cy=payment-amount]').should('contain', '$2,500.00');
    cy.get('[data-cy=payment-date]').should('contain', 'December 1, 2023');
    cy.get('[data-cy=payment-method]').should('contain', 'Mastercard ending in 4444');
    cy.get('[data-cy=payment-status]').should('contain', 'Completed');

    // Download receipt
    cy.get('[data-cy=download-receipt]').click();

    // Close details
    cy.get('[data-cy=close-details]').click();
  });

  it('should handle a pending payment', () => {
    cy.visit('/dashboard');

    // Simulate pending payment notification
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:pending-payment', {
        detail: {
          paymentId: '3',
          projectId: '123',
          projectName: 'Bathroom Remodel',
          amount: 3500,
          description: 'Final payment for Bathroom Remodel',
          dueDate: '2023-12-15'
        }
      }));
    });

    // Notification should be visible
    cy.get('[data-cy=notification-badge]').should('be.visible');
    cy.get('[data-cy=notifications]').click();
    cy.contains('Payment due').click();

    // Payment details should be visible
    cy.url().should('include', '/payments/');
    cy.get('[data-cy=payment-details]').should('be.visible');
    cy.get('[data-cy=payment-amount]').should('contain', '$3,500.00');
    cy.get('[data-cy=payment-due-date]').should('contain', 'December 15, 2023');

    // Make payment
    cy.get('[data-cy=make-payment]').click();

    // Payment method should be pre-selected to default
    cy.get('[data-cy=payment-method-select]').should('contain', 'Mastercard ending in 4444');

    // Confirm payment
    cy.get('[data-cy=confirm-payment]').click();

    // Enter CVC for verification
    cy.get('[data-cy=verify-cvc]').type('123');
    cy.get('[data-cy=complete-payment]').click();

    // Confirmation
    cy.contains('Payment successful').should('be.visible');
    cy.get('[data-cy=payment-status]').should('contain', 'Paid');
    cy.get('[data-cy=payment-date]').should('contain', new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  });

  it('should set up automatic payments', () => {
    cy.visit('/billing');
    cy.get('[data-cy=payment-settings]').click();

    // Enable automatic payments
    cy.get('[data-cy=auto-payments]').check();
    cy.get('[data-cy=auto-payment-method]').select('Mastercard ending in 4444');
    cy.get('[data-cy=auto-payment-threshold]').select('Any amount');

    // Save settings
    cy.get('[data-cy=save-payment-settings]').click();

    // Confirmation
    cy.contains('Payment settings updated').should('be.visible');
    cy.get('[data-cy=auto-payments-status]').should('contain', 'Enabled');
  });

  it('should generate and view invoices', () => {
    cy.visit('/billing');
    cy.get('[data-cy=invoices]').click();

    // Simulate invoices
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:invoices', {
        detail: {
          invoices: [
            {
              id: '1',
              date: '2023-12-05',
              dueDate: '2023-12-20',
              amount: 3500,
              description: 'Bathroom Remodel - Final Payment',
              status: 'paid',
              projectId: '123'
            },
            {
              id: '2',
              date: '2023-12-01',
              dueDate: '2023-12-15',
              amount: 2500,
              description: 'Kitchen Renovation - Progress Payment',
              status: 'paid',
              projectId: '456'
            }
          ]
        }
      }));
    });

    // Refresh to see invoices
    cy.reload();

    // Invoices should be visible
    cy.get('[data-cy=invoice-list]').should('be.visible');
    cy.get('[data-cy=invoice-list]').contains('Bathroom Remodel').should('be.visible');
    cy.get('[data-cy=invoice-list]').contains('Kitchen Renovation').should('be.visible');

    // View invoice details
    cy.get('[data-cy=invoice-list]').contains('Bathroom Remodel').click();

    // Invoice details should be visible
    cy.get('[data-cy=invoice-details]').should('be.visible');
    cy.get('[data-cy=invoice-amount]').should('contain', '$3,500.00');
    cy.get('[data-cy=invoice-date]').should('contain', 'December 5, 2023');
    cy.get('[data-cy=invoice-due-date]').should('contain', 'December 20, 2023');
    cy.get('[data-cy=invoice-status]').should('contain', 'Paid');

    // Download invoice
    cy.get('[data-cy=download-invoice]').click();

    // Close details
    cy.get('[data-cy=close-invoice]').click();
  });

  it('should dispute a charge', () => {
    cy.visit('/billing');
    cy.get('[data-cy=payment-history]').click();

    // Find payment to dispute
    cy.get('[data-cy=payment-list]').contains('Plumbing consultation').parent().find('[data-cy=payment-options]').click();
    cy.get('[data-cy=dispute-payment]').click();

    // Fill out dispute form
    cy.get('[data-cy=dispute-reason]').select('Service not as described');
    cy.get('[data-cy=dispute-description]').type('The consultation did not cover all the topics that were promised.');
    cy.get('[data-cy=dispute-evidence]').attachFile('consultation-agreement.pdf');

    // Submit dispute
    cy.get('[data-cy=submit-dispute]').click();

    // Confirmation
    cy.contains('Dispute submitted successfully').should('be.visible');

    // Payment should be marked as disputed
    cy.get('[data-cy=payment-list]').contains('Plumbing consultation').parent().find('[data-cy=payment-status]').should('contain', 'Disputed');
  });

  it('should update billing information', () => {
    cy.visit('/billing');
    cy.get('[data-cy=billing-info]').click();

    // Update billing information
    cy.get('[data-cy=billing-name]').clear().type('Test Client Updated');
    cy.get('[data-cy=billing-email]').should('have.value', testUser.email);
    cy.get('[data-cy=billing-phone]').clear().type('555-987-6543');
    cy.get('[data-cy=billing-address-line1]').clear().type('456 Oak Avenue');
    cy.get('[data-cy=billing-address-line2]').clear().type('Suite 200');
    cy.get('[data-cy=billing-city]').clear().type('Denver');
    cy.get('[data-cy=billing-state]').select('Colorado');
    cy.get('[data-cy=billing-zip]').clear().type('80203');
    cy.get('[data-cy=billing-country]').select('United States');

    // Save billing information
    cy.get('[data-cy=save-billing-info]').click();

    // Confirmation
    cy.contains('Billing information updated successfully').should('be.visible');

    // Updated information should be visible
    cy.get('[data-cy=billing-name]').should('have.value', 'Test Client Updated');
    cy.get('[data-cy=billing-address-line1]').should('have.value', '456 Oak Avenue');
  });

  it('should export payment data', () => {
    cy.visit('/billing');
    cy.get('[data-cy=payment-history]').click();

    // Export payment data
    cy.get('[data-cy=export-payments]').click();

    // Select export options
    cy.get('[data-cy=export-format]').select('CSV');
    cy.get('[data-cy=export-date-range]').select('This year');
    cy.get('[data-cy=export-include-details]').check();

    // Confirm export
    cy.get('[data-cy=confirm-export]').click();

    // Confirmation
    cy.contains('Payment data exported successfully').should('be.visible');
  });
});
