'use client';

import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-32 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-10 w-48 bg-gray-200 rounded-2xl" />
        <div className="h-3 w-64 bg-gray-100 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Grid Skeleton */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <div className="h-7 w-40 bg-gray-100 rounded-xl" />
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-gray-50 rounded-full" />
              <div className="w-9 h-9 bg-gray-50 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-3 bg-gray-50 rounded-full mx-2" />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-50/50 rounded-2xl border border-gray-50" />
            ))}
          </div>
        </div>

        {/* Details Panel Skeleton */}
        <div className="col-span-1 space-y-6">
          <div className="h-32 bg-neutral-dark/10 rounded-3xl border border-gray-100" />
          <div className="space-y-4">
            <div className="h-3 w-32 bg-gray-100 rounded-full ml-2" />
            <div className="h-40 bg-white rounded-2xl border border-gray-100 shadow-sm" />
            <div className="h-40 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
