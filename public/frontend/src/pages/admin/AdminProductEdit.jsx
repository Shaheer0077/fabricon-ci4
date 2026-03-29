import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Check, Image as ImageIcon, Plus, Info } from 'lucide-react';
import API from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_PALETTE = [
    '#000000', // Black
    '#FFFFFF', // White
    '#3B82F6', // Royal Blue
    '#EF4444', // Red
    '#22C55E', // Green
    '#F59E0B', // Amber
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#6B7280', // Slate
    '#7C3AED'  // Violet
];

const AdminProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fromCategory = location.state?.fromCategory || 'All';

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [description, setDescription] = useState('');
    const [colors, setColors] = useState('');
    const [defaultColor, setDefaultColor] = useState('');
    const [sizes, setSizes] = useState('');
    const [images, setImages] = useState([]);
    const [isSpecialOffer, setIsSpecialOffer] = useState(false);
    const [isEcoFriendly, setIsEcoFriendly] = useState(false);

    // View States
    const [views, setViews] = useState({
        front: null,
        back: null,
        leftSleeve: null,
        rightSleeve: null,
        insideLabel: null,
        outsideLabel: null
    });

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            navigate('/admin/login');
        } else {
            fetchCategories();
            if (id) {
                fetchProduct();
            }
        }
    }, [id, navigate]);

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/products/${id}`);
            setTitle(data.title);
            setPrice(data.price);
            setCategory(data.category);
            setSubcategory(data.subcategory || '');
            setDescription(data.description);
            setColors(data.colors ? data.colors.join(', ') : '');
            setDefaultColor(data.defaultColor || '');
            setSizes(data.sizes ? data.sizes.join(', ') : '');
            setImages(data.images || []);
            setIsSpecialOffer(data.isSpecialOffer || false);
            setIsEcoFriendly(data.isEcoFriendly || false);

            // Set Views
            if (data.views) {
                setViews({
                    front: data.views.front || null,
                    back: data.views.back || null,
                    leftSleeve: data.views.leftSleeve || null,
                    rightSleeve: data.views.rightSleeve || null,
                    insideLabel: data.views.insideLabel || null,
                    outsideLabel: data.views.outsideLabel || null
                });
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (category) {
            const selectedCat = categories.find(c => c.name === category);
            setSubcategories(selectedCat ? selectedCat.subcategories : []);
        } else {
            setSubcategories([]);
        }
    }, [category, categories]);

    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImages([...images, file]);
        e.target.value = ''; // Reset to allow re-uploading the  file
    };

    const handleViewUpload = (e, viewName) => {
        const file = e.target.files[0];
        if (!file) return;
        setViews(prev => ({ ...prev, [viewName]: file }));
        e.target.value = ''; // Reset to allow re-uploading the  file
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('subcategory', subcategory);
            formData.append('description', description);

            colors.split(',').map(c => c.trim()).filter(c => c).forEach(c => formData.append('colors', c));
            formData.append('defaultColor', defaultColor);
            sizes.split(',').map(s => s.trim()).filter(s => s).forEach(s => formData.append('sizes', s));
            formData.append('isSpecialOffer', isSpecialOffer);
            formData.append('isEcoFriendly', isEcoFriendly);

            // General Images
            images.forEach((img) => {
                if (typeof img === 'string') {
                    formData.append('existingImages', img);
                } else {
                    formData.append('images', img);
                }
            });

            // View Images
            Object.keys(views).forEach(key => {
                const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                if (views[key] instanceof File) {
                    formData.append(`view${capitalizedKey}`, views[key]);
                } else if (views[key]) {
                    formData.append(`existingView${capitalizedKey}`, views[key]);
                }
            });

            if (id) {
                await API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate('/admin', { state: { category: fromCategory } });
                }, 1500);
            } else {
                const { data } = await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate(`/admin/product/edit/${data.id}`, { replace: true, state: { fromCategory: fromCategory } });
                }, 1500);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    const renderViewUpload = (label, viewKey) => (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <label className="cursor-pointer relative aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-[#ff4d00]/50 hover:bg-orange-50/20 transition-all group overflow-hidden">
                {views[viewKey] ? (
                    <img
                        src={views[viewKey] instanceof File ? URL.createObjectURL(views[viewKey]) : (views[viewKey].startsWith('http') ? views[viewKey] : `http://localhost:8080${views[viewKey]}`)}
                        alt={label}
                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                    />
                ) : (
                    <div className="flex flex-col items-center">
                        <Plus size={20} className="text-slate-300 group-hover:text-[#ff4d00] transition-colors" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Upload</span>
                    </div>
                )}
                <input type="file" className="hidden" onChange={(e) => handleViewUpload(e, viewKey)} accept="image/*" />
            </label>
            {views[viewKey] && (
                <button onClick={() => setViews(prev => ({ ...prev, [viewKey]: null }))} className="text-[9px] text-red-500 font-bold hover:underline self-center">Remove</button>
            )}
        </div>
    );

    if (loading && id) return <div className="h-screen flex items-center justify-center font-black text-slate-300 uppercase tracking-widest text-xs">Loading Blueprint...</div>;

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <AdminSidebar />
            
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-8 left-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
                    >
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">Changes Captured Successfully</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-grow lg:ml-60 p-6 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <Link 
                                to="/admin" 
                                state={{ category: fromCategory }}
                                className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-xl transition-all shadow-sm"
                                title="Back to Inventory"
                            >
                                <ArrowLeft size={18} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {id ? 'Refine Product' : 'New Creation'}
                                </h1>
                                <p className="text-slate-400 text-xs font-bold mt-1">Configure your artisanal assets and market specs</p>
                            </div>
                        </div>

                        <button
                            onClick={submitHandler}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-[#ff4d00] hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/10 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={18} /> {id ? 'Save Changes' : 'Publish Product'}</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Media Column */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Specific Views Section */}
                            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <ImageIcon size={14} className="text-[#ff4d00]" /> Configuration Views
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderViewUpload('Front View', 'front')}
                                    {renderViewUpload('Back View', 'back')}
                                    {renderViewUpload('L. Sleeve', 'leftSleeve')}
                                    {renderViewUpload('R. Sleeve', 'rightSleeve')}
                                    {renderViewUpload('Inside', 'insideLabel')}
                                    {renderViewUpload('Outside', 'outsideLabel')}
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <ImageIcon size={14} className="text-[#ff4d00]" /> Gallery Visuals
                                </h3>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden group">
                                            <img
                                                src={typeof img === 'string' ? (img.startsWith('http') ? img : `http://localhost:8080${img}`) : URL.createObjectURL(img)}
                                                alt=""
                                                className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white shadow-md text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="cursor-pointer aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-[#ff4d00]/50 hover:bg-orange-50/20 transition-all group">
                                        <Plus size={20} className="text-slate-300 group-hover:text-[#ff4d00] transition-colors" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Upload</span>
                                        <input type="file" className="hidden" onChange={uploadFileHandler} multiple />
                                    </label>
                                </div>

                                <p className="text-slate-400 text-[9px] font-bold leading-relaxed flex items-start gap-2 italic">
                                    <Info size={10} className="mt-0.5 shrink-0" /> Higher resolution PNGs with transparency provide the best results.
                                </p>
                            </section>

                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100/50">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Check size={12} /> Sync Status
                                </h4>
                                <p className="text-[10px] text-blue-900/60 font-medium leading-normal">
                                    Changes are synchronized with the primary node immediately upon publication.
                                </p>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-8">
                            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Specifications Blueprint</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Market Identity</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Archetype Heavyweight Tee"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Price Point (USD)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Domain Category</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all appearance-none cursor-pointer"
                                            value={category}
                                            onChange={(e) => {
                                                setCategory(e.target.value);
                                                setSubcategory(''); // Reset subcategory when category changes
                                            }}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Subcategory</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                            value={subcategory}
                                            onChange={(e) => setSubcategory(e.target.value)}
                                            disabled={!category || subcategories.length === 0}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {subcategories.map((sub, idx) => (
                                                <option key={idx} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Size Tier (CSV)</label>
                                        <input
                                            type="text"
                                            placeholder="S, M, L, XL"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={sizes}
                                            onChange={(e) => setSizes(e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 px-1">Selected Palette Presets (10 Unique Shades)</label>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                {PRESET_PALETTE.map((c, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentColors = colors.split(',').map(x => x.trim()).filter(x => x);
                                                            if (!currentColors.includes(c)) {
                                                                setColors(prev => prev ? `${prev}, ${c}` : c);
                                                            }
                                                        }}
                                                        className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 hover:shadow-lg ${colors.includes(c) ? 'border-[#ff4d00]' : 'border-slate-200/60 shadow-sm'}`}
                                                        style={{ backgroundColor: c }}
                                                        title={c}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex-grow">
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Hex Codes (Comma Separated)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="#000000, #FFFFFF"
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#ff4d00]/30 rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                                        value={colors}
                                                        onChange={(e) => setColors(e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:w-32">
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Actions</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setColors('');
                                                            setDefaultColor('');
                                                        }}
                                                        className="w-full px-4 py-3 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-6 border-t border-slate-100 pt-6">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Default Applied Color</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {colors.split(',').map(c => c.trim()).filter(c => c).map((c, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => setDefaultColor(c)}
                                                            className={`px-3 py-1.5 rounded-lg border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${defaultColor === c ? 'border-[#ff4d00] bg-orange-50 text-[#ff4d00]' : 'border-slate-200/60 bg-white text-slate-400 hover:border-slate-300'}`}
                                                        >
                                                            <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c }} />
                                                            {c}
                                                            {defaultColor === c && <Check size={12} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isSpecialOffer}
                                                    onChange={(e) => setIsSpecialOffer(e.target.checked)}
                                                />
                                                <div className={`w-5 h-5 rounded border ${isSpecialOffer ? 'bg-[#ff4d00] border-[#ff4d00]' : 'bg-white border-slate-300'} transition-colors flex items-center justify-center shadow-sm group-hover:border-[#ff4d00]/50`}>
                                                    {isSpecialOffer && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Special Offer</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isEcoFriendly}
                                                    onChange={(e) => setIsEcoFriendly(e.target.checked)}
                                                />
                                                <div className={`w-5 h-5 rounded border ${isEcoFriendly ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'} transition-colors flex items-center justify-center shadow-sm group-hover:border-emerald-500/50`}>
                                                    {isEcoFriendly && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Eco-friendly</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Craftsmanship Narrative</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Detail the narrative, texture, and fit philosophy..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-medium text-sm text-slate-900 outline-none transition-all resize-none leading-relaxed"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductEdit;
