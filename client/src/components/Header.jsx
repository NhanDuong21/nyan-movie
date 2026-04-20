import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Search, User, LogOut, Menu, Play, LayoutDashboard } from 'lucide-react';

import logo from '../assets/logo.png';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    return (
        <header className="bg-dark sticky top-0 z-50 border-b border-white/5 shadow-lg backdrop-blur-md bg-dark/95">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-all duration-500">
                        <img 
                            src={logo} 
                            alt="Nyan Movie Logo" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex flex-col justify-center leading-none">
                        <span className="text-xl font-black text-white tracking-tighter group-hover:text-primary transition-colors italic">NYAN</span>
                        <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">MOVIE</span>
                    </div>
                </Link>

                {/* Nav Links */}
                <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <li className="hover:text-primary transition-colors cursor-pointer">
                        <Link to="/">Trang Chủ</Link>
                    </li>
                    <li className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1">
                        Thể Loại
                    </li>
                    <li className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1">
                        Quốc Gia
                    </li>
                    {user && (
                        <li className="hover:text-primary transition-colors cursor-pointer font-bold text-primary">
                            <Link to="/my-list">Phim Của Tôi</Link>
                        </li>
                    )}
                </ul>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md hidden lg:relative lg:block">
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim..."
                        className="w-full bg-dark-lighter border border-white/10 rounded-full py-2 px-5 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary">
                        <Search size={18} />
                    </button>
                </form>

                {/* Auth Controls */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end mr-1">
                                <span className="text-sm font-medium text-white">{user.username}</span>
                                <span className="text-[10px] text-primary uppercase tracking-widest">{user.role}</span>
                            </div>
                            <div className="group relative">
                                <div className="w-10 h-10 rounded-full border-2 border-white/10 cursor-pointer hover:border-primary transition-all overflow-hidden bg-dark-lighter flex items-center justify-center">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-gray-400" />
                                    )}
                                </div>
                                
                                <div className="absolute right-0 mt-3 w-56 bg-dark-card border border-white/5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-2">
                                    <div className="px-4 py-3 border-b border-white/5 mb-1 sm:hidden">
                                        <p className="text-sm text-white font-medium">{user.username}</p>
                                        <p className="text-[10px] text-primary uppercase">{user.role}</p>
                                    </div>
                                    <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center gap-3">
                                        <User size={16} /> Trang cá nhân
                                    </button>
                                    {user.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            className="w-full text-left px-4 py-3 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-3"
                                        >
                                            <LayoutDashboard size={16} /> Admin Panel
                                        </Link>
                                    )}
                                    <button 
                                        onClick={logout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3"
                                    >
                                        <LogOut size={16} /> Thoát tài khoản
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-sm font-medium px-5 py-2 hover:text-primary transition-colors">
                                Đăng Nhập
                            </Link>
                            <Link to="/register" className="bg-primary hover:bg-primary-hover text-sm font-semibold px-5 py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-primary/20">
                                Đăng Ký
                            </Link>
                        </div>
                    )}
                    <button className="md:hidden text-gray-400 hover:text-white">
                        <Menu size={24} />
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
