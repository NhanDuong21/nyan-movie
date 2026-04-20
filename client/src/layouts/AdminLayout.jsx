import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // RBAC: Only admins can access
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex min-h-screen bg-dark text-white">
            <AdminSidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
