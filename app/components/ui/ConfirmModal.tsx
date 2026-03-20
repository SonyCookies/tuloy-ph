'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Loader2, Trash2, Info, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = 'danger'
}: ConfirmModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6" />,
      iconBg: 'bg-red-50 text-red-500 border-red-100',
      actionBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-200',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
      actionBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      iconBg: 'bg-neutral-50 text-neutral-500 border-neutral-100',
      actionBtn: 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-gray-200',
    }
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center p-6 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        className={`relative w-full max-w-[320px] overflow-hidden
        bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl
        shadow-[0_20px_50px_rgba(0,0,0,0.15)]
        transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        <div className="pt-8 pb-4 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm border-2 ${style.iconBg}`}>
            {style.icon}
          </div>
          
          <div className="px-8 text-center space-y-2">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs leading-relaxed text-neutral-400">
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 pt-2 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 
              text-sm font-semibold transition-all active:scale-95 shadow-lg
              disabled:opacity-50 disabled:active:scale-100 ${style.actionBtn}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : confirmText}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl flex items-center justify-center 
              bg-white/50 border border-neutral-200 text-neutral-500 
              text-sm font-medium hover:bg-neutral-50 transition-all active:scale-95"
          >
            {cancelText}
          </button>
        </div>

        <div className="h-1.5 w-12 mx-auto mb-3 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}