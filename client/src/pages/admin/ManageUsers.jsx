import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { 
    Users,
    Trash2, 
    ShieldCheck, 
    User, 
    Loader2, 
    Search,
    AlertCircle,
    UserPlus,
    Clock,
    Mail,
    Pencil,
    Plus,
    X,
    UserCircle,
    ShieldAlert,
    Lock,
    Unlock,
    Ban,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Settings2
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [modalError, setModalError] = useState('');

    // Confirm Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => {}
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/admin/users`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    status: statusFilter
                }
            });
            setUsers(res.data.data);
            setTotal(res.data.pagination.total);
            setTotalPages(res.data.pagination.pages);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when page, limit, or filters change
    useEffect(() => {
        fetchUsers();
    }, [page, limit, statusFilter]);

    // Search with debounce/triggered by effect but reset page
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Reset page to 1 when filters change (limit, status)
    useEffect(() => {
        setPage(1);
    }, [limit, statusFilter]);

    // Block background scroll when modal is open
    useEffect(() => {
        if (showModal || confirmConfig.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal, confirmConfig.isOpen]);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // Password not editable here
                role: user.role
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'user'
            });
        }
        setModalError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setModalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setModalError('');

        try {
            if (editingUser) {
                await axiosClient.put(`/admin/users/${editingUser._id}`, {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role
                });
            } else {
                await axiosClient.post('/admin/users', formData);
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = (userId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xóa người dùng',
            message: 'CẢNH BÁO: Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ bị loại bỏ.',
            type: 'danger',
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    await axiosClient.delete(`/admin/users/${userId}`);
                    fetchUsers();
                } catch (err) {
                    alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
                } finally {
                    setIsUpdating(false);
                }
            }
        });
    };

    const handleToggleBan = (user) => {
        const action = user.isActive ? 'khóa' : 'mở khóa';
        setConfirmConfig({
            isOpen: true,
            title: user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
            message: `Bạn có chắc muốn ${action} tài khoản này? Người dùng sẽ ${user.isActive ? 'không thể' : 'có thể'} đăng nhập vào hệ thống sau khi thực hiện.`,
            type: user.isActive ? 'danger' : 'info',
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    await axiosClient.patch(`/admin/users/${user._id}/ban`);
                    // Update local state for immediate feedback
                    setUsers(prev => prev.map(u => 
                        u._id === user._id ? { ...u, isActive: !u.isActive } : u
                    ));
                } catch (err) {
                    alert(err.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
                } finally {
                    setIsUpdating(false);
                }
            }
        });
    };

    const displayUsers = users.filter(user => {
        // Hide Root account for non-root admins for cleaner UX and security
        const isCurrentlyRoot = currentUser?.email === 'sgoku4880@gmail.com' || currentUser?.is_root;
        const isTargetRoot = user.email === 'sgoku4880@gmail.com' || user.is_root;
        
        if (!isCurrentlyRoot && isTargetRoot) {
            return false;
        }
        
        return true;
    });

    if (loading && page === 1) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse text-center">Đang nạp danh sách tài khoản...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="text-primary" size={36} />
                        Quản lý <span className="text-primary italic">User</span>
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase font-bold tracking-widest text-[10px]">Create, Update, and Moderate accounts</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    Thêm Người Dùng
                </button>
            </header>

            {/* CONTROL BAR */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-300 focus:outline-none focus:border-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group/filter w-full md:w-44">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/filter:text-primary transition-colors">
                            <Settings2 size={16} />
                        </div>
                        <select 
                            className="w-full bg-[#111] border border-gray-800 rounded-2xl pl-11 pr-10 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="banned">Đã bị khóa</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>

                    <div className="relative group/limit w-full md:w-32">
                        <select 
                            className="w-full bg-[#111] border border-gray-800 rounded-2xl px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] italic border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Người dùng</th>
                                <th className="px-8 py-6 text-center">Vai trò</th>
                                <th className="px-8 py-6 text-center">Trạng thái</th>
                                <th className="px-8 py-6 text-center whitespace-nowrap">Gia nhập</th>
                                <th className="px-8 py-6 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayUsers.map(user => (
                                <tr key={user._id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-dark group-hover:border-primary transition-all shadow-lg flex items-center justify-center shrink-0">
                                                {user.avatar ? (
                                                    <img 
                                                        src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${user.avatar}`} 
                                                        className="w-full h-full object-cover" 
                                                        alt={user.username} 
                                                    />
                                                ) : (
                                                    <UserCircle className="text-gray-600" size={28} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white group-hover:text-primary transition-colors italic uppercase tracking-tight truncate max-w-[150px]">{user.username}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                                                    <Mail size={12} className="shrink-0" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            {user.email === 'sgoku4880@gmail.com' || user.is_root ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-yellow-600/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_15px_rgba(202,138,4,0.1)]">
                                                    <ShieldCheck size={14} />
                                                    ROOT
                                                </div>
                                            ) : (
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                                    user.role === 'admin' 
                                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(229,9,20,0.1)]' 
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                    {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                                    {user.role}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            {user.isActive ? (
                                                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                    Hoạt động
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    <X size={12} />
                                                    Bị khóa
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tight">
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} /> {new Date(user.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {user.email === 'sgoku4880@gmail.com' || user.is_root ? (
                                                <div className="w-10 h-10 flex items-center justify-center text-yellow-500/40" title="Tài khoản hệ thống">
                                                    <ShieldCheck size={20} />
                                                </div>
                                            ) : (user.role === 'admin' && (currentUser?.email !== 'sgoku4880@gmail.com' && !currentUser?.is_root)) ? (
                                                <div className="w-10 h-10 flex items-center justify-center text-gray-500/20" title="Chỉ Root mới có quyền thao tác lên Admin">
                                                    <Lock size={18} />
                                                </div>
                                            ) : (
                                                <>
                                                    <button 
                                                        disabled={isUpdating || user._id === currentUser?._id}
                                                        onClick={() => handleToggleBan(user)}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                                            user._id === currentUser?._id ? 'opacity-20 cursor-not-allowed border-white/5' :
                                                            user.isActive
                                                            ? 'border-orange-500/20 text-orange-500 hover:bg-orange-500/10'
                                                            : 'border-green-500/20 text-green-500 hover:bg-green-500/10'
                                                        }`}
                                                        title={user._id === currentUser?._id ? 'Không thể tự khóa' : (user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản')}
                                                    >
                                                        {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(user)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                                                        title="Sửa thông tin"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        disabled={isUpdating || user._id === currentUser?._id}
                                                        onClick={() => handleDelete(user._id)}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                                            user._id === currentUser?._id
                                                            ? 'border-white/5 text-gray-700 cursor-not-allowed opacity-20'
                                                            : 'border-red-500/20 text-red-500 hover:bg-red-500/10 active:scale-90'
                                                        }`}
                                                        title={user._id === currentUser?._id ? 'Không thể tự xóa' : 'Xóa người dùng'}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* PAGINATION FOOTER */}
                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                        Hiển thị <span className="text-white">{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</span> trong tổng số <span className="text-primary">{total}</span> người dùng
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-primary disabled:opacity-20 disabled:hover:bg-white/5 transition-all shadow-lg active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1.5 px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center gap-1.5">
                                        {i > 0 && arr[i-1] !== p - 1 && <span className="text-gray-600 font-bold">...</span>}
                                        <button
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                                page === p 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>

                        <button 
                            disabled={page === totalPages || loading}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-primary disabled:opacity-20 disabled:hover:bg-white/5 transition-all shadow-lg active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE/EDIT MODAL */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={handleCloseModal}>
                    <div 
                        className="relative w-full max-w-lg bg-[#111] border border-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Static */}
                        <header className="flex items-center justify-between p-6 border-b border-white/5 relative">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                                    {editingUser ? <Pencil size={24} /> : <UserPlus size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                                        {editingUser ? 'Sửa' : 'Thêm'} <span className="text-primary italic">User</span>
                                    </h2>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">Quản lý tài khoản hệ thống</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCloseModal} 
                                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </header>

                        {/* Modal Body - Scrollable */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="userForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Tên hiển thị</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-primary transition-all underline-none outline-none"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-primary transition-all underline-none outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    
                                    {!editingUser && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Mật khẩu</label>
                                            <input
                                                required
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-primary transition-all underline-none outline-none"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Vai trò</label>
                                        <div className="relative group/role">
                                            <select
                                                disabled={
                                                    (currentUser?.email !== 'sgoku4880@gmail.com' && !currentUser?.is_root) || 
                                                    (editingUser?._id === currentUser?._id)
                                                }
                                                className={`w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-primary transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed underline-none outline-none`}
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            >
                                                <option value="user">USER (Người dùng)</option>
                                                <option value="admin">ADMIN (Quản trị viên)</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>
                                        {/* Helper text for locked role */}
                                        {((currentUser?.email !== 'sgoku4880@gmail.com' && !currentUser?.is_root) || (editingUser?._id === currentUser?._id)) && (
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest pl-1 flex items-center gap-1">
                                                {editingUser?._id === currentUser?._id 
                                                    ? "Không thể tự thay đổi chức vụ của mình" 
                                                    : "Chỉ Root mới có quyền thay đổi chức vụ"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {modalError && (
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wide">
                                        <ShieldAlert size={18} className="shrink-0" />
                                        {modalError}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer - Static */}
                        <div className="p-6 border-t border-white/5 flex-shrink-0">
                            <button
                                form="userForm"
                                disabled={isUpdating}
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                            >
                                {isUpdating ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>{editingUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</span>
                                        <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                            <Plus size={12} />
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
        </div>
    );
};

export default ManageUsers;
