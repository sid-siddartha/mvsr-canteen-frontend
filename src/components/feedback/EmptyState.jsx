import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ title, description, icon: Icon, actionText, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white rounded-20 border border-slate-100 p-10 text-center max-w-md mx-auto shadow-soft my-8 flex flex-col items-center"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center text-primary mb-5"
        >
          <Icon size={26} className="stroke-[1.8]" />
        </motion.div>
      )}
      <h3 className="text-sm font-extrabold text-primary-text mb-1.5">{title}</h3>
      <p className="text-xs text-secondary-text leading-relaxed max-w-[280px]">{description}</p>
      
      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="mt-6 text-xs font-bold text-white bg-primary hover:bg-indigo-700 py-2.5 px-6 rounded-full transition-all shadow-sm shadow-primary/15"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;

