'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, X } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | null;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export default function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionText,
  onAction,
}: StatusModalProps) {
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

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-dark/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[340px] bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transition-all duration-300 transform ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Top Accent Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1 ${
            type === 'success' ? 'bg-secondary' : 'bg-primary'
          }`} 
        />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon Section */}
          <div className="mb-6">
            <div className={`p-4 rounded-xl ${
              type === 'success' 
                ? 'bg-secondary/10 text-secondary' 
                : 'bg-primary/10 text-primary'
            }`}>
              {type === 'success' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5 mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-2">
            <button
              onClick={onAction || onClose}
              className={`w-full py-3 rounded-xl text-base font-bold text-white transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                type === 'success' 
                  ? 'bg-secondary shadow-secondary/10 hover:opacity-90' 
                  : 'bg-primary shadow-primary/10 hover:opacity-90'
              }`}
            >
              {actionText || (type === 'success' ? 'Continue' : 'Try Again')}
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-50 text-gray-300 hover:text-gray-500 transition-all border border-transparent hover:border-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
