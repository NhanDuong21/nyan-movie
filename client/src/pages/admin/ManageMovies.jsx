import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Film, 
    Eye, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Loader2,
    PlayCircle,
    ChevronLeft,
    ChevronRight,
    ChevronDown 
} from 'lucide-react';
import MovieForm from '../../components/admin/MovieForm';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/movies', {
                params: {
                    page,
                    limit,
                    search: searchQuery,
                    type: filterType,
                    status: filterStatus,
                    sort: '-createdAt'
                }
            });
            setMovies(res.data.data);
            setTotal(res.data.pagination.total);
            setTotalPages(res.data.pagination.pages);
        } catch (err) {
            console.error('Failed to fetch movies', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [page, limit, filterType, filterStatus]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filterType, filterStatus]);

    // Search with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchMovies();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleDelete = (id) => {
        setMovieToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!movieToDelete) return;
        try {
            await axiosClient.delete(`/movies/${movieToDelete}`);
            fetchMovies();
        } catch (err) {
            console.error('Lỗi khi xóa phim', err);
        } finally {
            setMovieToDelete(null);
            setShowDeleteConfirm(false);
        }
    };

    const handleEdit = (movie) => {
        setEditingMovie(movie);
        setShowForm(true);
    };

    const renderTypeBadge = (type) => {
        switch(type) {
            case 'series':
                return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-900/50 text-blue-400 border border-blue-800">PHIM BỘ</span>;
            case 'chieurap':
                return <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-900/50 text-purple-400 border border-purple-800">PHIM CHIẾU RẠP</span>;
            case 'single':
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-900/50 text-orange-400 border border-orange-800">PHIM LẺ</span>;
        }
    };

    // Client-side mapping remains same but data is now fetched paginated
    // If we need extra filtering, server should handle it.

    if (showForm) {
        return (
            <div className="space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h1>
                    <button 
                        onClick={() => { setShowForm(false); setEditingMovie(null); }}
                        className="text-gray-400 hover:text-white underline text-sm"
                    >
                        Quay lại danh sách
                    </button>
                </header>
                <MovieForm 
                    initialData={editingMovie} 
                    onSuccess={() => { setShowForm(false); setEditingMovie(null); fetchMovies(); }} 
                />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                        <Film className="text-primary" size={32} />
                        Quản lý Phim
                    </h1>
                    <p className="text-gray-400 mt-1">Danh sách toàn bộ phim trong hệ thống.</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    THÊM PHIM MỚI
                </button>
            </header>

            <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên phim..."
                            className="w-full bg-[#111] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-primary transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Filter Type */}
                        <div className="relative group/filter">
                            <select 
                                className="bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[160px] pr-10"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">TẤT CẢ LOẠI PHIM</option>
                                <option value="single">PHIM LẺ</option>
                                <option value="series">PHIM BỘ</option>
                                <option value="chieurap">PHIM CHIẾU RẠP</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                        </div>

                        {/* Filter Status */}
                        <div className="relative group/filter">
                            <select 
                                className="bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[160px] pr-10"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">TẤT CẢ TRẠNG THÁI</option>
                                <option value="ongoing">ĐANG CHIẾU / ACTIVE</option>
                                <option value="completed">HOÀN THÀNH</option>
                                <option value="hidden">ẨN / HIDDEN</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                        </div>

                        {/* Items per page limit */}
                        <div className="relative group/limit w-full md:w-32">
                            <select 
                                className="w-full bg-[#111] border border-gray-800 rounded-xl px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
                                value={limit}
                                onChange={(e) => setLimit(parseInt(e.target.value))}
                            >
                                <option value={5}>5 / trang</option>
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-gray-500 font-medium">Đang tải dữ liệu phim...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Phim</th>
                                    <th className="px-6 py-4">Loại</th>
                                    <th className="px-6 py-4">Thông tin</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {movies.length > 0 ? (
                                    movies.map((movie) => (
                                        <tr key={movie._id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                                                        {movie.poster ? (
                                                            <img 
                                                                src={movie.poster.startsWith('http') ? movie.poster : `http://localhost:5000${movie.poster}`} 
                                                                alt={movie.title} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Film size={20} className="text-gray-700" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white line-clamp-1">{movie.title}</h4>
                                                        <p className="text-gray-500 text-xs mt-0.5">{movie.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {renderTypeBadge(movie.type)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5"><Clock size={12}/> {movie.duration} min</span>
                                                    <span className="flex items-center gap-1.5"><Eye size={12}/> {movie.views.toLocaleString()} view</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {movie.status === 'hidden' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs font-medium border border-red-500/10">
                                                        <XCircle size={14}/> Hidden
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium border border-green-500/10">
                                                        <CheckCircle size={14}/> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        to={`/admin/episodes/${movie._id}`}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-all"
                                                        title="Quản lý tập phim"
                                                    >
                                                        <PlayCircle size={16} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleEdit(movie)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(movie._id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                            Không tìm thấy phim nào.
                                        </td>
                                    </tr>
                                )}
                    </tbody>
                </table>
                )}
            </div>
            {/* PAGINATION FOOTER */}
                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                        Hiển thị <span className="text-white">{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</span> trong tổng số <span className="text-primary">{total}</span> phim
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-primary disabled:opacity-20 disabled:hover:bg-white/5 transition-all shadow-lg active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1.5 px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center gap-1.5">
                                        {i > 0 && arr[i-1] !== p - 1 && <span className="text-gray-600 font-bold">...</span>}
                                        <button
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                                page === p 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>

                        <button 
                            disabled={page === totalPages || loading}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-primary disabled:opacity-20 disabled:hover:bg-white/5 transition-all shadow-lg active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa Phim"
                message="Bạn có chắc chắn muốn xóa (ẩn) phim này khỏi hệ thống? Thao tác này có thể thay đổi cách người dùng nhìn thấy nội dung."
                type="danger"
                confirmText="Xóa (Ẩn) Ngay"
            />
        </div>
    );
};

export default ManageMovies;
