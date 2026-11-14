import React from 'react';

export function Windows18Logo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="w18-p1" x1="2" y1="2" x2="15" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="w18-p2" x1="17" y1="2" x2="30" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="w18-p3" x1="2" y1="17" x2="15" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="w18-p4" x1="17" y1="17" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="12.5" height="12.5" rx="3" fill="url(#w18-p1)" />
      <rect x="17" y="2.5" width="12.5" height="12.5" rx="3" fill="url(#w18-p2)" />
      <rect x="2.5" y="17" width="12.5" height="12.5" rx="3" fill="url(#w18-p3)" />
      <rect x="17" y="17" width="12.5" height="12.5" rx="3" fill="url(#w18-p4)" />
    </svg>
  );
}

/**
 * Windows 11-inspired Prismatic Rainbow Bloom Wallpaper
 * Crafted with layered translucent folded glass ribbons for crisp legibility in both Light and Dark themes.
 */
export function RainbowBloomWallpaper({
  variant = 'rainbow',
  className = '',
}: {
  variant?: 'rainbow' | 'cobalt' | 'aurora';
  className?: string;
}) {
  const palette =
    variant === 'cobalt'
      ? ['#0ea5e9', '#2563eb', '#4f46e5', '#1d4ed8', '#38bdf8']
      : variant === 'aurora'
        ? ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
        : ['#0ea5e9', '#6366f1', '#d946ef', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-[#050914] ${className}`}
      aria-hidden="true"
    >
      {/* Subtle atmospheric glow */}
      <div
        className="absolute inset-0 opacity-75 dark:opacity-90"
        style={{
          background: `
            radial-gradient(circle at 22% 25%, ${palette[0]}38 0%, transparent 48%),
            radial-gradient(circle at 78% 22%, ${palette[2]}33 0%, transparent 45%),
            radial-gradient(circle at 68% 78%, ${palette[3]}2e 0%, transparent 48%),
            radial-gradient(circle at 28% 76%, ${palette[4]}29 0%, transparent 45%)
          `,
        }}
      />

      {/* Windows 11-inspired Folded Rainbow Bloom SVG */}
      <svg
        viewBox="0 0 1200 720"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="bloom-petal-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette[0]} stopOpacity="0.92" />
            <stop offset="50%" stopColor={palette[1]} stopOpacity="0.88" />
            <stop offset="100%" stopColor={palette[2]} stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="bloom-petal-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette[2]} stopOpacity="0.85" />
            <stop offset="55%" stopColor={palette[3]} stopOpacity="0.82" />
            <stop offset="100%" stopColor={palette[4]} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="bloom-petal-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette[5] ?? palette[0]} stopOpacity="0.82" />
            <stop offset="50%" stopColor={palette[0]} stopOpacity="0.78" />
            <stop offset="100%" stopColor={palette[1]} stopOpacity="0.6" />
          </linearGradient>
          <filter id="bloom-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Outer Ribbon Fold */}
        <path
          d="M 600 120 C 780 90, 930 220, 860 390 C 800 540, 610 610, 440 540 C 290 480, 260 280, 390 180 C 465 122, 535 130, 600 120 Z"
          fill="url(#bloom-petal-1)"
          opacity="0.78"
        />

        {/* Secondary Cross Fold */}
        <path
          d="M 620 155 C 790 195, 880 355, 760 485 C 645 610, 445 555, 365 425 C 295 310, 390 175, 530 150 C 565 144, 595 149, 620 155 Z"
          fill="url(#bloom-petal-2)"
          opacity="0.74"
        />

        {/* Inner Luminous Core Petal */}
        <path
          d="M 595 210 C 710 215, 775 320, 715 420 C 655 520, 505 510, 445 415 C 390 330, 460 205, 595 210 Z"
          fill="url(#bloom-petal-3)"
          opacity="0.82"
          filter="url(#bloom-blur)"
        />

        {/* Crisp Glass Crease Highlights */}
        <path
          d="M 385 265 Q 595 340 830 275"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 430 475 Q 600 350 745 445"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}
