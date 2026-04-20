import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { 
    Plus, 
    Trash2, 
    ChevronLeft, 
    Play, 
    Loader2, 
    Check, 
    X 
} from 'lucide-react';

const ManageEpisodes = () => {
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        episodeNumber: '',
        videoUrl: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [movieRes, epsRes] = await Promise.all([
                axiosClient.get(`/movies/id/${movieId}`), // Need to ensure backend has getById
                axiosClient.get(`/episodes?movieId=${movieId}`)
            ]);
            setMovie(movieRes.data.data);
            setEpisodes(epsRes.data.data);
            
            // Set default episode number
            setFormData(prev => ({ 
                ...prev, 
                episodeNumber: epsRes.data.data.length + 1,
                name: `Tập ${epsRes.data.data.length + 1}`
            }));
        } catch (err) {
            console.error('Failed to fetch episodes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [movieId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axiosClient.post(`/episodes/${movieId}`, formData);
            setShowForm(false);
            setFormData({ name: '', episodeNumber: '', videoUrl: '' });
            fetchData();
        } catch (err) {
            alert('Lỗi khi thêm tập phim');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa tập phim này?')) return;
        try {
            await axiosClient.delete(`/episodes/${id}`);
            fetchData();
        } catch (err) {
            alert('Lỗi khi xóa tập phim');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 animate-pulse">Đang tải danh sách tập phim...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4">
                <Link to="/admin/movies" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-max group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại danh sách phim
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
                            Quản lý Tập phim: <span className="text-primary">{movie?.title}</span>
                        </h1>
                        <p className="text-gray-400 mt-1">Cấu hình link video cho từng tập phim.</p>
                    </div>
                    {!showForm && (
                        <button 
                            onClick={() => setShowForm(true)}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            THÊM TẬP MỚI
                        </button>
                    )}
                </div>
            </header>

            {showForm && (
                <div className="bg-dark-card p-6 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white">Thêm tập mới</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tên tập</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                placeholder="VD: Tập 1"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Số tập</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                placeholder="VD: 1"
                                value={formData.episodeNumber}
                                onChange={e => setFormData({...formData, episodeNumber: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2 flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL Video (Iframe/Direct)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                    placeholder="https://youtube.com/..."
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary-hover text-white h-[46px] px-6 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                LƯU
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Thứ tự</th>
                                <th className="px-6 py-4">Tên tập</th>
                                <th className="px-6 py-4">URL Video</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {episodes.length > 0 ? (
                                episodes.map((ep) => (
                                    <tr key={ep._id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-300 font-bold text-xs ring-1 ring-white/10 group-hover:ring-primary/30 group-hover:text-primary transition-all uppercase">
                                                {ep.episodeNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">{ep.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono truncate max-w-[300px]">
                                            {ep.videoUrl}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(ep._id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-500">
                                            <Play size={48} className="opacity-10" />
                                            <p className="font-medium">Chưa có tập phim nào được thêm.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageEpisodes;
