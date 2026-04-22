import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Lock, Loader2, CheckCircle2, ShieldAlert, Key, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }
        if (password.length < 6) {
            return setError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        setLoading(true);
        setError('');

        try {
            await axiosClient.put(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
            <div className="max-w-md w-full p-8 bg-dark-card rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/10 shadow-lg shadow-primary/5">
                        <Key size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Đặt lại <span className="text-primary italic">Mật khẩu</span></h2>
                    <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest">Thiết lập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                {success ? (
                    <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-5 py-6 rounded-3xl flex flex-col items-center gap-4">
                            <CheckCircle2 size={48} />
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-[0.1em]">Thành công!</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Mật khẩu đã được thay đổi. Đang chuyển hướng...</p>
                            </div>
                        </div>
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:underline transition-all"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <ShieldAlert size={20} className="shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-wide leading-relaxed">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Mật khẩu mới</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-dark border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all tracking-widest"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-dark border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all tracking-widest"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-3xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Cập nhật mật khẩu'}
                            </button>
                        </form>
                    </>
                )}

                <div className="mt-10 pt-8 border-t border-white/5 flex justify-center">
                    <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
