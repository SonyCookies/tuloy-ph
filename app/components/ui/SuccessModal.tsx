'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'info';
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success'
}: SuccessModalProps) {
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
      className={`fixed inset-0 z-[110] flex items-center justify-center p-6 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-[320px] overflow-hidden
        bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2.5rem]
        shadow-[0_20px_50px_rgba(0,0,0,0.15)]
        transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        <div className="pt-8 pb-4 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-sm border-2 ${
            variant === 'success' 
              ? 'bg-green-50 text-green-500 border-green-100' 
              : 'bg-neutral-50 text-neutral-500 border-neutral-100'
          }`}>
            {variant === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <Info className="w-8 h-8" />}
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

        <div className="p-6 pt-2">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl flex items-center justify-center 
              bg-neutral-900 hover:bg-neutral-800 text-white
              text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Great!
          </button>
        </div>

        <div className="h-1.5 w-12 mx-auto mb-3 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}
