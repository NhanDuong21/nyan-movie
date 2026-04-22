import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const RatingWidget = ({ movieId, initialAverage = 0, initialCount = 0 }) => {
    const { user } = useAuth();
    const [avg, setAvg] = useState(initialAverage);
    const [count, setCount] = useState(initialCount);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userVote, setUserVote] = useState(0);

    // Update state if props change
    useEffect(() => {
        setAvg(initialAverage);
        setCount(initialCount);
    }, [initialAverage, initialCount]);

    const handleRate = async (score) => {
        if (!user) {
            alert('Vui lòng đăng nhập để đánh giá phim.');
            return;
        }

        if (user.role === 'admin' || user.is_root || user.email === 'sgoku4880@gmail.com') {
            alert('Quản trị viên không thể đánh giá phim.');
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
            alert(err.response?.data?.message || 'Đã xảy ra lỗi khi đánh giá.');
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
        </div>
    );
};

export default RatingWidget;
