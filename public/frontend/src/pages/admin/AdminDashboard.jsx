import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Package, LayoutDashboard, LogOut, LayoutGrid, List, TrendingUp, Filter, ShoppingBag } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const location = useLocation();
    const [filterCategory, setFilterCategory] = useState(location.state?.category || 'All');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    // Sync filter if location state changes (for direct navigations while already mounted)
    useEffect(() => {
        if (location.state?.category) {
            setFilterCategory(location.state.category);
        }
    }, [location.state?.category]);

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            navigate('/admin/login');
        } else {
            fetchProducts();
            fetchCategories();
            fetchOrders();
        }
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Delete this product permanently?')) {
            try {
                await API.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting product');
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Sleek Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-grow lg:ml-60 p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Compact Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                                <span className="text-[#ff4d00]">Admin</span>
                                <span>/</span>
                                <span>Inventory Management</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 outline-none cursor-pointer focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d00] transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/5 focus:border-[#ff4d00]/30 font-medium text-sm transition-all w-48 md:w-64 shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Link
                                to="/admin/product/add"
                                state={{ fromCategory: filterCategory }}
                                className="flex items-center justify-center gap-2 bg-[#ff4d00] hover:bg-[#e64500] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={18} /> Add New
                            </Link>
                        </div>
                    </header>

                    {/* Refined Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Items', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                            { label: 'Active Categories', value: new Set(products.map(p => p.category)).size, icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                            { label: 'Net Value', value: `$${products.reduce((acc, p) => acc + Number(p.price || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'Total Orders', value: loading ? '...' : orders.length, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' }
                        ].map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className={`bg-white p-4 rounded-2xl border ${stat.border} shadow-sm flex items-center gap-4 group hover:shadow-md transition-all`}
                            >
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                    <stat.icon size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Data Table Container */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Master Inventory</span>
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{filteredProducts.length} Results</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Filter size={16} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Global Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="5" className="px-6 py-16 text-center"><div className="w-6 h-6 border-3 border-[#ff4d00]/30 border-t-[#ff4d00] rounded-full animate-spin mx-auto" /></td></tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-24 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No catalogue items matched the criteria</td></tr>
                                    ) : (
                                        <AnimatePresence>
                                            {filteredProducts.map((product, idx) => (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    key={product.id}
                                                    className="hover:bg-slate-50/50 transition-all group"
                                                >
                                                    <td className="px-6 py-3">
                                                        <div className="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-1.5 border border-slate-100 group-hover:border-[#ff4d00]/20 transition-all shadow-sm">
                                                            <img
                                                                src={product.images?.[0]?.startsWith('http') ? product.images[0] : `http://localhost:8080${product.images?.[0]}`}
                                                                alt=""
                                                                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=NA' }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <p className="font-bold text-slate-900 text-sm leading-tight mb-0.5 group-hover:text-[#ff4d00] transition-colors">{product.title}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter">REF: {product.id.slice(-8).toUpperCase()}</p>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-200/50">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-center">
                                                        <p className="text-base font-black text-slate-900 underline decoration-[#ff4d00]/10 decoration-4 underline-offset-2">${Number(product.price || 0).toFixed(2)}</p>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Link
                                                                to={`/admin/product/edit/${product.id}`}
                                                                state={{ fromCategory: filterCategory }}
                                                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-lg transition-all shadow-sm"
                                                                title="Edit Blueprint"
                                                            >
                                                                <Edit2 size={14} />
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteHandler(product.id)}
                                                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg transition-all shadow-sm"
                                                                title="Delete Entry"
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

                        <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                            <span>Displaying {filteredProducts.length} entries</span>
                            <div className="flex gap-4">
                                <button className="hover:text-slate-600 transition-colors">Previous</button>
                                <button className="hover:text-slate-600 transition-colors">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default AdminDashboard;
