import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    MapPin,
    Calendar,
    Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/client';

const OrderTracking = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await API.get(`/orders/track/${token}`);
                setOrder(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Order not found');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchOrder();
    }, [token]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="text-amber-500" size={24} />;
            case 'Processing': return <Package className="text-blue-500" size={24} />;
            case 'Shipped': return <Truck className="text-[#ff4d00]" size={24} />;
            case 'Delivered': return <CheckCircle2 className="text-emerald-500" size={24} />;
            case 'Cancelled': return <AlertCircle className="text-rose-500" size={24} />;
            default: return <Clock size={24} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Shipped': return 'bg-orange-50 text-[#ff4d00] border-orange-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <AlertCircle className="mx-auto text-rose-500 mb-6" size={64} />
                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase ">Order Not Found</h2>
                <p className="text-slate-500 font-medium mb-12">
                    We couldn't find an order with the tracking code <span className="text-slate-900 font-bold">{token}</span>.
                    Please double-check the code or contact support.
                </p>
                <button
                    onClick={() => navigate('/catalog')}
                    className="w-full py-5 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#ff4d00] transition-all"
                >
                    Return to Shop
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-20 px-6 sm:px-10 lg:px-20">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Status Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase  mb-2">Track Order</h1>
                                    <div className="flex items-center gap-3">
                                        <Hash size={14} className="text-slate-400" />
                                        <span className="text-xs font-black text-[#ff4d00] uppercase tracking-widest">{order.trackingToken}</span>
                                    </div>
                                </div>
                                <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 self-start sm:self-center ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                                </div>
                            </div>

                            {/* Tracking Progress */}
                            <div className="relative pb-12 overflow-hidden">
                                <div className="absolute left-[27px] top-0 bottom-12 w-[2px] bg-slate-100" />

                                <div className="space-y-12">
                                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                                        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                                        const currentIdx = steps.indexOf(order.status);
                                        const isCompleted = idx <= currentIdx;
                                        const isCurrent = idx === currentIdx;

                                        return (
                                            <div key={step} className={`relative flex items-center gap-8 ${!isCompleted ? 'opacity-30' : ''}`}>
                                                <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center z-10 transition-all ${isCompleted ? 'bg-white border-[#ff4d00] shadow-lg shadow-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                                                    {isCompleted ? <CheckCircle2 className="text-[#ff4d00]" size={20} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-[#ff4d00]' : 'text-slate-900'}`}>{step}</h4>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-1">
                                                        {isCurrent ? 'Current Status' : isCompleted ? 'Completed' : 'Expected soon'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm"
                        >
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
                                <Package size={18} className="text-[#ff4d00]" />
                                Order Composition
                            </h3>
                            <div className="space-y-8">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex gap-6 items-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-center">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-slate-900 mb-1">{item.title}</h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Size: {item.size}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Qty: {item.quantity}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full border border-slate-200" style={{ backgroundColor: item.color }} />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Finish</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar: Details */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm"
                        >
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Summary Details</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin size={16} className="text-slate-400 mt-1" />
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Shipping To</h4>
                                        <p className="text-xs font-bold text-slate-900">{order.customer.fullName}</p>
                                        <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">
                                            {order.shippingAddress.address},<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Calendar size={16} className="text-slate-400 mt-1" />
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Placed On</h4>
                                        <p className="text-xs font-bold text-slate-900">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-50">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter">${Number(order.totalPrice || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">Paid</div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Need Help?</h3>
                            <p className="text-xs font-bold leading-relaxed mb-6">
                                Our design specialists are here 24/7 to assist with your custom order.
                            </p>
                            <button className="w-full py-4 bg-[#ff4d00] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
