import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Search, XCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', subcategories: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            navigate('/admin/login');
        } else {
            fetchCategories();
        }
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                subcategories: category.subcategories.join(', '),
                image: null
            });
            setImagePreview(category.image ? `http://localhost:8080${category.image}` : null);
        } else {
            setEditingCategory(null);
            setFormData({ name: '', subcategories: '', image: null });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', subcategories: '', image: null });
        setImagePreview(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('subcategories', formData.subcategories);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingCategory) {
                await API.put(`/categories/${editingCategory.id}`, data, config);
            } else {
                await API.post('/categories', data, config);
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await API.delete(`/categories/${id}`);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting category');
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <AdminSidebar />
            <div className="flex-grow lg:ml-60 p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                                <span className="text-[#ff4d00]">Admin</span>
                                <span>/</span>
                                <span>Categories</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d00] transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/5 focus:border-[#ff4d00]/30 font-medium text-sm transition-all w-48 md:w-64 shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center justify-center gap-2 bg-[#ff4d00] hover:bg-[#e64500] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={18} /> Add Category
                            </button>
                        </div>
                    </header>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Master Categories</span>
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{filteredCategories.length} Results</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Image</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategories</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="3" className="px-6 py-16 text-center"><div className="w-6 h-6 border-3 border-[#ff4d00]/30 border-t-[#ff4d00] rounded-full animate-spin mx-auto" /></td></tr>
                                    ) : filteredCategories.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-24 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No categories found</td></tr>
                                    ) : (
                                        <AnimatePresence>
                                            {filteredCategories.map((category) => (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    key={category.id}
                                                    className="hover:bg-slate-50/50 transition-all group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                                            {category.image ? (
                                                                <img src={`http://localhost:8080${category.image}`} alt={category.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <Layers size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-[#ff4d00] transition-colors">
                                                        {category.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {category.subcategories.map((sub, idx) => (
                                                                <span key={idx} className="inline-flex px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-md border border-slate-200/50">
                                                                    {sub}
                                                                </span>
                                                            ))}
                                                            {category.subcategories.length === 0 && <span className="text-xs text-slate-400 italic">None</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleOpenModal(category)}
                                                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-lg transition-all shadow-sm"
                                                                title="Edit Category"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(category.id)}
                                                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg transition-all shadow-sm"
                                                                title="Delete Category"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-900">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="p-6 flex-grow overflow-y-auto">
                                <form onSubmit={handleSave} className="space-y-4 text-left">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Category Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ff4d00]/10 focus:border-[#ff4d00]/30 outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. Mens"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Subcategories (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.subcategories}
                                            onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ff4d00]/10 focus:border-[#ff4d00]/30 outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. T-Shirts, Jackets, Jeans"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Category Image</label>
                                        <div className="flex items-center gap-4">
                                            {imagePreview && (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-100 flex-shrink-0">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFormData({ ...formData, image: file });
                                                        setImagePreview(URL.createObjectURL(file));
                                                        e.target.value = ''; // Reset to allow re-uploading the  file
                                                    }
                                                }}
                                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 bg-[#ff4d00] hover:bg-[#e64500] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                                        >
                                            <Save size={16} /> {editingCategory ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategories;
