import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Newspaper, Loader2, Eye, Calendar, ChevronLeft, Share2, Clock } from 'lucide-react';

const NewsDetail = () => {
    const { slug } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const res = await axiosClient.get(`/news/${slug}`);
                setNews(res.data.data);
            } catch (err) {
                console.error('Failed to fetch news detail', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNewsDetail();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-xs">Đang đọc bài viết...</p>
        </div>
    );

    if (!news) return (
        <div className="text-center py-24 text-gray-500 font-bold uppercase tracking-widest">
            Bài viết không tồn tại.
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Header & Meta */}
            <header className="space-y-8">
                <Link to="/news" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại Tin tức
                </Link>
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
                        {news.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {new Date(news.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1.5"><Eye size={14} className="text-primary" /> {news.views} lượt xem</span>
                    </div>
                </div>
            </header>

            {/* Thumbnail */}
            <div className="relative aspect-video rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-white/5">
                <img 
                    src={news.thumbnail} 
                    alt={news.title} 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <article className="prose prose-invert max-w-none">
                <div className="bg-white/2 border border-white/5 p-8 md:p-12 rounded-[40px] shadow-xl text-gray-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                    {news.content}
                </div>
            </article>

            {/* Footer Actions */}
            <footer className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black italic">NY</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Nyan Editorial</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Cinema Enthusiast</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <Share2 size={16} /> Chia sẻ
                </button>
            </footer>
        </div>
    );
};

export default NewsDetail;
