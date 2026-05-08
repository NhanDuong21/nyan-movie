// ***********************************************************
// Cypress E2E Support File
// This file runs before every single spec file.
// Use it for global configurations, custom commands, and
// overriding default behavior.
// ***********************************************************

// Prevent Cypress from failing the test on uncaught exceptions
// originating from the application itself (e.g., third-party scripts).
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false prevents Cypress from failing the test
  return false;
});
