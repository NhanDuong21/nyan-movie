import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Heart, Film, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const MovieCard = ({ movie }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && movie?._id) {
            checkFavoriteStatus();
        }
    }, [user, movie?._id]);

    const checkFavoriteStatus = async () => {
        try {
            const res = await axiosClient.get(`/interactions/favorite/check/${movie._id}`);
            setIsFavorite(res.data.isFavorite);
        } catch (err) {
            console.error('Error checking favorite status', err);
        }
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const res = await axiosClient.post('/interactions/favorite', { movieId: movie._id });
            setIsFavorite(res.data.isFavorite);
        } catch (err) {
            console.error('Error toggling favorite', err);
        } finally {
            setLoading(false);
        }
    };

    if (!movie) return null;

    const posterUrl = movie.poster 
        ? (movie.poster.startsWith('http') ? movie.poster : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.poster}`)
        : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&fit=crop';

    const optimizedPosterUrl = optimizeCloudinaryUrl(posterUrl, 400);

    return (
        <Link to={`/movie/${movie.slug}`} className="group cursor-pointer block">
            <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden mb-4 shadow-2xl shadow-black/50 border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:border-primary/50 group-hover:shadow-[0_20px_50px_rgba(255,50,50,0.2)]">
                <img
                    src={optimizedPosterUrl}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&fit=crop'; }}
                />
                
                {/* Badge for episodes or info */}
                <div className="absolute top-4 left-4 bg-primary/90 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                    {movie.totalEpisodes > 1 ? (
                        <>
                            <span className="bg-white/20 px-1.5 rounded-md">{movie.totalEpisodes}</span> 
                            <span className="tracking-widest opacity-80 uppercase">TẬP</span>
                        </>
                    ) : (
                        <>
                            <Calendar size={12} className="opacity-80" /> 
                            <span className="tracking-widest uppercase">{(movie.year?.year || movie.year) || 'N/A'}</span>
                        </>
                    )}
                </div>

                <div 
                    onClick={handleToggleFavorite}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 z-10 ${
                        isFavorite ? 'text-primary' : 'text-white/50 hover:text-white'
                    }`}
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "animate-pulse" : ""} />
                    )}
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center scale-50 group-hover:scale-100 transition-all duration-500 shadow-[0_0_30px_rgba(255,50,50,0.6)]">
                        <Play size={28} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            </div>
            
            <div className="space-y-1.5 px-1">
                <h3 className="text-white text-base font-black truncate group-hover:text-primary transition-colors leading-tight uppercase italic tracking-tight">
                    {movie.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-gray-500 truncate max-w-[75%]">
                        {movie.genres && Array.isArray(movie.genres) 
                            ? movie.genres.map(g => g.name || g).slice(0, 2).join(' • ')
                            : (movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ')}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded-lg border border-yellow-500/10 shrink-0">
                        <Star size={10} fill="currentColor" /> {movie.ratingAverage ? movie.ratingAverage.toFixed(1) : '0.0'}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
