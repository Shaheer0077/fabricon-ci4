import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as fabricModule from 'fabric';
const fabric = fabricModule.fabric || fabricModule.default || fabricModule;
console.log("Customizer: Module File Loaded", {
    hasFabricProp: !!fabricModule.fabric,
    hasDefaultProp: !!fabricModule.default,
    fabricType: typeof fabric,
    hasCanvas: !!fabric?.Canvas
});
import {
    Type,
    Image as ImageIcon,
    Trash2,
    Layers,
    Plus,
    Box,
    Upload,
    Sticker,
    Zap,
    Crown,
    Droplets,
    X,
    ShoppingCart,
    Maximize2,
    Search,
    Copy,
    Palette,
    ChevronLeft,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/client';
import { saveDesign as saveDesignToDB, getDesign, deleteDesign } from '../utils/db';

const Customizer = () => {
    console.log("Customizer: COMPONENT_INIT_START");
    const { productId } = useParams();
    console.log("Customizer: COMPONENT_MOUNTED_ID:", productId);
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const fileInputRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [activeTab, setActiveTab] = useState('text');
    const [selectedObject, setSelectedObject] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productColor, setProductColor] = useState('#ffffff');
    const [view, setView] = useState('Front');
    const [showPreview, setShowPreview] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewSnapshots, setViewSnapshots] = useState({}); // Stores dataURL for each view thumb

    // Multi-View State
    const viewStates = useRef({}); // { 'Front': { json: object, preview: dataURL } }
    const prevViewRef = useRef(null); // Init to null to avoid overwriting Front on mount
    const currentViewRef = useRef('Front'); // Tracks latest view for event listeners

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
        { text: 'LIMITLESS', color: '#8b5cf6' }
    ];

    const CLIPART_CATEGORIES = {
        'Basic Shapes': [
            { type: 'circle', color: '#1a1a1a' },
            { type: 'rect', color: '#1a1a1a' },
            { type: 'triangle', color: '#1a1a1a' }
        ],
        'Icons': [
            'https://cdn-icons-png.flaticon.com/512/1043/1043431.png',
            'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
            'https://cdn-icons-png.flaticon.com/512/747/747376.png',
            'https://cdn-icons-png.flaticon.com/512/4359/4359295.png'
        ],
        'Illustrations': [
            'https://cdn-icons-png.flaticon.com/512/6062/6062646.png',
            'https://cdn-icons-png.flaticon.com/512/3661/3661330.png',
            'https://cdn-icons-png.flaticon.com/512/9379/9379854.png'
        ]
    };

    const FILL_COLORS = [
        '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#00ffff', '#ff00ff', '#808080', '#ffa500',
        '#800080', '#008000', '#000080', '#800000'
    ];

    useEffect(() => {
        console.log("Customizer: User is on Customizer with ID:", productId);
        const fetchProduct = async () => {
            try {
                setLoading(true);
                console.log("Customizer: Fetching product data for ID:", productId);
                const { data } = await API.get(`/products/${productId}`);
                console.log("Customizer: Product Data Received:", data);
                setProduct(data);

                // --- Persistence Load with IndexedDB + localStorage migration ---
                let parsed = null;

                // 1. Try IndexedDB first
                try {
                    parsed = await getDesign(`fabricon_v2_design_${productId}`);
                    if (parsed) {
                        console.log("Customizer: Restored saved design from IndexedDB");
                    }
                } catch (e) {
                    console.warn("Customizer: IndexedDB read failed, will try localStorage fallback", e);
                }

                // 2. Migration: If nothing in IndexedDB, check localStorage
                if (!parsed) {
                    const lsData = localStorage.getItem(`fabricon_v2_design_${productId}`);
                    if (lsData) {
                        try {
                            parsed = JSON.parse(lsData);
                            // Migrate to IndexedDB
                            await saveDesignToDB(`fabricon_v2_design_${productId}`, parsed);
                            localStorage.removeItem(`fabricon_v2_design_${productId}`);
                            console.log("Customizer: Migrated design from localStorage to IndexedDB");
                        } catch (e) {
                            console.warn("Customizer: localStorage migration failed", e);
                        }
                    }
                }

                // 3. Apply loaded state
                if (parsed) {
                    console.log("Customizer: Found saved design. Applying saved color:", parsed.color);
                    if (parsed.color) setProductColor(parsed.color);
                    if (parsed.states) {
                        viewStates.current = parsed.states;
                        // Initialize sidebar thumbnails from saved states
                        const snapshots = {};
                        Object.keys(parsed.states).forEach(v => {
                            if (parsed.states[v].preview) {
                                snapshots[v] = parsed.states[v].preview;
                            }
                        });
                        setViewSnapshots(snapshots);
                    }
                } else {
                    // Use product default color, or first available color, or white
                    const initialColor = data.defaultColor || (data.colors && data.colors.length > 0 ? data.colors[0] : '#ffffff');
                    console.log("Customizer: No saved design. Applying product default color:", initialColor);
                    setProductColor(initialColor);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Persistence Save Helper — writes to IndexedDB (no size limit)
    const saveDesign = () => {
        if (!productId) return;
        const dataToSave = {
            color: productColor,
            states: viewStates.current
        };
        // Fire-and-forget; errors are logged but don't block the UI
        saveDesignToDB(`fabricon_v2_design_${productId}`, dataToSave).catch(err =>
            console.error("Customizer: Failed to save design to IndexedDB", err)
        );
    };

    const resetDesign = () => {
        if (window.confirm("Are you sure you want to reset all designs? This cannot be undone.")) {
            // Delete from IndexedDB (also clear any remaining localStorage entry for safety)
            deleteDesign(`fabricon_v2_design_${productId}`).catch(err =>
                console.error("Customizer: Failed to delete design from IndexedDB", err)
            );
            localStorage.removeItem(`fabricon_v2_design_${productId}`);
            viewStates.current = {};
            setViewSnapshots({});
            if (canvas) canvas.clear();
            
            const initialResettedColor = product?.defaultColor || (product?.colors && product.colors.length > 0 ? product.colors[0] : '#ffffff');
            console.log("Customizer: Design Reset. Reverting to default:", initialResettedColor);
            setProductColor(initialResettedColor);
            
            // Trigger background reload
            setView(current => {
                const fresh = current === 'Front' ? 'Back' : 'Front';
                setTimeout(() => setView(current), 10);
                return fresh;
            });
        }
    };

    const [canvasObjects, setCanvasObjects] = useState([]);
    const [colorLayer, setColorLayer] = useState(null);

    // Standardize URL: Convert backslashes to forward slashes and ensure full path
    const getProductImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=715&auto=format&fit=crop";
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return finalPath; // Use relative path to hit Vite proxy
    };

    const getViewImage = (viewName) => {
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
        // Fallback for Front if missing
        if (!url && viewName === 'Front') url = product.images?.[0];
        // Placeholder if still missing
        if (!url) return null;

        return getProductImageUrl(url);
    };

    // 1. Initialize Canvas (Run when loading completes)
    useEffect(() => {
        if (loading || !canvasRef.current || fabricCanvas.current) return;

        console.log("Customizer: Initializing Canvas inside useEffect");
        try {
            const initCanvas = new fabric.Canvas(canvasRef.current, {
                width: 500,
                height: 580,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
                selection: true,
                renderOnAddRemove: false
            });
            console.log("Customizer: Fabric Canvas instance created");

            // Global Object Settings
            fabric.Object.prototype.set({
                cornerColor: '#ff4d00',
                cornerStyle: 'circle',
                cornerSize: 10,
                borderColor: '#ff4d00',
                transparentCorners: false,
                borderScaleFactor: 2,
                objectCaching: true
            });

            // Add Custom Delete Control
            fabric.Object.prototype.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -16,
                offsetX: 16,
                cursorStyle: 'pointer',
                mouseUpHandler: (eventData, transform) => {
                    const target = transform.target;
                    const canvas = target.canvas;
                    canvas.remove(target);
                    canvas.requestRenderAll();
                    return true;
                },
                render: (ctx, left, top, styleOverride, fabricObject) => {
                    const size = 24;
                    ctx.save();
                    ctx.translate(left, top);
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#ef4444';
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Draw X
                    ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke();
                    ctx.restore();
                },
                cornerSize: 24
            });

            // Events
            const handleSelection = (e) => {
                const active = initCanvas.getActiveObject();
                // Filter out background objects from selection
                if (active && active.data?.isBackground) {
                    initCanvas.discardActiveObject();
                    initCanvas.requestRenderAll();
                    return;
                }

                console.log("Customizer: Selection detected", {
                    eventType: 'selection',
                    objectType: active?.type,
                    text: active?.text
                });

                setSelectedObject(active);

                // Auto-open Text tab if text is selected
                if (active && (active.type === 'i-text' || active.type === 'text')) {
                    console.log("Customizer: Switching to Text tab");
                    setActiveTab('text');
                }
            };

            initCanvas.on('selection:created', handleSelection);
            initCanvas.on('selection:updated', handleSelection);
            initCanvas.on('selection:cleared', () => {
                console.log("Customizer: Selection cleared");
                setSelectedObject(null);
            });
            const handleCanvasChanges = () => {
                const currentObjs = [...initCanvas.getObjects()];
                setCanvasObjects(currentObjs);
                updateCurrentViewSnapshot(initCanvas);

                // Real-time persistence for the current view
                // CRITICAL: Only update viewStates if NOT currently loading/clearing a view
                // This prevents canvas.clear() from overwriting the new view's data before restoration
                if (!loadingViewRef.current) {
                    const activeView = currentViewRef.current;
                    const json = initCanvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
                    json.objects = json.objects.filter(obj => !obj.data?.isBackground);

                    viewStates.current[activeView] = {
                        ...viewStates.current[activeView],
                        json: json
                    };
                    saveDesign();
                }
            };

            initCanvas.on('object:added', handleCanvasChanges);
            initCanvas.on('object:removed', handleCanvasChanges);
            initCanvas.on('object:modified', handleCanvasChanges);

            fabricCanvas.current = initCanvas;
            setCanvas(initCanvas);
            console.log("Customizer: Canvas state and ref set");
        } catch (err) {
            console.error("Customizer: ERROR during fabric init:", err);
        }

        return () => {
            console.log("Customizer: Cleaning up/disposing canvas");
            if (fabricCanvas.current) {
                fabricCanvas.current.dispose();
                fabricCanvas.current = null;
            }
        };
    }, [loading]);

    const snapshotTimeout = useRef(null);
    const updateCurrentViewSnapshot = (targetCanvas) => {
        if (!targetCanvas) return;

        // Don't snap while background is loading to prevent UI freeze and broken snapshots
        if (loadingViewRef.current) return;

        // Debounce snapshot calls to handle multiple rapid changes (like enlivenObjects or batch adds)
        if (snapshotTimeout.current) clearTimeout(snapshotTimeout.current);

        snapshotTimeout.current = setTimeout(() => {
            try {
                const activeView = currentViewRef.current;
                // Use JPEG for slightly faster processing if possible, or lower multiplier
                const previewUrl = targetCanvas.toDataURL({
                    format: 'png',
                    multiplier: 1,
                    quality: 0.8
                });

                setViewSnapshots(prev => {
                    if (prev[activeView] === previewUrl) return prev;

                    // Also store preview in viewStates for reload persistence
                    if (viewStates.current[activeView]) {
                        viewStates.current[activeView].preview = previewUrl;
                        saveDesign();
                    }

                    return { ...prev, [activeView]: previewUrl };
                });
            } catch (err) {
                console.warn("Snapshot failed:", err);
            }
        }, 150); // 150ms buffer
    };

    // Race condition prevention
    const loadingViewRef = useRef(null);

    // 2. Load View Logic
    useEffect(() => {
        if (!canvas || !product) return;

        const loadBackground = (imageUrl, viewName) => {
            return new Promise((resolve) => {
                console.log("Customizer: Loading Background:", imageUrl);

                if (!imageUrl) {
                    const text = new fabric.Text("No Image Available for this View", {
                        fontSize: 20, fill: '#cbd5e1', left: 250, top: 290, originX: 'center', originY: 'center',
                        data: { isBackground: true }
                    });
                    canvas.add(text);
                    canvas.requestRenderAll();
                    return resolve();
                }

                const loadingText = new fabric.Text("Loading View...", {
                    fontSize: 12, fill: '#94a3b8', left: 250, top: 290, originX: 'center', originY: 'center',
                    data: { isBackground: true }
                });
                canvas.add(loadingText);
                canvas.requestRenderAll();

                fabric.Image.fromURL(imageUrl, (img) => {
                    // Check if view changed while loading
                    if (loadingViewRef.current !== viewName) {
                        return resolve();
                    }

                    canvas.remove(loadingText);
                    if (!img) {
                        console.error("Customizer: Image load failed for", viewName);
                        return resolve();
                    }

                    const scale = Math.min(460 / img.width, 540 / img.height);
                    const center = { x: 250, y: 290 };

                    // 1. Texture Layer
                    img.set({
                        scaleX: scale, scaleY: scale,
                        left: center.x, top: center.y,
                        originX: 'center', originY: 'center',
                        selectable: false, evented: false,
                        data: { isBackground: true, type: 'texture' }
                    });
                    canvas.add(img);
                    canvas.sendToBack(img);

                    // 2. Color Mask Layer
                    img.clone((mask) => {
                        if (loadingViewRef.current !== viewName) return resolve();

                        mask.set({
                            absolutePositioned: true,
                            left: center.x, top: center.y,
                            originX: 'center', originY: 'center',
                            scaleX: scale, scaleY: scale
                        });

                        const colorOverlay = new fabric.Rect({
                            width: img.width * scale,
                            height: img.height * scale,
                            left: center.x, top: center.y,
                            originX: 'center', originY: 'center',
                            fill: productColor,
                            globalCompositeOperation: 'multiply',
                            selectable: false, evented: false,
                            data: { isBackground: true, type: 'color' },
                            clipPath: mask
                        });

                        canvas.add(colorOverlay);
                        canvas.moveTo(colorOverlay, 1);
                        setColorLayer(colorOverlay);

                        // 3. Highlight Boost
                        img.clone((lights) => {
                            if (loadingViewRef.current !== viewName) return resolve();

                            lights.set({
                                scaleX: scale, scaleY: scale,
                                left: center.x, top: center.y,
                                originX: 'center', originY: 'center',
                                globalCompositeOperation: 'screen',
                                opacity: 0.1,
                                selectable: false, evented: false,
                                data: { isBackground: true, type: 'highlight' }
                            });
                            canvas.add(lights);
                            canvas.moveTo(lights, 2);
                            canvas.requestRenderAll();
                            resolve();
                        });
                    });

                }, { crossOrigin: 'anonymous' });
            });
        };

        const handleViewChange = async () => {
            const prevView = prevViewRef.current;
            console.log(`Customizer: Switching from ${prevView} to ${view}`);
            loadingViewRef.current = view;

            // A. Save Previous State (Only on actual switch)
            if (prevView && prevView !== view && (canvas.getObjects().length > 0 || viewStates.current[prevView])) {
                const json = canvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
                json.objects = json.objects.filter(obj => !obj.data?.isBackground);
                const previewUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });

                viewStates.current[prevView] = {
                    ...viewStates.current[prevView],
                    json: json,
                    preview: previewUrl
                };
                saveDesign(); // Persist on view change
            }

            // B. Prepare for New View
            canvas.clear();
            setSelectedObject(null);

            try {
                // C. Load Background FIRST
                const imageUrl = getViewImage(view);
                await loadBackground(imageUrl, view);

                // D. Restore Objects AFTER Background is ready
                if (loadingViewRef.current === view) {
                    const savedState = viewStates.current[view];
                    if (savedState && savedState.json && savedState.json.objects) {
                        console.log(`Customizer: Restoring objects for ${view}`);

                        fabric.util.enlivenObjects(savedState.json.objects, (enlivenedObjects) => {
                            if (loadingViewRef.current !== view) return;

                            enlivenedObjects.forEach(obj => {
                                canvas.add(obj);
                                canvas.bringToFront(obj);
                            });
                            canvas.requestRenderAll();

                            // Done restoration, trigger snapshot
                            loadingViewRef.current = null;
                            updateCurrentViewSnapshot(canvas);
                        }, 'fabric');
                    } else {
                        // No objects to restore, trigger snapshot
                        loadingViewRef.current = null;
                        updateCurrentViewSnapshot(canvas);
                    }
                }
            } catch (err) {
                console.error("View Change Error:", err);
                loadingViewRef.current = null;
            }

            prevViewRef.current = view;
        };

        handleViewChange();

    }, [view, product, canvas]); // Re-run when view changes (or product loads)

    // Separate Effect to Sync View Ref
    useEffect(() => {
        currentViewRef.current = view;
    }, [view]);

    // --- Off-screen snapshot generator for non-active views ---
    // Creates a temporary Fabric canvas, renders the view's background + color overlay
    // + any saved user objects, and returns a thumbnail dataURL.
    const generateViewSnapshot = (viewName, color) => {
        return new Promise((resolve) => {
            const imageUrl = getViewImage(viewName);
            if (!imageUrl) return resolve(null);

            const el = document.createElement('canvas');
            el.width = 500;
            el.height = 580;
            const offCanvas = new fabric.Canvas(el, {
                width: 500, height: 580,
                backgroundColor: '#ffffff',
                renderOnAddRemove: false,
                enableRetinaScaling: false
            });

            const cleanup = (result) => {
                try { offCanvas.dispose(); } catch (_) { }
                resolve(result);
            };

            fabric.Image.fromURL(imageUrl, (img) => {
                if (!img) return cleanup(null);

                const scale = Math.min(460 / img.width, 540 / img.height);
                const center = { x: 250, y: 290 };

                img.set({
                    scaleX: scale, scaleY: scale,
                    left: center.x, top: center.y,
                    originX: 'center', originY: 'center',
                    selectable: false, evented: false
                });
                offCanvas.add(img);
                offCanvas.sendToBack(img);

                img.clone((mask) => {
                    mask.set({
                        absolutePositioned: true,
                        left: center.x, top: center.y,
                        originX: 'center', originY: 'center',
                        scaleX: scale, scaleY: scale
                    });

                    const colorOverlay = new fabric.Rect({
                        width: img.width * scale,
                        height: img.height * scale,
                        left: center.x, top: center.y,
                        originX: 'center', originY: 'center',
                        fill: color,
                        globalCompositeOperation: 'multiply',
                        selectable: false, evented: false,
                        clipPath: mask
                    });
                    offCanvas.add(colorOverlay);
                    offCanvas.moveTo(colorOverlay, 1);

                    // Restore any saved user objects on top of the background
                    const savedState = viewStates.current[viewName];
                    if (savedState?.json?.objects?.length > 0) {
                        fabric.util.enlivenObjects(savedState.json.objects, (objs) => {
                            objs.forEach(obj => {
                                offCanvas.add(obj);
                                offCanvas.bringToFront(obj);
                            });
                            offCanvas.requestRenderAll();
                            const snap = offCanvas.toDataURL({ format: 'png', multiplier: 1, quality: 0.8 });
                            cleanup(snap);
                        }, 'fabric');
                    } else {
                        offCanvas.requestRenderAll();
                        const snap = offCanvas.toDataURL({ format: 'png', multiplier: 1, quality: 0.8 });
                        cleanup(snap);
                    }
                });
            }, { crossOrigin: 'anonymous' });
        });
    };

    // Ref to debounce the all-views color regeneration
    const colorSyncTimeout = useRef(null);

    // Separate Effect to Update Color on Current Layer + all other view thumbnails
    useEffect(() => {
        if (colorLayer && canvas) {
            console.log("Customizer: Updating Color Layer Fill:", productColor);
            colorLayer.set('fill', productColor);
            canvas.requestRenderAll();
            updateCurrentViewSnapshot(canvas);
            saveDesign(); // Persist on color change
        }

        // Debounce regeneration for other views to avoid thrashing during rapid clicks
        if (colorSyncTimeout.current) clearTimeout(colorSyncTimeout.current);
        colorSyncTimeout.current = setTimeout(async () => {
            if (!product) return;
            const availableViews = VIEW_OPTIONS.filter(v => getViewImage(v) !== null);
            const otherViews = availableViews.filter(v => v !== currentViewRef.current);
            const results = await Promise.all(
                otherViews.map(async (v) => {
                    const snap = await generateViewSnapshot(v, productColor);
                    return { view: v, snap };
                })
            );

            results.forEach(({ view: v, snap }) => {
                if (!snap) return;
                // Update sidebar thumbnail
                setViewSnapshots(prev => ({ ...prev, [v]: snap }));
                // Keep viewStates in sync so the preview persists on reload
                if (viewStates.current[v]) {
                    viewStates.current[v].preview = snap;
                } else {
                    // View hasn't been visited yet — create a minimal entry so the thumbnail is remembered
                    viewStates.current[v] = { preview: snap };
                }
            });

            // Persist updated previews
            if (results.some(r => r.snap)) saveDesign();
        }, 300);
    }, [productColor, colorLayer, canvas]);

    const addCustomText = (config) => {
        if (!canvas) {
            return;
        }

        const textOptions = {
            left: 100,
            top: 150,
            fontFamily: config.font || 'Inter',
            fontSize: config.size || 32,
            fill: config.color || '#000000',
            fontWeight: config.weight || '700',
            fontStyle: config.style || 'normal',
            charSpacing: config.spacing || 0,
            cornerColor: '#ff4d00',
            cornerStyle: 'circle',
            padding: 10
        };

        if (config.isArc) {
            // Simplified semi-circle path for Fabric.js textPath
            const path = new fabric.Path('M 10 80 Q 95 10 180 80', {
                fill: 'transparent',
                stroke: 'transparent',
                visible: false
            });
            textOptions.path = path;
        }

        const text = new fabric.IText(config.text || 'YOUR TEXT', textOptions);

        canvas.add(text);
        canvas.centerObject(text);
        canvas.bringToFront(text);
        canvas.setActiveObject(text);
        setSelectedObject(text); // Sync React state immediately
        canvas.requestRenderAll();
        setActiveTab('text'); // Ensure we stay in text tab to see the controls
    };

    const addClipart = (url) => {
        if (!canvas) return;
        fabric.Image.fromURL(url, (imgObj) => {
            imgObj.scaleToWidth(120);
            canvas.add(imgObj);
            canvas.centerObject(imgObj);
            canvas.bringToFront(imgObj);
            canvas.setActiveObject(imgObj);
            setSelectedObject(imgObj); // Sync React state immediately
            canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    };

    const handleOpenPreview = () => {
        if (!canvas) return;
        // Snapshot current view
        const objects = canvas.getObjects().filter(obj => !obj.data?.isBackground);
        // Even if empty, we might want to capture the background state?
        // Actually, we just need a visual snapshot.
        const previewUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });

        // Update state
        const json = canvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
        json.objects = json.objects.filter(obj => !obj.data?.isBackground);

        viewStates.current[view] = {
            json: json,
            preview: previewUrl
        };

        setShowPreview(true);
    };

    const addShape = (type) => {
        if (!canvas) return;
        let shape;
        const common = { left: 150, top: 200, fill: '#1a1a1a', cornerColor: '#ff4d00', cornerStyle: 'circle' };

        if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
        if (type === 'rect') shape = new fabric.Rect({ ...common, width: 100, height: 100 });
        if (type === 'triangle') shape = new fabric.Triangle({ ...common, width: 100, height: 100 });

        if (shape) {
            canvas.add(shape);
            canvas.centerObject(shape);
            canvas.bringToFront(shape);
            canvas.setActiveObject(shape);
            canvas.requestRenderAll();
        }
    };

    const handleImageUpload = (e) => {
        e.stopPropagation(); // Prevent bubbling
        const file = e.target.files[0];
        if (!file || !canvas) return;

        console.log('Customizer: Uploading Image:', file.name);
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (imgObj) => {
                if (!imgObj) {
                    console.error("Customizer: Upload image loading failed");
                    return;
                }
                console.log("Customizer: Upload image processed");
                imgObj.scaleToWidth(150);

                // Add on top of everything
                canvas.add(imgObj);
                canvas.bringToFront(imgObj);

                canvas.centerObject(imgObj);
                canvas.setActiveObject(imgObj);
                canvas.requestRenderAll();

                // reset the file input
                e.target.value = '';
            }, { crossOrigin: 'anonymous' });
        };
        reader.readAsDataURL(file);
    };


    const deleteObject = () => {
        if (!canvas) return;
        canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    };

    const duplicateObject = () => {
        if (!canvas || !selectedObject) return;
        selectedObject.clone((cloned) => {
            canvas.discardActiveObject();
            cloned.set({
                left: cloned.left + 20,
                top: cloned.top + 20,
                evented: true,
            });
            if (cloned.type === 'activeSelection') {
                cloned.canvas = canvas;
                cloned.forEachObject((obj) => canvas.add(obj));
                cloned.setCoords();
            } else {
                canvas.add(cloned);
            }
            canvas.bringToFront(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
        });
    };

    const updateObjectProperty = (prop, value) => {
        if (!canvas || !selectedObject) return;
        selectedObject.set(prop, value);
        canvas.requestRenderAll();
        setCanvasObjects([...canvas.getObjects()]);
        saveDesign(); // Save changes to property
    };

    const generateFinalImage = async () => {
        if (!canvas || !product) return;

        try {
            // 1. Snapshot current view one last time to be sure
            const currentDataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 1.5
            });

            // 2. Collect all available view images
            const availableViews = VIEW_OPTIONS.filter(v => getViewImage(v) !== null);
            const allViews = {};
            availableViews.forEach(v => {
                if (v === view) {
                    allViews[v] = currentDataURL;
                } else if (viewStates.current[v]?.preview) {
                    allViews[v] = viewStates.current[v].preview;
                }
            });

            // 3. Navigate to checkout page, passing everything
            navigate('/checkout', {
                state: {
                    product,
                    customizedImage: currentDataURL, // primary display
                    allViews: allViews,             // all edited angles
                    color: productColor
                }
            });
        } catch (error) {
            console.error('Error generating image:', error);
        }
    };

    const handleDownloadAll = async () => {
        if (!canvas || !product) return;

        try {
            const zip = new JSZip();
            const currentView = view;

            // Save the current state of the canvas for the current view before switching
            const currentViewJson = canvas.toDatalessJSON(['id', 'data', 'selectable', 'evented']);
            currentViewJson.objects = currentViewJson.objects.filter(obj => !obj.data?.isBackground);
            viewStates.current[currentView] = {
                json: currentViewJson,
                preview: canvas.toDataURL({ format: 'png', multiplier: 1 })
            };

            // Create a dedicated folder in the ZIP
            const folder = zip.folder(`${product.title.replace(/\s+/g, '-').toLowerCase()}-renderings`);

            // We need to iterate and render each view
            const availableViews = VIEW_OPTIONS.filter(v => getViewImage(v) !== null);
            for (const v of availableViews) {
                console.log(`Customizer: Capturing snapshot for ${v}...`);

                // Set the view, which triggers the useEffect to load background and objects
                setView(v);

                // Wait for the useEffect to finish loading the background and objects for the new view
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        // Check if the view has been fully loaded and rendered by the useEffect
                        if (prevViewRef.current === v) {
                            clearInterval(checkInterval);
                            // Add a small buffer to ensure all rendering is complete
                            setTimeout(resolve, 500);
                        }
                    }, 100); // Check every 100ms
                });

                const dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2
                });

                // Convert dataURL to Blob/Base64 for JSZip
                const base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                folder.file(`${v.toLowerCase()}.png`, base64Data, { base64: true });
            }

            // Restore original view
            setView(currentView);

            // Generate ZIP
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `fabricon-${product.title.replace(/\s+/g, '-').toLowerCase()}-all-views.zip`);

        } catch (error) {
            console.error('Error downloading all images:', error);
        }
    };

    const handleDownload = () => {
        handleDownloadAll(); // Switch Save Draft to Download All
    };

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




    return (
        <div className="flex flex-col md:flex-row h-screen bg-white md:bg-[#f3f4f6] md:pt-20 overflow-hidden relative">

            {/* 1. Slim Left Sidebar (Desktop Only) */}
            <div className="hidden md:flex w-[80px] bg-white border-r border-slate-200 flex-col items-center py-6 gap-2 z-30">
                {SIDEBAR_TOOLS.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => {
                            setActiveTab(tool.id);
                            setIsMobileMenuOpen(true);
                        }}
                        className={`w-[60px] py-3 flex flex-col items-center gap-1.5 transition-all rounded-xl ${activeTab === tool.id
                            ? 'bg-orange-50 text-[#ff4d00] shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tool.icon size={20} className={activeTab === tool.id ? 'stroke-[2.5px]' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{tool.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Secondary Sidebar (Responsive Panel / Bottom Sheet on Mobile) */}
            <div className={`
                fixed inset-x-0 bottom-0 z-[60] md:relative md:inset-auto md:flex
                md:w-[320px] bg-white md:border-r border-slate-200 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.2)] md:shadow-none
                transition-all duration-300 ease-in-out rounded-t-[2.5rem] md:rounded-none
                ${isMobileMenuOpen ? 'h-[50vh] flex flex-col' : 'h-0 hidden'}
                md:h-full md:translate-x-0
            `}>
                <div className="flex items-center justify-between p-6 pb-2 md:hidden">
                    <button
                        onClick={() => {
                            if (activeTab === 'design-hub') {
                                setIsMobileMenuOpen(false);
                            } else {
                                setActiveTab('design-hub');
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        {activeTab === 'design-hub' ? <X size={14} /> : <ChevronLeft size={14} />} {activeTab === 'design-hub' ? 'Close' : 'Back to Menu'}
                    </button>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d00]">
                        {activeTab === 'design-hub' ? 'Design Hub' : activeTab}
                    </h3>
                </div>
                <div className="p-7 pt-2 h-full overflow-y-auto custom-scrollbar flex-1 bg-white rounded-t-[2.5rem] md:rounded-none">
                    <AnimatePresence mode="wait">

                        {activeTab === 'design-hub' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-y-8 gap-x-4 pt-4">
                                {/* Global Reset Action */}
                                <button
                                    onClick={resetDesign}
                                    className="flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-all shadow-sm">
                                        <Trash2 size={22} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-rose-600">Reset</span>
                                </button>

                                {SIDEBAR_TOOLS.filter(t => t.id !== 'product').map((tool) => (
                                    <button
                                        key={tool.id}
                                        onClick={() => setActiveTab(tool.id)}
                                        className="flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-[#ff4d00] transition-all shadow-sm">
                                            <tool.icon size={22} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{tool.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                        {/* ... (keep existing activeTab content but ensure it feels good on mobile) ... */}
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
                                            {product.colors?.map((color, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setProductColor(color);
                                                        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                                    }}
                                                    className={`w-10 h-10 rounded-xl border-2 transition-all ${productColor === color ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-slate-200/60 hover:border-slate-300'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
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
                                            <button onClick={deleteObject} className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 size={16} /></button>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Change Text</label>
                                                <input
                                                    type="text"
                                                    value={selectedObject.text}
                                                    onChange={(e) => updateObjectProperty('text', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#ff4d00] transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Font Size</label>
                                                    <input
                                                        type="number"
                                                        value={selectedObject.fontSize}
                                                        onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Letter Spacing</label>
                                                    <input
                                                        type="number"
                                                        value={selectedObject.charSpacing / 10}
                                                        onChange={(e) => updateObjectProperty('charSpacing', parseInt(e.target.value) * 10)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider italic">Quick Colors</label>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {FILL_COLORS.slice(0, 12).map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => updateObjectProperty('fill', c)}
                                                            className={`w-7 h-7 rounded-full border-2 transition-all ${selectedObject.fill === c ? 'border-[#ff4d00] scale-110 shadow-md' : 'border-slate-200/60 shadow-sm hover:scale-105'}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl group hover:border-[#ff4d00]/20 transition-all">
                                                    <input
                                                        type="color"
                                                        value={typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000'}
                                                        onChange={(e) => updateObjectProperty('fill', e.target.value)}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                                                    />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#ff4d00] transition-colors">Custom Text Color</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Font Presets</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {FONT_COMBINATIONS.map((f, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    addCustomText(f);
                                                    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                                }}
                                                className="group relative h-24 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[#ff4d00]/30 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center justify-center p-4 overflow-hidden"
                                            >
                                                {f.isArc && (
                                                    <div className="absolute top-0 right-0 bg-[#ff4d00] text-white text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">
                                                        Curved
                                                    </div>
                                                )}
                                                <span className="text-xs font-black line-clamp-1 text-center font-style" style={{ fontFamily: f.font, fontWeight: f.weight, fontStyle: f.style || 'normal' }}>{f.text}</span>
                                                <span className="absolute bottom-2 text-[8px] font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'layers' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Scene Elements</h3>
                                <div className="space-y-3">
                                    {canvasObjects.length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-3 grayscale opacity-50">
                                            <Layers size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Layers Detected</p>
                                        </div>
                                    )}
                                    {canvasObjects
                                        .filter(obj => !obj.data?.isBackground)
                                        .slice()
                                        .reverse()
                                        .map((obj, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    canvas.setActiveObject(obj);
                                                    canvas.requestRenderAll();
                                                    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                                }}
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
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        canvas.remove(obj);
                                                        canvas.requestRenderAll();
                                                    }}
                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'uploads' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-8">
                                    <div
                                        className="p-8 border-2 border-dashed border-orange-400 bg-orange-50 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-orange-100 transition-all cursor-pointer"
                                        onClick={() => {
                                            console.log("Customizer: Upload Card CLICKED");
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
                                            <Upload className="text-slate-300 group-hover:text-[#ff4d00]" size={28} />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Click to Upload</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">PNG, JPG or SVG<br />Max 5MB</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={(e) => {
                                                handleImageUpload(e);
                                                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                            }}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">Your Local Assets</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'quick' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ready Quotes</h3>
                                <div className="space-y-4">
                                    {READY_QUOTES.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                addCustomText({ text: q.text, color: q.color, font: 'Inter', weight: '900', size: 28 });
                                                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-[#ff4d00]/30 hover:shadow-xl transition-all group"
                                        >
                                            <p className="text-xs font-black uppercase tracking-tight mb-2" style={{ color: q.color }}>{q.text}</p>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                        <button
                                            key={`${cat}-${i}`}
                                            onClick={() => {
                                                typeof item === 'string' ? addClipart(item) : addShape(item.type);
                                                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                            }}
                                            className="aspect-square bg-slate-50 rounded-xl hover:shadow-lg border border-slate-100 transition-all p-3 flex items-center justify-center group"
                                        >
                                            {typeof item === 'string' ? <img src={item} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" /> : <div className="w-8 h-8 bg-slate-900 group-hover:scale-110 transition-transform" style={item.type === 'circle' ? { borderRadius: '50%' } : {}} />}
                                        </button>
                                    )))}
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'fill' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                    {selectedObject ? 'Element Color' : 'Product Color'}
                                </h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {FILL_COLORS.map((color, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (selectedObject) {
                                                    updateObjectProperty('fill', color);
                                                } else {
                                                    setProductColor(color);
                                                }
                                                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                            }}
                                            className={`aspect-square rounded-xl border-2 transition-all ${(selectedObject ? selectedObject.fill === color : productColor === color) ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-slate-200/60 hover:border-slate-300'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    {selectedObject
                                        ? "Pick a color for your selected design element."
                                        : "Pick a global base color for the product mockup."}
                                </p>
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

            {/* 3. Main Studio Workbench */}
            <div className="grow flex flex-col relative overflow-hidden bg-[#f3f4f6]">
                {/* Desktop-only secondary header */}
                <div className="hidden md:flex h-14 bg-white items-center justify-between px-6 z-20 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Edition Mode:</span>
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#ff4d00] cursor-pointer`}>{view} View</div>
                        </div>
                        <button
                            onClick={resetDesign}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-orange-100 text-[#ff4d00]  hover:text-rose-600 uppercase tracking-wider cursor-pointer  flex items-center gap-1.5"
                        >
                            <Trash2 size={12} /> Reset All
                        </button>
                    </div>

                    <button
                        onClick={handleOpenPreview}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                        <Maximize2 size={14} /> Preview Mockups
                    </button>
                </div>

                <div className={`
                    flex-grow flex items-center justify-center p-2 min-h-0 overflow-hidden relative transition-all duration-500
                    ${isMobileMenuOpen ? 'h-[25vh] md:h-full -translate-y-6 md:translate-y-0' : 'h-full'}
                `}>
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        <div className={`
                            relative overflow-hidden z-10 transition-all duration-500 origin-center
                            ${isMobileMenuOpen ? 'scale-[0.9] sm:scale-[0.95]' : 'scale-[0.85] sm:scale-95'}
                            md:scale-90 lg:scale-100
                        `} style={{ width: 500, height: 580 }}>
                            <canvas ref={canvasRef} width={500} height={580} style={{ display: 'block' }} />
                        </div>
                    </div>
                </div>

                {/* 3c. Bottom Bar (Desktop Version) */}
                <div className="hidden md:flex h-24 bg-white border-t border-slate-100 px-10 items-center justify-between z-30 shadow-2xl">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-1">Total Price</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">${Number(product?.price || 0).toFixed(2)}</span>
                        </div>
                        <div className="text-center border-l border-slate-100 pl-10">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Estimation</span>
                            <p className="text-[11px] font-bold text-slate-500 ">Ship: 48h</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="px-8 py-4 bg-black text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#ff4d00] transition-all"
                        >
                            Save Draft
                        </button>
                        <button onClick={generateFinalImage} className="flex items-center gap-3 px-5 py-3 bg-black text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#ff4d00] transition-all shadow-2xl shadow-orange-500/20 active:scale-95">
                            <ShoppingCart size={20} /> Checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Right Sidebar: Angle Navigator (Desktop Only) */}
            <div className="hidden lg:flex w-[140px] bg-white border-l border-slate-200 flex-col py-6 px-4 gap-4 z-30 overflow-y-auto custom-scrollbar">
                <div className="mb-2 px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">View Angles</h4>
                </div>
                <div className="flex flex-col gap-4">
                    {VIEW_OPTIONS.filter(v => getViewImage(v) !== null).map((v) => {
                        const img = viewSnapshots[v] || getViewImage(v);
                        return (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`group relative aspect-[4/5] w-full rounded-2xl border-2 transition-all p-2 bg-slate-50 overflow-hidden ${view === v
                                    ? 'border-[#ff4d00] shadow-lg shadow-orange-500/10'
                                    : 'border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="h-full w-full flex items-center justify-center">
                                    {img ? (
                                        <img src={img} alt={v} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 opacity-20">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent pt-4 pb-1">
                                    <span className={`text-[8px] font-black uppercase tracking-tighter block text-center ${view === v ? 'text-[#ff4d00]' : 'text-slate-400'}`}>
                                        {v}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile View Switcher (Floating) */}
            <div className={`
                lg:hidden absolute left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md shadow-xl px-2 py-1.5 rounded-2xl border border-slate-100 flex items-center gap-2 overflow-x-auto max-w-[95vw] no-scrollbar transition-all duration-500
                ${isMobileMenuOpen ? 'top-2 scale-90 opacity-60' : 'top-[75px] scale-100 opacity-100'}
            `}>
                {VIEW_OPTIONS.filter(v => getViewImage(v) !== null).map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-[#ff4d00] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 bg-slate-50'}`}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {/* Mobile Tool Dock (Bottom Navigation) - Sample Inspired */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-50 flex flex-col pointer-events-none">
                {/* Mobile Pricing Bar (Now part of the bottom group) */}
                <div className="bg-white border-t border-slate-100 pl-6 pr-0 flex items-center justify-between pointer-events-auto h-20 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Subtotal</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">${Number(product?.price || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-0 h-full">
                        {/* Tab Selector Hub */}
                        <div className="flex items-center gap-7 mr-6">
                            <button
                                onClick={() => {
                                    setActiveTab('product');
                                    setIsMobileMenuOpen(true);
                                }}
                                className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'product' && isMobileMenuOpen ? 'text-[#ff4d00]' : 'text-slate-400'}`}
                            >
                                <Box size={18} />
                                <span className="text-[8px] font-black uppercase">Product</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('design-hub');
                                    setIsMobileMenuOpen(true);
                                }}
                                className={`flex flex-col items-center gap-1 transition-all ${activeTab !== 'product' && isMobileMenuOpen ? 'text-[#ff4d00]' : 'text-slate-400'}`}
                            >
                                <Palette size={18} />
                                <span className="text-[8px] font-black uppercase">Design</span>
                            </button>
                        </div>

                        {/* Red Checkout Pulse */}
                        <button
                            onClick={generateFinalImage}
                            className="bg-[#e11d48] text-white w-20 h-full flex items-center justify-center shadow-[0_0_50px_-10px_rgba(225,29,72,0.4)] active:scale-95 transition-all"
                        >
                            <ArrowRight size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-10"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mockup Preview</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Review all configuration angles</p>
                                </div>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {VIEW_OPTIONS.filter(v => getViewImage(v) !== null).map((v) => {
                                    // Logic to determine what image to show
                                    // 1. Snapshot from viewStates (most accurate for edits)
                                    // 2. Raw Product Image (if no edits visited)
                                    // 3. Fallback placeholder
                                    let displayImage = null;

                                    if (viewStates.current[v]?.preview) {
                                        displayImage = viewStates.current[v].preview;
                                    } else {
                                        displayImage = getViewImage(v);
                                    }

                                    if (!displayImage) return null; // Skip if no image at all

                                    return (
                                        <div key={v} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                                            <div className="relative aspect-[4/5] w-full bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
                                                <img
                                                    src={displayImage}
                                                    alt={v}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                />
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Customizer;
