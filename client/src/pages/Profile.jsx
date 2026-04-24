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
    EyeOff,
    Monitor,
    Smartphone,
    Globe,
    Clock,
    MapPin
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

    const getDeviceInfo = (ua) => {
        if (!ua) return { name: 'Thiết bị lạ', icon: <Globe size={18} /> };
        if (ua.includes('Mobi')) return { name: 'Mobile Device', icon: <Smartphone size={18} /> };
        if (ua.includes('Windows')) return { name: 'Windows PC', icon: <Monitor size={18} /> };
        if (ua.includes('Macintosh')) return { name: 'MacBook', icon: <Monitor size={18} /> };
        return { name: 'Desktop PC', icon: <Monitor size={18} /> };
    };

    const parseBrowser = (ua) => {
        if (!ua) return 'Unknown Browser';
        if (ua.includes('Chrome')) return 'Google Chrome';
        if (ua.includes('Firefox')) return 'Mozilla Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Apple Safari';
        if (ua.includes('Edge')) return 'Microsoft Edge';
        return 'Web Browser';
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

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                                src={avatar.startsWith('http') ? avatar : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${avatar}`} 
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
                                <div className="flex-1">
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
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center justify-between">
                                            <span className="flex items-center gap-2"><Mail size={10} /> Email (Cố định)</span>
                                            {user.authProvider === 'google' && (
                                                <span className="text-[9px] text-primary flex items-center gap-1">
                                                    <Globe size={10} /> ĐÃ LIÊN KẾT GOOGLE
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                disabled
                                                type="email"
                                                className="w-full bg-dark/40 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-gray-500 cursor-not-allowed italic"
                                                value={user.email}
                                            />
                                            {user.authProvider === 'google' && (
                                                <img 
                                                    src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" 
                                                    alt="Google" 
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 grayscale"
                                                />
                                            )}
                                        </div>
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

                            {user.authProvider === 'google' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center">
                                        <img 
                                            src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" 
                                            alt="Google" 
                                            className="w-10 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2 max-w-[280px]">
                                        <h3 className="text-lg font-black text-white uppercase italic">Đăng nhập bằng Google</h3>
                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                            Bạn đang sử dụng tài khoản Google để đăng nhập. Mật khẩu và bảo mật được quản lý trực tiếp bởi Google.
                                        </p>
                                    </div>
                                    <a 
                                        href="https://myaccount.google.com/security" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Quản lý tài khoản Google <Globe size={14} />
                                    </a>
                                </div>
                            ) : (
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
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                                >
                                                    {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between pl-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mật khẩu mới</label>
                                                {passwordStrength && (
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                                        {passwordStrength.label}
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
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                                >
                                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {passwordStrength && (
                                                <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                                                    <div 
                                                        className={`h-full ${passwordStrength.color} transition-all duration-500`}
                                                        style={{ width: passwordStrength.width }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Xác nhận mật khẩu</label>
                                            <div className="relative group">
                                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
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
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {passMessage.text && (
                                        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide animate-in slide-in-from-top-2 duration-300 ${
                                            passMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'
                                        }`}>
                                            {passMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            {passMessage.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isChangingPass}
                                        className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isChangingPass ? <Loader2 className="animate-spin" size={18} /> : "Thay đổi mật khẩu"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Login History */}
                <div className="bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <div className="p-8 md:p-10 space-y-8">
                        <header className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 border border-white/5">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Kiểm soát truy cập</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lịch sử đăng nhập và bảo mật thiết bị</p>
                            </div>
                        </header>

                        {!user.loginHistory || user.loginHistory.length === 0 ? (
                            <div className="py-12 text-center bg-dark/20 rounded-3xl border border-white/5 border-dashed">
                                <Globe size={40} className="mx-auto text-gray-700 mb-3 opacity-20" />
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chưa có bản ghi hoạt động nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...user.loginHistory].reverse().map((history, index) => {
                                    const deviceInfo = getDeviceInfo(history.userAgent);
                                    return (
                                        <div key={index} className="bg-dark/40 border border-white/10 p-6 rounded-3xl flex flex-col gap-5 hover:border-primary/30 transition-all group relative overflow-hidden">
                                            {/* Header Row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                        {deviceInfo.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">Device: {deviceInfo.name}</h4>
                                                        {index === 0 && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full ring-1 ring-green-500/20">Now</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Rows */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Globe size={14} className="shrink-0" />
                                                    <div className="text-[11px] font-bold uppercase tracking-wide flex-1">
                                                        Browser: <span className="text-white italic">{parseBrowser(history.userAgent)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <MapPin size={14} className="shrink-0" />
                                                    <div className="text-[11px] font-bold uppercase tracking-wide flex-1">
                                                        Location: <span className="text-white italic">{history.location || 'Unknown Location'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Clock size={14} className="shrink-0" />
                                                    <div className="text-[11px] font-bold uppercase tracking-wide flex-1">
                                                        Time: <span className="text-white italic">{formatDate(history.time)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* IP Badge at bottom */}
                                            <div className="mt-2 pt-4 border-t border-white/5">
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">IP Address: {history.ip || '0.0.0.0'}</span>
                                            </div>

                                            {/* Subtle background glow */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
