import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { 
    MessageSquare, 
    Send, 
    Trash2, 
    UserCircle, 
    Loader2,
    AlertCircle
} from 'lucide-react';

const CommentSection = ({ movieId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [movieId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/comments/movie/${movieId}`);
            setComments(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch comments', err);
            setError('Không thể tải bình luận. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            setSubmitting(true);
            const res = await axiosClient.post('/comments', {
                movieId,
                content: content.trim()
            });
            setComments([res.data.data, ...comments]);
            setContent('');
        } catch (err) {
            console.error('Failed to post comment', err);
            alert('Lỗi: ' + (err.response?.data?.message || 'Không thể gửi bình luận'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        try {
            await axiosClient.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
            alert('Lỗi: Không thể xóa bình luận');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        return `http://localhost:5000${avatar}`;
    };

    return (
        <section className="mt-12 pt-12 border-t border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">Bình luận</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{comments.length} Phản hồi</p>
                </div>
            </header>

            {/* Post Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-white/2 p-6 rounded-3xl border border-white/5 space-y-4 ring-1 ring-white/5">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-dark-lighter flex items-center justify-center">
                            {user.avatar ? (
                                <img src={getAvatarUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={24} className="text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Gửi bình luận
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-white/2 p-10 rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <UserCircle size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-black uppercase tracking-widest text-sm italic">Bạn chưa đăng nhập</h4>
                        <p className="text-xs text-gray-500 font-medium">Vui lòng đăng nhập để tham gia thảo luận cùng cộng đồng.</p>
                    </div>
                    <a href="/login" className="mt-2 text-primary font-black uppercase tracking-widest text-[10px] border-b border-primary/20 pb-1 hover:border-primary transition-all">Đăng nhập ngay</a>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Đang tải...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center gap-3 py-10 text-red-400 bg-red-400/5 rounded-2xl border border-red-400/10">
                        <AlertCircle size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4 group animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-dark-lighter flex items-center justify-center shadow-lg">
                                {comment.user?.avatar ? (
                                    <img src={getAvatarUrl(comment.user.avatar)} alt={comment.user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle size={28} className="text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h5 className="font-black uppercase text-sm italic tracking-tight">{comment.user?.username || 'Người dùng ẩn danh'}</h5>
                                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    {(user && (user._id === comment.user?._id || user.role === 'admin')) && (
                                        <button 
                                            onClick={() => handleDelete(comment._id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Xóa bình luận"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white/2 p-4 rounded-2xl rounded-tl-none border border-white/5 relative">
                                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                        {comment.content}
                                    </p>
                                    <div className="absolute top-0 -left-1 w-2 h-2 bg-dark-card border-l border-t border-white/5 -rotate-45 -translate-x-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4 bg-white/2 rounded-3xl border border-white/5 border-dashed">
                        <MessageSquare size={48} className="mx-auto text-gray-700 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-600 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CommentSection;
