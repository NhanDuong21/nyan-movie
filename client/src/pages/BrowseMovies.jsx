import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import MovieCard from '../components/MovieCard';
import { 
    Search, Filter, Loader2, Film, 
    ChevronLeft, ChevronRight, Calendar, Layers 
} from 'lucide-react';

const BrowseMovies = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Khám phá Phim');
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);

    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const year = searchParams.get('year');
    const type = searchParams.get('type');
    const recent = searchParams.get('recent');
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [genreRes, countryRes] = await Promise.all([
                    axiosClient.get('/categories/genres'),
                    axiosClient.get('/categories/countries')
                ]);
                setGenres(genreRes.data.data);
                setCountries(countryRes.data.data);
            } catch (err) {
                console.error('Failed to fetch categories in Browse', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const params = {
                    page,
                    limit: 12,
                    sort: '-updatedAt'
                };
                if (search) params.search = search;
                if (genre) params.genre = genre;
                if (country) params.country = country;
                if (year) params.year = year;
                if (type) params.type = type;
                if (recent) params.recent = recent;

                const res = await axiosClient.get('/movies', { params });
                setMovies(res.data.data);
                setPagination(res.data.pagination);

                // Set dynamic title
                if (recent === '14') setTitle('Phim Mới Cập Nhật');
                else if (type === 'series') setTitle('Tất Cả Phim Bộ');
                else if (type === 'single') setTitle('Tất Cả Phim Lẻ');
                else if (search) setTitle(`Kết quả tìm kiếm cho: "${search}"`);
                else if (genre) {
                    const found = genres.find(g => g.slug === genre);
                    const genreName = found ? found.name : genre.charAt(0).toUpperCase() + genre.slice(1).replace(/-/g, ' ');
                    setTitle(`Phim theo Thể loại: ${genreName}`);
                }
                else if (country) {
                    const found = countries.find(c => c.slug === country);
                    const countryName = found ? found.name : country.charAt(0).toUpperCase() + country.slice(1).replace(/-/g, ' ');
                    setTitle(`Phim theo Quốc gia: ${countryName}`);
                }
                else if (year) setTitle(`Phim năm ${year}`);
                else setTitle('Tất cả phim');

            } catch (err) {
                console.error('Failed to fetch filtered movies', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
        window.scrollTo(0, 0);
    }, [search, genre, country, year, type, recent, page, genres, countries]);

    const handlePageChange = (newPage) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, page: newPage });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-gray-400 font-black tracking-[0.2em] uppercase text-xs">Đang tìm kiếm phim...</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                        {recent ? <Calendar size={32} /> : type ? <Layers size={32} /> : search ? <Search size={32} /> : <Film size={32} />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter line-clamp-1">{title}</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Trang {pagination.page} / {pagination.pages || 1} — Tìm thấy {pagination.total} phim
                        </p>
                    </div>
                </div>
            </header>

            {/* Results Grid */}
            <main className="space-y-16">
                {movies.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {movies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {/* Pagination UI */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-8">
                                <button 
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-3 rounded-xl bg-white/5 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all active:scale-90"
                                    aria-label="Trang trước"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                                    {[...Array(pagination.pages)].map((_, i) => {
                                        const p = i + 1;
                                        // Show first, last, and pages around current
                                        if (p === 1 || p === pagination.pages || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => handlePageChange(p)}
                                                    aria-label={`Trang ${p}`}
                                                    className={`w-10 h-10 rounded-xl font-bold transition-all text-sm ${
                                                        pagination.page === p 
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/40' 
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        }
                                        if (p === pagination.page - 2 || p === pagination.page + 2) {
                                            return <span key={p} className="text-gray-700 px-1 font-bold">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button 
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-3 rounded-xl bg-white/5 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all active:scale-90"
                                    aria-label="Trang sau"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white/2 rounded-[40px] border border-white/5 border-dashed">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-gray-700 opacity-30">
                            <Filter size={48} />
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-xl font-black uppercase italic tracking-widest text-white/50">Không tìm thấy phim</h3>
                            <p className="text-sm font-medium text-gray-600 px-6">
                                Rất tiếc, chúng tôi không tìm thấy bộ phim nào phù hợp với yêu cầu của bạn.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrowseMovies;
