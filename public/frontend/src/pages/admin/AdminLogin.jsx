import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../../api/client';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
            navigate('/admin');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/admin/login', { email, password });
            localStorage.setItem('adminInfo', JSON.stringify(data));
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-[#ff4d00] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-200">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h2>
                        <p className="text-slate-500 mt-2 font-medium">Secure access for Fabricon management</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d00] transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#ff4d00]/20 focus:bg-white rounded-2xl font-bold text-slate-900 outline-none transition-all"
                                    placeholder="admin@fabricon.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d00] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#ff4d00]/20 focus:bg-white rounded-2xl font-bold text-slate-900 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Sign In to Dashboard <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center space-y-4">
                        <Link to="/" className="inline-block text-[#ff4d00] font-bold text-sm hover:underline">
                            ← Return to Storefront
                        </Link>
                        <p className="text-slate-400 text-sm font-medium italic">
                            Authorized personnel only. Sessions are monitored.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
