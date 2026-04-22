import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await axiosClient.post('/auth/forgot-password', { email });
            setMessage(res.data.message || 'Link khôi phục đã được gửi đến email của bạn.');
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
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
                        <Mail size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Quên <span className="text-primary italic">Mật khẩu?</span></h2>
                    <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest">Đừng lo, chúng tôi sẽ giúp bạn lấy lại tài khoản</p>
                </div>

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <CheckCircle2 size={20} className="shrink-0" />
                        <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ShieldAlert size={20} className="shrink-0" />
                        <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">{error}</p>
                    </div>
                )}

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Email đã đăng ký</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-dark border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all tracking-wide"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-3xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Gửi link khôi phục'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-400 text-sm italic mb-6">Bạn chưa nhận được email? Kiểm tra cả hòm thư Spam nhé.</p>
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline transition-all"
                        >
                            Thử lại với email khác
                        </button>
                    </div>
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

export default ForgotPassword;
