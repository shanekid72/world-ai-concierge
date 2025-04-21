import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/use-toast';
import { setToastFunction } from '../hooks/toast-utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-cyber-green/20 border-cyber-green text-cyber-green',
  error: 'bg-red-900/20 border-red-500 text-red-500',
  info: 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue',
  warning: 'bg-yellow-900/20 border-yellow-500 text-yellow-500',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, toast } = useToast();

  useEffect(() => {
    setToastFunction(toast);
  }, [toast]);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-4 min-w-[320px] max-w-[420px]">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`p-4 rounded border ${colors[toast.type]} shadow-lg backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5" />
                  <p className="flex-1 text-sm">{toast.message}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}; 