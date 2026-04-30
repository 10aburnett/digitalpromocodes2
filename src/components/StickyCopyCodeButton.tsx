'use client';

import React, { useState, useEffect } from 'react';

interface StickyCopyCodeButtonProps {
  code: string;
  offerId?: string;
  promoCodeId?: string;
}

export default function StickyCopyCodeButton({
  code,
  offerId,
  promoCodeId
}: StickyCopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const displayCode = code.length > 10 ? `${code.slice(0, 10)}..` : code;

  // Fetch usage count when component mounts (keep for tracking but don't display)
  useEffect(() => {
    if (promoCodeId) {
      fetchUsageCount();
    }

    // Refresh count every minute
    const interval = setInterval(() => {
      if (promoCodeId) {
        fetchUsageCount();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [promoCodeId]);

  const fetchUsageCount = async () => {
    try {
      const response = await fetch(`/api/tracking?bonusId=${promoCodeId}`);
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.usageCount);
      }
    } catch (error) {
      console.error('Error fetching usage count:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // Track the copy action if offerId and promoCodeId are provided
      if (offerId && promoCodeId) {
        trackCopyCode();
        // Update the usage count immediately after tracking
        setTimeout(fetchUsageCount, 500);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const trackCopyCode = async () => {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          casinoId: offerId, // Using offerId as casinoId for API compatibility
          bonusId: promoCodeId, // Using promoCodeId as bonusId for API compatibility
          actionType: 'code_copy',
        }),
      });
    } catch (error) {
      console.error("Error tracking code copy:", error);
    }
  };

  // Always apply the hover styles to the button
  return (
    <div className="relative w-full">
      <button
        onClick={handleCopy}
        className="bg-[#4a4c5c] text-white rounded-lg shadow-lg border border-[#68D08B] transition-all duration-200 px-4 py-2 md:py-2.5 w-full md:w-auto flex items-center justify-between relative min-w-[130px] h-[38px] md:h-[44px]"
        title={code}
      >
        <div className="flex-1 mr-2 text-center">
          <span className="text-base md:text-lg font-medium text-white">
            {copied ? 'Copied!' : displayCode}
          </span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-[#68D08B] opacity-100">
          <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
          <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
        </svg>
      </button>
    </div>
  );
}
