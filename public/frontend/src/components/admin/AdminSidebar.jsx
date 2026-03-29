import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ExternalLink, LogOut, Layers } from 'lucide-react';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    const currentPath = window.location.pathname;

    return (
        <div className="w-60 bg-[#0f172a] text-white hidden lg:flex flex-col fixed h-full shadow-2xl z-20">
            <div className="p-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#ff4d00] to-[#ff7840] rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/20">F</div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-widest uppercase">Fabricon</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Management Console</span>
                    </div>
                </div>
            </div>

            <nav className="px-4 space-y-1 flex-grow">
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Main Navigation</p>

                <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentPath === '/admin' || currentPath.startsWith('/admin/product')
                        ? 'bg-[#ff4d00]/10 text-[#ff4d00]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <LayoutDashboard size={18} /> <span className="text-sm">Catalog</span>
                </Link>

                <Link
                    to="/admin/orders"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentPath === '/admin/orders'
                        ? 'bg-[#ff4d00]/10 text-[#ff4d00]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <ShoppingBag size={18} /> <span className="text-sm">Orders</span>
                </Link>

                <Link
                    to="/admin/categories"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentPath === '/admin/categories'
                        ? 'bg-[#ff4d00]/10 text-[#ff4d00]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Layers size={18} /> <span className="text-sm">Categories</span>
                </Link>

                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all group"
                >
                    <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> <span className="text-sm">Storefront</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                <button
                    onClick={logoutHandler}
                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 w-full text-left font-bold transition-colors group rounded-xl hover:bg-red-500/5"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
