'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export default function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = 'unset';
      }, 300); // Wait for animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-dark/20 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-lg max-h-[85dvh] bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Agreement</span>
            <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide bg-white">
          <div className="text-sm text-gray-600 font-medium leading-relaxed">
            {content}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
