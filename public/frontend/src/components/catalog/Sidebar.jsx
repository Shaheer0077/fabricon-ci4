import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import API from '../../api/client';

const Sidebar = ({ onClose }) => {
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [loading, setLoading] = useState(true);

    const handleLinkClick = () => {
        if (onClose) onClose();
    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/categories');
                setCategories(data);

                // Keep current category expanded if we're on a category page
                const pathParts = location.pathname.split('/');
                if (pathParts[1] === 'catalog' && pathParts[2]) {
                    const currentCat = data.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === pathParts[2].toLowerCase());
                    if (currentCat) {
                        setExpandedCategories(prev => ({ ...prev, [currentCat.id]: true }));
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, [location.pathname]);

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const hoverColor = "hover:text-[#ff4d00]";

    return (
        <aside className="w-full">
            <nav className="space-y-8">
                {/* Categories */}
                <div>
                    <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Layers size={12} /> Categories
                    </h3>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                to="/all-products"
                                onClick={handleLinkClick}
                                className={`flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-xl transition-all ${location.pathname === '/all-products'

                                    ? "bg-orange-50 text-[#ff4d00]"
                                    : `text-slate-600 ${hoverColor}`
                                    }`}
                            >
                                <span>All products</span>
                            </Link>
                        </li>

                        {loading ? (
                            <div className="px-3 py-4 space-y-2">
                                <div className="h-4 bg-slate-50 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-slate-50 rounded animate-pulse w-1/2"></div>
                                <div className="h-4 bg-slate-50 rounded animate-pulse w-2/3"></div>
                            </div>
                        ) : categories.map((cat) => {
                            const isExpanded = expandedCategories[cat.id];
                            const isActive = location.pathname === `/catalog/${cat.name.toLowerCase().replace(/\s+/g, '-')}`;

                            return (
                                <li key={cat.id} className="space-y-1">
                                    <div className="flex items-center">
                                        <Link
                                            to={`/catalog/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                                            onClick={handleLinkClick}
                                            className={`flex-grow flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-xl transition-all ${isActive

                                                ? "bg-orange-50 text-[#ff4d00]"
                                                : `text-slate-600 ${hoverColor}`
                                                }`}
                                        >
                                            <span>{cat.name}</span>
                                        </Link>
                                        {cat.subcategories && cat.subcategories.length > 0 && (
                                            <button
                                                onClick={() => toggleCategory(cat.id)}
                                                className="p-2 text-slate-300 hover:text-[#ff4d00] transition-colors"
                                            >
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                        )}
                                    </div>

                                    {isExpanded && cat.subcategories && (
                                        <ul className="pl-6 space-y-1 overflow-hidden transition-all duration-300">
                                            {cat.subcategories.map((sub, idx) => {
                                                const subPath = `/catalog/${cat.name.toLowerCase().replace(/\s+/g, '-')}?subcategory=${sub.toLowerCase().replace(/\s+/g, '-')}`;
                                                const isSubActive = location.pathname + location.search === subPath;

                                                return (
                                                    <li key={idx}>
                                                        <Link
                                                            to={subPath}
                                                            onClick={handleLinkClick}
                                                            className={`block px-3 py-1.5 text-[12px] font-semibold border-l-2 transition-all ${isSubActive

                                                                ? "border-[#ff4d00] text-[#ff4d00] bg-orange-50/50"
                                                                : "border-transparent text-slate-500 hover:text-[#ff4d00] hover:border-slate-200"
                                                                }`}
                                                        >
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="border-t border-slate-100 mx-2" />

                {/* Filter Markers */}
                <div>
                    <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Highlights</h3>
                    <ul className="space-y-1">
                        {[
                            { label: "Special offers", slug: "special-offers" },
                            { label: "New products", slug: "new-products" },
                            { label: "Eco-friendly", slug: "eco-friendly" }
                        ].map((item, i) => {
                            const isHighlightActive = location.pathname === '/all-products' && location.search === `?highlight=${item.slug}`;
                            return (
                                <li key={i}>
                                    <Link
                                        to={`/all-products?highlight=${item.slug}`}
                                        onClick={handleLinkClick}
                                        className={`block w-full text-left px-3 py-2 text-[13px] font-bold rounded-xl transition-colors whitespace-nowrap ${isHighlightActive

                                            ? "bg-orange-50 text-[#ff4d00]"
                                            : `text-slate-600 ${hoverColor}`
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
