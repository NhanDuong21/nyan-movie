import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    Users, 
    Film, 
    Heart, 
    Eye, 
    TrendingUp, 
    Clock, 
    Loader2, 
    AlertCircle,
    Tv,
    TrendingDown,
    Activity,
    Clapperboard,
    PlaySquare
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-dark-card p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white italic">{value}</h3>
            {subtitle && <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl bg-opacity-10 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={28} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

const TopTable = ({ title, data, icon: Icon, metricLabel, metricKey }) => (
    <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon size={20} />
            </div>
            <h3 className="font-black text-white italic uppercase tracking-tight">{title}</h3>
        </div>
        <div className="flex-1">
            {data && data.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {data.map((item, index) => (
                        <div key={item._id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors group">
                            {/* Left Side: Rank & Title */}
                            <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg bg-white/5 text-[10px] font-black text-gray-500 group-hover:text-primary transition-colors">
                                    {index + 1}
                                </span>
                                <span className="text-sm font-bold text-gray-300 group-hover:text-white truncate">
                                    {item.title || 'Chưa cập nhật'}
                                </span>
                            </div>

                            {/* Right Side: Metric Stats (Aligned perfectly to the right) */}
                            <div className="flex flex-col items-end shrink-0 text-right min-w-[80px]">
                                <span className="text-xs font-black text-primary italic">
                                    {metricKey === 'createdAt' ? new Date(item[metricKey]).toLocaleDateString('vi-VN') : (item[metricKey] || item.count || 0)}
                                </span>
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
                                    {metricLabel}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                    <Activity size={40} />
                    <p className="text-xs mt-2 uppercase font-bold">No Data</p>
                </div>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            const res = await axiosClient.get('/admin/stats');
            setStats(res.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load statistics');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 animate-pulse font-bold tracking-widest uppercase text-xs">Đang xử lý dữ liệu hệ thống...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-red-500">
            <AlertCircle size={48} />
            <p className="font-bold">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter"><span className="text-primary italic">ADMIN</span> Dashboard</h1>
                    <p className="text-gray-500 mt-1 uppercase font-bold tracking-widest text-[10px]">Real-time analytics and management</p>
                </div>
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-primary font-black text-xs uppercase italic">System Operational</span>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-white text-xs">
                <StatCard 
                    title="Người dùng" 
                    value={stats.counts.totalUsers} 
                    icon={Users} 
                    color="bg-blue-500"
                    subtitle="Registered"
                />
                <StatCard 
                    title="Phim Lẻ" 
                    value={stats.counts.totalSingle} 
                    icon={Film} 
                    color="bg-red-500"
                    subtitle="Standalone"
                />
                <StatCard 
                    title="Phim Bộ" 
                    value={stats.counts.totalSeries} 
                    icon={Tv} 
                    color="bg-purple-500"
                    subtitle="TV Series"
                />
                <StatCard 
                    title="Chiếu Rạp" 
                    value={stats.counts.totalChieurap} 
                    icon={Clapperboard} 
                    color="bg-emerald-500"
                    subtitle="Cinema"
                />
                <StatCard 
                    title="Yêu Thích" 
                    value={stats.counts.totalFavorites} 
                    icon={Heart} 
                    color="bg-pink-500"
                    subtitle="Interactions"
                />
            </div>

            {/* Content Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                <TopTable 
                    title="Phim Mới Nhất" 
                    data={stats.latestMovies} 
                    icon={Clock} 
                    metricLabel="NGÀY ĐĂNG" 
                    metricKey="createdAt"
                />
                <TopTable 
                    title="Yêu Thích Nhất" 
                    data={stats.topFavorited} 
                    icon={TrendingUp} 
                    metricLabel="LƯỢT THÍCH" 
                    metricKey="count"
                />
                <TopTable 
                    title="Top Phim Lẻ" 
                    data={stats.topViewedSingle} 
                    icon={Eye} 
                    metricLabel="LƯỢT XEM" 
                    metricKey="views"
                />
                <TopTable 
                    title="Top Phim Bộ" 
                    data={stats.topViewedSeries} 
                    icon={Activity} 
                    metricLabel="LƯỢT XEM" 
                    metricKey="views"
                />
                <TopTable 
                    title="Top Phim Chiếu Rạp" 
                    data={stats.topViewedChieurap} 
                    icon={PlaySquare} 
                    metricLabel="LƯỢT XEM" 
                    metricKey="views"
                />
            </div>
        </div>
    );
};

export default Dashboard;
