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
    PlayCircle 
} from 'lucide-react';
import MovieForm from '../../components/admin/MovieForm';

const ManageMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/movies?limit=50&sort=-createdAt');
            setMovies(res.data.data);
        } catch (err) {
            console.error('Failed to fetch movies', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa (ẩn) phim này?')) return;
        try {
            await axiosClient.delete(`/movies/${id}`);
            fetchMovies();
        } catch (err) {
            alert('Lỗi khi xóa phim');
        }
    };

    const handleEdit = (movie) => {
        setEditingMovie(movie);
        setShowForm(true);
    };

    const filteredMovies = movies.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="p-6 border-b border-white/5 bg-white/2 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên phim..."
                            className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                {filteredMovies.length > 0 ? (
                                    filteredMovies.map((movie) => (
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
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                    movie.type === 'series' 
                                                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                                                    : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                                }`}>
                                                    {movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
                                                </span>
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
            </div>
        </div>
    );
};

export default ManageMovies;
