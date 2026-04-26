import { useState, useEffect, useMemo, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import MovieCard from '../components/MovieCard';
import { 
    Loader2, Play, Info, ChevronRight, ChevronLeft, 
    Star, Clock, AlertCircle, Activity 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const Home = () => {
    const [latestMovies, setLatestMovies] = useState([]);
    const [seriesMovies, setSeriesMovies] = useState([]);
    const [singleMovies, setSingleMovies] = useState([]);
    const [cinemaMovies, setCinemaMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [latestRes, seriesRes, singleRes, cinemaRes] = await Promise.all([
                axiosClient.get('/movies?recent=14&limit=20'),
                axiosClient.get('/movies?type=series&limit=20'),
                axiosClient.get('/movies?type=single&limit=8'),
                axiosClient.get('/movies?type=chieurap&limit=8')
            ]);
            
            setLatestMovies(latestRes.data.data || []);
            setSeriesMovies(seriesRes.data.data || []);
            setSingleMovies(singleRes.data.data || []);
            setCinemaMovies(cinemaRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch home data', err);
            setError("Không thể kết nối với máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        window.scrollTo(0, 0);
    }, []);


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
                onClick={fetchAllData}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/5"
            >
                THỬ LẠI
            </button>
        </div>
    );

    const MovieSection = ({ title, subtitle, movies, viewAllLink, layout = "default" }) => {
        const carouselRef = useRef(null);
        const [isPaused, setIsPaused] = useState(false);

        const scroll = (direction) => {
            if (carouselRef.current) {
                const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
                
                if (direction === 'right') {
                    // Check if at the end (with small buffer)
                    if (scrollLeft + clientWidth >= scrollWidth - 10) {
                        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        carouselRef.current.scrollBy({ left: clientWidth * 0.8, behavior: 'smooth' });
                    }
                } else if (direction === 'left') {
                    // Check if at the beginning
                    if (scrollLeft <= 5) {
                        carouselRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
                    } else {
                        carouselRef.current.scrollBy({ left: -clientWidth * 0.8, behavior: 'smooth' });
                    }
                }
            }
        };

        // Auto-play logic
        useEffect(() => {
            if (layout !== "carousel" || movies.length <= 5 || isPaused) return;

            const interval = setInterval(() => {
                scroll('right');
            }, 10000); // 10 seconds

            return () => clearInterval(interval);
        }, [layout, movies.length, isPaused]);

        const renderContent = () => {
            if (movies.length === 0) {
                return (
                    <div className="py-24 bg-white/2 rounded-[40px] border border-dashed border-white/5 flex flex-col items-center justify-center gap-6 text-center px-6">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                            <Play size={32} opacity={0.2} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tight italic">Danh sách trống</h3>
                            <p className="text-gray-600 max-w-sm text-xs font-medium">Hiện tại mục này chưa có bộ phim nào được cập nhật.</p>
                        </div>
                    </div>
                );
            }

            if (layout === "carousel") {
                return (
                    <div 
                        className="relative group/carousel"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Navigation Arrows */}
                        {movies.length > 5 && (
                            <>
                                <button 
                                    onClick={() => scroll('left')}
                                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-primary text-white p-2 rounded-full cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all shadow-xl shadow-black/50 border border-white/10 active:scale-90"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <button 
                                    onClick={() => scroll('right')}
                                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-primary text-white p-2 rounded-full cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all shadow-xl shadow-black/50 border border-white/10 active:scale-90"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Scroll Container */}
                        <div 
                            ref={carouselRef}
                            className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {movies.map((movie) => (
                                <div 
                                    key={movie._id} 
                                    className="snap-start flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                                >
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            if (layout === "small-grid") {
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} />
                        ))}
                    </div>
                );
            }

            if (layout === "large-grid") {
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                        {movies.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} />
                        ))}
                    </div>
                );
            }

            // Default grid
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
                    {movies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} />
                    ))}
                </div>
            );
        };

        return (
            <section>
                <div className="flex items-center justify-between mb-10">
                    <header className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(255,50,50,0.5)]"></div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">{title}</h2>
                            <p className="text-gray-500 text-[10px] mt-1 font-black tracking-widest uppercase opacity-60">{subtitle}</p>
                        </div>
                    </header>
                    <Link to={viewAllLink} className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] group">
                        Xem tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {renderContent()}
            </section>
        );
    };

    return (
        <div className="space-y-16 pb-20">
            {/* Native HTML5 Video Banner */}
            <div className="relative w-full h-[500px] lg:h-[800px] overflow-hidden -mt-24">
                {isMobile ? (
                    /* Mobile Fallback Image - Optimized for LCP */
                    <img 
                        src={optimizeCloudinaryUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop")} 
                        alt="Cinema Banner" 
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        fetchpriority="high"
                    />
                ) : (
                    /* Desktop Video - Only rendered on larger screens to save mobile bandwidth */
                    <video 
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        src="/banner.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        poster={optimizeCloudinaryUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop")}
                    ></video>
                )}
                
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-dark via-transparent to-transparent"></div>
                
                {/* Banner Content (Title, Play Button, etc.) */}
                <div className="absolute inset-0 flex flex-col justify-center items-start z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                            <Activity size={14} /> Live Experience
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                            NYAN <span className="text-primary italic">MOVIE</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-xl font-medium tracking-wide">
                            Trải nghiệm không gian điện ảnh đỉnh cao ngay tại nhà với hàng ngàn bộ phim bom tấn cực nét.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <Link 
                                to="/browse"
                                className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-2xl shadow-primary/40 active:scale-95 text-lg"
                            >
                                <Play size={24} fill="currentColor" /> XEM NGAY
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movie Sections */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 space-y-24">
                <MovieSection 
                    title="PHIM MỚI CẬP NHẬT" 
                    subtitle="LATEST RELEASES" 
                    movies={latestMovies} 
                    viewAllLink="/browse?recent=14" 
                    layout="carousel"
                />

                <MovieSection 
                    title="PHIM BỘ" 
                    subtitle="LATEST SERIES" 
                    movies={seriesMovies} 
                    viewAllLink="/browse?type=series" 
                    layout="carousel"
                />

                <MovieSection 
                    title="PHIM LẺ" 
                    subtitle="LATEST SINGLE MOVIES" 
                    movies={singleMovies} 
                    viewAllLink="/browse?type=single" 
                    layout="large-grid"
                />


                <MovieSection 
                    title="PHIM CHIẾU RẠP" 
                    subtitle="CINEMA MOVIES" 
                    movies={cinemaMovies} 
                    viewAllLink="/browse?type=chieurap" 
                    layout="large-grid"
                />
            </div>
        </div>
    );
};

export default Home;
