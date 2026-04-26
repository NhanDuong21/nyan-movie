import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Xác nhận', 
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?', 
    type = 'danger', // danger, warning, info
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
}) => {
    // Block background scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const icons = {
        danger: <AlertTriangle className="text-red-500" size={32} />,
        warning: <AlertCircle className="text-orange-500" size={32} />,
        info: <Info className="text-blue-500" size={32} />
    };

    const confirmButtonStyles = {
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
        warning: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            {/* Modal Content */}
            <div 
                className="relative w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col animate-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                        type === 'danger' ? 'bg-red-500/10 border-red-500/20' : 
                        type === 'warning' ? 'bg-orange-500/10 border-orange-500/20' : 
                        'bg-blue-500/10 border-blue-500/20'
                    }`}>
                        {icons[type]}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                            {title}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full mt-2">
                        {cancelText && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`${cancelText ? 'flex-1' : 'w-full'} px-6 py-3.5 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 ${confirmButtonStyles[type]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
                    aria-label="Đóng hộp thoại"
                >
                    <X size={24} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
