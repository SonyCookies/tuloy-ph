'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message = 'Processing...' }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm animate-in fade-in duration-500" />
      
      {/* Modal Content */}
      <div className="relative flex flex-col items-center gap-4 animate-in zoom-in-95 fade-in duration-300">
        {/* Card for the spinner */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center">
          <LoadingSpinner size="lg" color="primary" />
        </div>
        
        {/* Loading Message */}
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-900 tracking-[0.2em] uppercase">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
