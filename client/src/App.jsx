import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Lazy load all pages to reduce initial bundle size (FCP optimization)
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const WatchMovie = lazy(() => import('./pages/WatchMovie'));
const MyList = lazy(() => import('./pages/MyList'));
const BrowseMovies = lazy(() => import('./pages/BrowseMovies'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageMovies = lazy(() => import('./pages/admin/ManageMovies'));
const ManageEpisodes = lazy(() => import('./pages/admin/ManageEpisodes'));
const ManageNews = lazy(() => import('./pages/admin/ManageNews'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));

// Minimal loading fallback for Suspense
const LoadingFallback = () => (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} strokeWidth={1.5} />
    </div>
);

function App() {
    const { loading } = useAuth();

    if (loading) return <LoadingFallback />;

    return (
        <Router>
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
        </Router>
    );
}

export default App;
