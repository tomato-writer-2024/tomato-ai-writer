'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ showToast: addToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Toast Item
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const config = {
    success: {
      icon: <CheckCircle className="text-green-600" size={20} />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      titleColor: 'text-green-900',
    },
    error: {
      icon: <XCircle className="text-red-600" size={20} />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      titleColor: 'text-red-900',
    },
    warning: {
      icon: <AlertCircle className="text-yellow-600" size={20} />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      titleColor: 'text-yellow-900',
    },
    info: {
      icon: <Info className="text-blue-600" size={20} />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-900',
    },
  };

  const style = config[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 rounded-xl border ${style.border} ${style.bg} p-4
        shadow-lg transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-semibold ${style.titleColor} mb-1`}>{toast.title}</p>
        )}
        <p className="text-sm text-gray-700">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Hook to use Toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
