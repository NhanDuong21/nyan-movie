import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Upload, X, Check, Loader2, Image as ImageIcon, Film } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

const MovieForm = ({ initialData, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'single',
        duration: 0,
        totalEpisodes: 1,
        actors: '',
        director: '',
        language: '',
        status: 'ongoing',
        genres: [],
        country: '',
        year: '',
        poster: '',
        backdrop: ''
    });

    const [categories, setCategories] = useState({
        genres: [],
        countries: [],
        years: []
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState({ poster: false, backdrop: false });
    const [error, setError] = useState('');
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => {},
        cancelText: '',
        confirmText: 'Đã hiểu'
    });

    const getPreviewUrl = (imageState) => {
        if (!imageState) return null;
        // 1. If it's a newly selected File object
        if (imageState instanceof File || imageState instanceof Blob) {
            return URL.createObjectURL(imageState);
        }
        // 2. If it's a string (existing image from DB)
        if (typeof imageState === 'string') {
            // Full Cloudinary or external URL
            if (imageState.startsWith('http')) return imageState;
            // Legacy local path
            return `http://localhost:5000${imageState.startsWith('/') ? '' : '/'}${imageState}`;
        }
        return null;
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [g, c, y] = await Promise.all([
                    axiosClient.get('/categories/genres'),
                    axiosClient.get('/categories/countries'),
                    axiosClient.get('/categories/years')
                ]);
                setCategories({
                    genres: g.data.data,
                    countries: c.data.data,
                    years: y.data.data
                });
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();

        if (initialData) {
            setFormData({
                ...initialData,
                genres: initialData.genres?.map(g => g._id || g),
                country: initialData.country?._id || initialData.country,
                year: initialData.year?._id || initialData.year,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            
            // Logic: Cinema or Single must be 1 episode
            if (name === 'type' && (value === 'single' || value === 'chieurap')) {
                newState.totalEpisodes = 1;
            }
            
            return newState;
        });
    };

    const handleGenreChange = (genreId) => {
        setFormData(prev => {
            const genres = prev.genres.includes(genreId)
                ? prev.genres.filter(id => id !== genreId)
                : [...prev.genres, genreId];
            return { ...prev, genres };
        });
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const res = await axiosClient.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [field]: res.data.url }));
        } catch (err) {
            setConfirmConfig({
                isOpen: true,
                title: 'Lỗi tải lên',
                message: 'Không thể tải lên hình ảnh. Vui lòng kiểm tra định dạng file hoặc kết nối mạng.',
                type: 'danger',
                onConfirm: () => {},
                cancelText: '',
                confirmText: 'Đã hiểu'
            });
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (initialData) {
                await axiosClient.put(`/movies/${initialData._id}`, formData);
            } else {
                await axiosClient.post('/movies', formData);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-dark-card p-8 rounded-3xl border border-white/5 space-y-10">
            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm border border-red-500/20">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Side: General Info */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Tiêu đề phim *</label>
                        <input
                            required
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-dark border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            placeholder="Nhập tên phim..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Mô tả phim</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full bg-dark border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all resize-none"
                            placeholder="Tóm tắt nội dung..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Loại phim</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-dark border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            >
                                <option value="single">Phim Lẻ (Single)</option>
                                <option value="series">Phim Bộ (Series)</option>
                                <option value="chieurap">Phim Chiếu Rạp (Cinema)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-dark border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            >
                                <option value="ongoing">Đang chiếu (Ongoing)</option>
                                <option value="completed">Hoàn thành (Completed)</option>
                                <option value="hidden">Ẩn (Hidden)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Thời lượng (phút)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Tổng số tập</label>
                            <input
                                type="number"
                                name="totalEpisodes"
                                value={formData.totalEpisodes}
                                onChange={handleChange}
                                disabled={formData.type === 'single' || formData.type === 'chieurap'}
                                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Ngôn ngữ</label>
                        <input
                            type="text"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            placeholder="Tiếng Anh, Vietsub..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Đạo diễn</label>
                            <input
                                type="text"
                                name="director"
                                value={formData.director}
                                onChange={handleChange}
                                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Diễn viên</label>
                            <input
                                type="text"
                                name="actors"
                                value={formData.actors}
                                onChange={handleChange}
                                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Media & Categories */}
                <div className="space-y-8">
                    {/* Media Uploads */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Poster Upload */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Film size={14} /> Poster (Dọc)
                            </label>
                            <div className="relative group aspect-[2/3] bg-dark border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                {formData.poster ? (
                                    <>
                                        <img src={getPreviewUrl(formData.poster)} alt="Poster Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(p => ({...p, poster: ''}))}
                                                className="bg-red-500 p-2 rounded-full text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {uploading.poster ? (
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                        ) : (
                                            <>
                                                <Upload className="text-gray-600 mb-2" size={32} />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Tải lên Poster</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            onChange={(e) => handleFileUpload(e, 'poster')}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Backdrop Upload */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <ImageIcon size={14} /> Backdrop (Ngang)
                            </label>
                            <div className="relative group aspect-square bg-dark border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                {formData.backdrop ? (
                                    <>
                                        <img src={getPreviewUrl(formData.backdrop)} alt="Backdrop Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(p => ({...p, backdrop: ''}))}
                                                className="bg-red-500 p-2 rounded-full text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {uploading.backdrop ? (
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                        ) : (
                                            <>
                                                <Upload className="text-gray-600 mb-2" size={32} />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Tải lên Backdrop</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            onChange={(e) => handleFileUpload(e, 'backdrop')}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Quốc gia</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full bg-dark border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="">Chọn quốc gia...</option>
                                    {categories.countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Năm phát hành</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full bg-dark border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="">Chọn năm...</option>
                                    {categories.years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-400">Thể loại (Chọn nhiều)</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.genres.map(g => (
                                    <button
                                        key={g._id}
                                        type="button"
                                        onClick={() => handleGenreChange(g._id)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                                            formData.genres.includes(g._id)
                                            ? 'bg-primary text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {formData.genres.includes(g._id) && <Check size={12} />}
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-white/5 flex justify-end gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-primary/20"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Check size={24} />}
                    {initialData ? 'CẬP NHẬT PHIM' : 'TẠO PHIM MỚI'}
                </button>
            </div>
            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                cancelText={confirmConfig.cancelText}
                confirmText={confirmConfig.confirmText}
            />
        </form>
    );
};

export default MovieForm;
