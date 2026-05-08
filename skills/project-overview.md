# Project Overview & Environment Context

## 1. Core Stack & Versions
- Frontend: React 18+ (Vite Bundler), React Router DOM v6, Tailwind CSS v3.
- Backend: Node.js (v18+ recommended), Express.js v4.
- Database: MongoDB 6+ (Mongoose ODM).
- Real-time: Socket.io (v4).

## 2. Environment Variables Strategy
The application relies on strict environment isolation.
- Client (.env): 
  - VITE_API_URL: Backend base URL (e.g., http://localhost:5000/api)
  - VITE_SOCKET_URL: WebSocket endpoint.
- Server (.env):
  - PORT: API port.
  - MONGODB_URI: Connection string.
  - JWT_SECRET & JWT_EXPIRES_IN: For stateless authentication.
  - GEMINI_API_KEY: For Google Generative AI integration.

## 3. Global Development Rules
- Strict Mode: React.StrictMode is enabled; components must handle double-mounting gracefully in development.
- Styling: Utility-first via Tailwind. No custom CSS files unless absolute necessary for complex animations not supported by Tailwind arbitrary values.
- Component Architecture: Functional components strictly utilizing React Hooks. Class components are strictly prohibited.