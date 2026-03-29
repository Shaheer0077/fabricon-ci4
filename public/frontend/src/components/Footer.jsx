import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, ChevronUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const sections = [
        {
            title: "Marketplace",
            links: [
                { name: "Full Catalog", h: "/catalog" },
                { name: "Men's Collection", h: "/catalog/men" },
                { name: "Women's Collection", h: "/catalog/women" },
                { name: "Kids' & Youth", h: "/catalog/kids" },
                { name: "Premium Hoodies", h: "/catalog/hoodies" }
            ]
        },
        {
            title: "Artisanal Hub",
            links: [
                { name: "Our Philosophy", h: "#" },
                { name: "Eco-Friendly Tech", h: "#" },
                { name: "Design Studio", h: "#" },
                { name: "Partner Program", h: "#" }
            ]
        },
        {
            title: "Framework",
            links: [
                { name: "API Reference", h: "#" },
                { name: "Global Shipping", h: "#" },
                { name: "Merchant Docs", h: "#" },
                { name: "Help Terminal", h: "#" }
            ]
        }
    ];

    return (
        <footer className="bg-[#0f172a] text-white">
            {/* Newsletter Section */}
            <div className="max-w-[1280px] mx-auto px-10 md:px-20 py-20 border-b border-white/5">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div className="max-w-xl">
                        <h3 className="text-3xl font-black tracking-tight mb-4">Join the Craft Registry</h3>
                        <p className="text-slate-400 font-medium">Get internal updates on new artisanal releases and architectural improvements to the Fabricon engine.</p>
                    </div>
                    <div className="w-full lg:w-auto flex gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email node"
                            className="bg-white/5 border border-white/10 rounded-md px-6 py-4 outline-none focus:border-[#ff4d00]/50 transition-all font-medium text-sm flex-grow lg:w-80"
                        />
                        <button className="bg-[#ff4d00] hover:bg-white hover:text-slate-900 text-white px-8 py-4 rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/10">
                            Connect
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-10 md:px-20 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-8 group">
                            <div className="w-10 h-10 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                                <span className="text-white font-black text-xl italic">F</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase">Fabricon</span>
                        </Link>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm mb-10 italic">
                            Redefining the boundaries of custom-tailored merchandise. Fabricon is a professional platform for creators, brands, and artisanal explorers.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                                <button key={i} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#ff4d00] hover:text-white transition-all">
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {sections.map((section, idx) => (
                        <div key={idx}>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.h} className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 group">
                                            {link.name}
                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff4d00]" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        © 2026 Fabricon. Engine v1.0.4. All nodes secure.
                    </p>

                    <div className="flex gap-8 items-center">
                        <Link to="/admin" className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest hover:text-white transition-colors">Admin Console</Link>
                        <div className="flex gap-4 opacity-30">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 invert" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 invert" />
                        </div>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all shadow-xl"
                        >
                            <ChevronUp size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
