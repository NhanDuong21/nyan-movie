// Admin Dashboard Navigation Flow
// Validates that an Admin user can access the dashboard and navigate
// through the management sidebar tabs successfully.

describe('Admin Dashboard Flow', () => {
  beforeEach(() => {
    // Login as Admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@gmail.com');
    cy.get('input[type="password"]').type('Nhanmax0123');
    cy.get('button[type="submit"]').click();
    
    // Admins are automatically redirected to /admin
    cy.url({ timeout: 10000 }).should('include', '/admin');
  });

  it('should render the dashboard overview initially', () => {
    // Ensure the main admin area is visible
    cy.get('main', { timeout: 10000 }).should('be.visible');
    
    // Check for a dashboard-specific heading or card
    // The exact text depends on your Dashboard.jsx, but we can verify the sidebar is present
    cy.get('aside').should('be.visible');
  });

  it('should navigate to the Movies management tab', () => {
    // Look for the sidebar link containing "Qu\u1ea3n l\u00fd Phim" (Manage Movies)
    // Using a regex to match variations
    cy.get('aside').contains(/Qu\u1ea3n l\u00fd Phim|Movies/i).click();

    // Verify URL change
    cy.url().should('include', '/admin/movies');

    // Assert that the management table is visible
    // Based on ManageMovies.jsx, it renders a standard <table> element
    cy.get('table', { timeout: 10000 }).should('be.visible');
    
    // Verify table headers are rendered
    cy.get('table thead th').contains(/Phim|Lo\u1ea1i/i).should('be.visible');
  });
});
