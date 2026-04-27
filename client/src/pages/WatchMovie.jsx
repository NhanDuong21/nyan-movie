import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { 
    Play, 
    Loader2, 
    VideoOff, 
    ListVideo, 
    ChevronLeft, 
    ChevronRight,
    Star,
    Calendar,
    Globe
} from 'lucide-react';
import CommentSection from '../components/movie/CommentSection';

const WatchMovie = () => {
    const { movieSlug, episodeId } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasCountedView, setHasCountedView] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get(`/movies/slug/${movieSlug}`);
                setMovie(res.data.data);
                
                // Find current episode in the movie's episodes list
                const episode = res.data.data.episodes?.find(ep => ep.id === episodeId);
                const activeEp = episode || (res.data.data.episodes?.length > 0 ? res.data.data.episodes[0] : null);
                setCurrentEpisode(activeEp);
                setHasCountedView(false); // Reset view count state when episode changes

                // Track Watch History if logged in
                if (user && res.data.data.id && activeEp?.id) {
                    await axiosClient.post('/interactions/history', {
                        movieId: res.data.data.id,
                        episodeId: activeEp.id
                    });
                }
            } catch (err) {
                console.error('Failed to fetch watch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [movieSlug, episodeId, user]);

    const handleTimeUpdate = async (e) => {
        const video = e.target;
        if (!movie || !currentEpisode || hasCountedView) return;

        // Rule: Increment view ONLY IF user plays for >= 15 seconds
        if (video.currentTime >= 15) {
            const viewKey = `nyan_view_${movie.id}_${currentEpisode.id}`;
            const lastView = localStorage.getItem(viewKey);
            const now = Date.now();
            const COOLDOWN = 30 * 60 * 1000; // 30 minutes

            // Anti-spam Rule: 1 view per session per 30 minutes
            if (!lastView || (now - parseInt(lastView)) >= COOLDOWN) {
                try {
                    await axiosClient.post(`/movies/${movie.id}/episodes/${currentEpisode.id}/view`);
                    localStorage.setItem(viewKey, now.toString());
                    localStorage.setItem(`view_${movieSlug}_${episodeId}`, Date.now().toString());
                } catch (err) {
                    
                }
            } else {
                
            }

            setHasCountedView(true);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-xs">Đang tải video...</p>
        </div>
    );

    if (!movie || !currentEpisode) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <VideoOff size={64} className="text-gray-700" />
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic">Không tìm thấy tập phim</h2>
                <p className="text-gray-500">Tập phim này không tồn tại hoặc đã bị gỡ bỏ.</p>
            </div>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95">Quay lại trang chủ</Link>
        </div>
    );

    return (
        <div className="pb-20 text-white animate-in fade-in duration-700">
            {/* Breadcrumb / Back Navigation */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between border-b border-white/5 bg-dark/50 backdrop-blur-xl sticky top-20 z-40">
                <Link to={`/movie/${movie.slug}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest leading-none">Quay lại</h4>
                        <p className="text-[10px] font-bold opacity-50 truncate max-w-[200px]">{movie.title}</p>
                    </div>
                </Link>
                <div className="text-center hidden md:block">
                    <h1 className="text-lg font-black uppercase italic tracking-tight">{movie.title}</h1>
                    <p className="text-xs font-bold text-primary tracking-widest">{currentEpisode.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded border border-white/10">{movie.episodes?.length} Tập</span>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-0 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Player Column */}
                <div className={`${movie.type === 'single' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-8`}>
                    {/* Video Embed */}
                    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 ring-1 ring-white/5 group">
                        {currentEpisode.videoUrl ? (
                            <video
                                src={currentEpisode.videoUrl}
                                controls
                                onTimeUpdate={handleTimeUpdate}
                                className="absolute inset-0 w-full h-full object-contain"
                                poster={movie.backdrop?.startsWith('http') ? movie.backdrop : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.backdrop}`}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
                                <VideoOff size={48} className="opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs">Video hiện chưa khả dụng</p>
                            </div>
                        )}
                    </div>

                    {/* Movie Info & Actions below player */}
                    <div className="px-6 md:px-0 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black uppercase italic tracking-tighter">{movie.title} - {currentEpisode.name}</h1>
                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Star size={14} fill="currentColor" className="text-yellow-500" /> {(movie.ratingAverage || 0).toFixed(1)}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {movie.year?.year}</span>
                                    <span className="flex items-center gap-1.5"><Globe size={14} /> {movie.country?.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/5 transition-all">Báo lỗi</button>
                                <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/5 transition-all">Mở rộng</button>
                            </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed font-medium line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                            {movie.description}
                        </p>

                        <CommentSection movieId={movie.id} />
                    </div>
                </div>

                {/* Sidebar: Episodes List */}
                {movie.type !== 'single' && (
                    <div className="px-6 md:px-0 space-y-8">
                        <header className="flex items-center gap-3">
                            <ListVideo size={24} className="text-primary" />
                            <h2 className="text-xl font-black uppercase italic tracking-widest">Danh sách tập</h2>
                        </header>

                        <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {movie.episodes?.map((ep) => (
                                <Link 
                                    key={ep.id}
                                    to={`/watch/${movie.slug}/${ep.id}`}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                                        currentEpisode.id === ep.id 
                                        ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' 
                                        : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                        currentEpisode.id === ep.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/40' : 'bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-white/10'
                                    }`}>
                                        <Play size={16} fill={currentEpisode.id === ep.id ? 'white' : 'transparent'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-black text-sm uppercase tracking-tight truncate ${currentEpisode.id === ep.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                            {ep.name}
                                        </h4>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">TẬP {ep.episodeNumber}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Recommendation Card */}
                        <div className="bg-gradient-to-br from-primary/20 to-transparent p-6 rounded-3xl border border-primary/20 space-y-4">
                            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-primary">NYAN PRO TIP</h5>
                            <p className="text-xs font-medium text-gray-300 leading-relaxed">
                                Bấm vào biểu tượng phóng to trên player để trải nghiệm xem phim chất lượng cao nhất!
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WatchMovie;
