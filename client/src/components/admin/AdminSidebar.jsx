import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Tags, 
    Film, 
    Users, 
    ArrowLeft, 
    LogOut,
    ChevronRight,
    Newspaper
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';

const AdminSidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { title: 'Quản lý Danh mục', icon: Tags, path: '/admin/categories' },
        { title: 'Quản lý Phim', icon: Film, path: '/admin/movies' },
        { title: 'Quản lý Tin tức', icon: Newspaper, path: '/admin/news' },
        { title: 'Quản lý Users', icon: Users, path: '/admin/users' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 w-72 bg-dark-card border-r border-white/5 flex flex-col z-[70] transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-primary/10">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white leading-none italic">NYAN</span>
                            <span className="text-[8px] font-black text-primary tracking-widest uppercase">ADMIN</span>
                        </div>
                    </Link>
                    
                    {/* Close Button for Mobile */}
                    <button 
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Đóng menu"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    {/* Fixed: Use ArrowLeft as Close icon to be consistent with main nav */}
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
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
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Thoát
                    </button>
                </div>

                <ConfirmModal 
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Đăng xuất"
                    message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?"
                    type="warning"
                    confirmText="Đăng xuất ngay"
                />
            </aside>
        </>
    );
};

export default AdminSidebar;
