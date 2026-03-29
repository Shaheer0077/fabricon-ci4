import React from 'react';
import { Star, Palette, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`group premium-card p-4 ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-6 sm:items-center w-full' : 'flex flex-col'}`}
        >
            {/* Image Container */}
            <div className={`relative bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${viewMode === 'list' ? 'w-full sm:w-48 h-48 mb-0' : 'aspect-4/5 mb-6'}`}>
                {product.badge && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">
                        {product.badge}
                    </div>
                )}

                <img
                    src={product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:8080${product.images[0]}`) : 'https://via.placeholder.com/400?text=No+Image'}
                    alt={product.title}
                    className="w-[85%] h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />

                {/* Quick Actions — always visible on mobile, slide-in on hover for desktop */}
                <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-0 lg:translate-y-20 lg:group-hover:translate-y-0 transition-transform duration-500">
                    <Link
                        to={`/product/${product.id}`}
                        className="flex-1 bg-white hover:bg-[#ff4d00] hover:text-white text-slate-900 border border-slate-200 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center gap-2 text-center"
                    >
                        <Eye size={14} /> View
                    </Link>
                    <Link
                        to={`/customize/${product.id}`}
                        className="flex-1 bg-[#ff4d00] hover:bg-[#e64500] text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2 text-center"
                    >
                        <Palette size={14} /> Customize
                    </Link>
                </div>
            </div>

            {/* Product Details */}
            <div className={`space-y-3 px-2 flex-grow w-full ${viewMode === 'list' ? 'pb-0' : 'pb-2'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-slate-600">{product.rating}</span>
                        <span className="text-[11px] text-slate-400">({product.reviews})</span>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#ff4d00] transition-colors line-clamp-2 leading-tight">
                    {product.title}
                </h4>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                        {product.colors?.slice(0, 6).map((color, i) => (
                            <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-slate-200 shadow-sm"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        {product.colors?.length > 6 && (
                            <span className="text-[10px] font-bold text-slate-400 pl-1">
                                +{product.colors.length - 6}
                            </span>
                        )}
                    </div>
                    <p className="text-lg font-extrabold text-slate-900">
                        ${product.price}
                    </p>
                </div>

                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t border-slate-50 pt-3">
                    {product.sizes} • Professional Grade
                </p>
            </div>
        </motion.div>
    );
};

export default ProductCard;

