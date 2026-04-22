import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageMovies from './pages/admin/ManageMovies';
import ManageEpisodes from './pages/admin/ManageEpisodes';
import ManageNews from './pages/admin/ManageNews';
import ManageUsers from './pages/admin/ManageUsers';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import WatchMovie from './pages/WatchMovie';
import MyList from './pages/MyList';
import BrowseMovies from './pages/BrowseMovies';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

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
                    <Route path="/watch/:movieSlug/:episodeId" element={<WatchMovie />} />
                    <Route path="/my-list" element={<MyList />} />
                    <Route path="/browse" element={<BrowseMovies />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:slug" element={<NewsDetail />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="categories" element={<ManageCategories />} />
                    <Route path="movies" element={<ManageMovies />} />
                    <Route path="episodes/:movieId" element={<ManageEpisodes />} />
                    <Route path="news" element={<ManageNews />} />
                    <Route path="users" element={<ManageUsers />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
