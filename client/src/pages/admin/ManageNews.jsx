import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    MoreVertical, 
    AlertCircle, 
    Loader2, 
    Newspaper,
    Eye,
    X,
    Check,
    Upload,
    Image,
    CheckCircle
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        thumbnail: '',
        content: ''
    });
    const [uploading, setUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/news');
            setNews(res.data.data);
        } catch (err) {
            console.error('Failed to fetch news', err);
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setUploading(true);
            const res = await axiosClient.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingNews(item);
            setFormData({
                title: item.title,
                thumbnail: item.thumbnail,
                content: item.content
            });
        } else {
            setEditingNews(null);
            setFormData({ title: '', thumbnail: '', content: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNews) {
                await axiosClient.put(`/news/${editingNews._id}`, formData);
            } else {
                await axiosClient.post('/news', formData);
            }
            fetchNews();
            setShowModal(false);
        } catch (err) {
            console.error('Failed to save news', err);
        }
    };

    const handleDelete = (id) => {
        setNewsToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!newsToDelete) return;
        try {
            await axiosClient.delete(`/news/${newsToDelete}`);
            fetchNews();
        } catch (err) {
            console.error('Failed to delete news', err);
        } finally {
            setNewsToDelete(null);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Newspaper size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Quản lý Tin tức</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Đăng và chỉnh sửa bài viết, thông báo</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} /> Viết bài mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <div key={item._id} className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-300 shadow-xl">
                        <div className="relative aspect-video overflow-hidden">
                            <img 
                                src={item.thumbnail.startsWith('http') ? item.thumbnail : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${item.thumbnail}`} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(item)}
                                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            <h3 className="font-black text-white uppercase italic tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Eye size={12} /> {item.views} lượt xem</span>
                                <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* News Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-2xl bg-dark-card border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <header className="flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    {editingNews ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                                </h2>
                                <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </header>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tiêu đề bài viết</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                                        placeholder="Nhập tiêu đề bài viết..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Thumbnail</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group/thumb w-40 aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40 flex items-center justify-center">
                                            {formData.thumbnail ? (
                                                <>
                                                    <img 
                                                        src={formData.thumbnail.startsWith('http') ? formData.thumbnail : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${formData.thumbnail}`} 
                                                        className="w-full h-full object-cover" 
                                                        alt="Thumbnail preview" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="cursor-pointer p-2 bg-primary rounded-lg text-white">
                                                            <Upload size={16} />
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                                                        </label>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                                                    {uploading ? (
                                                        <Loader2 className="animate-spin text-primary" size={24} />
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                                                                <Image size={20} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tải ảnh lên</span>
                                                        </>
                                                    )}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                                                </label>
                                            )}
                                        </div>
                                        {formData.thumbnail && (
                                            <div className="flex items-center gap-2 text-green-500 animate-in fade-in slide-in-from-left-2 transition-all">
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <CheckCircle size={16} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Đã tải lên</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nội dung bài viết</label>
                                    <textarea 
                                        required
                                        rows="8"
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all resize-none scrollbar-thin scrollbar-thumb-white/10"
                                        placeholder="Kể một câu chuyện hấp dẫn..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <footer className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    disabled={uploading}
                                    className={`bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 flex items-center gap-2 ${uploading && 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <Check size={18} /> {editingNews ? 'Cập nhật' : 'Đăng bài'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa Bài Viết"
                message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác và bài viết sẽ biến mất khỏi trang tin tức."
                type="danger"
                confirmText="Xóa bài viết"
            />
        </div>
    );
};

export default ManageNews;
