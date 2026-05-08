# System Architecture & Data Flow

## 1. Authentication Flow (JWT)
- Login: Client posts credentials -> Server verifies Bcrypt hash -> Server generates JWT.
- Storage: JWT is stored in LocalStorage (or HttpOnly cookies depending on final security audit) and attached to Axios Interceptors.
- Axios Interceptor: All outgoing requests automatically attach `Authorization: Bearer <token>`. 401 responses trigger a global logout function and redirect to /login.

## 2. API Routing & Middleware (Server)
- Base Path: `/api/v1/...`
- Middleware Pipeline:
  1. `cors()` & `express.json()`.
  2. `verifyToken`: Checks JWT validity.
  3. `verifyAdmin`: Checks user role inside JWT payload.
  4. Error Handling: Global `errorHandler` middleware catches `next(err)` and formats consistent JSON responses: `{ success: false, message: string, error: object }`.

## 3. Frontend Routing (React Router v6)
- Private Routes: Wrapped in a `<ProtectedRoute>` component that checks `isAuthenticated` context. Unauthenticated users are pushed to `/login` via `<Navigate replace />`.
- Layout Pattern: `<MainLayout>` contains the Header (with Debounced Search), `<Outlet>` for page content, and Footer. Search triggers navigation to `/search?keyword=...`.

## 4. Debounced Search Optimization
- Implementation: Input uses `onChange` to set raw text. A `useEffect` with `setTimeout` delays the API call or dropdown render based on string length (1 char = ignore, 2 = 1000ms, 3+ = 500ms).