import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Point to the Vite dev server
    baseUrl: 'http://localhost:5173',

    // Default viewport matching a standard desktop
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeout configs for slower local environments
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 15000,

    // Disable video recording to speed up local runs
    video: false,

    // Screenshot only on failure
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // Node event listeners can be registered here
    },
  },
});
