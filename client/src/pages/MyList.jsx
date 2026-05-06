import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import MovieCard from '../components/MovieCard';
import { 
    Heart, 
    History as HistoryIcon, 
    Clock, 
    Loader2, 
    Film, 
    ChevronLeft,
    ChevronRight,
    Play
} from 'lucide-react';

const MyList = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'history'; // Default to history
    
    const [favorites, setFavorites] = useState([]);
    
    // Strict page-based pagination for both tabs
    const ITEMS_PER_PAGE = 12;
    const [currentPage, setCurrentPage] = useState(1);
    
    // History State
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    const [initialLoading, setInitialLoading] = useState(true);

    const handleTabChange = (tabName) => {
        setSearchParams({ tab: tabName });
    };

    // Reset page to 1 when the active tab changes via URL parameter
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Determine active data array (filter out null entries from deleted movies)
    const currentData = activeTab === 'history' 
        ? history.filter(Boolean) 
        : favorites.filter(Boolean);

    // Calculate pagination boundaries
    const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = currentData.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Initial Fetch (Favorites only)
    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    // Fetch all history when tab becomes active
    useEffect(() => {
        if (user && activeTab === 'history' && history.length === 0) {
            fetchHistory();
        }
    }, [user, activeTab]);

    const fetchFavorites = async () => {
        try {
            setInitialLoading(true);
            const res = await axiosClient.get('/interactions/favorite');
            setFavorites(res.data.data);
        } catch (err) {
            console.error('Failed to fetch favorites', err);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (historyLoading) return;
        
        try {
            setHistoryLoading(true);
            const res = await axiosClient.get(`/interactions/history?page=1&limit=9999`);
            setHistory(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setHistoryLoading(false);
            setInitialLoading(false);
        }
    };



    if (initialLoading && history.length === 0 && favorites.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-xs">Đang tải danh sách...</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Page Header omitted for brevity, same as before */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                        <Film size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Bộ sưu tập</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Quản lý phim đã lưu và lịch sử xem của bạn</p>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <button 
                        onClick={() => handleTabChange('saved')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'saved' 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Heart size={16} fill={activeTab === 'saved' ? 'currentColor' : 'none'} />
                        Phim đã lưu
                    </button>
                    <button 
                        onClick={() => handleTabChange('history')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'history' 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <HistoryIcon size={16} />
                        Lịch sử xem
                    </button>
                </div>
            </header>

            {/* Tab Content - Strict Page-based Pagination */}
            <main>
                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Loading state for history tab */}
                    {activeTab === 'history' && historyLoading && history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Đang tải lịch sử...</span>
                        </div>
                    ) : currentData.length === 0 ? (
                        <EmptyState 
                            icon={activeTab === 'saved' ? <Heart size={48} /> : <HistoryIcon size={48} />} 
                            title={activeTab === 'saved' ? 'Danh sách trống' : 'Chưa có lịch sử'} 
                            description={activeTab === 'saved' 
                                ? 'Bạn chưa lưu bộ phim nào. Hãy khám phá và lưu lại những bộ phim yêu thích nhé!' 
                                : 'Bạn chưa xem bộ phim nào gần đây.'
                            } 
                        />
                    ) : (
                        <>
                            {/* Strict Grid: Renders EXACTLY up to 12 items per page */}
                            {activeTab === 'saved' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                                    {currentItems.map(movie => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentItems.map(item => (
                                        <HistoryCard key={item.id} item={item} />
                                    ))}
                                </div>
                            )}

                            {/* Strict Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-6 mt-12 mb-8">
                                    <button 
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-700 rounded-full font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:border-gray-500 text-white"
                                    >
                                        <ChevronLeft size={16} />
                                        Trang trước
                                    </button>
                                    
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                                        Trang <span className="text-white">{currentPage}</span> / {totalPages}
                                    </span>

                                    <button 
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-700 rounded-full font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:border-gray-500 text-white"
                                    >
                                        Trang sau
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

const HistoryCard = ({ item }) => {
    const { movie, episode, updatedAt } = item;
    if (!movie) return null;

    return (
        <div className="group relative flex gap-4 p-4 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all duration-300">
            <div className="w-24 aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shrink-0">
                <img 
                    src={movie.poster?.startsWith('http') ? movie.poster : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.poster}`} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1">
                    <h4 className="font-black text-white uppercase italic tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {movie.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 w-fit px-2 py-0.5 rounded">
                        <Play size={12} fill="currentColor" />
                        {episode?.name || 'Đang xem'}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Clock size={12} />
                        Xem lúc: {new Date(updatedAt).toLocaleDateString('vi-VN')} {new Date(updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <Link 
                        to={`/watch/${movie.slug}/${episode?.id || ''}`}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group/btn"
                    >
                        Xem tiếp
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title, description }) => (
    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white/2 rounded-[40px] border border-white/5 border-dashed">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-gray-700 opacity-30">
            {icon}
        </div>
        <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-black uppercase italic tracking-widest text-white/50">{title}</h3>
            <p className="text-sm font-medium text-gray-600 px-6">{description}</p>
        </div>
        <Link 
            to="/" 
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
            Khám phá ngay
        </Link>
    </div>
);

export default MyList;
