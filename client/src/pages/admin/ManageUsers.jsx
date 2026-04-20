import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    Trash2, 
    ShieldCheck, 
    User, 
    Loader2, 
    Search,
    AlertCircle,
    UserPlus,
    Clock,
    Mail
} from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/admin/users?page=${page}&limit=10`);
            setUsers(res.data.data);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Xác nhận đổi vai trò thành ${newRole.toUpperCase()}?`)) return;

        setIsUpdating(true);
        try {
            await axiosClient.patch(`/admin/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi đổi vai trò');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.')) return;

        setIsUpdating(true);
        try {
            await axiosClient.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && page === 1) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse text-center">Đang nạp danh sách tài khoản...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Quản lý <span className="text-primary italic">User</span></h1>
                    <p className="text-gray-500 mt-1 uppercase font-bold tracking-widest text-[10px]">Audit, promote, or delete accounts</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full bg-dark-card border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                            <tr>
                                <th className="px-8 py-5">Người dùng</th>
                                <th className="px-8 py-5">Vai trò</th>
                                <th className="px-8 py-5">Ngày gia nhập</th>
                                <th className="px-8 py-5 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-primary transition-colors italic uppercase tracking-tight">{user.username}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Mail size={12} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            user.role === 'admin' 
                                            ? 'bg-primary/10 text-primary border-primary/20' 
                                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                            {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tight">
                                            <Clock size={14} className="text-gray-600" />
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                disabled={isUpdating}
                                                onClick={() => handleToggleRole(user._id, user.role)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                                    user.role === 'admin'
                                                    ? 'border-gray-500/20 text-gray-500 hover:bg-gray-500/10'
                                                    : 'border-primary/20 text-primary hover:bg-primary/10'
                                                }`}
                                                title={user.role === 'admin' ? 'Hạ xuống User' : 'Thăng lên Admin'}
                                            >
                                                {user.role === 'admin' ? <UserPlus size={18} /> : <ShieldCheck size={18} />}
                                            </button>
                                            <button 
                                                disabled={isUpdating}
                                                onClick={() => handleDelete(user._id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                                                title="Xóa người dùng"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {total > 10 && (
                    <div className="p-6 border-t border-white/5 flex items-center justify-center gap-4">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-30"
                        >
                            Trang trước
                        </button>
                        <span className="text-xs font-black text-primary italic">Trang {page}</span>
                        <button 
                            disabled={page * 10 >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-30"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
