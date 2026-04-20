import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import MovieCard from '../components/MovieCard';
import { Loader2, Play, Info, ChevronRight, Star, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMovies = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosClient.get('/movies?limit=20');
            console.log("Fetched movies:", res.data);
            
            // Handle different possible response structures
            const movieData = res.data.data || res.data;
            if (Array.isArray(movieData)) {
                setMovies(movieData);
            } else {
                console.error("Data received is not an array:", movieData);
                setMovies([]);
            }
        } catch (err) {
            console.error('Failed to fetch movies', err);
            setError("Không thể kết nối với máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const heroMovie = useMemo(() => {
        if (!movies || movies.length === 0) return null;
        return movies.find(m => m.backdrop) || movies[0];
    }, [movies]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <div className="relative">
                <Loader2 className="animate-spin text-primary" size={64} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full blur-xl"></div>
                </div>
            </div>
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-[10px] animate-pulse">Đang tải trải nghiệm...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20">
                <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase italic">Ối! Đã có lỗi xảy ra</h2>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">{error}</p>
            </div>
            <button 
                onClick={fetchMovies}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/5"
            >
                THỬ LẠI
            </button>
        </div>
    );

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Banner */}
            {heroMovie ? (
                <section className="relative h-[85vh] -mt-24 group overflow-hidden">
                    {/* Background with Zoom Effect */}
                    <div className="absolute inset-0">
                        <img 
                            src={heroMovie.backdrop ? `http://localhost:5000${heroMovie.backdrop}` : `http://localhost:5000${heroMovie.poster}`}
                            alt={heroMovie.title}
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-out"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1400&fit=crop'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col justify-center gap-6 pt-20">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 shadow-lg shadow-primary/20">POPULAR</span>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold text-white">8.5</span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black text-white max-w-3xl leading-[1.1] uppercase italic tracking-tighter">
                            {heroMovie.title}
                        </h1>

                        <p className="text-gray-300 text-lg md:text-xl max-w-2xl line-clamp-3 leading-relaxed font-medium">
                            {heroMovie.description || "Nội dung phim đang được cập nhật..."}
                        </p>

                        <div className="flex items-center gap-4 flex-wrap mt-4">
                            <Link 
                                to={`/movie/${heroMovie.slug}`}
                                className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl shadow-primary/40 active:scale-95 text-lg"
                            >
                                <Play size={24} fill="white" />
                                XEM NGAY
                            </Link>
                            <Link 
                                to={`/movie/${heroMovie.slug}`}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 border border-white/10 active:scale-95 text-lg"
                            >
                                <Info size={24} />
                                CHI TIẾT
                            </Link>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="h-24"></div> // Spacer when no hero
            )}

            {/* Movie Sections */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 space-y-16">
                {/* Hot Movies Section */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <header className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(255,50,50,0.5)]"></div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">PHIM MỚI CẬP NHẬT</h2>
                                <p className="text-gray-500 text-[10px] mt-1 font-black tracking-widest uppercase opacity-60">LATEST RELEASES</p>
                            </div>
                        </header>
                        <Link to="/movies" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] group">
                            Xem tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {movies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
                            {movies.map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 bg-white/2 rounded-[40px] border border-dashed border-white/5 flex flex-col items-center justify-center gap-6 text-center px-6">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                                <Play size={40} opacity={0.2} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-400 uppercase tracking-tight italic">Danh sách trống</h3>
                                <p className="text-gray-600 max-w-sm text-sm font-medium">Hiện tại chưa có bộ phim nào được cập nhật. Vui lòng quay lại sau!</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;
