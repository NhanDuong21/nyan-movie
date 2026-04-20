import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import MovieCard from '../components/MovieCard';
import { Search, Filter, Loader2, Film } from 'lucide-react';

const BrowseMovies = () => {
    const [searchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Khám phá Phim');

    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const year = searchParams.get('year');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const params = {};
                if (search) params.search = search;
                if (genre) params.genre = genre;
                if (country) params.country = country;
                if (year) params.year = year;

                const res = await axiosClient.get('/movies', { params });
                setMovies(res.data.data);

                // Set dynamic title
                if (search) setTitle(`Kết quả tìm kiếm cho: "${search}"`);
                else if (genre) setTitle(`Phim theo Thể loại: ${genre.charAt(0).toUpperCase() + genre.slice(1).replace(/-/g, ' ')}`);
                else if (country) setTitle(`Phim theo Quốc gia: ${country.charAt(0).toUpperCase() + country.slice(1).replace(/-/g, ' ')}`);
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
    }, [search, genre, country, year]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-xs">Đang tìm kiếm phim...</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                        {search ? <Search size={32} /> : <Film size={32} />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter line-clamp-1">{title}</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                            Tìm thấy {movies.length} bộ phim phù hợp
                        </p>
                    </div>
                </div>
            </header>

            {/* Results Grid */}
            <main>
                {movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {movies.map(movie => (
                            <MovieCard key={movie._id} movie={movie} />
                        ))}
                    </div>
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
