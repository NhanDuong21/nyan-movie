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
        <div className="min-h-screen bg-[#0b0b0b] text-white">
            <AdminSidebar />
            <main className="lg:pl-64 min-h-screen">
                <div className="p-4 lg:p-8 min-h-screen flex flex-col">
                    <div className="flex-1 bg-dark-lighter/20 backdrop-blur-sm rounded-[2rem] border border-white/5 p-6 lg:p-10 shadow-2xl shadow-black/50">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
