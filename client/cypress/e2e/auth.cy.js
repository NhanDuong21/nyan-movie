// Authentication & Role-Based Redirection Tests
// Validates login form rendering, error handling, and RBAC redirection
// for both normal User and Admin accounts.

describe('Authentication & Role-Based Redirection', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form correctly', () => {
    cy.contains('Nyan Movie').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@gmail.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Verify error banner appears (matches the red error div in Login.jsx)
    cy.get('.bg-red-500\\/10', { timeout: 10000 }).should('be.visible');
  });

  it('should login as NORMAL USER and redirect to homepage', () => {
    // User account
    cy.get('input[type="email"]').type('nyan@gmail.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();

    // Normal users should be redirected to the root URL
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
  });

  it('should login as ADMIN and redirect to dashboard', () => {
    // Admin account
    cy.get('input[type="email"]').type('admin@gmail.com');
    cy.get('input[type="password"]').type('Nhanmax0123');
    cy.get('button[type="submit"]').click();

    // Admins should be automatically redirected to the admin panel
    cy.url({ timeout: 10000 }).should('include', '/admin');
  });
});
