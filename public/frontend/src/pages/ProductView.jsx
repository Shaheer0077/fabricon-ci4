import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star,
    ChevronRight,
    Palette,
    Truck,
    Clock,
    ShieldCheck,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Plus,
    Minus,
    Heart,
    Share2,
    Check,
    Ruler,
    Info,
    MapPin,
    Layers,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/client';

const ProductView = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [mainImage, setMainImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await API.get(`/products/${productId}`);
                setProduct(data);
                if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
                if (data.defaultColor && data.colors) {
                    const defaultIndex = data.colors.indexOf(data.defaultColor);
                    if (defaultIndex !== -1) setSelectedColor(defaultIndex);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Details...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Product not found</h2>
                <Link to="/catalog" className="text-[#ff4d00] font-bold hover:underline">Back to Catalog</Link>
            </div>
        </div>
    );

    const productImages = product.images?.length > 0
        ? product.images.map(img => img.startsWith('http') ? img : `http://localhost:8080${img}`)
        : ['https://via.placeholder.com/600x800?text=No+Image+Available'];

    return (
        <div className="bg-white min-h-screen pt-24 pb-20">
            <div className="max-w-[1280px] mx-auto px-10 md:px-16 lg:px-20">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-8 py-2">
                    <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <ChevronRight size={12} strokeWidth={3} className="text-slate-300" />
                    <Link to="/catalog" className="hover:text-slate-900 transition-colors">Catalog</Link>
                    <ChevronRight size={12} strokeWidth={3} className="text-slate-300" />
                    <span className="text-slate-900 font-semibold">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

                    {/* Left Side: Image Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-[4/5] bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={mainImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    src={productImages[mainImage]}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-8 mix-blend-multiply"
                                />
                            </AnimatePresence>

                            {productImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setMainImage((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
                                    >
                                        <ChevronLeft size={20} className="text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => setMainImage((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
                                    >
                                        <ChevronRightIcon size={20} className="text-slate-600" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {productImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMainImage(i)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-50 ${mainImage === i ? 'border-[#ff4d00]' : 'border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Info */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <span className="bg-slate-100 text-slate-500 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                                {product.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className={i < 4 ? "text-amber-400 fill-amber-400" : "text-amber-400"} />
                                    ))}
                                    <span className="ml-2 text-sm font-bold text-slate-900">4.8</span>
                                    <span className="ml-1 text-sm font-medium text-slate-400">(293 reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium">
                            {product.description}
                        </p>

                        {/* Options */}
                        <div className="space-y-8 mb-10">
                            {product.colors?.length > 0 && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Palette</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.colors.map((color, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedColor(i)}
                                                className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm ${selectedColor === i ? 'border-[#ff4d00] scale-110' : 'border-transparent hover:border-slate-200'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {selectedColor === i && (
                                                    <Check size={18} className={color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f5f5f5' ? 'text-slate-900' : 'text-white'} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.sizes?.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Fit</label>
                                        <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1 hover:text-[#ff4d00]">
                                            <Ruler size={12} /> Size Guide
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[56px] h-14 flex items-center justify-center rounded-xl border-2 transition-all font-black text-sm ${selectedSize === size
                                                        ? 'border-slate-900 text-slate-900 bg-white shadow-md'
                                                        : 'border-slate-100 text-slate-400 bg-slate-50 hover:border-slate-200'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price & Shipping */}
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Pricing</p>
                                    <h3 className="text-4xl font-black text-slate-900">${Number(product.price || 0).toFixed(2)}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">In Stock</p>
                                    <div className="flex items-center gap-1 text-slate-900 font-bold text-sm justify-end">
                                        <Truck size={16} /> Fast Shipping
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pb-6 border-b border-slate-200/50 mb-6">
                                <Clock size={14} className="text-[#ff4d00]" />
                                Estimated delivery: <span className="text-slate-900 font-bold">Feb 16–18</span>
                            </div>

                            <button
                                onClick={() => navigate(`/customize/${productId}`)}
                                className="w-full py-5 bg-[#ff4d00] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-orange-500/10 active:scale-[0.98]"
                            >
                                CUSTOMIZE YOUR ITEM
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                                <ShieldCheck className="text-emerald-500" size={20} />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-tight">Secure <br />Satisfaction</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                                <Palette className="text-[#ff4d00]" size={20} />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-tight">Artisanal <br />Curation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView;
