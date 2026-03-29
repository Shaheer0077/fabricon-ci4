import React, { useState, useEffect } from 'react';
import Sidebar from '../components/catalog/Sidebar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/client';
import { SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';


const Catalog = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);


    useEffect(() => {
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
        fetchCategories();
    }, []);

    return (
        <div className="bg-[#fafafa] min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Mobile Sidebar Toggle Button (Floating or inline) */}
                    <div className="lg:hidden fixed bottom-8 right-6 z-40">
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="flex items-center gap-2 px-6 py-4 bg-black text-white rounded-full font-bold shadow-2xl hover:scale-105 transition-transform active:scale-95"
                        >
                            <SlidersHorizontal size={18} className="text-[#ff4d00]" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Mobile Sidebar Drawer */}
                    <AnimatePresence>
                        {showMobileSidebar && (
                            <div className="fixed inset-0 z-[100] lg:hidden">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowMobileSidebar(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="relative bg-white w-[300px] h-full overflow-y-auto p-8 flex flex-col shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Navigation</h2>
                                        <button
                                            onClick={() => setShowMobileSidebar(false)}
                                            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <Sidebar onClose={() => setShowMobileSidebar(false)} />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-24 p-10 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                            <Sidebar />
                        </div>
                    </div>



                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight ">Master Catalog</h1>
                            <p className="text-slate-500 font-medium text-lg md:text-xl opacity-70">Curated craftsmanship for the discerning soul.</p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-12 h-12 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Assembling Collections...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {categories.map((cat, i) => (
                                    <Link
                                        to={`/catalog/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        key={i}
                                        className="group block relative overflow-hidden rounded-md h-[280px] bg-slate-100 border border-slate-200 transition-all shadow-sm hover:shadow-xl"
                                    >
                                        <motion.img
                                            src={cat.image ? `http://localhost:8080${cat.image}` : `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=300&text=${cat.name}`}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                                        <div className="absolute bottom-6 left-6">
                                            <span className="text-[#ff4d00] font-black text-[9px] uppercase tracking-[0.2em] mb-1 block">Browse</span>
                                            <h3 className="text-xl font-black text-white tracking-tight">{cat.name}</h3>
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{cat.subcategories?.length || 0} Subcategories</p>
                                        </div>
                                    </Link>
                                ))}

                                <Link
                                    to={`/all-products`}
                                    className="group block relative overflow-hidden rounded-md h-[280px] bg-slate-900 flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="w-10 h-10 bg-[#ff4d00] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                        <ArrowRight size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2">View All</h3>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-none">Complete Archives</p>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon for the fallback card
const ArrowRight = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default Catalog;
