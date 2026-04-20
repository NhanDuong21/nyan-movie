import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';
import { Newspaper, Loader2, Eye, Calendar, ChevronRight } from 'lucide-react';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axiosClient.get('/news');
                setNews(res.data.data);
            } catch (err) {
                console.error('Failed to fetch news', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
        window.scrollTo(0, 0);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-xs">Đang tải tin tức...</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                        <Newspaper size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Tin Tức Cinema</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Cập nhật những thông tin mới nhất về điện ảnh</p>
                    </div>
                </div>
            </header>

            {/* News Grid */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                    <Link 
                        key={item._id} 
                        to={`/news/${item.slug}`}
                        className="group flex flex-col bg-white/2 border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/30 hover:bg-white/5 transition-all duration-500 shadow-xl"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <img 
                                src={item.thumbnail.startsWith('http') ? item.thumbnail : `http://localhost:5000${item.thumbnail}`} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-6 space-y-4 flex-1 flex flex-col">
                            <h3 className="text-xl font-black uppercase italic tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium line-clamp-3 flex-1">
                                {item.content}
                            </p>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                    <span className="flex items-center gap-1.5"><Eye size={12} /> {item.views}</span>
                                </div>
                                <div className="text-primary group-hover:translate-x-1 transition-transform">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </main>

            {news.length === 0 && (
                <div className="py-24 text-center text-gray-500 font-bold uppercase tracking-widest">
                    Chưa có bài viết nào.
                </div>
            )}
        </div>
    );
};

export default News;
