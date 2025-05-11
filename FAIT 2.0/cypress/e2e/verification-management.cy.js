describe('Verification Management', () => {
  beforeEach(() => {
    // Mock admin user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/admin_login_success.json',
    }).as('loginAdmin');

    // Mock verification requests list
    cy.intercept('GET', '**/rest/v1/admin/verifications*', {
      fixture: 'admin/verifications.json',
    }).as('getVerifications');

    // Mock verification details
    cy.intercept('GET', '**/rest/v1/admin/verifications/*', {
      fixture: 'admin/verification_detail.json',
    }).as('getVerificationDetail');

    // Mock approve verification
    cy.intercept('POST', '**/rest/v1/admin/verifications/*/approve', {
      statusCode: 200,
      body: { success: true }
    }).as('approveVerification');

    // Mock reject verification
    cy.intercept('POST', '**/rest/v1/admin/verifications/*/reject', {
      statusCode: 200,
      body: { success: true }
    }).as('rejectVerification');

    // Login as admin and navigate to verification management
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');
    
    cy.visit('/admin/verifications');
    cy.wait('@getVerifications');
  });

  it('should display the list of verification requests', () => {
    cy.get('[data-testid="verification-management"]').should('be.visible');
    cy.get('[data-testid="verification-table"]').should('be.visible');
    cy.get('[data-testid="verification-row"]').should('have.length.at.least', 1);
  });

  it('should filter verification requests by status', () => {
    // Mock filtered results
    cy.intercept('GET', '**/rest/v1/admin/verifications*', {
      fixture: 'admin/pending_verifications.json',
    }).as('filterVerifications');
    
    cy.get('[data-testid="status-filter"]').select('pending');
    cy.wait('@filterVerifications');
    
    cy.get('[data-testid="verification-row"]').each(($el) => {
      cy.wrap($el).find('[data-testid="verification-status"]').should('contain', 'pending');
    });
  });

  it('should view verification details', () => {
    // Click view on the first verification
    cy.get('[data-testid="verification-row"]').first().find('[data-testid="view-verification-button"]').click();
    cy.wait('@getVerificationDetail');
    
    // Verification detail modal should appear
    cy.get('[data-testid="verification-detail-modal"]').should('be.visible');
    
    // Should display verification information
    cy.get('[data-testid="verification-user-info"]').should('be.visible');
    cy.get('[data-testid="verification-documents"]').should('be.visible');
    
    // Close the modal
    cy.get('[data-testid="close-modal-button"]').click();
    cy.get('[data-testid="verification-detail-modal"]').should('not.exist');
  });

  it('should approve a verification request', () => {
    // Click view on the first verification
    cy.get('[data-testid="verification-row"]').first().find('[data-testid="view-verification-button"]').click();
    cy.wait('@getVerificationDetail');
    
    // Verification detail modal should appear
    cy.get('[data-testid="verification-detail-modal"]').should('be.visible');
    
    // Click approve button
    cy.get('[data-testid="approve-verification-button"]').click();
    
    // Confirmation dialog should appear
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    cy.get('[data-testid="confirm-button"]').click();
    
    cy.wait('@approveVerification');
    
    // Modal should close
    cy.get('[data-testid="verification-detail-modal"]').should('not.exist');
    
    // Verification list should refresh
    cy.wait('@getVerifications');
  });

  it('should reject a verification request', () => {
    // Click view on the first verification
    cy.get('[data-testid="verification-row"]').first().find('[data-testid="view-verification-button"]').click();
    cy.wait('@getVerificationDetail');
    
    // Verification detail modal should appear
    cy.get('[data-testid="verification-detail-modal"]').should('be.visible');
    
    // Click reject button
    cy.get('[data-testid="reject-verification-button"]').click();
    
    // Rejection dialog should appear
    cy.get('[data-testid="rejection-dialog"]').should('be.visible');
    
    // Enter rejection reason
    cy.get('[data-testid="rejection-reason"]').type('Documents are not clear');
    
    // Confirm rejection
    cy.get('[data-testid="confirm-rejection-button"]').click();
    
    cy.wait('@rejectVerification');
    
    // Modal should close
    cy.get('[data-testid="verification-detail-modal"]').should('not.exist');
    
    // Verification list should refresh
    cy.wait('@getVerifications');
  });

  it('should view verification documents', () => {
    // Mock document viewer
    cy.intercept('GET', '**/storage/v1/object/public/verification_documents/*', {
      fixture: 'admin/document_image.jpg',
    }).as('getDocument');
    
    // Click view on the first verification
    cy.get('[data-testid="verification-row"]').first().find('[data-testid="view-verification-button"]').click();
    cy.wait('@getVerificationDetail');
    
    // Click on a document
    cy.get('[data-testid="document-item"]').first().click();
    
    // Document viewer should appear
    cy.get('[data-testid="document-viewer"]').should('be.visible');
    cy.get('[data-testid="document-image"]').should('be.visible');
    
    // Close document viewer
    cy.get('[data-testid="close-document-viewer"]').click();
    cy.get('[data-testid="document-viewer"]').should('not.exist');
  });

  it('should paginate through verification requests', () => {
    // Mock second page of verifications
    cy.intercept('GET', '**/rest/v1/admin/verifications*', {
      fixture: 'admin/verifications_page2.json',
    }).as('getVerificationsPage2');
    
    // Check that pagination exists
    cy.get('[data-testid="pagination"]').should('be.visible');
    
    // Go to next page
    cy.get('[data-testid="next-page"]').click();
    cy.wait('@getVerificationsPage2');
    
    // Should show different verifications
    cy.get('[data-testid="verification-row"]').should('have.length.at.least', 1);
    
    // Go back to first page
    cy.get('[data-testid="prev-page"]').click();
    cy.wait('@getVerifications');
  });

  it('should show empty state when no verification requests match filters', () => {
    // Mock empty verifications list
    cy.intercept('GET', '**/rest/v1/admin/verifications*', {
      body: { verifications: [], total: 0 }
    }).as('getEmptyVerifications');
    
    // Filter by a status with no results
    cy.get('[data-testid="status-filter"]').select('expired');
    cy.wait('@getEmptyVerifications');
    
    // Should show empty state
    cy.get('[data-testid="empty-verifications"]').should('be.visible');
  });
});
