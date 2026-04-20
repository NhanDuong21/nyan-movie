import MainLayout from '../layouts/MainLayout';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, Play, Info, ChevronRight, MessageCircle } from 'lucide-react';

// MOCK DATA
const NEW_SERIES = [
    { id: 1, title: 'Solo Leveling: Arise', poster: 'https://images.unsplash.com/photo-1541560052-5e137f229371?q=80&w=600&h=900&auto=format&fit=crop', episodeCount: 12, genres: ['Action', 'Fantasy'], year: 2024 },
    { id: 2, title: 'Dungeon Meshi', poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&h=900&auto=format&fit=crop', episodeCount: 24, genres: ['Comedy', 'Adventure'], year: 2024 },
    { id: 3, title: 'Mashle: Magic & Muscles', poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&h=900&auto=format&fit=crop', episodeCount: 12, genres: ['Action', 'Comedy'], year: 2023 },
    { id: 4, title: 'Spy x Family Season 2', poster: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=600&h=900&auto=format&fit=crop', episodeCount: 25, genres: ['Comedy', 'Espionage'], year: 2023 },
    { id: 5, title: 'Blue Lock', poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&h=900&auto=format&fit=crop', episodeCount: 24, genres: ['Sports', 'Thriller'], year: 2022 },
    { id: 6, title: 'Chainsaw Man', poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&h=900&auto=format&fit=crop', episodeCount: 12, genres: ['Drama', 'Action'], year: 2022 },
];

const NEW_SINGLES = [
    { id: 7, title: 'Blade Runner 2049', poster: 'https://images.unsplash.com/photo-1613679074971-91fc211824c7?q=80&w=600&h=900&auto=format&fit=crop', genres: ['Sci-Fi', 'Mystery'], year: 2017 },
    { id: 8, title: 'Dune: Part Two', poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&h=900&auto=format&fit=crop', genres: ['Adventure', 'Sci-Fi'], year: 2024 },
    { id: 9, title: 'Oppenheimer', poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&h=900&auto=format&fit=crop', genres: ['History', 'Drama'], year: 2023 },
    { id: 10, title: 'The Batman', poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&h=900&auto=format&fit=crop', genres: ['Action', 'Crime'], year: 2022 },
    { id: 11, title: 'Spider-Man: Across the Universe', poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&h=900&auto=format&fit=crop', genres: ['Animation', 'Action'], year: 2023 },
    { id: 12, title: 'John Wick: Chapter 4', poster: 'https://images.unsplash.com/photo-1542204172-3c35b6728080?q=80&w=600&h=900&auto=format&fit=crop', genres: ['Action', 'Thriller'], year: 2023 },
];

const TRENDING = [
    { id: 1, title: 'Solo Leveling', views: '2.5M', poster: 'https://images.unsplash.com/photo-1541560052-5e137f229371?q=80&w=80&h=120&auto=format&fit=crop' },
    { id: 2, title: 'Dune: Part Two', views: '1.8M', poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=80&h=120&auto=format&fit=crop' },
    { id: 3, title: 'Oppenheimer', views: '1.2M', poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=80&h=120&auto=format&fit=crop' },
    { id: 4, title: 'Spy x Family', views: '980K', poster: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=80&h=120&auto=format&fit=crop' },
    { id: 5, title: 'Blue Lock', views: '850K', poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=80&h=120&auto=format&fit=crop' },
];

const Home = () => {
    return (
        <MainLayout>
            <div className="container mx-auto px-4">
                {/* Hero section */}
                <div className="relative h-[400px] sm:h-[500px] mb-12 rounded-3xl overflow-hidden group shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1600&h=900&auto=format&fit=crop"
                        alt="Hero Banner"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent lg:bg-gradient-to-r lg:from-dark lg:via-dark/60 lg:to-transparent flex flex-col justify-center px-8 md:px-16">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">
                            <Flame size={14} fill="currentColor" />
                            <span>Đang thịnh hành</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 max-w-2xl leading-[1.1] uppercase italic">
                            Dungeon Meshi: <br/> Ngon từ thịt, ngọt từ xương
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base mb-10 max-w-lg line-clamp-3 leading-relaxed opacity-80 font-light">
                            Laios và đồng đội dấn thân vào hầm ngục nguy hiểm để giải cứu em gái. Để sinh tồn, họ phải học cách chế biến quái vật thành những món ăn hấp dẫn bậc nhất hầm ngục.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-10 rounded-full transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center gap-3">
                                <Play size={20} fill="currentColor" /> Xem Phim
                            </button>
                            <button className="bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white font-semibold py-3.5 px-10 rounded-full transition-all border border-white/10 flex items-center gap-3">
                                <Info size={20} /> Chi Tiết
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Left Column */}
                    <div className="lg:col-span-3 space-y-20">
                        {/* Section 1 */}
                        <section>
                            <div className="flex justify-between items-end mb-10 pb-2 border-b border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Phim Bộ Mới</h3>
                                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                                </div>
                                <Link to="/" className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1 group">
                                    Tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                {NEW_SERIES.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <div className="flex justify-between items-end mb-10 pb-2 border-b border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Phim Lẻ Mới</h3>
                                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                                </div>
                                <Link to="/" className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1 group">
                                    Tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                {NEW_SINGLES.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column / Sidebar */}
                    <aside className="space-y-12">
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <TrendingUp size={20} className="text-primary" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Top Xu Hướng</h3>
                            </div>
                            <div className="space-y-6">
                                {TRENDING.map((movie, idx) => (
                                    <div key={movie.id} className="flex gap-4 group cursor-pointer relative items-center">
                                        <div className="relative flex-none w-14 h-14 rounded-full overflow-hidden border border-white/10 ring-2 ring-transparent group-hover:ring-primary transition-all">
                                            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center overflow-hidden">
                                            <h4 className="text-gray-300 text-sm font-semibold truncate group-hover:text-white transition-colors">
                                                {movie.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-primary text-[10px] font-bold">TOP {idx + 1}</span>
                                                <span className="text-gray-600 text-[10px]">|</span>
                                                <span className="text-gray-500 text-[10px]">{movie.views} views</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        
                        <div className="bg-dark-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                                    <MessageCircle size={24} fill="currentColor" className="opacity-80" />
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2 leading-tight">Tham gia <br/> Cộng đồng</h4>
                                <p className="text-xs text-gray-500 mb-6 leading-relaxed">Luôn cập nhật tập phim mới nhất nhanh chóng và cùng thảo luận.</p>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                    Join Telegram
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
};

export default Home;
