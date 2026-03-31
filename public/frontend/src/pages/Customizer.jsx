import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as fabricModule from 'fabric';
const fabric = fabricModule.fabric || fabricModule.default || fabricModule;

import {
    Type, Image as ImageIcon, Trash2, Layers, Box, Upload,
    Sticker, Zap, Crown, Droplets, X, ShoppingCart, Maximize2,
    Copy, Palette, ChevronLeft, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/client';
import { saveDesign as saveDesignToDB, getDesign, deleteDesign } from '../utils/db';

// ─── Constants outside component to prevent re-creation on every render ──────
const VIEW_OPTIONS = ['Front', 'Back', 'Left sleeve', 'Right sleeve', 'Inside label', 'Outside label'];

const FONT_COMBINATIONS = [
    { name: 'Stylish Script', text: 'Graceful', font: 'Rochester', size: 50, weight: '400' },
    { name: 'Cursive Chic', text: 'Chic Style', font: 'Pacifico', size: 45, weight: '400' },
    { name: 'Retro Soul', text: 'Handcrafted', font: 'Satisfy', size: 45, weight: '400' },
    { name: 'Power Bold', text: 'IMPACT', font: 'Archivo Black', size: 50, weight: '900' },
    { name: 'Comic Vibes', text: 'BOOM!', font: 'Bangers', size: 55, weight: '400', spacing: 2 },
    { name: 'Classic Serif', text: 'ESTABLISHED', font: 'Playfair Display', size: 35, weight: '700', style: 'italic' },
    { name: 'Arc Signature', text: 'CURVED TEXT', font: 'Rochester', size: 40, weight: '400', isArc: true },
    { name: 'Vintage Sport', text: 'VARSITY', font: 'Bebas Neue', size: 60, weight: '900', style: 'italic' },
    { name: 'Modern Minimal', text: 'ESSENTIALS', font: 'Inter', size: 40, weight: '400', spacing: 10 },
];

const READY_QUOTES = [
    { text: 'BURN FOR WHAT YOU LOVE', color: '#dc2626' },
    { text: "DON'T LIVE IN A COMFORT ZONE", color: '#2563eb' },
    { text: 'BETTER AN OOPS THAN WHAT IF', color: '#16a34a' },
    { text: 'CONSISTENCY IS KEY', color: '#1a1a1a' },
    { text: 'STAY REAL', color: '#ff4d00' },
    { text: 'LIMITLESS', color: '#8b5cf6' },
];

const CLIPART_CATEGORIES = {
    'Basic Shapes': [
        { type: 'circle', color: '#1a1a1a' },
        { type: 'rect', color: '#1a1a1a' },
        { type: 'triangle', color: '#1a1a1a' },
    ],
    'Icons': [
        'https://cdn-icons-png.flaticon.com/512/1043/1043431.png',
        'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
        'https://cdn-icons-png.flaticon.com/512/747/747376.png',
        'https://cdn-icons-png.flaticon.com/512/4359/4359295.png',
    ],
    'Illustrations': [
        'https://cdn-icons-png.flaticon.com/512/6062/6062646.png',
        'https://cdn-icons-png.flaticon.com/512/3661/3661330.png',
        'https://cdn-icons-png.flaticon.com/512/9379/9379854.png',
    ],
};

const FILL_COLORS = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#808080', '#ffa500',
    '#800080', '#008000', '#000080', '#800000',
];

const SIDEBAR_TOOLS = [
    { id: 'product', icon: Box, label: 'Product' },
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'clipart', icon: Sticker, label: 'Clipart' },
    { id: 'quick', icon: Zap, label: 'Quick' },
    { id: 'premium', icon: Crown, label: 'Premium' },
    { id: 'fill', icon: Droplets, label: 'Fill' },
];

// FIX: CI4 backend base URL — set VITE_API_BASE_URL=http://localhost:8080 in .env
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getProductImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=715&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    const clean = path.replace(/\\/g, '/');
    const final = clean.startsWith('/') ? clean : `/${clean}`;
    return `${API_BASE}${final}`;
};

