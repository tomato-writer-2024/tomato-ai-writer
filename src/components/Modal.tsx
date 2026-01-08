'use client';

import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClass = sizes[size];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClass} bg-white rounded-2xl shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">{children}</div>;
};

// Alert Modal
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const alertConfig = {
  info: {
    icon: <Info className="text-blue-600" size={32} />,
    bg: 'bg-blue-50',
    confirmColor: 'bg-blue-600 hover:bg-blue-700',
  },
  success: {
    icon: <CheckCircle className="text-green-600" size={32} />,
    bg: 'bg-green-50',
    confirmColor: 'bg-green-600 hover:bg-green-700',
  },
  warning: {
    icon: <AlertTriangle className="text-yellow-600" size={32} />,
    bg: 'bg-yellow-50',
    confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  danger: {
    icon: <AlertCircle className="text-red-600" size={32} />,
    bg: 'bg-red-50',
    confirmColor: 'bg-red-600 hover:bg-red-700',
  },
};

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = '确认',
  cancelText = '取消',
  isLoading = false,
}: AlertModalProps) {
  const config = alertConfig[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.bg}`}>
          {config.icon}
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
      </div>

      <Modal.Footer>
        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition-colors disabled:opacity-50 ${config.confirmColor}`}
          >
            {isLoading ? '处理中...' : confirmText}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

// Confirm Modal (alias for AlertModal with danger type)
export function ConfirmModal(props: Omit<AlertModalProps, 'type'>) {
  return <AlertModal {...props} type="danger" />;
}

// Form Modal
interface FormModalProps extends Omit<ModalProps, 'title' | 'footer'> {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isValid?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = '提交',
  cancelText = '取消',
  isLoading = false,
  isValid = true,
  size = 'md',
  className = '',
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
    >
      <form onSubmit={onSubmit}>
        {children}

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border-2 border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 font-medium text-white transition-all hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-purple-600"
          >
            {isLoading ? '提交中...' : submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default Modal;
