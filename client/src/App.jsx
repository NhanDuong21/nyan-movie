import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageMovies from './pages/admin/ManageMovies';
import ManageEpisodes from './pages/admin/ManageEpisodes';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
    const { loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/movie/:slug" element={<MovieDetail />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="categories" element={<ManageCategories />} />
                    <Route path="movies" element={<ManageMovies />} />
                    <Route path="episodes/:movieId" element={<ManageEpisodes />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
