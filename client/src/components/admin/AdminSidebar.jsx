import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Tags, 
    Film, 
    Users, 
    ArrowLeft, 
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { title: 'Quản lý Danh mục', icon: Tags, path: '/admin/categories' },
        { title: 'Quản lý Phim', icon: Film, path: '/admin/movies' },
        { title: 'Quản lý Users', icon: Users, path: '/admin/users' },
    ];

    return (
        <aside className="w-64 bg-dark-card border-r border-white/5 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-white/5">
                <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
                    NYAN <span className="text-white font-light text-xs bg-primary/20 px-2 py-0.5 rounded uppercase">Admin</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={20} />
                                <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <ArrowLeft size={20} />
                    Quay lại Web
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    Thoát
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
