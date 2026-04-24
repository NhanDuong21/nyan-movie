import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import socket from '../../utils/socket';
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
    const [replyTargetUser, setReplyTargetUser] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

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

    // Socket.io: Connect, join room, and listen for real-time events
    useEffect(() => {
        if (!movieId) return;

        // Connect socket if not connected
        if (!socket.connected) socket.connect();

        socket.emit('join_movie', movieId);

        // Listen for new comments from other users
        const handleNewComment = (newComment) => {
            setComments(prev => {
                // Avoid duplicates (our own comment is already added optimistically)
                if (prev.some(c => c._id === newComment._id)) return prev;
                return [newComment, ...prev];
            });
        };

        // Listen for deleted comments
        const handleCommentDeleted = ({ commentId, parentId }) => {
            setComments(prev => {
                // If a parent was deleted, also remove its replies
                if (!parentId) {
                    return prev.filter(c => c._id !== commentId && c.parentId !== commentId);
                }
                return prev.filter(c => c._id !== commentId);
            });
        };

        // Typing indicators
        const handleUserTyping = ({ username }) => {
            setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
        };

        const handleUserStopTyping = ({ username }) => {
            setTypingUsers(prev => prev.filter(u => u !== username));
        };

        socket.on('new_comment', handleNewComment);
        socket.on('comment_deleted', handleCommentDeleted);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stop_typing', handleUserStopTyping);

        return () => {
            socket.emit('leave_movie', movieId);
            socket.off('new_comment', handleNewComment);
            socket.off('comment_deleted', handleCommentDeleted);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stop_typing', handleUserStopTyping);
        };
    }, [movieId]);

    // Typing event handler
    const handleTyping = useCallback(() => {
        if (!user) return;
        socket.emit('typing', { movieId, username: user.username });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { movieId, username: user.username });
        }, 2000);
    }, [movieId, user]);

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

        // Stop typing indicator
        if (user) socket.emit('stop_typing', { movieId, username: user.username });

        try {
            setSubmitting(true);
            const res = await axiosClient.post('/comments', {
                movieId,
                content: textToSubmit.trim(),
                parentId,
                replyToUser: parentId ? replyTargetUser : null
            });
            
            // Add new comment to local state (Socket will handle sync for others)
            setComments(prev => {
                if (prev.some(c => c._id === res.data.data._id)) return prev;
                return [res.data.data, ...prev];
            });
            
            if (parentId) {
                setReplyContent('');
                setReplyingTo(null);
                setReplyTargetUser(null);
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
                    // Socket will sync deletions to other clients
                    setComments(prev => prev.filter(c => c._id !== commentId && c.parentId !== commentId));
                } catch (err) {
                    console.error('Failed to delete comment', err);
                    setConfirmConfig({
                        isOpen: true,
                        title: 'Lỗi',
                        message: err.response?.data?.message || 'Không thể xóa bình luận này. Vui lòng thử lại sau.',
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
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${avatar}`;
    };

    // Permission check: mirrors backend hierarchical rules
    const canDelete = (commentOwnerId) => {
        if (!user) return false;
        // Owner can always delete their own
        if (user._id === commentOwnerId) return true;
        // Root can delete anything
        if (user.is_root || user.email === 'sgoku4880@gmail.com') return true;
        // Admin can delete (backend handles admin-vs-admin block)
        if (user.role === 'admin') return true;
        return false;
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
                                onInput={handleTyping}
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

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="flex items-center gap-2.5 px-2 py-1 animate-in fade-in duration-300">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] italic text-gray-500 tracking-wide">
                        <span className="font-semibold text-gray-400 not-italic">{typingUsers.join(', ')}</span> đang nhập bình luận...
                    </span>
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
                                                        onClick={() => {
                                                            setReplyingTo(replyingTo === comment._id ? null : comment._id);
                                                            setReplyTargetUser(comment.user?.username);
                                                            setReplyContent('');
                                                        }}
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
                                            {canDelete(comment.user?._id) && (
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
                                            {replyTargetUser && (
                                                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                                    <CornerDownRight size={11} className="text-primary/50" />
                                                    <span className="text-[10px] italic text-gray-600">Đang trả lời</span>
                                                    <span className="text-[10px] font-bold text-primary/70">@{replyTargetUser}</span>
                                                </div>
                                            )}
                                            <textarea
                                                autoFocus
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                onInput={handleTyping}
                                                placeholder="Viết phản hồi..."
                                                className="w-full bg-transparent border-none p-0 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:ring-0 min-h-[60px] resize-none"
                                            />
                                            <div className="flex justify-end items-center gap-3 mt-2 pt-2 border-t border-white/5">
                                                <button 
                                                    onClick={() => { setReplyingTo(null); setReplyContent(''); setReplyTargetUser(null); }}
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
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h5 className="font-black uppercase text-[11px] italic tracking-tight text-gray-300">{reply.user?.username || 'Người dùng ẩn danh'}</h5>
                                                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{formatDate(reply.createdAt)}</span>
                                                            {user && (
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(comment._id);
                                                                        setReplyTargetUser(reply.user?.username);
                                                                        setReplyContent('');
                                                                    }}
                                                                    className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded transition-all ${
                                                                        replyingTo === comment._id
                                                                        ? 'text-primary/60'
                                                                        : 'text-gray-600 hover:text-primary'
                                                                    }`}
                                                                >
                                                                    Phản hồi
                                                                </button>
                                                            )}
                                                        </div>
                                                        {canDelete(reply.user?._id) && (
                                                            <button 
                                                                onClick={() => handleDelete(reply._id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-700 hover:text-red-500 transition-all"
                                                                title="Xóa phản hồi"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Reply-to label from saved data */}
                                                    <div className="flex items-center gap-1.5 text-[10px]">
                                                        <CornerDownRight size={12} className="text-primary/50" />
                                                        <span className="italic text-gray-600">Đang trả lời</span>
                                                        <span className="font-bold text-primary/70">@{reply.replyToUser || comment.user?.username || 'Ẩn danh'}</span>
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
