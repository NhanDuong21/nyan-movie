import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { 
    Play, 
    Loader2, 
    Star, 
    Calendar, 
    Globe, 
    Clock, 
    ChevronRight,
    Share2,
    Heart,
    Tv
} from 'lucide-react';
import CommentSection from '../components/movie/CommentSection';
import RatingWidget from '../components/movie/RatingWidget';

const MovieDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recsLoading, setRecsLoading] = useState(false);

    useEffect(() => {
        const fetchMovie = async () => {
        setLoading(true);
        setError(null);
        try {
                const res = await axiosClient.get(`/movies/slug/${slug}`);
                setMovie(res.data.data);
                if (res.data.data.episodes?.length > 0) {
                    setSelectedEpisode(res.data.data.episodes[0]);
                }
                
                // If logged in, check favorite status
                if (user && res.data.data._id) {
                    const favRes = await axiosClient.get(`/interactions/favorite/check/${res.data.data._id}`);
                    setIsFavorite(favRes.data.isFavorite);
                }
            } catch (err) {
                console.error('Failed to fetch movie details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
        window.scrollTo(0, 0);
    }, [slug, user]);

    // Fetch recommendations whenever the movie ID is available
    useEffect(() => {
        if (!movie?._id) return;
        const fetchRecs = async () => {
            setRecsLoading(true);
            try {
                const res = await axiosClient.get(`/movies/${movie._id}/recommendations`);
                setRecommendations(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch recommendations', err);
            } finally {
                setRecsLoading(false);
            }
        };
        fetchRecs();
    }, [movie?._id]);

    const handleToggleFavorite = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setFavLoading(true);
            const res = await axiosClient.post('/interactions/favorite', { movieId: movie._id });
            setIsFavorite(res.data.isFavorite);
        } catch (err) {
            console.error('Error toggling favorite', err);
        } finally {
            setFavLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Đang tải phim...</p>
        </div>
    );

    if (!movie) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <h2 className="text-4xl font-black text-white uppercase italic">Không tìm thấy phim</h2>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest">Quay lại trang chủ</Link>
        </div>
    );

    return (
        <div className="pb-20 text-white">
            {/* Backdrop Section */}
            <section className="relative h-[65vh] md:h-[80vh] group">
                <div className="absolute inset-0">
                    <img 
                        src={(movie.backdrop || movie.poster)?.startsWith('http') ? (movie.backdrop || movie.poster) : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.backdrop || movie.poster}`} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-transparent to-transparent"></div>
                </div>

                <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-12 gap-8">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-8">
                        {/* Poster Over Backdrop (Mobile: hidden or small) */}
                        <div className="hidden md:block w-64 aspect-[2/3] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl shadow-black/50 shrink-0 transform -translate-y-4">
                            <img 
                                src={movie.poster?.startsWith('http') ? movie.poster : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.poster}`} 
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    {movie.type === 'series' ? 'PHIM BỘ' : 'PHIM LẺ'}
                                </span>
                                {movie.genres?.map(g => (
                                    <span key={g._id} className="text-gray-400 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
                                        {g.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">{movie.title}</h1>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-gray-400">
                                <RatingWidget 
                                    movieId={movie._id} 
                                    initialAverage={movie.ratingAverage || 0} 
                                    initialCount={movie.ratingCount || 0} 
                                />
                                <div className="flex items-center gap-2 pt-1"><Calendar size={16} /> {movie.year?.year}</div>
                                <div className="flex items-center gap-2 pt-1"><Clock size={16} /> {movie.duration} min</div>
                                <div className="flex items-center gap-2 pt-1"><Globe size={16} /> {movie.country?.name}</div>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                                {movie.episodes?.length > 0 ? (
                                    <Link 
                                        to={`/watch/${movie.slug}/${movie.episodes[0]._id}`}
                                        className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl shadow-primary/40 active:scale-95 text-lg"
                                    >
                                        <Play size={24} fill="currentColor" />
                                    XEM NGAY
                                </Link>
                            ) : (
                                <button 
                                    disabled
                                    className="bg-gray-700 text-gray-500 px-10 py-4 rounded-2xl font-black flex items-center gap-3 cursor-not-allowed text-lg"
                                >
                                    <Play size={24} fill="currentColor" />
                                    CHƯA CÓ TẬP
                                </button>
                            )}
                            <button 
                                onClick={handleToggleFavorite}
                                disabled={favLoading}
                                className={`w-14 h-14 rounded-2xl backdrop-blur-md flex items-center justify-center border transition-all active:scale-90 shadow-lg ${
                                    isFavorite 
                                    ? 'bg-primary/20 border-primary/30 text-primary shadow-primary/10' 
                                    : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                {favLoading ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : (
                                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "animate-pulse" : ""} />
                                )}
                            </button>
                            <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all active:scale-90 shadow-lg">
                                <Share2 size={24} />
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Body */}
            <main className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left Side: Info & Episodes */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-4">
                        <header className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-xl font-black uppercase italic tracking-widest">Nội dung phim</h2>
                        </header>
                        <p className="text-gray-400 leading-relaxed text-lg font-medium">
                            {movie.description}
                        </p>

                        {/* Additional Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 pt-6 border-t border-white/5 text-sm uppercase tracking-widest font-black italic">
                            {(movie.director || movie.actors || movie.language) && (
                                <>
                                    {movie.director && (
                                        <div className="space-y-1">
                                            <span className="text-gray-600 block">Đạo diễn</span>
                                            <span className="text-gray-300">{movie.director}</span>
                                        </div>
                                    )}
                                    {movie.actors && (
                                        <div className="space-y-1">
                                            <span className="text-gray-600 block">Diễn viên</span>
                                            <span className="text-gray-300">{movie.actors}</span>
                                        </div>
                                    )}
                                    {movie.language && (
                                        <div className="space-y-1">
                                            <span className="text-gray-600 block">Ngôn ngữ</span>
                                            <span className="text-gray-300">{movie.language}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {movie.type !== 'single' && (
                            <section className="space-y-6">
                                <header className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                                        <h2 className="text-xl font-black uppercase italic tracking-widest">Danh sách tập</h2>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{movie.episodes?.length} TẬP</span>
                                </header>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {movie.episodes?.length > 0 ? (
                                        movie.episodes.map((ep) => (
                                            <Link 
                                                key={ep._id}
                                                to={`/watch/${movie.slug}/${ep._id}`}
                                                className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${
                                                    selectedEpisode?._id === ep._id 
                                                    ? 'border-primary ring-2 ring-primary/20' 
                                                    : 'border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="absolute inset-0 bg-white/2 flex items-center justify-center group-hover:bg-white/5 transition-all">
                                                    <Play size={20} className={selectedEpisode?._id === ep._id ? 'text-primary' : 'text-white/20 group-hover:text-white'} fill="currentColor" />
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <span className="text-[10px] font-black tracking-widest uppercase">{ep.name}</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 bg-white/2 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3 text-gray-500">
                                            <Tv size={32} opacity={0.2} />
                                            <p className="text-xs font-bold uppercase tracking-widest">Đang cập nhật tập mới...</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </section>

                    {/* Comment System Integration */}
                    <CommentSection movieId={movie._id} />
                </div>

                {/* Right Side: Recommendations */}
                <div className="space-y-8">
                    <header className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-xl font-black uppercase italic tracking-widest">Đề xuất cho bạn</h2>
                    </header>
                    <div className="space-y-4">
                        {recsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-primary" size={28} />
                            </div>
                        ) : recommendations.length > 0 ? (
                            recommendations.map(rec => {
                                const posterUrl = rec.poster?.startsWith('http')
                                    ? rec.poster
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${rec.poster}`;
                                return (
                                    <Link
                                        key={rec._id}
                                        to={`/movie/${rec.slug}`}
                                        className="flex gap-4 p-3 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                                    >
                                        <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                            <img
                                                src={posterUrl}
                                                alt={rec.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80x112?text=N/A'; }}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center gap-2 min-w-0">
                                            <h4 className="font-bold uppercase tracking-tight line-clamp-2 group-hover:text-primary transition-colors text-sm leading-tight">{rec.title}</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {(rec.genres || []).slice(0, 2).map(g => (
                                                    <span key={g._id} className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded">{g.name}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase">
                                                <span className="flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" className="text-yellow-500" />
                                                    {rec.ratingAverage ? rec.ratingAverage.toFixed(1) : '0.0'}
                                                </span>
                                                {rec.year?.year && <span>{rec.year.year}</span>}
                                            </div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                                Xem ngay <ChevronRight size={12} />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest text-center py-8">Không có gợi ý phù hợp.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MovieDetail;
