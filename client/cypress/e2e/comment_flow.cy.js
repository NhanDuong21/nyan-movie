// User Comment Flow
// Validates that a logged-in user can submit a comment on a movie detail page.

describe('User Comment Flow', () => {
  beforeEach(() => {
    // Login as normal User
    cy.visit('/login');
    cy.get('input[type="email"]').type('nyan@gmail.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
  });

  it('should allow user to post a comment', () => {
    // Navigate to the first available movie
    cy.get('a[href^="/movie/"]', { timeout: 10000 }).first().click();
    cy.url().should('include', '/movie/');

    // Ensure the Comment Section has loaded
    cy.get('textarea', { timeout: 10000 }).should('be.visible').scrollIntoView();

    // Generate a unique test comment to avoid false positives
    const testComment = `Test comment from Cypress ${new Date().getTime()}`;

    // Type the comment
    cy.get('textarea').type(testComment);

    // Click the submit button. In CommentSection.jsx, it has type="submit"
    // and text "G\u1eedi b\u00ecnh lu\u1eadn" (Gửi bình luận)
    cy.get('button[type="submit"]')
      .contains(/G\u1eedi|Submit/i)
      .should('not.be.disabled')
      .click();

    // Assert that the new comment appears in the list
    cy.contains(testComment, { timeout: 10000 }).should('be.visible');
  });
});
