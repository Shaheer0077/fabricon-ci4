import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingBag,
    LayoutDashboard,
    LogOut,
    ExternalLink,
    Package,
    TrendingUp,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    Eye,
    Trash2,
    Calendar,
    User,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            navigate('/admin/login');
        } else {
            fetchOrders();
        }
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/orders/${id}/status`, { status });
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const deleteOrder = async (id) => {
        if (window.confirm('Permanently delete this order record?')) {
            try {
                await API.delete(`/orders/${id}`);
                setOrders(orders.filter(o => o.id !== id));
                setSelectedOrder(null);
            } catch (error) {
                alert('Error deleting order');
            }
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(o.id).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-orange-50 text-orange-500 border-orange-100';
            case 'Processing': return 'bg-blue-50 text-blue-500 border-blue-100';
            case 'Shipped': return 'bg-purple-50 text-purple-500 border-purple-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return Clock;
            case 'Processing': return Package;
            case 'Shipped': return Truck;
            case 'Delivered': return CheckCircle2;
            case 'Cancelled': return XCircle;
            default: return Clock;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <AdminSidebar />

            {/* Main Area */}
            <div className="flex-grow lg:ml-60 p-8 md:p-12">
                <div className="max-w-7xl mx-auto">
                    <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Incoming Orders</h1>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">
                                <span className="text-[#ff4d00]">Admin</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>Order Management</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <select
                                className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 outline-none cursor-pointer focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d00] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/5 focus:border-[#ff4d00]/30 font-bold text-xs transition-all w-64 md:w-80 shadow-sm outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Today Orders', value: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                            { label: 'Total Revenue', value: `$${orders.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' }
                        ].map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/50 transition-all border-b-4 hover:border-b-[#ff4d00]"
                            >
                                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Active Orders</span>
                                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-400 text-[10px] font-black rounded-xl shadow-sm">{filteredOrders.length} Results</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="6" className="px-10 py-24 text-center"><div className="w-10 h-10 border-4 border-[#ff4d00]/20 border-t-[#ff4d00] rounded-xl animate-spin mx-auto shadow-lg shadow-orange-500/10" /></td></tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr><td colSpan="6" className="px-10 py-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">No processing units match the filter</td></tr>
                                    ) : (
                                        <AnimatePresence>
                                            {filteredOrders.map((order) => (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    key={order.id}
                                                    className="hover:bg-slate-50/50 transition-all group"
                                                >
                                                    <td className="px-10 py-5">
                                                        <span className="font-mono text-[11px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors">#{String(order.id).toUpperCase()}</span>
                                                    </td>
                                                    <td className="px-10 py-5">
                                                        <p className="font-black text-slate-900 text-sm leading-tight mb-1">{order.customer?.fullName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{order.customer?.email}</p>
                                                    </td>
                                                    <td className="px-10 py-5">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Calendar size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900 tracking-tight">${Number(order.totalPrice || 0).toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-10 py-5 text-center">
                                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(order.status)}`}>
                                                            {React.createElement(getStatusIcon(order.status), { size: 10 })}
                                                            {order.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="p-3 bg-white border border-slate-200 text-slate-400 hover:bg-black hover:text-white hover:border-black rounded-xl transition-all shadow-sm hover:shadow-lg active:scale-95"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteOrder(order.id)}
                                                                className="p-3 bg-white border border-slate-200 text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-xl transition-all shadow-sm hover:shadow-lg active:scale-95"
                                                            >
                                                                <Trash2 size={16} />
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

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-md shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-md border ${getStatusColor(selectedOrder.status)}`}>
                                        {React.createElement(getStatusIcon(selectedOrder.status), { size: 24 })}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Order #{String(selectedOrder.id).toUpperCase()}</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {selectedOrder.status}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-grow overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Left: Items */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ordered Blueprints</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex flex-col gap-4 p-6 bg-slate-50 rounded-md border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                                                <div className="flex gap-6">
                                                    <div
                                                        className="w-24 h-32 bg-white rounded-md overflow-hidden p-3 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-sm cursor-zoom-in"
                                                        onClick={() => setPreviewImage({ url: item.image, title: item.title })}
                                                    >
                                                        <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                    <div className="flex-grow py-1">
                                                        <h4 className="font-black text-slate-900 text-sm mb-3">{item.title}</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-3 py-1.5 bg-white border border-slate-200 text-[9px] font-black uppercase rounded-xl shadow-sm">SZ: {item.size}</span>
                                                            <span className="px-3 py-1.5 bg-white border border-slate-200 text-[9px] font-black uppercase rounded-xl shadow-sm">FAB: {item.fabric}</span>
                                                            <span className="px-3 py-1.5 bg-white border border-slate-200 text-[9px] font-black uppercase rounded-xl shadow-sm">LOG: {item.logoType}</span>
                                                            <span className="px-3 py-1.5 bg-white border border-slate-200 text-[9px] font-black uppercase rounded-xl shadow-sm flex items-center gap-2">
                                                                CLR: <div className="w-3 h-3 rounded-md border border-slate-200 shadow-inner" style={{ backgroundColor: item.color }} />
                                                            </span>
                                                            <span className="px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase rounded-md shadow-lg">QTY: {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* All Customized Angles */}
                                                {item.allViews && Object.keys(item.allViews).length > 0 && (
                                                    <div className="pt-4 border-t border-slate-100">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Customized Angles ({Object.keys(item.allViews).length})</p>
                                                        <div className="flex flex-wrap gap-3">
                                                            {Object.entries(item.allViews).map(([angle, url]) => (
                                                                <div
                                                                    key={angle}
                                                                    onClick={() => setPreviewImage({ url, title: `${item.title} - ${angle}` })}
                                                                    className="group/angle relative w-16 h-20 bg-white rounded-md border border-slate-100 p-2 hover:border-[#ff4d00] transition-all cursor-zoom-in"
                                                                >
                                                                    <img src={url} alt={angle} title={angle} className="w-full h-full object-contain mix-blend-multiply" />
                                                                    <div className="absolute -bottom-1 -right-1 bg-black text-white text-[7px] font-black uppercase px-1 rounded-sm opacity-0 group-hover/angle:opacity-100 transition-opacity">
                                                                        {angle}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-8 bg-slate-900 rounded-md text-white">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Amount</p>
                                                <p className="text-4xl font-black tracking-tighter">${Number(selectedOrder.totalPrice || 0).toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-2">Payment</p>
                                                <p className="text-xs font-black uppercase tracking-widest">Pay on Delivery</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Customer & Actions */}
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Customer Profile</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#ff4d00]/10 group-hover:text-[#ff4d00] transition-all"><User size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                                                    <p className="text-sm font-black text-slate-900">{selectedOrder.customer.fullName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#ff4d00]/10 group-hover:text-[#ff4d00] transition-all"><Mail size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                                    <p className="text-sm font-black text-slate-900">{selectedOrder.customer.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#ff4d00]/10 group-hover:text-[#ff4d00] transition-all"><Phone size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Contact</p>
                                                    <p className="text-sm font-black text-slate-900">{selectedOrder.customer.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 group">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#ff4d00]/10 group-hover:text-[#ff4d00] transition-all mt-1"><MapPin size={18} /></div>
                                                <div className="flex-grow">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Shipping Logistics</p>
                                                    <p className="text-sm font-black text-slate-900 leading-relaxed max-w-[200px]">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.zipCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="pt-8 border-t border-slate-100">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Execution Status</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(selectedOrder.id, status)}
                                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedOrder.status === status ? 'border-black bg-black text-white shadow-xl shadow-slate-200' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-12 bg-slate-950/90 backdrop-blur-xl cursor-zoom-out"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-rose-500 text-white rounded-full transition-all group"
                            onClick={() => setPreviewImage(null)}
                        >
                            <XCircle size={32} />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative max-w-5xl max-h-full flex flex-col items-center gap-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-slate-50 rounded-2xl shadow-2xl relative group/img overflow-hidden flex items-center justify-center" style={{ width: 480, height: 560 }}>
                                <img
                                    src={previewImage.url}
                                    alt={previewImage.title}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <h4 className="text-white text-xl font-black uppercase tracking-widest">{previewImage.title}</h4>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Design Blueprint Preview</p>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href={previewImage.url}
                                    download={`${previewImage.title}.png`}
                                    className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#ff4d00] hover:text-white transition-all shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Download High-Res
                                </a>
                                <button
                                    onClick={() => setPreviewImage(null)}
                                    className="px-8 py-4 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;