// ─── FIX: Native-canvas tinting ──────────────────────────────────────────────
// multiply blend on a Fabric rect FAILS for removebg/transparent PNGs because
// the transparent area gets filled black. Instead we composite via native 2D canvas:
//   1. Draw original image
//   2. Multiply-fill the color on top
//   3. Use destination-in with original to restore transparency
// Result: only opaque/coloured pixels get tinted; transparent areas stay transparent.
const buildTintedDataURL = (htmlImg, color) => {
    const W = htmlImg.naturalWidth || 500;
    const H = htmlImg.naturalHeight || 580;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const ctx = off.getContext('2d');
    ctx.drawImage(htmlImg, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(htmlImg, 0, 0);
    return off.toDataURL('image/png');
};

// ─────────────────────────────────────────────────────────────────────────────

const Customizer = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const fileInputRef = useRef(null);

    const [canvas, setCanvas] = useState(null);
    const [activeTab, setActiveTab] = useState('text');
    const [selectedObject, setSelectedObject] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [colorReady, setColorReady] = useState(false);
    const [productColor, setProductColor] = useState('#ffffff');
    const [view, setView] = useState('Front');
    const [showPreview, setShowPreview] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewSnapshots, setViewSnapshots] = useState({});
    const [canvasObjects, setCanvasObjects] = useState([]);
    const [colorLayer, setColorLayer] = useState(null);

    // Refs that persist without re-renders
    const viewStates = useRef({});
    const prevViewRef = useRef(null);
    const currentViewRef = useRef('Front');
    const latestProductColorRef = useRef('#ffffff');
    const loadingViewRef = useRef(null);
    const snapshotTimeout = useRef(null);
    const colorSyncTimeout = useRef(null);

    // Keep ref in sync with state
    useEffect(() => { latestProductColorRef.current = productColor; }, [productColor]);
    useEffect(() => { currentViewRef.current = view; }, [view]);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const getViewImage = useCallback((viewName) => {
        if (!product) return null;
        let url = null;
        if (product.views) {
            switch (viewName) {
                case 'Front': url = product.views.front; break;
                case 'Back': url = product.views.back; break;
                case 'Left sleeve': url = product.views.leftSleeve; break;
                case 'Right sleeve': url = product.views.rightSleeve; break;
                case 'Inside label': url = product.views.insideLabel; break;
                case 'Outside label': url = product.views.outsideLabel; break;
            }
        }
        if (!url && viewName === 'Front') url = product.images?.[0];
        if (!url) return null;
        return getProductImageUrl(url);
    }, [product]);

    const saveDesign = useCallback(() => {
        if (!productId) return;
        saveDesignToDB(`fabricon_v2_design_${productId}`, {
            color: latestProductColorRef.current,
            states: viewStates.current,
        }).catch(err => console.error('Save failed:', err));
    }, [productId]);

    // ── Fetch Product ─────────────────────────────────────────────────────────

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            try {
                setLoading(true);
                setColorReady(false);

                const { data } = await API.get(`/products/${productId}`);
                if (!isMounted) return;

                console.log('Customizer: Product received:', data);
                setProduct(data);

                // Load saved design
                let parsed = null;
                try {
                    parsed = await getDesign(`fabricon_v2_design_${productId}`);
                } catch (e) {
                    console.warn('IndexedDB read failed', e);
                }

                if (!parsed) {
                    const ls = localStorage.getItem(`fabricon_v2_design_${productId}`);
                    if (ls) {
                        try {
                            parsed = JSON.parse(ls);
                            await saveDesignToDB(`fabricon_v2_design_${productId}`, parsed);
                            localStorage.removeItem(`fabricon_v2_design_${productId}`);
                        } catch (e) { console.warn('LS migration failed', e); }
                    }
                }

                // Resolve color — Backend uses camelCase (defaultColor) in formatProduct
                // but we check both just in case.
                let resolvedColor = '#ffffff';
                if (parsed?.color) {
                    resolvedColor = parsed.color;
                    console.log('Customizer: Restoring saved color:', resolvedColor);
                } else {
                    const backendDefault = data.defaultColor || data.default_color;
                    if (backendDefault) {
                        resolvedColor = backendDefault;
                    } else if (Array.isArray(data.colors) && data.colors.length > 0) {
                        const first = data.colors[0];
                        resolvedColor = typeof first === 'string' ? first : (first.hex || first.value || first.color || '#ffffff');
                    }
                    console.log('Customizer: Using initial color:', resolvedColor);
                }

                // Sync ref AND state immediately
                latestProductColorRef.current = resolvedColor;
                setProductColor(resolvedColor);

                if (parsed?.states) {
                    viewStates.current = parsed.states;
                    const snaps = {};
                    Object.keys(parsed.states).forEach(v => {
                        if (parsed.states[v].preview) snaps[v] = parsed.states[v].preview;
                    });
                    setViewSnapshots(snaps);
                }

                // Give it a tiny tick to ensure state set is processed before unlocking
                setTimeout(() => {
                    if (isMounted) {
                        setColorReady(true);
                        setLoading(false);
                    }
                }, 10);
            } catch (err) {
                console.error('Fetch product error:', err);
                if (isMounted) {
                    setColorReady(true);
                    setLoading(false);
                }
            }
        };

        run();
        return () => { isMounted = false; };
    }, [productId]); // eslint-disable-line

    // ── Reset ─────────────────────────────────────────────────────────────────

    const resetDesign = () => {
        if (!window.confirm('Reset all designs? This cannot be undone.')) return;
        deleteDesign(`fabricon_v2_design_${productId}`).catch(console.error);
        localStorage.removeItem(`fabricon_v2_design_${productId}`);
        viewStates.current = {};
        setViewSnapshots({});
        if (canvas) canvas.clear();

        const resetColor =
            product?.defaultColor || product?.default_color ||
            (Array.isArray(product?.colors) && product.colors.length > 0
                ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].hex || '#ffffff')
                : '#ffffff');

        latestProductColorRef.current = resetColor;
        setProductColor(resetColor);

        setView(cur => {
            const tmp = cur === 'Front' ? 'Back' : 'Front';
            setTimeout(() => setView(cur), 10);
            return tmp;
        });
    };

    // ── Canvas Init ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (loading || !canvasRef.current || fabricCanvas.current) return;

        const fc = new fabric.Canvas(canvasRef.current, {
            width: 500, height: 580,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            renderOnAddRemove: false,
        });

        fabric.Object.prototype.set({
            cornerColor: '#ff4d00', cornerStyle: 'circle', cornerSize: 10,
            borderColor: '#ff4d00', transparentCorners: false,
            borderScaleFactor: 2, objectCaching: true,
        });

        fabric.Object.prototype.controls.deleteControl = new fabric.Control({
            x: 0.5, y: -0.5, offsetY: -16, offsetX: 16, cursorStyle: 'pointer',
            mouseUpHandler: (_, t) => { t.target.canvas.remove(t.target); t.target.canvas.requestRenderAll(); return true; },
            render: (ctx, left, top) => {
                ctx.save(); ctx.translate(left, top);
                ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444'; ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke();
                ctx.restore();
            },
            cornerSize: 24,
        });

        const onSel = () => {
            const active = fc.getActiveObject();
            if (active?.data?.isBackground) { fc.discardActiveObject(); fc.requestRenderAll(); return; }
            setSelectedObject(active);
            if (active && (active.type === 'i-text' || active.type === 'text')) setActiveTab('text');
        };
        fc.on('selection:created', onSel);
        fc.on('selection:updated', onSel);
        fc.on('selection:cleared', () => setSelectedObject(null));

        const onChange = () => {
            setCanvasObjects([...fc.getObjects()]);
            updateCurrentViewSnapshot(fc);
            if (!loadingViewRef.current) {
                const av = currentViewRef.current;
                const json = fc.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
                json.objects = json.objects.filter(o => !o.data?.isBackground);
                viewStates.current[av] = { ...viewStates.current[av], json };
                saveDesign();
            }
        };
        fc.on('object:added', onChange);
        fc.on('object:removed', onChange);
        fc.on('object:modified', onChange);

        fabricCanvas.current = fc;
        setCanvas(fc);

        return () => { if (fabricCanvas.current) { fabricCanvas.current.dispose(); fabricCanvas.current = null; } };
    }, [loading]); // eslint-disable-line

    // ── Snapshot ──────────────────────────────────────────────────────────────

    const updateCurrentViewSnapshot = (tc) => {
        if (!tc || loadingViewRef.current) return;
        if (snapshotTimeout.current) clearTimeout(snapshotTimeout.current);
        snapshotTimeout.current = setTimeout(() => {
            try {
                const av = currentViewRef.current;
                const url = tc.toDataURL({ format: 'png', multiplier: 1, quality: 0.8 });
                setViewSnapshots(prev => {
                    if (prev[av] === url) return prev;
                    if (viewStates.current[av]) { viewStates.current[av].preview = url; saveDesign(); }
                    return { ...prev, [av]: url };
                });
            } catch (e) { console.warn('Snapshot failed', e); }
        }, 150);
    };

    // ── FIX: Build background using native-canvas tinting (not multiply rect) ─
    //   This correctly handles transparent / removebg product images.

    const buildBackground = (imageUrl, color, viewName) => {
        return new Promise((resolve) => {
            if (!imageUrl) {
                const t = new fabric.Text('No Image Available', {
                    fontSize: 20, fill: '#cbd5e1', left: 250, top: 290,
                    originX: 'center', originY: 'center',
                    data: { isBackground: true }, selectable: false, evented: false,
                });
                canvas.add(t); canvas.requestRenderAll(); return resolve(null);
            }

            const htmlImg = new Image();
            htmlImg.crossOrigin = 'anonymous';
            htmlImg.onload = () => {
                if (loadingViewRef.current !== viewName) return resolve(null);

                const W = htmlImg.naturalWidth || 500;
                const H = htmlImg.naturalHeight || 580;
                const scale = Math.min(460 / W, 540 / H);
                const center = { x: 250, y: 290 };

                // Layer 1: original image (preserves transparent bg)
                fabric.Image.fromURL(imageUrl, (baseImg) => {
                    if (!baseImg || loadingViewRef.current !== viewName) return resolve(null);

                    baseImg.set({
                        scaleX: scale,
                        scaleY: scale,
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false,
                        data: { isBackground: true, type: 'texture' },
                    });
                    canvas.add(baseImg);
                    canvas.centerObject(baseImg);
                    canvas.sendToBack(baseImg);

                    // Layer 2: tinted version (native canvas 2D, transparent-safe)
                    const tintedURL = buildTintedDataURL(htmlImg, color);

                    fabric.Image.fromURL(tintedURL, (tintImg) => {
                        if (!tintImg || loadingViewRef.current !== viewName) return resolve(null);

                        tintImg.set({
                            scaleX: scale,
                            scaleY: scale,
                            originX: 'center',
                            originY: 'center',
                            selectable: false,
                            evented: false,
                            opacity: 0.88,
                            data: { isBackground: true, type: 'color' },
                        });
                        // Store source for re-tinting on color change
                        tintImg._sourceHtmlImg = htmlImg;

                        canvas.add(tintImg);
                        canvas.centerObject(tintImg);
                        canvas.moveTo(tintImg, 1);
                        setColorLayer(tintImg);

                        canvas.requestRenderAll();
                        resolve(tintImg);
                    });
                }, { crossOrigin: 'anonymous' });
            };
            htmlImg.onerror = () => resolve(null);
            htmlImg.src = imageUrl;
        });
    };

    // ── View Loading ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (!canvas || !product || !colorReady) return;

        const handleViewChange = async () => {
            const currentView = view;
            const prevView = prevViewRef.current;

            // Avoid redundant loads for the same view
            if (loadingViewRef.current === currentView) return;
            loadingViewRef.current = currentView;

            // Save state of previous view before switching
            if (prevView && prevView !== currentView && canvas.getObjects().length > 0) {
                const json = canvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
                json.objects = json.objects.filter(o => !o.data?.isBackground);
                viewStates.current[prevView] = {
                    ...viewStates.current[prevView],
                    json,
                    preview: canvas.toDataURL({ format: 'png', multiplier: 1 }),
                };
                saveDesign();
            }

            // Prepare canvas for new view
            canvas.clear();
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // Reset any pan/zoom
            setColorLayer(null);
            setSelectedObject(null);

            try {
                // Use the latest color for the initial render of this view
                const colorToUse = latestProductColorRef.current;
                const imageUrl = getViewImage(currentView);

                console.log(`Customizer: Loading view ${currentView} with color ${colorToUse}`);
                await buildBackground(imageUrl, colorToUse, currentView);

                // If we are still on the same view, restore any saved objects
                if (loadingViewRef.current === currentView) {
                    const saved = viewStates.current[currentView];
                    if (saved?.json?.objects?.length) {
                        fabric.util.enlivenObjects(saved.json.objects, (objs) => {
                            if (loadingViewRef.current !== currentView) return;
                            objs.forEach(o => { canvas.add(o); canvas.bringToFront(o); });
                            canvas.requestRenderAll();
                            loadingViewRef.current = null;
                            updateCurrentViewSnapshot(canvas);
                        }, 'fabric');
                    } else {
                        loadingViewRef.current = null;
                        updateCurrentViewSnapshot(canvas);
                    }
                }
            } catch (err) {
                console.error('View change error:', err);
                loadingViewRef.current = null;
            }

            prevViewRef.current = currentView;
        };

        handleViewChange();
    }, [view, product, canvas, colorReady]); // eslint-disable-line

    // ── Color Change ──────────────────────────────────────────────────────────
    // FIX: re-generate tinted layer via native canvas instead of changing fill

    useEffect(() => {
        if (!canvas || !colorReady) return;

        const syncColor = async () => {
            // 1. Update current view if it's ready
            if (colorLayer && colorLayer._sourceHtmlImg) {
                const tintedURL = buildTintedDataURL(colorLayer._sourceHtmlImg, productColor);
                colorLayer.setSrc(tintedURL, () => {
                    canvas.requestRenderAll();
                    updateCurrentViewSnapshot(canvas);
                    saveDesign();
                });
            }

            // 2. Generate snapshots for ALL other views to keep thumbnails in sync
            // Use a timeout to avoid spamming on rapid color changes
            if (colorSyncTimeout.current) clearTimeout(colorSyncTimeout.current);
            colorSyncTimeout.current = setTimeout(async () => {
                const others = VIEW_OPTIONS.filter(v => getViewImage(v) && v !== currentViewRef.current);
                const results = await Promise.all(others.map(async v => {
                    const snap = await generateOffscreenSnap(v, productColor);
                    return { v, snap };
                }));

                results.forEach(({ v, snap }) => {
                    if (!snap) return;
                    setViewSnapshots(prev => ({ ...prev, [v]: snap }));
                    viewStates.current[v] = { ...viewStates.current[v], preview: snap };
                });

                if (results.some(r => r.snap)) saveDesign();
            }, 300);
        };

        syncColor();
    }, [productColor, colorLayer, canvas, colorReady]); // eslint-disable-line

    // ── Off-screen snapshot for sidebar thumbnails ────────────────────────────

    const generateOffscreenSnap = (viewName, color) => {
        return new Promise((resolve) => {
            const url = getViewImage(viewName);
            if (!url) return resolve(null);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const W = img.naturalWidth || 500;
                const H = img.naturalHeight || 580;
                const scale = Math.min(460 / W, 540 / H);
                const dx = (500 - W * scale) / 2;
                const dy = (580 - H * scale) / 2;

                // Build tinted layer
                const tinted = buildTintedDataURL(img, color);
                const tImg = new Image();
                tImg.onload = () => {
                    const fin = document.createElement('canvas');
                    fin.width = 500; fin.height = 580;
                    const ctx = fin.getContext('2d');
                    ctx.fillStyle = '#f3f4f6';
                    ctx.fillRect(0, 0, 500, 580);
                    // base
                    ctx.drawImage(img, dx, dy, W * scale, H * scale);
                    // tinted overlay
                    ctx.globalAlpha = 0.88;
                    ctx.drawImage(tImg, dx, dy, W * scale, H * scale);
                    ctx.globalAlpha = 1;

                    const saved = viewStates.current[viewName];
                    if (saved?.json?.objects?.length) {
                        const el = document.createElement('canvas');
                        el.width = 500; el.height = 580;
                        const tfc = new fabric.Canvas(el, { width: 500, height: 580, renderOnAddRemove: false, enableRetinaScaling: false });
                        fabric.util.enlivenObjects(saved.json.objects, (objs) => {
                            objs.forEach(o => { tfc.add(o); tfc.bringToFront(o); });
                            tfc.requestRenderAll();
                            ctx.drawImage(el, 0, 0);
                            try { tfc.dispose(); } catch (_) { }
                            resolve(fin.toDataURL('image/png'));
                        }, 'fabric');
                    } else {
                        resolve(fin.toDataURL('image/png'));
                    }
                };
                tImg.src = tinted;
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    // ── Canvas Actions ────────────────────────────────────────────────────────

    const addCustomText = (config) => {
        if (!canvas) return;
        const opts = {
            left: 100, top: 150,
            fontFamily: config.font || 'Inter',
            fontSize: config.size || 32,
            fill: config.color || '#000000',
            fontWeight: config.weight || '700',
            fontStyle: config.style || 'normal',
            charSpacing: config.spacing || 0,
            cornerColor: '#ff4d00', cornerStyle: 'circle', padding: 10,
        };
        if (config.isArc) {
            opts.path = new fabric.Path('M 10 80 Q 95 10 180 80', { fill: 'transparent', stroke: 'transparent', visible: false });
        }
        const text = new fabric.IText(config.text || 'YOUR TEXT', opts);
        canvas.add(text);
        canvas.centerObject(text);
        canvas.bringToFront(text);
        canvas.setActiveObject(text);
        setSelectedObject(text);
        canvas.requestRenderAll();
        setActiveTab('text');
    };

    const addClipart = (url) => {
        if (!canvas) return;
        fabric.Image.fromURL(url, (img) => {
            img.scaleToWidth(120);
            canvas.add(img); canvas.centerObject(img); canvas.bringToFront(img);
            canvas.setActiveObject(img); setSelectedObject(img); canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    };

    const addShape = (type) => {
        if (!canvas) return;
        const c = { left: 150, top: 200, fill: '#1a1a1a', cornerColor: '#ff4d00', cornerStyle: 'circle' };
        let s;
        if (type === 'circle') s = new fabric.Circle({ ...c, radius: 50 });
        if (type === 'rect') s = new fabric.Rect({ ...c, width: 100, height: 100 });
        if (type === 'triangle') s = new fabric.Triangle({ ...c, width: 100, height: 100 });
        if (s) { canvas.add(s); canvas.centerObject(s); canvas.bringToFront(s); canvas.setActiveObject(s); canvas.requestRenderAll(); }
    };

    const handleImageUpload = (e) => {
        e.stopPropagation();
        const file = e.target.files[0];
        if (!file || !canvas) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                if (!img) return;
                img.scaleToWidth(150);
                canvas.add(img); canvas.bringToFront(img); canvas.centerObject(img);
                canvas.setActiveObject(img); canvas.requestRenderAll();
                e.target.value = '';
            }, { crossOrigin: 'anonymous' });
        };
        reader.readAsDataURL(file);
    };

    const handleOpenPreview = () => {
        if (!canvas) return;
        const json = canvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
        json.objects = json.objects.filter(o => !o.data?.isBackground);
        viewStates.current[view] = { json, preview: canvas.toDataURL({ format: 'png', multiplier: 1 }) };
        setShowPreview(true);
    };

    const deleteObject = () => {
        if (!canvas) return;
        canvas.getActiveObjects().forEach(o => canvas.remove(o));
        canvas.discardActiveObject(); canvas.requestRenderAll();
    };

    const duplicateObject = () => {
        if (!canvas || !selectedObject) return;
        selectedObject.clone((cl) => {
            canvas.discardActiveObject();
            cl.set({ left: cl.left + 20, top: cl.top + 20, evented: true });
            if (cl.type === 'activeSelection') { cl.canvas = canvas; cl.forEachObject(o => canvas.add(o)); cl.setCoords(); }
            else canvas.add(cl);
            canvas.bringToFront(cl); canvas.setActiveObject(cl); canvas.requestRenderAll();
        });
    };

    const updateObjectProperty = (prop, value) => {
        if (!canvas || !selectedObject) return;
        selectedObject.set(prop, value);
        canvas.requestRenderAll();
        setCanvasObjects([...canvas.getObjects()]);
        saveDesign();
    };

    const generateFinalImage = async () => {
        if (!canvas || !product) return;
        const cur = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1.5 });
        const all = {};
        VIEW_OPTIONS.filter(v => getViewImage(v)).forEach(v => {
            all[v] = v === view ? cur : (viewStates.current[v]?.preview || null);
        });
        navigate('/checkout', { state: { product, customizedImage: cur, allViews: all, color: productColor } });
    };

    const handleDownloadAll = async () => {
        if (!canvas || !product) return;
        const zip = new JSZip();
        const cv = view;
        const json = canvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
        json.objects = json.objects.filter(o => !o.data?.isBackground);
        viewStates.current[cv] = { json, preview: canvas.toDataURL({ format: 'png', multiplier: 1 }) };
        const folder = zip.folder(`${product.title.replace(/\s+/g, '-').toLowerCase()}-renderings`);
        for (const v of VIEW_OPTIONS.filter(v => getViewImage(v))) {
            setView(v);
            await new Promise(res => {
                const t = setInterval(() => { if (prevViewRef.current === v) { clearInterval(t); setTimeout(res, 500); } }, 100);
            });
            const b64 = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 }).replace(/^data:image\/(png|jpg);base64,/, '');
            folder.file(`${v.toLowerCase()}.png`, b64, { base64: true });
        }
        setView(cv);
        saveAs(await zip.generateAsync({ type: 'blob' }), `fabricon-${product.title.replace(/\s+/g, '-').toLowerCase()}-all-views.zip`);
    };

    // ── Guards ────────────────────────────────────────────────────────────────

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white font-black text-slate-300 uppercase tracking-widest text-xs">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
                Initializing Space...
            </div>
        </div>
    );

    if (!product) return (
        <div className="h-screen flex items-center justify-center bg-white font-black text-slate-300 uppercase tracking-widest text-xs">
            <div className="flex flex-col items-center gap-4">
                Product Data Unavailable
                <button onClick={() => navigate(-1)} className="text-[#ff4d00] underline">Back</button>
            </div>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col md:flex-row h-screen bg-white md:bg-[#f3f4f6] pt-20 overflow-hidden relative">

            {/* 1. Left Sidebar */}
            <div className="hidden md:flex w-[80px] bg-white border-r border-slate-200 flex-col items-center pt-10 py-6 gap-2 z-30">
                {SIDEBAR_TOOLS.map(tool => (
                    <button key={tool.id}
                        onClick={() => { setActiveTab(tool.id); setIsMobileMenuOpen(true); }}
                        className={`w-[60px] py-3 flex flex-col items-center gap-1.5 transition-all rounded-xl ${activeTab === tool.id ? 'bg-orange-50 text-[#ff4d00] shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        <tool.icon size={20} className={activeTab === tool.id ? 'stroke-[2.5px]' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{tool.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Panel / Bottom Sheet */}
            <div className={`
                fixed inset-x-0 bottom-0 z-[60] md:sticky md:top-[80px] md:inset-auto md:flex
                md:w-[320px] bg-white md:border-r border-slate-200 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.2)] md:shadow-none
                transition-all duration-300 ease-in-out rounded-t-[2.5rem] md:rounded-none
                ${isMobileMenuOpen ? 'h-[50vh] flex flex-col' : 'h-0 hidden'} md:h-[calc(100vh-80px)] md:z-40
            `}>
                <div className="flex items-center justify-between p-6 pb-2 md:hidden">
                    <button onClick={() => activeTab === 'design-hub' ? setIsMobileMenuOpen(false) : setActiveTab('design-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        {activeTab === 'design-hub' ? <X size={14} /> : <ChevronLeft size={14} />}
                        {activeTab === 'design-hub' ? 'Close' : 'Back to Menu'}
                    </button>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d00]">
                        {activeTab === 'design-hub' ? 'Design Hub' : activeTab}
                    </h3>
                </div>

                <div className="p-7 pt-4 md:pt-10 h-full overflow-y-auto custom-scrollbar flex-1 bg-white rounded-t-[2.5rem] md:rounded-none">
                    <AnimatePresence mode="wait">

                        {activeTab === 'design-hub' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-y-8 gap-x-4 pt-4">
                                <button onClick={resetDesign} className="flex flex-col items-center gap-3 group">
                                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-100 shadow-sm"><Trash2 size={22} /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-rose-600">Reset</span>
                                </button>
                                {SIDEBAR_TOOLS.filter(t => t.id !== 'product').map(tool => (
                                    <button key={tool.id} onClick={() => setActiveTab(tool.id)} className="flex flex-col items-center gap-3 group">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-[#ff4d00] shadow-sm"><tool.icon size={22} /></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{tool.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'product' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-8">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-1 block">{product?.category}</span>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{product?.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{product?.description?.substring(0, 100)}...</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Global Palette</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors?.map((color, i) => {
                                                // FIX: support both string[] and object[] color formats
                                                const hex = typeof color === 'string' ? color : (color.hex || color.value || color.color || '#ffffff');
                                                return (
                                                    <button key={i}
                                                        onClick={() => {
                                                            latestProductColorRef.current = hex;
                                                            setProductColor(hex);
                                                            if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                                        }}
                                                        className={`w-10 h-10 rounded-xl border-2 transition-all ${productColor === hex ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-slate-200/60 hover:border-slate-300'}`}
                                                        style={{ backgroundColor: hex }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'text' && (
                            <motion.div key="text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 pb-20 md:pb-0">
                                {selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-2xl shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest">Text Style & Color</h4>
                                            <button onClick={deleteObject} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Change Text</label>
                                                <input type="text" value={selectedObject.text}
                                                    onChange={e => updateObjectProperty('text', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#ff4d00]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Font Size</label>
                                                    <input type="number" value={selectedObject.fontSize}
                                                        onChange={e => updateObjectProperty('fontSize', parseInt(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Letter Spacing</label>
                                                    <input type="number" value={selectedObject.charSpacing / 10}
                                                        onChange={e => updateObjectProperty('charSpacing', parseInt(e.target.value) * 10)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider italic">Quick Colors</label>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {FILL_COLORS.slice(0, 12).map(c => (
                                                        <button key={c} onClick={() => updateObjectProperty('fill', c)}
                                                            className={`w-7 h-7 rounded-full border-2 transition-all ${selectedObject.fill === c ? 'border-[#ff4d00] scale-110' : 'border-slate-200/60'}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                                    <input type="color"
                                                        value={typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000'}
                                                        onChange={e => updateObjectProperty('fill', e.target.value)}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                                                    />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Text Color</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Font Presets</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {FONT_COMBINATIONS.map((f, i) => (
                                            <button key={i}
                                                onClick={() => { addCustomText(f); if (window.innerWidth < 768) setIsMobileMenuOpen(false); }}
                                                className="group relative h-24 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[#ff4d00]/30 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center justify-center p-4 overflow-hidden"
                                            >
                                                {f.isArc && <div className="absolute top-0 right-0 bg-[#ff4d00] text-white text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Curved</div>}
                                                <span className="text-xs font-black line-clamp-1 text-center" style={{ fontFamily: f.font, fontWeight: f.weight, fontStyle: f.style || 'normal' }}>{f.text}</span>
                                                <span className="absolute bottom-2 text-[8px] font-black text-slate-300 opacity-0 group-hover:opacity-100 uppercase tracking-tighter">{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'layers' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Scene Elements</h3>
                                {canvasObjects.filter(o => !o.data?.isBackground).length === 0
                                    ? <div className="py-12 flex flex-col items-center text-slate-300 gap-3 opacity-50"><Layers size={32} /><p className="text-[10px] font-black uppercase tracking-widest">No Layers Detected</p></div>
                                    : canvasObjects.filter(o => !o.data?.isBackground).slice().reverse().map((obj, i) => (
                                        <div key={i}
                                            onClick={() => { canvas.setActiveObject(obj); canvas.requestRenderAll(); if (window.innerWidth < 768) setIsMobileMenuOpen(false); }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${canvas.getActiveObject() === obj ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    {obj.type === 'i-text' ? <Type size={14} className="text-slate-400" /> : <ImageIcon size={14} className="text-slate-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 line-clamp-1">{obj.text || 'Imported Element'}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{obj.type}</p>
                                                </div>
                                            </div>
                                            <button onClick={e => { e.stopPropagation(); canvas.remove(obj); canvas.requestRenderAll(); }} className="p-2 text-slate-300 hover:text-rose-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                }
                            </motion.div>
                        )}

                        {activeTab === 'uploads' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-8">
                                    <div className="p-8 border-2 border-dashed border-orange-400 bg-orange-50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-orange-100 cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-50">
                                            <Upload className="text-slate-300 group-hover:text-[#ff4d00]" size={28} />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Click to Upload</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">PNG, JPG or SVG · Max 5MB</p>
                                        <input type="file" ref={fileInputRef}
                                            onChange={e => { handleImageUpload(e); if (window.innerWidth < 768) setIsMobileMenuOpen(false); }}
                                            className="hidden" accept="image/*"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'quick' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ready Quotes</h3>
                                <div className="space-y-4">
                                    {READY_QUOTES.map((q, i) => (
                                        <button key={i}
                                            onClick={() => { addCustomText({ text: q.text, color: q.color, font: 'Inter', weight: '900', size: 28 }); if (window.innerWidth < 768) setIsMobileMenuOpen(false); }}
                                            className="w-full text-left p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-[#ff4d00]/30 hover:shadow-xl transition-all group"
                                        >
                                            <p className="text-xs font-black uppercase tracking-tight mb-2" style={{ color: q.color }}>{q.text}</p>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                                <Zap size={10} className="text-[#ff4d00]" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Instant Apply</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'clipart' && (
                            <motion.div key="clipart" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(CLIPART_CATEGORIES).map(([cat, items]) => items.map((item, i) => (
                                        <button key={`${cat}-${i}`}
                                            onClick={() => { typeof item === 'string' ? addClipart(item) : addShape(item.type); if (window.innerWidth < 768) setIsMobileMenuOpen(false); }}
                                            className="aspect-square bg-slate-50 rounded-xl hover:shadow-lg border border-slate-100 p-3 flex items-center justify-center group"
                                        >
                                            {typeof item === 'string'
                                                ? <img src={item} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                                : <div className="w-8 h-8 bg-slate-900 group-hover:scale-110 transition-transform" style={item.type === 'circle' ? { borderRadius: '50%' } : {}} />
                                            }
                                        </button>
                                    )))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'fill' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{selectedObject ? 'Element Color' : 'Product Color'}</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {FILL_COLORS.map((color, i) => (
                                        <button key={i}
                                            onClick={() => {
                                                if (selectedObject) updateObjectProperty('fill', color);
                                                else { latestProductColorRef.current = color; setProductColor(color); }
                                                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                            }}
                                            className={`aspect-square rounded-xl border-2 transition-all ${(selectedObject ? selectedObject.fill === color : productColor === color) ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-slate-200/60 hover:border-slate-300'}`}
                                            style={{ backgroundColor: color }} title={color}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{selectedObject ? 'Pick a color for the selected element.' : 'Pick a base color for the product.'}</p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {selectedObject && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={deleteObject} className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /> Remove</button>
                            <button onClick={duplicateObject} className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all"><Copy size={14} /> Clone</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Canvas Area */}
            <div className="grow flex flex-col relative overflow-hidden bg-[#f3f4f6]">
                <div className="hidden md:flex h-14 bg-white items-center justify-between px-6 z-20 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edition Mode:</span>
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#ff4d00]">{view} View</div>
                        <button onClick={resetDesign} className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-orange-100 text-[#ff4d00] hover:text-rose-600 uppercase cursor-pointer flex items-center gap-1.5">
                            <Trash2 size={12} /> Reset All
                        </button>
                    </div>
                    <button onClick={handleOpenPreview} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                        <Maximize2 size={14} /> Preview Mockups
                    </button>
                </div>

                <div className={`flex-grow flex items-center justify-center p-4 min-h-0 overflow-hidden relative transition-all duration-500 ${isMobileMenuOpen ? 'h-[30vh] md:h-full -translate-y-4 md:translate-y-0' : 'h-full'}`}>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className={`relative transition-all duration-500 origin-center ${isMobileMenuOpen ? 'scale-[0.5] sm:scale-[0.7] md:scale-90 lg:scale-100' : 'scale-[0.7] sm:scale-[0.8] md:scale-90 lg:scale-100'}`} style={{ width: 500, height: 580 }}>
                            <canvas ref={canvasRef} width={500} height={580} className="max-w-full h-auto block mx-auto" />
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex h-24 bg-white border-t border-slate-100 px-10 items-center justify-between z-30 shadow-2xl">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-1">Total Price</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">${Number(product?.price || 0).toFixed(2)}</span>
                        </div>
                        <div className="text-center border-l border-slate-100 pl-10">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Estimation</span>
                            <p className="text-[11px] font-bold text-slate-500">Ship: 48h</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleDownloadAll} className="px-8 py-4 bg-black text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#ff4d00] transition-all">Save Draft</button>
                        <button onClick={generateFinalImage} className="flex items-center gap-3 px-5 py-3 bg-black text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#ff4d00] transition-all shadow-2xl shadow-orange-500/20 active:scale-95">
                            <ShoppingCart size={20} /> Checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. View Navigator */}
            <div className="hidden lg:flex w-[140px] bg-white border-l border-slate-200 flex-col py-6 px-4 gap-4 z-30 overflow-y-auto custom-scrollbar">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">View Angles</h4>
                {VIEW_OPTIONS.filter(v => getViewImage(v) !== null).map(v => {
                    const img = viewSnapshots[v] || getViewImage(v);
                    return (
                        <button key={v} onClick={() => setView(v)}
                            className={`group relative aspect-[4/5] w-full rounded-2xl border-2 transition-all p-2 bg-slate-50 overflow-hidden ${view === v ? 'border-[#ff4d00] shadow-lg' : 'border-transparent hover:border-slate-200'}`}
                        >
                            <div className="h-full w-full flex items-center justify-center">
                                {img ? <img src={img} alt={v} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                                    : <div className="opacity-20"><ImageIcon size={20} /></div>}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent pt-4 pb-1">
                                <span className={`text-[8px] font-black uppercase tracking-tighter block text-center ${view === v ? 'text-[#ff4d00]' : 'text-slate-400'}`}>{v}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Mobile View Switcher */}
            <div className={`lg:hidden absolute left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md shadow-xl px-2 py-1.5 rounded-2xl border border-slate-100 flex items-center gap-2 overflow-x-auto max-w-[95vw] no-scrollbar transition-all duration-500 ${isMobileMenuOpen ? 'top-2 scale-90 opacity-60' : 'top-[85px]'}`}>
                {VIEW_OPTIONS.filter(v => getViewImage(v) !== null).map(v => (
                    <button key={v} onClick={() => setView(v)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-[#ff4d00] text-white shadow-lg' : 'text-slate-400 bg-slate-50'}`}
                    >{v}</button>
                ))}
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none">
                <div className="bg-white border-t border-slate-100 pl-6 pr-0 flex items-center justify-between pointer-events-auto h-20">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Subtotal</span>
                        <span className="text-xl font-black text-slate-900">${Number(product?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center h-full">
                        <div className="flex items-center gap-7 mr-6">
                            <button onClick={() => { setActiveTab('product'); setIsMobileMenuOpen(true); }}
                                className={`flex flex-col items-center gap-1 ${activeTab === 'product' && isMobileMenuOpen ? 'text-[#ff4d00]' : 'text-slate-400'}`}>
                                <Box size={18} /><span className="text-[8px] font-black uppercase">Product</span>
                            </button>
                            <button onClick={() => { setActiveTab('design-hub'); setIsMobileMenuOpen(true); }}
                                className={`flex flex-col items-center gap-1 ${activeTab !== 'product' && isMobileMenuOpen ? 'text-[#ff4d00]' : 'text-slate-400'}`}>
                                <Palette size={18} /><span className="text-[8px] font-black uppercase">Design</span>
                            </button>
                        </div>
                        <button onClick={generateFinalImage} className="bg-[#e11d48] text-white w-20 h-full flex items-center justify-center active:scale-95 transition-all">
                            <ArrowRight size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-10"
                        onClick={() => setShowPreview(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mockup Preview</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Review all configuration angles</p>
                                </div>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {VIEW_OPTIONS.filter(v => getViewImage(v) !== null).map(v => {
                                    const di = viewStates.current[v]?.preview || getViewImage(v);
                                    if (!di) return null;
                                    return (
                                        <div key={v} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                                            <div className="relative aspect-[4/5] w-full bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
                                                <img src={di} alt={v} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{v}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar{width:4px}
                .custom-scrollbar::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:10px}
                .no-scrollbar::-webkit-scrollbar{display:none}
                .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
            `}</style>
        </div>
    );
};

export default Customizer;