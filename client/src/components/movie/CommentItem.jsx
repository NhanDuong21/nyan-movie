import { useState } from 'react';
import { Trash2, UserCircle, Send, Loader2, CornerDownRight } from 'lucide-react';
import ReplyItem from './ReplyItem';

const CommentItem = ({ 
    comment, 
    replies, 
    user, 
    formatDate, 
    getAvatarUrl, 
    canDelete, 
    handleDelete, 
    onSubmitReply,
    replyingTo,
    setReplyingTo,
    replyTargetUser,
    setReplyTargetUser,
    replyContent,
    setReplyContent,
    handleTyping,
    submitting
}) => {
    const [showAllReplies, setShowAllReplies] = useState(false);
    const hasMoreReplies = replies.length > 1;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Root Comment Card */}
            <div className="flex gap-4 group">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-dark-lighter flex items-center justify-center shadow-lg">
                    {comment.user?.avatar ? (
                        <img 
                            src={getAvatarUrl(comment.user.avatar)} 
                            alt={comment.user.username} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <UserCircle size={28} className="text-gray-500" />
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h5 className="font-black uppercase text-sm italic tracking-tight">
                                {comment.user?.username || 'Người dùng ẩn danh'}
                            </h5>
                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {formatDate(comment.createdAt)}
                            </span>
                            
                            {user && (
                                <button 
                                    onClick={() => {
                                        const isAlreadyReplying = replyingTo === comment.id;
                                        setReplyingTo(isAlreadyReplying ? null : comment.id);
                                        setReplyTargetUser(comment.user?.username);
                                        setReplyContent('');
                                    }}
                                    className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md transition-all ${
                                        replyingTo === comment.id 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-primary hover:bg-primary/10'
                                    }`}
                                >
                                    {replyingTo === comment.id ? 'Đang phản hồi' : 'Phản hồi'}
                                </button>
                            )}
                        </div>
                        {canDelete(comment.user?.id) && (
                            <button 
                                onClick={() => handleDelete(comment.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                aria-label="Xóa bình luận"
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
            {replyingTo === comment.id && (
                <div className="ml-16 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-[#111] p-4 rounded-2xl border border-primary/20 ring-1 ring-primary/5">
                        {replyTargetUser && (
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                <CornerDownRight size={11} className="text-primary/50" />
                                <span className="text-[10px] italic text-gray-400">Đang trả lời</span>
                                <span className="text-[10px] font-bold text-primary/70">@{replyTargetUser}</span>
                            </div>
                        )}
                        <textarea
                            autoFocus
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onInput={handleTyping}
                            placeholder="Viết phản hồi..."
                            className="w-full bg-transparent border-none p-0 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 min-h-[60px] resize-none"
                        />
                        <div className="flex justify-end items-center gap-3 mt-2 pt-2 border-t border-white/5">
                            <button 
                                onClick={() => { setReplyingTo(null); setReplyContent(''); setReplyTargetUser(null); }}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={(e) => onSubmitReply(e, comment.id)}
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

            {/* Nested Replies Rendering with Collapse/Expand Logic */}
            {replies.length > 0 && (
                <div className="ml-16 space-y-4 border-l-2 border-white/5 pl-4">
                    {replies
                        .slice(0, showAllReplies ? replies.length : 1)
                        .map(reply => (
                            <ReplyItem 
                                key={reply.id} 
                                reply={reply}
                                rootCommentId={comment.id}
                                user={user}
                                formatDate={formatDate}
                                getAvatarUrl={getAvatarUrl}
                                canDelete={canDelete}
                                handleDelete={handleDelete}
                                onReply={(username) => {
                                    setReplyingTo(comment.id);
                                    setReplyTargetUser(username);
                                    setReplyContent('');
                                }}
                            />
                        ))
                    }
                    
                    {hasMoreReplies && (
                        <button 
                            onClick={() => setShowAllReplies(!showAllReplies)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all flex items-center gap-2 mt-2 bg-primary/5 hover:bg-primary/20 px-3 py-1 rounded-full border border-primary/10"
                        >
                            {showAllReplies 
                                ? "Thu gọn phản hồi" 
                                : `Xem thêm ${replies.length - 1} phản hồi`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
