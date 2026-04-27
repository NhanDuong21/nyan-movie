import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const CategorySection = ({ type, title }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newVal, setNewVal] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const endpoint = `/categories/${type}`;

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(endpoint);
            setItems(res.data.data);
        } catch (err) {
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [type]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newVal) return;
        setError('');
        setSuccess('');
        try {
            const body = type === 'years' ? { year: Number(newVal) } : { name: newVal };
            await axiosClient.post(endpoint, body);
            setNewVal('');
            setSuccess('Đã thêm thành công!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axiosClient.delete(`${endpoint}/${itemToDelete}`);
            fetchData();
        } catch (err) {
            setError('Không thể xóa item này');
        } finally {
            setItemToDelete(null);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="bg-dark-card p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-xl font-bold border-l-4 border-primary pl-4">{title}</h3>

            {/* Success/Error messages */}
            {error && <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
            {success && <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><CheckCircle size={14}/> {success}</div>}

            {/* Form */}
            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    type={type === 'years' ? 'number' : 'text'}
                    placeholder={`Thêm ${title.toLowerCase()} mới...`}
                    className="flex-1 bg-dark-lighter border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                />
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl transition-all active:scale-95">
                    <Plus size={20} />
                </button>
            </form>

            {/* Table */}
            <div className="max-h-[400px] overflow-y-auto rounded-xl">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium">
                            <tr>
                                <th className="px-4 py-3">Tên / Giá trị</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-200">
                                        {type === 'years' ? item.year : item.name}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title={`Xóa ${title}`}
                message={`Bạn có chắc chắn muốn xóa ${title.toLowerCase()} này khỏi hệ thống?`}
                type="danger"
                confirmText="Xóa ngay"
            />
        </div>
    );
};

const ManageCategories = () => {
    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-bold text-white">Quản lý Danh mục</h1>
                <p className="text-gray-400 mt-1">Cấu hình các thuộc tính Master Data cho phim.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <CategorySection type="genres" title="Thể Loại" />
                <CategorySection type="countries" title="Quốc Gia" />
                <CategorySection type="years" title="Năm Phát Hành" />
            </div>
        </div>
    );
};

export default ManageCategories;
