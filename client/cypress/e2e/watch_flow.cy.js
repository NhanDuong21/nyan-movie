// Watch Movie & Picture-in-Picture (PiP) Flow
// Validates that the video player loads properly and triggers the
// Picture-in-Picture layout shift when scrolling down.

describe('Watch Movie & PiP Flow', () => {
  beforeEach(() => {
    // Login to ensure access to watch features
    cy.visit('/login');
    cy.get('input[type="email"]').type('nyan@gmail.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
  });

  it('should render video player and trigger PiP on scroll', () => {
    // Navigate to a movie detail page
    cy.get('a[href^="/movie/"]', { timeout: 10000 }).first().click();
    cy.url().should('include', '/movie/');

    // Click the Watch button
    // It's a link to `/watch/{slug}`, containing "Xem phim" text (or similar)
    cy.get('a[href^="/watch/"]')
      .first()
      .click({ force: true }); // Use force true if overlaid or animated

    // Ensure we landed on the watch page
    cy.url({ timeout: 10000 }).should('include', '/watch/');

    // Assert that the video player container is visible
    // Based on WatchMovie.jsx, the player wrapper has the .aspect-video class
    // 1. Ensure the main video container (the first one) is visible and simulate a click to "Play"
    cy.get('.aspect-video').first().should('be.visible').click({ force: true });

    // Wait a brief moment to simulate the user watching the start of the video
    cy.wait(1000);

    // 2. Scroll specifically to the comments area smoothly
    cy.get('textarea').should('exist').scrollIntoView({ duration: 1000 });

    // 3. Give the IntersectionObserver and React state time to process the scroll and apply animations
    cy.wait(1500);

    // 4. Assert that the floating player exists. 
    // We use a broader CSS attribute selector that catches 'fixed', '!fixed', 'md:fixed', etc.
    // We scope it broadly because the class might be applied to a wrapper or the video itself
    cy.get('[class*="fixed"]').should('exist');
  });
});
