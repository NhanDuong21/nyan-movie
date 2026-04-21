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

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-dark-card border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
                <div className={`h-2 w-full ${type === 'danger' ? 'bg-red-600' : type === 'warning' ? 'bg-orange-500' : 'bg-blue-600'}`}></div>
                
                <div className="p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
                            type === 'danger' ? 'bg-red-500/10 border-red-500/20' : 
                            type === 'warning' ? 'bg-orange-500/10 border-orange-500/20' : 
                            'bg-blue-500/10 border-blue-500/20'
                        }`}>
                            {icons[type]}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full mt-2">
                            {cancelText && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all active:scale-95"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`${cancelText ? 'flex-1' : 'w-full'} px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 ${confirmButtonStyles[type]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
