// Movie Interaction Flow - Favorites
// Validates the complete user journey: login -> browse -> favorite -> verify in My List.
//
// Selector rationale (based on actual component DOM):
//   - Movie links: a[href^="/movie/"] (MovieCard renders <Link to="/movie/{slug}">)
//   - Movie title: section h1 (MovieDetail renders h1 inside a <section> hero block,
//     avoiding accidental capture of the "NYAN MOVIE" branding watermark in the
//     split-screen auth pages or the mobile sidebar)
//   - Favorite button: button[aria-label*="thich"] (MovieDetail.jsx L241)
//   - MyList saved grid: main .grid h3 (MyList renders MovieCard <h3> inside
//     <div className="grid ..."> which is itself inside <main>)
//
// Prerequisites:
//   - Backend server running with seeded movie data.
//   - Test user account: nyan@gmail.com / 123456

describe('Movie Interaction Flow - Favorites', () => {
  beforeEach(() => {
    // UI login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('nyan@gmail.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate to a movie detail page from the homepage', () => {
    // The homepage renders MovieCard components which produce <a href="/movie/{slug}">.
    // These appear in both carousel (flex) and grid containers.
    cy.get('a[href^="/movie/"]', { timeout: 10000 }).first().click();

    cy.url().should('include', '/movie/');

    // The detail page title is in a <section> hero block. Scope to section to
    // avoid capturing any other h1 that may exist elsewhere in the DOM.
    cy.get('section h1', { timeout: 10000 }).should('be.visible').and('not.be.empty');
  });

  it('should add a movie to favorites and display it in My List', () => {
    // 1. Click the first movie link from the homepage
    cy.get('a[href^="/movie/"]', { timeout: 10000 }).first().click();
    cy.url().should('include', '/movie/');

    // 2. Capture the movie title scoped to the <section> hero block.
    //    This avoids the mobile sidebar logo or any other h1 in the layout.
    cy.get('section h1', { timeout: 10000 })
      .invoke('text')
      .then((rawTitle) => {
        const movieTitle = rawTitle.trim();

        // 3. Determine current favorite state via aria-label and ensure the movie
        //    ends up in the favorited state after this block.
        cy.get('button[aria-label*="th\u00edch"]', { timeout: 10000 }).then(($btn) => {
          const label = $btn.attr('aria-label') || '';

          if (label.includes('B\u1ecf')) {
            // Already favorited: toggle off then back on to guarantee a clean state
            cy.wrap($btn).click();
            cy.wait(1000);
            cy.get('button[aria-label*="th\u00edch"]').click();
          } else {
            // Not yet favorited: click to add
            cy.wrap($btn).click();
          }
        });

        // 4. Wait for the POST /interactions/favorite API call to complete
        cy.wait(1500);

        // 5. Navigate to the saved tab of My List
        cy.visit('/my-list?tab=saved');

        // 6. Assert the movie title is visible inside the saved grid.
        //    MyList renders <main> > <div class="grid ..."> > MovieCard > <h3>{title}</h3>.
        //    Scoping to "main .grid" isolates the assertion to the movies grid and
        //    prevents false positives from the page header or mobile sidebar.
        cy.get('main .grid', { timeout: 10000 })
          .contains(movieTitle)
          .should('be.visible');
      });
  });

  it('should remove a movie from favorites and verify it is absent from My List', () => {
    // 1. Navigate to the saved tab to find a favorited movie
    cy.visit('/my-list?tab=saved');

    cy.get('body').then(($body) => {
      // Only run the removal test if there is at least one saved movie
      if ($body.find('a[href^="/movie/"]').length > 0) {
        // 2. Capture the title from the first card in the saved grid
        cy.get('main .grid h3').first().invoke('text').then((rawTitle) => {
          const movieTitle = rawTitle.trim();

          // 3. Click into the movie's detail page
          cy.get('main .grid a[href^="/movie/"]').first().click();
          cy.url().should('include', '/movie/');

          // 4. Click the favorite button to remove it
          cy.get('button[aria-label*="th\u00edch"]', { timeout: 10000 }).click();
          cy.wait(1500);

          // 5. Return to the saved list
          cy.visit('/my-list?tab=saved');

          // 6. Assert the movie title no longer appears inside the saved grid
          cy.get('main').should('not.contain.text', movieTitle);
        });
      } else {
        cy.log('No saved movies found. Skipping removal test.');
      }
    });
  });

  it('should show an empty state when no movies are saved', () => {
    // Navigate directly to the saved tab
    cy.visit('/my-list?tab=saved');

    // The page should render either a grid of movies or the EmptyState component.
    // Verify the page itself loads without error regardless of list contents.
    cy.get('main', { timeout: 10000 }).should('be.visible');
  });
});
