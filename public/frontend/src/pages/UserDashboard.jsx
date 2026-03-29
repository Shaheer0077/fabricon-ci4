import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    ChevronRight,
    Search,
    Clock,
    ExternalLink,
    Package,
    LayoutDashboard,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const localOrders = JSON.parse(localStorage.getItem('fabricon_orders') || '[]');
        setOrders(localOrders);
    }, []);

    const handleTrackSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/track/${searchTerm.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-20 px-6 sm:px-10 lg:px-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-black text-white rounded-lg">
                                <LayoutDashboard size={18} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Portal</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase  mb-2">My Studio Space</h1>
                        <p className="text-sm font-medium text-slate-500">Manage your custom creations and track production status.</p>
                    </div>

                    <form onSubmit={handleTrackSubmit} className="relative group">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Track Specific Order</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ENTER TRACKING CODE..."
                                className="w-full md:w-80 bg-white border border-slate-200 rounded-xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                            />
                            <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-[#ff4d00] transition-colors shadow-lg shadow-slate-200">
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Sidebar: Quick Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Overview</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-3xl font-black text-slate-900 leading-none mb-1">{orders.length}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                                </div>
                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-xs font-bold text-slate-900 mb-2 leading-relaxed">Your orders are stored locally in this browser.</p>
                                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                                        As a guest user, we use your browser's memory to keep track of your history. If you clear your history, these links may disappear.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#ff4d00] rounded-3xl p-8 text-white shadow-xl shadow-orange-100 flex flex-col justify-between aspect-square">
                            <ShoppingBag size={32} />
                            <div>
                                <h4 className="text-lg font-black leading-tight mb-4">Ready to start a new project?</h4>
                                <button
                                    onClick={() => navigate('/catalog')}
                                    className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
                                >
                                    Visit Catalog
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Order History */}
                    <div className="lg:col-span-3">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Clock size={18} className="text-[#ff4d00]" />
                            Recent History
                        </h3>

                        {orders.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl py-20 px-10 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                    <Package size={32} />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-2 uppercase ">No Orders Found</h4>
                                <p className="text-sm font-medium text-slate-400 mb-8 max-w-xs mx-auto">
                                    You haven't placed any orders from this device yet. Start your design journey today.
                                </p>
                                <button
                                    onClick={() => navigate('/catalog')}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff4d00] transition-all shadow-xl shadow-slate-200"
                                >
                                    Browse Products
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order, i) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => navigate(`/track/${order.token}`)}
                                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#ff4d00]/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                            <div className="w-20 h-20 bg-slate-50 rounded-2xl p-2 border border-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={order.image} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest">{order.token}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(order.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-black text-slate-900 mb-1">{order.title}</h4>
                                                <p className="text-sm font-black text-slate-900">${Number(order.total || 0).toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:flex flex-col items-end mr-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-600 tracking-widest">
                                                        Live Tracking
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#ff4d00] group-hover:text-white group-hover:border-[#ff4d00] transition-all">
                                                    <ExternalLink size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
