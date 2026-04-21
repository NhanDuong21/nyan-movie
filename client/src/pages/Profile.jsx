import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { 
    User, 
    Mail, 
    Camera, 
    CheckCircle, 
    Loader2, 
    AlertCircle,
    Shield,
    Lock,
    Calendar,
    Key,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [passMessage, setPassMessage] = useState({ type: '', text: '' });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const fileInputRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const passwordStrength = useMemo(() => {
        let score = 0;
        if (!newPassword) return null;
        if (newPassword.length >= 6) score += 1;
        if (newPassword.length >= 10) score += 1;
        if (/[A-Z]/.test(newPassword)) score += 1;
        if (/[0-9]/.test(newPassword)) score += 1;
        if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

        if (score <= 2) return { label: 'Yếu', color: 'bg-red-500', width: '25%' };
        if (score === 3) return { label: 'Trung bình', color: 'bg-orange-500', width: '50%' };
        if (score === 4) return { label: 'Mạnh', color: 'bg-yellow-500', width: '75%' };
        return { label: 'Rất mạnh', color: 'bg-green-500', width: '100%' };
    }, [newPassword]);

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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axiosClient.put('/users/profile', { username, avatar });
            setUser(res.data.user);
            setMessage({ type: 'success', text: 'Thông tin cá nhân đã được cập nhật!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi cập nhật thông tin' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            return setPassMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }
        if (newPassword !== confirmPassword) {
            return setPassMessage({ type: 'error', text: 'Mật khẩu mới không trùng khớp' });
        }

        setIsChangingPass(true);
        setPassMessage({ type: '', text: '' });

        try {
            await axiosClient.put('/users/change-password', { oldPassword, newPassword });
            setPassMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPassMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi đổi mật khẩu' });
        } finally {
            setIsChangingPass(false);
        }
    };

    const togglePass = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-12 animate-in fade-in duration-700">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                    Trung tâm <span className="text-primary italic">Cá Nhân</span>
                </h1>
                <p className="text-gray-500 mt-2 uppercase font-bold tracking-widest text-xs">Quản lý bảo mật và thông tin tài khoản</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* LEFT COLUMN: Profile Info */}
                <div className="bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative h-full">
                    <div className="h-2 w-full bg-primary"></div>
                    <div className="p-8 md:p-10 flex-1 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-primary transition-all duration-500 shadow-xl bg-dark-lighter flex items-center justify-center">
                                    {isUploading ? (
                                        <Loader2 size={24} className="animate-spin text-primary" />
                                    ) : avatar ? (
                                        <img 
                                            src={avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <User size={32} className="text-gray-600" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg border-2 border-dark-card transition-all active:scale-90"
                                >
                                    <Camera size={14} />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white leading-tight uppercase italic">{username || user.username}</h2>
                                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{user.role}</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                        <User size={10} /> Tên hiển thị
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary transition-all"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                        <Mail size={10} /> Email (Cố định)
                                    </label>
                                    <input
                                        disabled
                                        type="email"
                                        className="w-full bg-dark/40 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-gray-500 cursor-not-allowed italic"
                                        value={user.email}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                        <Calendar size={10} /> Ngày tham gia
                                    </label>
                                    <div className="px-4 py-3.5 bg-dark/20 border border-white/5 rounded-xl text-xs text-gray-400">
                                        {formatDate(user.createdAt)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                        <RefreshCw size={10} /> Cập nhật lần cuối
                                    </label>
                                    <div className="px-4 py-3.5 bg-dark/20 border border-white/5 rounded-xl text-xs text-gray-400">
                                        {formatDate(user.updatedAt)}
                                    </div>
                                </div>
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide animate-in slide-in-from-top-2 duration-300 ${
                                    message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'
                                }`}>
                                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Cập nhật thông tin"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Change Password */}
                <div className="bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full ring-1 ring-primary/20">
                    <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-primary"></div>
                    <div className="p-8 md:p-10 flex-1 flex flex-col justify-center space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-lg shadow-primary/5">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Đổi mật khẩu</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tăng cường bảo mật tài khoản</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Mật khẩu hiện tại</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            required
                                            type={showPasswords.old ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-12 py-4 text-sm text-white focus:border-primary transition-all"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => togglePass('old')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                        >
                                            {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Mật khẩu mới</label>
                                        {passwordStrength && (
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                                Độ mạnh: {passwordStrength.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            required
                                            type={showPasswords.new ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-12 py-4 text-sm text-white focus:border-primary transition-all"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => togglePass('new')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                        >
                                            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {/* Strength Meter Bar */}
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                                        <div 
                                            className={`h-full transition-all duration-500 ${passwordStrength?.color || ''}`}
                                            style={{ width: passwordStrength?.width || '0%' }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Xác nhận mật khẩu mới</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            required
                                            type={showPasswords.confirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-12 py-4 text-sm text-white focus:border-primary transition-all"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => togglePass('confirm')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {passMessage.text && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide animate-in zoom-in duration-300 ${
                                    passMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'
                                }`}>
                                    {passMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {passMessage.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChangingPass}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                            >
                                {isChangingPass ? <Loader2 className="animate-spin" size={20} /> : "Cập nhật mật khẩu"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
