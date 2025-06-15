# Cypress Testing for FAIT Co-op Platform

This document outlines the Cypress testing approach for the FAIT Co-op platform.

## Overview

We use Cypress for end-to-end testing of the FAIT Co-op platform. Cypress allows us to simulate user interactions and verify that the application behaves as expected.

## Test Structure

Our Cypress tests are organized into the following categories:

1. **App Navigation Tests** (`app-navigation.cy.js`)
   - Tests basic navigation through the application
   - Verifies that links work correctly
   - Checks that pages load properly

2. **Authentication Flow Tests** (`auth-flow.cy.js`)
   - Tests login functionality
   - Tests registration functionality
   - Tests password reset functionality
   - Verifies form validation

3. **Responsive Design Tests** (`responsive-design.cy.js`)
   - Tests the application's responsiveness on different screen sizes
   - Verifies that the UI adapts correctly to desktop, tablet, and mobile viewports
   - Checks that text remains readable on all devices

4. **Client Dashboard Tests** (`client-dashboard.cy.js`)
   - Tests the client dashboard UI
   - Verifies navigation within the dashboard
   - Checks that key dashboard elements are displayed correctly

5. **Service Agent Tests** (`service-agent.cy.js`)
   - Tests service agent functionality
   - Verifies service agent registration
   - Checks service agent dashboard features

6. **Project Management Tests** (`project-management.cy.js`)
   - Tests project creation and management
   - Verifies project listing and details
   - Checks project-related navigation

7. **Community Features Tests** (`community-features.cy.js`)
   - Tests community-related functionality
   - Verifies social media integration
   - Checks community navigation

8. **Accessibility Tests** (`accessibility.cy.js`)
   - Tests basic accessibility features
   - Verifies proper heading structure
   - Checks for alt text on images
   - Verifies keyboard navigation

9. **Performance Tests** (`performance.cy.js`)
   - Tests page load times
   - Verifies navigation performance
   - Checks responsiveness under load

10. **Visual Testing** (`visual-testing.cy.js`)
    - Tests visual appearance of pages
    - Verifies visual consistency across viewports
    - Checks for visual regressions

11. **Form Validation** (`form-validation.cy.js`)
    - Tests form validation for login, registration, and forgot password forms
    - Verifies validation for email format, password strength, and required fields
    - Checks error messages for invalid inputs

12. **Navigation Flow** (`navigation-flow.cy.js`)
    - Tests navigation through main sections of the application
    - Verifies authentication flow navigation
    - Tests browser navigation (back/forward)
    - Checks footer link navigation

## Running Tests

### Running All Tests

To run all Cypress tests, use the following script:

```bash
./run-cypress-tests.sh
```

This script will:
1. Check if the application is running
2. Run all the Cypress tests
3. Report the results

### Running Tests by Category

To run tests for a specific category, use the following script:

```bash
./run-cypress-category.sh <category>
```

Available categories:
- `navigation` - App navigation tests
- `auth` - Authentication flow tests
- `responsive` - Responsive design tests
- `client` - Client dashboard tests
- `service` - Service agent tests
- `project` - Project management tests
- `community` - Community features tests
- `accessibility` - Accessibility tests
- `performance` - Performance tests
- `visual` - Visual testing
- `form` - Form validation tests
- `flow` - Navigation flow tests
- `all` - All tests

Example:
```bash
./run-cypress-category.sh auth
```

## Test Data

The tests use the following test data:

- **Login Credentials**:
  - Admin: admin@itsfait.com / admin123
  - Client: client@itsfait.com / client123
  - Service Agent: service@itsfait.com / service123

## Best Practices

When writing Cypress tests, follow these best practices:

1. **Use data-cy attributes** for element selection to make tests more resilient to UI changes
2. **Keep tests independent** so they can run in any order
3. **Use meaningful assertions** that verify the expected behavior
4. **Handle asynchronous operations** properly using Cypress's built-in retry and wait mechanisms
5. **Use custom commands** for common operations to reduce code duplication

## Custom Commands

We have implemented several custom commands to make testing more efficient:

1. **login(email, password)** - Logs in with the specified credentials
2. **createProject(projectData)** - Creates a new project with the specified data
3. **uploadDocument(documentData)** - Uploads a document with the specified data
4. **addPaymentMethod(paymentData)** - Adds a payment method with the specified data
5. **makePayment(paymentData)** - Makes a payment with the specified data
6. **sendMessage(messageData)** - Sends a message with the specified data
7. **completeClientOnboarding(userData)** - Completes the client onboarding process
8. **navigateTo(page)** - Navigates to a specific page
9. **checkA11y(context, options)** - Performs basic accessibility checks
10. **measurePageLoad(url)** - Measures page load time
11. **testResponsive(url, viewports)** - Tests responsive behavior on different viewports

Example usage:

```javascript
// Login with test credentials
cy.login('client@itsfait.com', 'client123');

// Navigate to a specific page
cy.navigateTo('projects');

// Test responsive behavior
cy.testResponsive('/', ['desktop', 'tablet', 'mobile']);

// Measure page load time
cy.measurePageLoad('/services');
```

## Adding New Tests

To add new tests:

1. Create a new `.cy.js` file in the `cypress/e2e` directory
2. Add the test file to the `run-cypress-tests.sh` script
3. Run the tests to verify they work correctly

## Troubleshooting

If tests are failing, check the following:

1. Is the application running on the expected URL (http://localhost:5173)?
2. Have the UI elements changed? Update selectors if necessary.
3. Are there timing issues? Adjust timeouts or add explicit waits.
4. Check the Cypress screenshots for visual clues about what went wrong.

## Future Improvements

Future improvements to our testing approach include:

1. **Implementing Cypress Dashboard** - Set up Cypress Dashboard for better test reporting and analytics
2. **Adding API Tests** - Implement API tests for backend functionality using Cypress's API testing capabilities
3. **Visual Regression Testing** - Add visual regression testing using plugins like cypress-image-snapshot
4. **Accessibility Testing** - Enhance accessibility testing using cypress-axe
5. **CI/CD Integration** - Set up CI/CD integration for automated testing on every commit
6. **Test Coverage Reports** - Generate test coverage reports to identify areas that need more testing
7. **Performance Benchmarking** - Establish performance benchmarks and monitor them over time
8. **Mobile Device Testing** - Add testing on real mobile devices using services like BrowserStack or Sauce Labs
9. **Cross-Browser Testing** - Expand testing to cover multiple browsers (Firefox, Safari, Edge)
10. **Load Testing** - Implement load testing to ensure the application performs well under heavy load
