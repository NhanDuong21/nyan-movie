import { Link } from 'react-router-dom';
import { Play, Star, Calendar, Bookmark } from 'lucide-react';

const MovieCard = ({ movie }) => {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border border-white/5 transition-transform duration-300 group-hover:-translate-y-2 group-hover:border-primary/50 group-hover:shadow-primary/10">
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                
                {/* Badge for episodes or info */}
                <div className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm flex items-center gap-1">
                    {movie.episodeCount ? (
                        <><span>{movie.episodeCount}</span> <span className="font-light opacity-80 text-[8px]">TẬP</span></>
                    ) : (
                        <><Calendar size={10} /> {movie.year}</>
                    )}
                </div>

                <div className="absolute top-3 right-3 text-white/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    <Bookmark size={18} />
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-primary/40">
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            </div>
            
            <h3 className="text-white text-sm font-semibold truncate group-hover:text-primary transition-colors leading-tight">
                {movie.title}
            </h3>
            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-gray-500 uppercase tracking-tighter truncate max-w-[70%]">
                    {movie.genres.join(' • ')}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-bold">
                    <Star size={10} fill="currentColor" /> 8.5
                </span>
            </div>
        </div>
    );
};

export default MovieCard;
