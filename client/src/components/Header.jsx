import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Search, User, LogOut, Menu, Play, LayoutDashboard, ChevronDown, History as HistoryIcon, X, Sparkles, Mic, Loader2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';


import logo from '../assets/logo.png';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const searchTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGenresOpen, setIsGenresOpen] = useState(false);
    const [isCountriesOpen, setIsCountriesOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Close menu when location changes
    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
    }, [location.pathname]);

    // Sync search input with URL if present
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchFromUrl = queryParams.get('search');
        if (location.pathname === '/browse' && searchFromUrl) {
            setSearchQuery(searchFromUrl);
        } else {
            setSearchQuery('');
        }
    }, [location.search, location.pathname]);

    // Debounced real-time search with dynamic delays
    useEffect(() => {
        // Skip effect on mount to prevent accidental redirect to home
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const trimmed = searchQuery.trim();

        // Rule 1: length === 0 -> Instantly return to Home (if on search page)
        if (!trimmed) {
            setSuggestions([]);
            setShowDropdown(false);
            const currentParams = new URLSearchParams(location.search);
            if (location.pathname === '/browse' && currentParams.has('search')) {
                navigate('/');
            }
            return;
        }

        // Rule 2: length === 1 -> Do NOT trigger search
        if (trimmed.length === 1) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        // Determine delay
        // Rule 3: 2 characters = 1000ms delay
        // Rule 4: 3+ characters = 400ms delay
        const delay = trimmed.length === 2 ? 1000 : 400;

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await axiosClient.get(`/movies?search=${encodeURIComponent(trimmed)}&limit=5`);
                setSuggestions(res.data.data || res.data.movies || []);
                setShowDropdown(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, delay);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, navigate, location.pathname, location.search]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [genreRes, countryRes] = await Promise.all([
                    axiosClient.get('/categories/genres'),
                    axiosClient.get('/categories/countries')
                ]);
                setGenres(genreRes.data.data);
                setCountries(countryRes.data.data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            setShowDropdown(false);
            setIsSearchOpen(false);
            navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'vi-VN';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                
                if (typeof setSearchQuery === 'function') {
                    setSearchQuery(transcript);
                }
                
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                setIsListening(false);
                if (event.error === 'aborted' || event.error === 'no-speech') {
                    // Silently handle Apple's frequent aborts/no-speech without alerting
                    return; 
                }
                if (event.error === 'not-allowed') {
                    alert('Vui lòng cấp quyền sử dụng Micro trong cài đặt trình duyệt.');
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Safari bản mới nhất.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
            } catch (err) {
                // Handle cases where the recognition engine is already running in the background
                console.error('Recognition start error:', err);
                recognitionRef.current.stop();
                setIsListening(false);
            }
        }
    };

    const navLinkClass = ({ isActive }) => 
        `transition-all duration-300 font-bold uppercase tracking-widest text-[11px] ${
            isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
        }`;

    return (
        <header className="bg-dark sticky top-0 z-50 border-b border-white/5 shadow-lg backdrop-blur-md bg-dark/95">
            <nav className="container mx-auto px-4 py-3 relative">
                <div className="flex items-center justify-between gap-6">
                    {/* Mobile: Hamburger Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden text-gray-400 hover:text-white transition-colors w-11 h-11 flex items-center justify-center active:scale-90"
                        aria-label="Mở menu điều hướng"
                    >
                        <Menu size={26} />
                    </button>

                    {/* Logo (Centered on mobile via absolute/flex combo) */}
                    <Link to="/" className="flex items-center gap-2 group md:relative md:left-0 absolute left-1/2 -translate-x-1/2 md:translate-x-0">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-all duration-500">
                            <img 
                                src={logo} 
                                alt="Nyan Movie Logo" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="flex flex-col justify-center leading-none text-left">
                            <span className="text-lg md:text-xl font-black text-white tracking-tighter group-hover:text-primary transition-colors italic uppercase">NYAN</span>
                            <span className="text-[8px] md:text-[10px] font-black text-primary tracking-[0.3em] uppercase">MOVIE</span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <ul className="hidden md:flex items-center gap-8">
                        <li>
                            <NavLink to="/" end className={navLinkClass}>
                                Trang Chủ
                            </NavLink>
                        </li>
                        <li className="relative group/dropdown py-4">
                            <div className="text-gray-400 hover:text-white text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-1">
                                Thể Loại <ChevronDown size={12} />
                            </div>
                            <div className="absolute top-full left-0 w-64 bg-dark-card border border-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 grid grid-cols-2 p-4 translate-y-2 group-hover/dropdown:translate-y-0">
                                {genres.map(g => (
                                    <Link 
                                        key={g.id} 
                                        to={`/browse?genre=${g.slug}`}
                                        className="px-3 py-2 text-[10px] font-bold text-gray-400 hover:text-primary hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest"
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </li>
                        <li className="relative group/dropdown py-4">
                            <div className="text-gray-400 hover:text-white text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-1">
                                Quốc Gia <ChevronDown size={12} />
                            </div>
                            <div className="absolute top-full left-0 w-64 bg-dark-card border border-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 p-4 translate-y-2 group-hover/dropdown:translate-y-0">
                                <div className="grid grid-cols-2 gap-1">
                                    {countries.map(c => (
                                        <Link 
                                            key={c.id} 
                                            to={`/browse?country=${c.slug}`}
                                            className="px-3 py-2 text-[10px] font-bold text-gray-400 hover:text-primary hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </li>
                        <li>
                            <NavLink to="/news" className={navLinkClass}>
                                Tin Tức
                            </NavLink>
                        </li>
                        {user && (
                            <li>
                                <NavLink to="/my-list?tab=saved" className={navLinkClass}>
                                    Phim Của Tôi
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    {/* Desktop Search Bar */}
                    <div className="flex-1 max-w-md hidden lg:relative lg:block">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Tìm kiếm phim..."
                                className="w-full bg-dark-lighter border border-white/10 rounded-full py-2 px-5 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-400 shadow-inner pr-24"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.length === 0) setShowDropdown(false);
                                }}
                                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                                {isSearching && (
                                    <Loader2 size={16} className="text-primary animate-spin mr-1" />
                                )}
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`p-1.5 rounded-full transition ${isListening ? 'text-primary bg-primary/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    title="Tìm kiếm bằng giọng nói"
                                >
                                    <Mic size={16} />
                                </button>
                                <button 
                                    type="submit" 
                                    className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                    aria-label="Tìm kiếm phim"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </form>

                        {/* Dropdown Suggestions */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-50">
                                <ul className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                                    {suggestions.map((movie) => (
                                        <li key={movie._id || movie.id}>
                                            <Link 
                                                to={`/movie/${movie.slug}`} 
                                                className="flex items-center gap-3 p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <img 
                                                    src={movie.poster?.startsWith('http') ? movie.poster : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.poster}`} 
                                                    alt={movie.title} 
                                                    className="w-10 h-14 object-cover rounded-md shadow-md"
                                                />
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{movie.title}</h4>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 truncate mt-1">{movie.originTitle || movie.name}</p>
                                                    <span className="text-[10px] text-primary font-black mt-1 block">{movie.year?.year || movie.year || new Date(movie.createdAt).getFullYear()}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="p-3 bg-dark-lighter border-t border-white/5 text-center">
                                    <button 
                                        onClick={handleSearch}
                                        className="text-[11px] uppercase font-black tracking-[0.2em] text-primary hover:text-white transition-colors"
                                    >
                                        Xem tất cả kết quả
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Auth & Search Toggle */}
                    <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
                        {/* Mobile Search Toggle */}
                        <button 
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="lg:hidden text-gray-400 hover:text-white w-12 h-12 flex items-center justify-center transition-colors relative z-10 active:scale-90"
                            aria-label="Mở khung tìm kiếm"
                        >
                            <Search size={24} />
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end mr-1">
                                    <span className="text-sm font-medium text-white">{user.username}</span>
                                    <span className="text-[10px] text-primary uppercase tracking-widest font-black">{user.role}</span>
                                </div>
                                <div className="group relative">
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white/10 cursor-pointer hover:border-primary transition-all overflow-hidden bg-dark-lighter flex items-center justify-center shadow-lg">
                                        {user.avatar ? (
                                            <img 
                                                src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${user.avatar}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <User size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    
                                    <div className="absolute right-0 mt-3 w-56 bg-dark-card border border-white/5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-2 z-50">
                                        <div className="px-4 py-3 border-b border-white/5 mb-1 sm:hidden">
                                            <p className="text-sm text-white font-medium">{user.username}</p>
                                            <p className="text-[10px] text-primary uppercase font-bold">{user.role}</p>
                                        </div>
                                        <Link 
                                            to="/profile"
                                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center gap-3"
                                        >
                                            <User size={16} /> Trang cá nhân
                                        </Link>
                                        <Link 
                                            to="/my-list?tab=history"
                                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center gap-3"
                                        >
                                            <HistoryIcon size={16} /> Lịch sử xem
                                        </Link>
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
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login" className="text-sm font-medium px-5 py-2 hover:text-primary transition-colors">
                                    Đăng Nhập
                                </Link>
                                <Link to="/register" className="bg-primary hover:bg-primary-hover text-sm font-semibold px-5 py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-primary/20">
                                    Đăng Ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Dropdown */}
                <div className={`lg:hidden transition-all duration-300 ease-in-out relative ${isSearchOpen ? 'mt-3 opacity-100 z-[100]' : 'opacity-0 pointer-events-none'}`}>
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim..."
                            className="w-full bg-black border border-white/20 rounded-full py-2.5 px-5 text-[16px] md:text-sm focus:outline-none focus:border-primary transition-all shadow-xl pr-24"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.length === 0) setShowDropdown(false);
                            }}
                            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            autoFocus={isSearchOpen}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {isSearching && (
                                <Loader2 size={16} className="text-primary animate-spin mr-1" />
                            )}
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2 rounded-full transition ${isListening ? 'text-primary bg-primary/10 animate-pulse' : 'text-gray-400 active:scale-90'}`}
                                title="Tìm kiếm bằng giọng nói"
                            >
                                <Mic size={18} />
                            </button>
                            <button 
                                type="submit" 
                                className="p-2 text-gray-400 hover:text-primary transition-colors active:scale-90"
                                aria-label="Xác nhận tìm kiếm"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </form>

                    {/* Dropdown Suggestions for Mobile */}
                    {showDropdown && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-[110]">
                            <ul className="max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {suggestions.map((movie) => (
                                    <li key={movie._id || movie.id}>
                                        <Link 
                                            to={`/movie/${movie.slug}`} 
                                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <img 
                                                src={movie.poster?.startsWith('http') ? movie.poster : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.poster}`} 
                                                alt={movie.title} 
                                                className="w-10 h-14 object-cover rounded-md shadow-md"
                                            />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 truncate mt-1">{movie.originTitle || movie.name}</p>
                                                <span className="text-[10px] text-primary font-black mt-1 block">{movie.year?.year || movie.year || new Date(movie.createdAt).getFullYear()}</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Sidebar Navigation Drawer */}
            <div 
                className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />
            {/* Mobile menu container with fixed height and scrolling fix */}
            <div className={`fixed top-0 left-0 w-[300px] h-screen z-[70] bg-black border-r border-white/10 shadow-2xl transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full uppercase tracking-tighter opacity-100 overflow-hidden">
                    {/* Drawer Header (Sticky at top of drawer) */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Play size={16} className="text-primary fill-primary" />
                            </div>
                            <span className="text-lg font-black text-white italic tracking-tighter">NYAN MOVIE</span>
                        </div>
                        <button 
                            onClick={() => setIsMenuOpen(false)} 
                            className="text-gray-400 hover:text-white transition-colors w-11 h-11 flex items-center justify-center active:scale-95"
                            aria-label="Đóng menu"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Drawer Content - Scrollable area with pb-20 as requested */}
                    <div className="flex-1 overflow-y-auto bg-black p-4 pb-20">
                        {/* 1. ALWAYS SHOW THE MAIN LINKS HERE (Core Navigation) */}
                        <div className="flex flex-col space-y-5 text-white mb-8">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-3">
                                <Play size={16} /> Trang chủ
                            </Link>

                            {/* Thể loại Accordion */}
                            <div className="border-t border-white/5 pt-5">
                                <button 
                                    onClick={() => setIsGenresOpen(!isGenresOpen)} 
                                    className="flex justify-between items-center w-full py-2 text-white font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
                                >
                                    <span className="text-sm">Thể loại</span>
                                    <span className="text-xl font-light">{isGenresOpen ? '-' : '+'}</span>
                                </button>
                                
                                {isGenresOpen && (
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {genres.slice(0, 10).map(g => (
                                            <Link 
                                                key={g.id} 
                                                to={`/browse?genre=${g.slug}`} 
                                                onClick={() => setIsMenuOpen(false)} 
                                                className="text-[11px] font-bold text-gray-300 hover:text-primary transition-colors uppercase tracking-widest"
                                            >
                                                {g.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quốc gia Accordion */}
                            <div className="border-t border-white/5 pt-5">
                                <button 
                                    onClick={() => setIsCountriesOpen(!isCountriesOpen)} 
                                    className="flex justify-between items-center w-full py-2 text-white font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
                                >
                                    <span className="text-sm">Quốc gia</span>
                                    <span className="text-xl font-light">{isCountriesOpen ? '-' : '+'}</span>
                                </button>
                                
                                {isCountriesOpen && (
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {countries.slice(0, 10).map(c => (
                                            <Link 
                                                key={c.id} 
                                                to={`/browse?country=${c.slug}`} 
                                                onClick={() => setIsMenuOpen(false)} 
                                                className="text-[11px] font-bold text-gray-300 hover:text-primary transition-colors uppercase tracking-widest"
                                            >
                                                {c.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link to="/news" onClick={() => setIsMenuOpen(false)} className="border-t border-white/5 pt-5 text-sm font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-3">
                                <Search size={16} /> Tin tức
                            </Link>

                            {/* ONLY show "Phim của tôi" if logged in */}
                            {user && (
                                <Link to="/my-list?tab=saved" onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-3">
                                    <HistoryIcon size={16} /> Phim của tôi
                                </Link>
                            )}
                        </div>

                        {/* 2. THEN SHOW AUTHENTICATION STATE */}
                        <div className="py-6 border-t border-white/10">
                            {!user ? (
                                <div className="flex flex-col space-y-4">
                                    <Link 
                                        to="/login" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className="w-full py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-white border border-white/20 rounded-xl hover:bg-white/5 transition-all outline-none"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className="w-full py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-white bg-primary rounded-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-white">
                                    <div className="w-12 h-12 rounded-full border-2 border-primary/40 overflow-hidden shadow-xl">
                                        {user.avatar ? (
                                            <img 
                                                src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${user.avatar}`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-dark flex items-center justify-center text-white">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black italic tracking-tight">{user.username}</span>
                                        <span className="text-[10px] text-primary uppercase font-black tracking-widest">{user.role}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. LOGOUT AT THE VERY BOTTOM (Separate standard link per previous request) */}
                        {user && (
                            <button 
                                onClick={() => { logout(); setIsMenuOpen(false); }} 
                                className="mt-4 w-full flex items-center gap-3 px-2 py-4 text-red-500 font-bold text-[11px] uppercase tracking-[0.15em] border-t border-white/5 hover:bg-red-500/5 transition-all"
                            >
                                <LogOut size={16} /> Thoát tài khoản
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
