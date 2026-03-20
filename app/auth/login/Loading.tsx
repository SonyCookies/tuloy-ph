'use client';

import React from 'react';
import Image from 'next/image';

export default function LoginLoading() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white font-sans">
      {/* 1. Background for Zero-Flash Transition */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/tuloyphloginbg.svg"
          alt="Loading Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 2. Content Layer */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8 md:py-16">
        
        <div className="w-full max-w-md animate-pulse">
          {/* Header Skeleton */}
          <div className="w-full mb-10 text-left">
            <div className="w-24 h-6 bg-gray-50/80 backdrop-blur-sm rounded-full mb-6 border border-gray-100" />
            <div className="space-y-1">
              <div className="w-16 h-2.5 bg-primary/20 rounded-full" />
              <div className="w-40 h-7 bg-gray-200/80 rounded-lg" />
            </div>
          </div>

          {/* Form Card Skeleton */}
          <div className="w-full bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
            {/* Input rows */}
            {[1, 2].map((i) => (
              <div key={i} className="px-4 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="w-20 h-2 bg-gray-100 rounded-full" />
                  <div className="w-32 h-4 bg-gray-50 rounded-md" />
                </div>
              </div>
            ))}

            {/* Button Placeholder */}
            <div className="p-4 pt-1">
              <div className="w-full h-12 bg-primary/10 rounded-xl" />
            </div>

            {/* Footer Placeholder */}
            <div className="py-4 flex justify-center border-t border-gray-50 bg-gray-50/10">
              <div className="w-40 h-3 bg-gray-100 rounded-full" />
            </div>
          </div>

          {/* Bottom Logo Placeholder */}
          <div className="mt-12 flex justify-end">
            <div className="w-24 h-10 bg-gray-100/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
