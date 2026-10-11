import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-[#08151f]/95 border-emerald-500/60 neon-glow-green',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          titleColor: 'text-emerald-300'
        };
      case 'warning':
        return {
          bg: 'bg-[#18150c]/95 border-yellow-500/60 neon-glow-yellow',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
          titleColor: 'text-yellow-300'
        };
      case 'error':
        return {
          bg: 'bg-[#190c12]/95 border-red-500/60 neon-glow-red',
          icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
          titleColor: 'text-red-300'
        };
      default:
        return {
          bg: 'bg-[#0c1524]/95 border-cyan-500/60 neon-glow-cyan',
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
          titleColor: 'text-cyan-300'
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto rounded-xl border p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-200 transform translate-y-0 ${style.bg}`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <h5 className={`text-xs font-bold font-mono ${style.titleColor}`}>
          {toast.title}
        </h5>
        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
