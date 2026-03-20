'use client';

import React from 'react';

export default function DormCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 animate-pulse w-full">
      <div className="h-48 sm:h-56 w-full bg-gray-100 relative">
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="w-12 h-6 bg-white/50 rounded-full" />
          <div className="w-12 h-6 bg-white/50 rounded-full" />
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="w-16 h-8 bg-white/50 rounded-2xl" />
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        <div className="w-12 h-2 bg-gray-100 rounded-full" />
        <div className="space-y-2">
          <div className="w-full h-5 bg-gray-200 rounded-lg" />
          <div className="w-1/2 h-3 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="w-14 h-6 bg-gray-50 rounded-2xl" />
          <div className="w-14 h-6 bg-gray-50 rounded-2xl" />
          <div className="w-14 h-6 bg-gray-50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
