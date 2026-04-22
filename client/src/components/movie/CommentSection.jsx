import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { 
    MessageSquare, 
    Send, 
    Trash2, 
    UserCircle, 
    Loader2,
    AlertCircle,
    CornerDownRight
} from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

const CommentSection = ({ movieId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => {},
        cancelText: 'Hủy',
        confirmText: 'Xác nhận'
    });

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

    const handleSubmit = async (e, parentId = null) => {
        if (e) e.preventDefault();
        
        const textToSubmit = parentId ? replyContent : content;
        if (!textToSubmit.trim()) return;

        try {
            setSubmitting(true);
            const res = await axiosClient.post('/comments', {
                movieId,
                content: textToSubmit.trim(),
                parentId
            });
            
            // Add new comment to local state
            setComments([res.data.data, ...comments]);
            
            if (parentId) {
                setReplyContent('');
                setReplyingTo(null);
            } else {
                setContent('');
            }
        } catch (err) {
            console.error('Failed to post comment', err);
            setConfirmConfig({
                isOpen: true,
                title: 'Lỗi gửi bình luận',
                message: err.response?.data?.message || 'Không thể gửi bình luận vào lúc này. Vui lòng thử lại sau.',
                type: 'danger',
                onConfirm: () => {},
                cancelText: '',
                confirmText: 'Đã hiểu'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (commentId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xóa bình luận',
            message: 'Bạn có chắc chắn muốn xóa bình luận này? Thao tác này không thể hoàn tác.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axiosClient.delete(`/comments/${commentId}`);
                    setComments(comments.filter(c => c._id !== commentId));
                } catch (err) {
                    console.error('Failed to delete comment', err);
                    setConfirmConfig({
                        isOpen: true,
                        title: 'Lỗi',
                        message: 'Không thể xóa bình luận này. Vui lòng thử lại sau.',
                        type: 'danger',
                        onConfirm: () => {},
                        cancelText: '',
                        confirmText: 'Đã hiểu'
                    });
                }
            },
            cancelText: 'Hủy',
            confirmText: 'Xóa ngay'
        });
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
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{comments.length} Lượt tương tác</p>
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
                    (() => {
                        const rootComments = comments.filter(c => !c.parentId);
                        const replies = comments.filter(c => c.parentId);

                        return rootComments.map((comment) => (
                            <div key={comment._id} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                {/* Root Comment Card */}
                                <div className="flex gap-4 group">
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
                                                
                                                {user && (
                                                    <button 
                                                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                        className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md transition-all ${
                                                            replyingTo === comment._id 
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                            : 'text-primary hover:bg-primary/10'
                                                        }`}
                                                    >
                                                        {replyingTo === comment._id ? 'Đang phản hồi' : 'Phản hồi'}
                                                    </button>
                                                )}
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

                                {/* Reply Input Area */}
                                {replyingTo === comment._id && (
                                    <div className="ml-16 animate-in slide-in-from-top-2 duration-300">
                                        <div className="bg-[#111] p-4 rounded-2xl border border-primary/20 ring-1 ring-primary/5">
                                            <textarea
                                                autoFocus
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder={`Phản hồi ${comment.user?.username}...`}
                                                className="w-full bg-transparent border-none p-0 text-sm text-white placeholder:text-gray-700 focus:ring-0 min-h-[60px] resize-none"
                                            />
                                            <div className="flex justify-end items-center gap-3 mt-2 pt-2 border-t border-white/5">
                                                <button 
                                                    onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                                                    className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={() => handleSubmit(null, comment._id)}
                                                    disabled={submitting || !replyContent.trim()}
                                                    className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                    Gửi
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Nested Replies Rendering */}
                                <div className="ml-16 space-y-4 border-l-2 border-white/5 pl-4">
                                    {replies
                                        .filter(reply => reply.parentId === comment._id)
                                        .map(reply => (
                                            <div key={reply._id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-dark-lighter flex items-center justify-center shadow-lg">
                                                    {reply.user?.avatar ? (
                                                        <img src={getAvatarUrl(reply.user.avatar)} alt={reply.user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={18} className="text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-black uppercase text-[11px] italic tracking-tight text-gray-300">{reply.user?.username || 'Người dùng ẩn danh'}</h5>
                                                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{formatDate(reply.createdAt)}</span>
                                                        </div>
                                                        {(user && (user._id === reply.user?._id || user.role === 'admin')) && (
                                                            <button 
                                                                onClick={() => handleDelete(reply._id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-700 hover:text-red-500 transition-all"
                                                                title="Xóa phản hồi"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="bg-white/[0.015] p-3 rounded-xl border border-white/5">
                                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ));
                    })()
                ) : (
                    <div className="py-20 text-center space-y-4 bg-white/2 rounded-3xl border border-white/5 border-dashed">
                        <MessageSquare size={48} className="mx-auto text-gray-700 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-600 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    </div>
                )}
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
        </section>
    );
};

export default CommentSection;
