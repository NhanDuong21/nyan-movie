import { Trash2, UserCircle, CornerDownRight } from 'lucide-react';

const ReplyItem = ({ 
    reply, 
    rootCommentId, 
    user, 
    formatDate, 
    getAvatarUrl, 
    canDelete, 
    handleDelete, 
    onReply 
}) => {
    return (
        <div className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-dark-lighter flex items-center justify-center shadow-lg">
                {reply.user?.avatar ? (
                    <img 
                        src={getAvatarUrl(reply.user.avatar)} 
                        alt={reply.user.username} 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <UserCircle size={18} className="text-gray-400" />
                )}
            </div>
            <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-black uppercase text-[11px] italic tracking-tight text-gray-300">
                            {reply.user?.username || 'Người dùng ẩn danh'}
                        </h5>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {formatDate(reply.createdAt)}
                        </span>
                        {user && (
                            <button
                                onClick={() => onReply(reply.user?.username)}
                                className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded transition-all text-gray-400 hover:text-primary"
                            >
                                Phản hồi
                            </button>
                        )}
                    </div>
                    {canDelete(reply.user?.id) && (
                        <button 
                            onClick={() => handleDelete(reply.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            aria-label="Xóa phản hồi"
                            title="Xóa phản hồi"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
                {/* Reply-to label */}
                <div className="flex items-center gap-1.5 text-[10px]">
                    <CornerDownRight size={12} className="text-primary/50" />
                    <span className="italic text-gray-400">Đang trả lời</span>
                    <span className="font-bold text-primary/70">
                        @{reply.replyToUser || 'Ẩn danh'}
                    </span>
                </div>
                <div className="bg-white/[0.015] p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        {reply.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;
