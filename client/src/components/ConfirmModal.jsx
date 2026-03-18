import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md glass-panel p-0 overflow-hidden border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header/Banner */}
          <div className="h-2 bg-linear-to-r from-primary via-secondary to-primary animate-gradient opacity-80" />
          
          <div className="p-8">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <Trash2 className="text-error w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase font-display">
                {title || 'Are you sure?'}
              </h3>
              
              <p className="text-text-secondary font-medium leading-relaxed">
                {message || 'This action is permanent and cannot be reversed.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-xl font-bold font-display text-sm uppercase tracking-widest bg-surface border border-white/5 text-text-muted hover:text-white hover:bg-surface-light transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-6 py-4 rounded-xl font-bold font-display text-sm uppercase tracking-widest bg-error text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
