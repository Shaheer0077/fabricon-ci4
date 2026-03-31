import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/client';

// Preload a single image, returns a promise
const preloadImage = (src) =>
    new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src); // resolve anyway to not block
        img.src = src;
    });

const CategoryCard = ({ cat, i, navigate }) => (
    <div
        onClick={() => navigate(`/catalog/${cat.name.toLowerCase().replace(/\s+/g, '-')}`)}
        className="bg-slate-100 rounded-xl overflow-hidden cursor-pointer relative group h-[300px]"
        style={{ animation: `fadeUp 0.4s ease forwards`, animationDelay: `${i * 0.04}s`, opacity: 0 }}
    >
        <img
            src={cat.image ? `http://localhost:8080${cat.image}` : `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=300`}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute bottom-6 left-6 z-10">
            <span className="bg-white px-4 py-2 rounded-md text-[10px] font-black text-slate-900 shadow-xl inline-block uppercase tracking-widest group-hover:bg-[#ff4d00] group-hover:text-white transition-all duration-300">
                {cat.name}
            </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
    </div>
);

const SkeletonCard = () => (
    <div className="rounded-xl bg-slate-100 h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
);

const CategoryGrid = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchAndPreload = async () => {
            try {
                const { data } = await API.get('/categories');
                const cats = data.slice(0, 8);

                // Preload ALL images in parallel before showing anything
                await Promise.all(
                    cats.map((cat) => {
                        const src = cat.image
                            ? `http://localhost:8080${cat.image}`
                            : `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=300`;
                        return preloadImage(src);
                    })
                );

                setCategories(cats);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setReady(true);
            }
        };
        fetchAndPreload();
    }, []);

    return (
        <section className="bg-white">
            {/* Inject keyframes once */}
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(200%); }
                }
            `}</style>

            <div className="container mx-auto px-6 lg:px-40 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* CTA Card — always instant */}
                    <div className="sm:col-span-2 bg-[#003d29] rounded-3xl p-8 flex flex-col justify-center min-h-[300px] relative overflow-hidden group">
                        <div className="relative z-10">
                            <span className="text-[#ff4d00] font-black tracking-[0.2em] text-[9px] uppercase mb-4 block">Fabricon Selection</span>
                            <h2 className="text-3xl md:text-[2.25rem] font-bold text-white mb-4 leading-[1.1] tracking-tight">
                                Timeless items <br />tailored for you
                            </h2>
                            <p className="text-white/60 text-base mb-8 font-medium max-w-md">
                                Discover a curated collection of premium artisanal products. Perfectly crafted, uniquely yours.
                            </p>
                            <button
                                onClick={() => navigate('/catalog')}
                                className="inline-flex items-center gap-3 bg-white hover:bg-[#ff4d00] hover:text-white text-slate-900 px-6 py-3.5 rounded-xl font-black transition-all text-[10px] group shadow-xl uppercase tracking-widest"
                            >
                                EXPLORE ALL
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                    </div>

                    {/* Skeletons → Cards (no layout shift) */}
                    {!ready
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : categories.map((cat, i) => (
                            <CategoryCard key={cat._id || i} cat={cat} i={i} navigate={navigate} />
                        ))
                    }
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;