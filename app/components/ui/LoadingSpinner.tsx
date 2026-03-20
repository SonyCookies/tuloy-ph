'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
}

export default function LoadingSpinner({ size = 'md', color = 'primary' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} inline-flex items-center justify-center`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-[spin_1.2s_linear_infinite]"
      >
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="11"
              y="2"
              width="2"
              height="5"
              rx="1"
              fill="currentColor"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: '50% 12px',
                opacity: 1 - (i * 0.08),
              }}
            />
          ))}
        </svg>
    </div>
  );
}
