import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center text-[#ff4d00]"
        >
          <AlertTriangle size={80} strokeWidth={1.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-7xl font-black text-white tracking-tighter mb-4"
        >
          404
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold text-slate-300 tracking-tight mb-2"
        >
          System Error: Page Missing
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-slate-500 text-sm font-medium mb-12"
        >
          The architecture you're looking for doesn't exist within the Fabricon engine. It may have been relocated or deleted.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff4d00] hover:bg-[#e64500] text-white font-bold text-sm tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-1"
          >
            <Home size={18} />
            Return to Core
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
