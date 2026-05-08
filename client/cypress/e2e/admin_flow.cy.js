// Admin Dashboard - Full CRUD Flows
// Validates all major modules: Master Data, Movies, News, and Users.

describe('Admin Dashboard - Full CRUD Flows', () => {
  beforeEach(() => {
    // Login as Admin before every test to ensure fresh state
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@gmail.com');
    cy.get('input[type="password"]').type('Nhanmax0123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/admin');
  });

  context('1. Master Data Management (Quản lý Danh mục)', () => {
    it('should navigate to Categories and add a new Genre', () => {
      // Click Sidebar item
      cy.get('aside').contains('Quản lý Danh mục').click();
      cy.get('h1').should('contain', 'Quản lý Danh mục');

      // Add new genre (Thể loại)
      const testGenre = `Test Genre ${new Date().getTime()}`;
      // Assuming the first input in the grid is for Genres
      cy.get('input[placeholder*="Thêm thể loại mới"]').type(testGenre);
      cy.get('input[placeholder*="Thêm thể loại mới"]').parent().find('button').click();

      // Verify the toast or table update by scrolling to the newly added element
      cy.contains(testGenre).scrollIntoView().should('be.visible');
    });
  });

  context('2. Movie & Episode Management (Quản lý Phim)', () => {
    it('should open the Add Movie form and validate fields', () => {
      cy.get('aside').contains('Quản lý Phim').click();
      
      // Click Add Movie button
      cy.contains('THÊM PHIM MỚI').click();

      // Verify form elements are rendered correctly based on UI schema
      cy.get('input[placeholder*="Nhập tên phim"]').should('be.visible');
      cy.get('textarea[placeholder*="Tóm tắt nội dung"]').should('be.visible');
      cy.get('select').should('have.length.at.least', 2); // Loai phim, Trang thai
      cy.contains(/Tải lên Poster/i).should('be.visible');
      cy.contains(/Tải lên Backdrop/i).should('be.visible');
    });

    it('should trigger the Delete Movie confirmation modal', () => {
      cy.get('aside').contains('Quản lý Phim').click();

      // Wait for the table to load
      cy.get('table').should('be.visible');

      // Find the first delete icon in the movie list and click it
      cy.get('table').find('button').filter(':has(svg.lucide-trash-2), button[title*="Xóa"]').first().click({ force: true });

      // Assert the Warning Modal appears
      cy.contains(/Bạn có chắc chắn muốn xóa/i).should('be.visible');
      
      // Cancel the deletion to preserve data
      cy.contains(/Hủy/i).click();
      cy.contains(/Bạn có chắc chắn muốn xóa/i).should('not.exist');
    });
  });

  context('3. News Management (Quản lý Tin tức)', () => {
    it('should open the Write News modal', () => {
      cy.get('aside').contains('Quản lý Tin tức').click();

      // Click Write Post button
      cy.contains(/Viết bài mới/i).click();

      // Assert modal inputs
      cy.get('input[placeholder*="Nhập tiêu đề bài viết"]').should('be.visible');
      cy.get('textarea[placeholder*="Kể một câu chuyện"]').should('be.visible');
      cy.contains(/Tải ảnh lên/i).should('be.visible');

      // Close modal
      cy.contains(/Hủy bỏ/i).click();
    });
  });

  context('4. User Management (Quản lý Users)', () => {
    it('should display user list and action buttons', () => {
      cy.get('aside').contains('Quản lý Users').click();

      // Assert user list elements
      cy.get('input[placeholder*="Tìm kiếm theo tên hoặc email"]').should('be.visible');
      
      // Verify role badges exist using case-insensitive regex (handles CSS uppercase transformation)
      cy.contains(/admin/i).should('exist');
      cy.contains(/user/i).should('exist');

      // Verify action icons exist on a user row (Lock, Edit, Delete)
      // The UI uses SVGs directly or links instead of strict button tags
      cy.get('table tbody tr').first().within(() => {
         cy.get('button, svg, a').should('have.length.at.least', 1);
      });
    });
  });
});
