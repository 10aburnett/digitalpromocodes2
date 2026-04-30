'use client';

import React, { useState, useEffect } from 'react';
import { useSocialProof } from '@/contexts/SocialProofContext';

export interface SocialProofData {
  id: string;
  name: string;
  amount: string;
  code: string;
  whopName: string;
}

interface SocialProofPopupProps {
  data: SocialProofData;
  onComplete: () => void;
}

function SocialProofPopupItem({ data, onComplete }: SocialProofPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start entrance animation
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Start exit animation after 5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5000);

    // Complete removal after exit animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`
        fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50
        max-w-xs sm:max-w-sm w-auto
        rounded-xl border p-3 sm:p-3.5
        backdrop-blur
        transition-all duration-500 ease-out
        ${isVisible && !isExiting
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-3 scale-95'
        }
      `}
      style={{
        backgroundColor: 'var(--background-color)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-color)',
        boxShadow: '0 18px 35px rgba(12, 20, 33, 0.30)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Circular accent icon */}
        <div className="flex-shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'rgba(22,163,74,0.12)',
              color: 'var(--success-color)',
            }}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide mb-0.5"
            style={{ color: 'var(--success-color)' }}
          >
            Live savings
          </p>
          <p className="text-xs sm:text-sm leading-relaxed">
            A shopper just saved with a promo on{' '}
            <span className="font-medium" style={{ color: 'var(--accent-color)' }}>
              {data.whopName}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

interface SocialProofPopupManagerProps {
  notifications: SocialProofData[];
  onRemove: (id: string) => void;
}

export default function SocialProofPopupManager({ notifications, onRemove }: SocialProofPopupManagerProps) {
  const { isHydrated } = useSocialProof();
  
  // Don't render anything until hydration is complete to prevent mismatches
  if (!isHydrated) {
    return null;
  }

  // Only show the most recent notification to avoid overlap
  const currentNotification = notifications[notifications.length - 1];

  if (!currentNotification) {
    return null;
  }

  return (
    <SocialProofPopupItem
      key={currentNotification.id}
      data={currentNotification}
      onComplete={() => onRemove(currentNotification.id)}
    />
  );
} 