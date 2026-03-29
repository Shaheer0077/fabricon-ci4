import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Globe, UserPlus, LayoutDashboard, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setIsSearchOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-[1280px] mx-auto h-20 flex items-center justify-between px-6 md:px-12 lg:px-20">

                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:bg-[#ff4d00] transition-colors shadow-lg shadow-black/5">
                            <span className="text-white font-black text-xl italic">F</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                            Fabricon
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        <Link to="/catalog" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#ff4d00] transition-colors">Catalog</Link>
                        <Link to="/catalog/men" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#ff4d00] transition-colors">Men</Link>
                        <Link to="/catalog/women" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#ff4d00] transition-colors">Women</Link>
                        <Link to="/catalog/kids" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#ff4d00] transition-colors">Kids</Link>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center relative group min-w-[240px]">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d00] transition-colors">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-[13px] font-bold outline-none focus:bg-white focus:border-[#ff4d00]/30 transition-all placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>

                    <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <Link to="/admin" className="p-3 text-slate-400 hover:text-[#ff4d00] transition-colors" title="Management Console">
                            <LayoutDashboard size={20} />
                        </Link>
                        <button className="p-3 text-slate-400 hover:text-[#ff4d00] transition-colors relative">
                            <ShoppingCart size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4d00] rounded-full" />
                        </button>
                    </div>

                    <Link to="/dashboard" className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-md text-[11px] font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-slate-200">
                        Track Orders
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
