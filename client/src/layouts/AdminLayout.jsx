import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useState } from 'react';
import { Menu, Play } from 'lucide-react';

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 bg-dark-card border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <Link to="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Play size={16} className="text-primary fill-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white leading-none italic uppercase">Nyan</span>
                        <span className="text-[8px] font-black text-primary tracking-widest uppercase">Admin</span>
                    </div>
                </Link>
                
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Mở menu quản trị"
                >
                    <Menu size={24} />
                </button>
            </header>

            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 lg:p-8 min-h-screen flex flex-col">
                    <div className="flex-1 bg-dark-lighter/20 backdrop-blur-sm rounded-3xl lg:rounded-[2rem] border border-white/5 p-4 md:p-6 lg:p-10 shadow-2xl shadow-black/50">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
