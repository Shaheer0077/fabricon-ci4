import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, Sparkles, Palette, Box, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KidWear from '../../assets/Images/KidsWears.png'
import TrackSuit from '../../assets/Images/TrackSuits.png'
import MensWear from '../../assets/Images/MenWears.png'
import WomenWear from '../../assets/Images/WomenWears.png'
import Hoodies from '../../assets/Images/OversizedHoodie.png'



const Hero = () => {
    const navigate = useNavigate();
    const marqueeControls = useAnimation();

    useEffect(() => {
        marqueeControls.start({
            x: [0, -2000],
            transition: {
                duration: 50,
                repeat: Infinity,
                ease: "linear",
            },
        });
    }, [marqueeControls]);

    const products = [
        { img: TrackSuit, title: "Track Suits", path: "/catalog/men" },
        { img: MensWear, title: "Mens Wears", path: "/catalog/men" },
        { img: KidWear, title: "Kids Wears", path: "/catalog/kids" },
        { img: Hoodies, title: "Hoodies", path: "/catalog/hoodies" },
        { img: WomenWear, title: "Women Wears", path: "/catalog/women" },
    ];

    return (
        <section className="relative pt-24 pb-0 overflow-hidden bg-white">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-50/50 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-[#ff4d00] text-xs font-black uppercase tracking-[0.2em] mb-10 border border-orange-100/50">
                        <Sparkles size={14} /> Design Your Future
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-10 tracking-tighter">
                        Custom products in <br />
                        <span className="text-gradient">any quantity.</span>
                    </h1>

                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Create and order premium branded merchandise with no minimums.
                        Professional tools for artists, brands, and dreamers.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 77, 0, 0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/catalog')}
                        className="bg-[#111827] text-white px-12 py-5 rounded-xl font-black text-lg flex items-center gap-3 mx-auto transition-all group cursor-pointer"
                    >
                        Explore Products
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </div>

            {/* ✅ Marquee (Reduced Size) */}
            <div
                className="mt-16 relative overflow-hidden py-16 bg-[#111827] mask-fade"
                onMouseEnter={() => marqueeControls.stop()}
                onMouseLeave={() =>
                    marqueeControls.start({
                        x: [0, -2000],
                        transition: {
                            duration: 50,
                            repeat: Infinity,
                            ease: "linear",
                        },
                    })
                }
            >
                <motion.div className="flex gap-8" animate={marqueeControls}>
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-12">
                            {products.map((product, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    onClick={() => navigate(product.path)}
                                    className="relative w-64 h-[340px] cursor-pointer group"
                                >
                                    {/* Tilted Orange Background */}
                                    <div className="absolute inset-0 rounded-2xl bg-[#ff4d00] rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl opacity-90" />

                                    {/* Front Card */}
                                    <div className="relative w-full h-full bg-white rounded-2xl p-4 flex flex-col justify-between shadow-lg border border-slate-100">
                                        <div className="w-full flex-1 relative mb-3 min-h-[180px]">
                                            <div className="absolute inset-0 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <img
                                                    src={product.img}
                                                    alt={product.title}
                                                    className="relative z-10 w-[90%] h-[90%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center flex-shrink-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00] mb-1">Customizable</p>
                                            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.title}</h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ✅ Features Section (Boxes) */}
            <div className="container mx-auto px-12 lg:px-40 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: <Palette size={28} />,
                            title: "Easy Customization",
                            desc: "Powerful online tools to add your logic and designs instantly."
                        },
                        {
                            icon: <Box size={28} />,
                            title: "No Order Minimums",
                            desc: "Order one item for yourself or thousands for your entire company."
                        },
                        {
                            icon: <Truck size={28} />,
                            title: "Global Fulfillment",
                            desc: "Fast worldwide shipping with localized printing centers."
                        },
                        {
                            icon: <Sparkles size={28} />,
                            title: "Premium Quality",
                            desc: "We use only the best fabrics and professional-grade printing techniques."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#ff4d00]/20 transition-all group">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff4d00] mb-6 group-hover:bg-[#ff4d00] group-hover:text-white transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Badges Footer (Simplified) */}
            <div className="container mx-auto px-6 pb-12 opacity-30">
                <div className="flex flex-wrap justify-center gap-12 grayscale border-t border-slate-100">
                    {["10k+ Brands", "Worldwide Shipping", "Eco Options", "Top Quality"].map((text, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                            <div className="w-1.5 h-1.5 bg-[#ff4d00] rounded-full" />
                            {text}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
