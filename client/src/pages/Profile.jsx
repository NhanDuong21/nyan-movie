import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { 
    User, 
    Mail, 
    Camera, 
    CheckCircle, 
    Loader2, 
    AlertCircle,
    Shield
} from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatar(res.data.url);
            setMessage({ type: 'success', text: 'Ảnh đại diện đã được tải lên!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi tải ảnh' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axiosClient.put('/users/profile', { username, avatar });
            // Update context
            setUser(res.data.user);
            setMessage({ type: 'success', text: 'Thông tin cá nhân đã được cập nhật!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi cập nhật thông tin' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-16 animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        Trang <span className="text-primary italic">Cá Nhân</span>
                    </h1>
                    <p className="text-gray-500 mt-2 uppercase font-bold tracking-widest text-xs">Quản lý danh tính và thông tin tài khoản</p>
                </header>

                <div className="bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    {/* Header Decorative Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-orange-500"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-primary transition-all duration-500 shadow-2xl bg-dark-lighter flex items-center justify-center">
                                    {isUploading ? (
                                        <Loader2 size={32} className="animate-spin text-primary" />
                                    ) : avatar ? (
                                        <img 
                                            src={avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <User size={48} className="text-gray-600" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg border-4 border-dark-card transition-all active:scale-90"
                                >
                                    <Camera size={18} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarUpload} 
                                    className="hidden" 
                                    accept="image/*" 
                                />
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-white tracking-tight">{user.username}</h2>
                                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{user.role}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* Email (Read-only) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Địa chỉ Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                    <input
                                        disabled
                                        type="email"
                                        className="w-full bg-dark/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-500 cursor-not-allowed italic"
                                        value={user.email}
                                    />
                                    <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" size={16} />
                                </div>
                            </div>

                            {/* Username (Editable) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Tên hiển thị</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-dark border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-700"
                                        placeholder="Nhập tên mới của bạn..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {message.text && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in zoom-in duration-300 ${
                                message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                            }`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <span className="text-sm font-bold uppercase tracking-wide">{message.text}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                                    LƯU THAY ĐỔI
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
