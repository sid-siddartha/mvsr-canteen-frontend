import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-20 border border-slate-100 p-8 shadow-premium max-w-sm w-full text-center flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center text-primary mb-5">
          <HelpCircle size={32} className="stroke-[1.5]" />
        </div>
        
        <span className="text-[10px] font-extrabold text-primary bg-primary/10 py-1 px-3 rounded-full uppercase tracking-wider mb-2">
          Error 404
        </span>
        
        <h2 className="text-base font-extrabold text-primary-text mb-2">This page isn't available right now</h2>
        <p className="text-xs text-secondary-text leading-relaxed max-w-[260px] mb-6">
          The link you followed may be broken or the page may have been removed. Let's get you back on track.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="w-full bg-primary hover:bg-indigo-700 text-white text-xs font-bold py-3.5 px-4 rounded-full shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98"
        >
          <ArrowLeft size={14} /> Return to Menu
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
