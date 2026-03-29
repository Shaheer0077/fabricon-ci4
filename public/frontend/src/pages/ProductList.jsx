import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/catalog/Sidebar';
import ProductCard from '../components/catalog/ProductCard';
import { ChevronRight, SlidersHorizontal, ChevronDown, LayoutGrid, List, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/client';

const ProductList = () => {
    const { category } = useParams();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const subcategory = queryParams.get('subcategory');
    const searchQuery = queryParams.get('q');
    const highlight = queryParams.get('highlight');

    const getTitle = () => {
        if (searchQuery) return `Results for "${searchQuery}"`;
        if (highlight === 'special-offers') return "Special Offers";
        if (highlight === 'new-products') return "New Arrivals";
        if (highlight === 'eco-friendly') return "Eco-Friendly Collection";
        if (subcategory) return subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
        if (category) return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return "All Products";
    };

    const categoryTitle = getTitle();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data } = await API.get('/products');

                let filtered = data;

                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    filtered = data.filter(p =>
                        p.title?.toLowerCase().includes(q) ||
                        p.category?.toLowerCase().includes(q) ||
                        p.description?.toLowerCase().includes(q)
                    );
                } else if (category && category.toLowerCase() !== 'all') {
                    filtered = data.filter(p => {
                        const productCat = p.category?.toLowerCase();
                        const urlCat = category.toLowerCase();
                        const catMatch = productCat === urlCat || productCat?.replace(/ /g, '-') === urlCat;

                        if (subcategory) {
                            const productSub = p.subcategory?.toLowerCase();
                            const urlSub = subcategory.toLowerCase();
                            return catMatch && (productSub === urlSub || productSub?.replace(/ /g, '-') === urlSub);
                        }
                        return catMatch;
                    });
                }

                if (highlight === 'special-offers') {
                    filtered = filtered.filter(p => p.isSpecialOffer);
                } else if (highlight === 'eco-friendly') {
                    filtered = filtered.filter(p => p.isEcoFriendly);
                } else if (highlight === 'new-products') {
                    filtered = filtered.slice(0, 6);
                }

                setProducts(filtered);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
        setShowMobileFilters(false);
    }, [category, searchQuery, subcategory, highlight]);

    return (
        <div className="bg-[#fafafa] min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-6 lg:px-12">

                {/* Header section with Breadcrumbs */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        <Link to="/" className="hover:text-[#ff4d00] transition-colors">Home</Link>
                        <ChevronRight size={12} />
                        <Link to="/catalog" className="hover:text-[#ff4d00] transition-colors">Catalog</Link>
                        {(category || searchQuery) && (
                            <>
                                <ChevronRight size={12} />
                                <Link to={subcategory ? `/catalog/${category}` : '#'} className={subcategory ? "hover:text-[#ff4d00]" : "text-slate-900"}>
                                    {category ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : categoryTitle}
                                </Link>
                                {subcategory && (
                                    <>
                                        <ChevronRight size={12} />
                                        <span className="text-slate-900">{categoryTitle}</span>
                                    </>
                                )}
                            </>
                        )}
                        {highlight && !category && !searchQuery && (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-slate-900">{categoryTitle}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                {categoryTitle}
                            </h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                                {products.length} Items Available
                            </p>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? "text-[#ff4d00] bg-orange-50" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? "text-[#ff4d00] bg-orange-50" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-[#ff4d00] transition-all"
                            >
                                <SlidersHorizontal size={16} /> Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
                        <div className="relative bg-white w-4/5 max-w-sm h-full overflow-y-auto p-6 flex-col animate-in slide-in-from-left duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Filters</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <Sidebar onClose={() => setShowMobileFilters(false)} />

                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-24 p-8 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <Sidebar />
                        </div>
                    </div>


                    {/* Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Archives...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-10">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">
                                    <Search size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No results found</h3>
                                <p className="text-slate-500 max-w-sm mb-10 font-medium">We couldn't find any products matching your criteria. Try adjusting your search or category.</p>
                                <Link to="/catalog" className="px-10 py-4 bg-[#ff4d00] text-white rounded-2x font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/10">
                                    Return to Catalog
                                </Link>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        viewMode={viewMode}
                                        product={{
                                            id: product.id,
                                            title: product.title,
                                            images: product.images || [],
                                            price: product.price,
                                            category: product.category,
                                            rating: 4.8,
                                            reviews: 120,
                                            colors: product.colors || [],
                                            sizes: product.sizes?.join(' - ') || "S - XL"
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
