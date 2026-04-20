import { LayoutDashboard, Film, Users, Tags } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-dark-card p-6 rounded-2xl border border-white/5 flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl bg-opacity-10 ${color}`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-bold text-white">Chào mừng quay lại 👋</h1>
                <p className="text-gray-400 mt-1">Đây là tổng quan về hệ thống Nyan Movie của bạn.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng Phim" value="128" icon={Film} color="bg-primary text-primary" />
                <StatCard title="Người dùng" value="1.2K" icon={Users} color="bg-blue-500 text-blue-500" />
                <StatCard title="Thể Loại" value="18" icon={Tags} color="bg-green-500 text-green-500" />
                <StatCard title="Lượt xem" value="45.6K" icon={LayoutDashboard} color="bg-purple-500 text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                <div className="bg-dark-card p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold mb-6">Hoạt động gần đây</h3>
                    <div className="text-gray-500 text-sm italic text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                        Mô đun logs sẽ được cập nhật trong phase tiếp theo...
                    </div>
                </div>
                <div className="bg-dark-card p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold mb-6">Server Status</h3>
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-500 text-sm font-medium">Backend: Connected and Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
