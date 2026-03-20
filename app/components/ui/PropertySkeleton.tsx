'use client';

import React from 'react';
import { ChevronLeft } from "lucide-react";

interface PropertySkeletonProps {
  isStudent?: boolean;
}

export default function PropertySkeleton({ isStudent = false }: PropertySkeletonProps) {
  return (
    <div className="min-h-screen bg-white relative pb-32 animate-pulse overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 py-6 mb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-32 h-8 bg-gray-200 rounded-xl" />
              <div className="w-48 h-3 bg-gray-100 rounded-full" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-200" />
            </div>
          </div>
        </div>

        <main className="space-y-6">
          
          {/* Hero Image Skeleton */}
          <div className="relative h-[300px] rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden">
            <div className="absolute top-4 left-4 w-20 h-6 bg-gray-200 rounded-lg" />
            {isStudent && <div className="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-xl" />}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
            </div>
          </div>

          {/* Rate & Info Card Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[100px] flex">
            <div className="flex-1 p-6 border-r border-gray-50 flex flex-col justify-center gap-2">
              <div className="w-20 h-2.5 bg-gray-100 rounded-full" />
              <div className="w-32 h-8 bg-gray-200 rounded-xl" />
            </div>
            <div className="w-[120px] bg-gray-50/50 flex flex-col items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
              <div className="w-16 h-3 bg-gray-200 rounded-lg" />
            </div>
          </div>

          {/* Core Info Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Identity */}
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="w-48 h-8 bg-gray-200 rounded-xl" />
            </div>
            {/* Location */}
            <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/20 space-y-2">
              <div className="w-16 h-2.5 bg-gray-100 rounded-full" />
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
                <div className="w-full h-4 bg-gray-100 rounded-lg" />
              </div>
            </div>
            {/* Spec Grid */}
            <div className="flex divide-x divide-gray-50">
              <div className="flex-1 px-6 py-5 space-y-2">
                <div className="w-16 h-2.5 bg-gray-100 rounded-full" />
                <div className="w-20 h-4 bg-gray-200 rounded-lg" />
              </div>
              <div className="flex-1 px-6 py-5 space-y-2">
                <div className="w-16 h-2.5 bg-gray-100 rounded-full" />
                <div className="w-24 h-4 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="w-32 h-2.5 bg-gray-100 rounded-full" />
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-100 rounded-full" />
              <div className="w-full h-3 bg-gray-100 rounded-full" />
              <div className="w-3/4 h-3 bg-gray-100 rounded-full" />
            </div>
          </div>

          {/* Amenities Skeleton */}
          <div className="space-y-3">
             <div className="w-32 h-2.5 bg-gray-100 rounded-full ml-1" />
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 bg-white border border-gray-100 rounded-xl shadow-sm" />
                ))}
             </div>
          </div>

          {/* Rules Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="w-40 h-2.5 bg-gray-200 rounded-full" />
             </div>
             <div className="p-5 space-y-3">
                <div className="w-full h-3 bg-gray-100 rounded-full" />
                <div className="w-5/6 h-3 bg-gray-100 rounded-full" />
                <div className="w-4/6 h-3 bg-gray-100 rounded-full" />
             </div>
          </div>

          {/* Map Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex gap-4 items-center">
                <div className="p-2.5 bg-white rounded-xl w-9 h-9" />
                <div className="w-20 h-2.5 bg-gray-200 rounded-full" />
             </div>
             <div className="h-[250px] bg-gray-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300">
                Loading Map...
             </div>
          </div>

          {/* Student-only Owner Card Skeleton */}
          {isStudent && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="w-16 h-2 bg-gray-100 rounded-full" />
                  <div className="w-32 h-5 bg-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="w-full h-14 bg-gray-100 rounded-xl" />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
