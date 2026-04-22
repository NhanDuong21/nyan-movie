import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const RatingWidget = ({ movieId, initialAverage = 0, initialCount = 0 }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [avg, setAvg] = useState(initialAverage);
    const [count, setCount] = useState(initialCount);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userVote, setUserVote] = useState(0);

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
        confirmText: 'OK',
        cancelText: null
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    // Update state if props change
    useEffect(() => {
        setAvg(initialAverage);
        setCount(initialCount);
    }, [initialAverage, initialCount]);

    const handleRate = async (score) => {
        if (!user) {
            setModal({
                isOpen: true,
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để đánh giá phim và trải nghiệm đầy đủ tính năng.',
                type: 'info',
                confirmText: 'Đăng nhập ngay',
                cancelText: 'Để sau',
                onConfirm: () => navigate('/login')
            });
            return;
        }

        if (user.role === 'admin' || user.is_root || user.email === 'sgoku4880@gmail.com') {
            setModal({
                isOpen: true,
                title: 'Quyền hạn chế',
                message: 'Quản trị viên và Root không thể tham gia đánh giá phim để đảm bảo tính khách quan.',
                type: 'warning',
                confirmText: 'Đã hiểu',
                cancelText: null,
                onConfirm: closeModal
            });
            return;
        }

        try {
            setLoading(true);
            const res = await axiosClient.post(`/movies/${movieId}/rate`, { score });
            if (res.data.success) {
                setAvg(res.data.data.ratingAverage);
                setCount(res.data.data.ratingCount);
                setUserVote(score);
            }
        } catch (err) {
            console.error('Error rating movie', err);
            setModal({
                isOpen: true,
                title: 'Lỗi đánh giá',
                message: err.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá của bạn. Vui lòng thử lại sau.',
                type: 'danger',
                confirmText: 'Thử lại',
                cancelText: null,
                onConfirm: closeModal
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                    {[...Array(10)].map((_, i) => {
                        const starValue = i + 1;
                        const isActive = (hover || userVote || Math.round(avg)) >= starValue;
                        
                        return (
                            <button
                                key={i}
                                type="button"
                                className={`transition-all duration-200 transform ${!loading && 'hover:scale-125'} disabled:cursor-not-allowed`}
                                onMouseEnter={() => !loading && setHover(starValue)}
                                onMouseLeave={() => !loading && setHover(0)}
                                onClick={() => handleRate(starValue)}
                                disabled={loading}
                            >
                                <Star
                                    size={20}
                                    className={`${
                                        isActive 
                                        ? 'text-yellow-400 fill-yellow-400' 
                                        : 'text-gray-600'
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>
                {loading && <Loader2 size={16} className="animate-spin text-primary" />}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                <span className="flex items-center gap-1">
                    <Star size={14} fill="currentColor" className="text-yellow-500" />
                    <span className="text-white text-sm">{avg.toFixed(1)}</span>
                </span>
                <span className="text-gray-600">/</span>
                <span>{count} đánh giá</span>
                {userVote > 0 && (
                    <span className="ml-2 text-primary text-[10px] lowercase italic font-normal">
                        (Bạn đã đánh giá {userVote} sao)
                    </span>
                )}
            </div>

            <ConfirmModal 
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
            />
        </div>
    );
};

export default RatingWidget;
