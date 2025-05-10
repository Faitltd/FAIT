# FAIT Co-op Cypress Tests

This directory contains Cypress end-to-end tests for the FAIT Co-op platform.

## Test Organization

The tests are organized into several categories:

### Basic Tests
- `basic-test.cy.js`: Simple tests to verify that the application loads correctly
- `features-test.cy.js`: Tests for basic feature availability

### Fixed Tests
These tests use flexible selectors to work with different UI implementations:

- `fixed-login-test.cy.js`: Tests for authentication functionality
- `fixed-navigation-test.cy.js`: Tests for navigation between pages
- `fixed-dashboard-test.cy.js`: Tests for dashboard functionality
- `fixed-client-features.cy.js`: Tests for client-specific features
- `fixed-service-agent-features.cy.js`: Tests for service agent-specific features
- `fixed-booking-test.cy.js`: Tests for booking functionality
- `fixed-messaging-test.cy.js`: Tests for messaging functionality
- `fixed-project-test.cy.js`: Tests for project management functionality
- `fixed-visual-test.cy.js`: Tests for visual consistency and UI elements
- `fixed-test-data-management.cy.js`: Tests using the test data management utilities

### User Role Tests
Tests specific to different user roles:

- `auth/login.cy.js`: Authentication tests
- `client/client-journey.cy.js`: Client user journey tests
- `service-agent.cy.js`: Service agent functionality tests

## Running Tests

### Running All Fixed Tests
```bash
npm run cypress:fixed
```

### Running Specific Tests
```bash
# Run only login tests
npm run test:fixed-login

# Run tests in Cypress UI
npm run cypress:open
```

## Test Credentials

The tests use the following credentials:

- Admin: `admin@itsfait.com` / `admin123`
- Client: `client@itsfait.com` / `client123`
- Service Agent: `service@itsfait.com` / `service123`

## Test Utilities

The test suite includes several utilities to enhance testing capabilities:

### Visual Testing Utilities
Located in `cypress/support/visual-testing.js`, these utilities provide:
- `cy.visualSnapshot()`: Takes screenshots with standardized naming
- `cy.visualCheckElement()`: Checks if an element is visually rendered correctly
- `cy.visualCheckPage()`: Checks the visual state of a page and its elements

### Test Data Management
Located in `cypress/support/test-data.js`, these utilities provide:
- `cy.createTestData()`: Creates and tracks test data for cleanup
- `cy.cleanupTestData()`: Cleans up test data after tests
- `Cypress.testData`: Generators for different types of test data (users, projects, etc.)

## Test Design Principles

1. **Resilient Selectors**: Tests use multiple selectors to find elements, making them more resilient to UI changes.
2. **Graceful Degradation**: Tests check for the existence of elements before interacting with them.
3. **Visual Verification**: Screenshots are taken at key points for visual verification.
4. **Isolated Tests**: Each test is independent and cleans up after itself.
5. **Test Data Management**: Tests create and clean up their own test data.
6. **Visual Consistency**: Tests check for visual consistency in colors, typography, and layout.

## Adding New Tests

When adding new tests:

1. Use the flexible selector pattern from the fixed tests
2. Clear cookies and localStorage before each test
3. Take screenshots for debugging
4. Add the test to the `run-fixed-tests.sh` script

## Troubleshooting

If tests are failing:

1. Check the screenshots in `cypress/screenshots/`
2. Verify that the application is running on the correct port (default: 5173)
3. Check that the test credentials are valid
4. Ensure localStorage is properly cleared between tests
