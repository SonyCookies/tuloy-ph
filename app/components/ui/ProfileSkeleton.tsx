'use client';

import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 animate-pulse">
      <div className="space-y-6">
        {/* Profile Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          {/* Cover Area placeholder */}
          <div className="h-32 bg-gray-100/50" />
          
          <div className="px-8 pb-8 flex flex-col items-center text-center -mt-16 relative z-10">
            {/* Avatar placeholder */}
            <div className="w-32 h-32 rounded-2xl bg-gray-200 border-4 border-white shadow-xl" />
            
            {/* Name placeholder */}
            <div className="mt-4 w-48 h-8 bg-gray-200 rounded-2xl" />
            
            {/* Role/Badge placeholder */}
            <div className="mt-2 w-32 h-5 bg-gray-100 rounded-full" />
          </div>

          {/* Info Sections placeholders */}
          <div className="border-t border-gray-50 px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-20 h-3 bg-gray-100 rounded-full ml-1" />
                  <div className="w-full h-14 bg-gray-50 rounded-2xl border border-transparent" />
                </div>
              ))}
            </div>

            {/* Large Address placeholder */}
            <div className="space-y-2 pt-2">
              <div className="w-24 h-3 bg-gray-100 rounded-full ml-1" />
              <div className="w-full h-24 bg-gray-50 rounded-2xl border border-transparent" />
            </div>
          </div>
        </div>

        {/* Action Buttons placeholders */}
        <div className="space-y-3">
          <div className="w-full h-14 bg-gray-200 rounded-2xl" />
          <div className="w-full h-14 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
