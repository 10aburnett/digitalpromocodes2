'use client';

import { useState, useEffect } from 'react';
import { formatTimeAgo } from '@/lib/utils';

interface UsageCounterProps {
  bonusId: string;
}

export default function UsageCounter({ bonusId }: UsageCounterProps) {
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsageCount = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tracking?bonusId=${bonusId}`);
        if (response.ok) {
          const data = await response.json();
          setUsageCount(data.usageCount);
          
          // Format the last used time if available
          if (data.lastUsed) {
            const formattedTime = formatTimeAgo(data.lastUsed);
            setLastUsed(formattedTime);
          }
        }
      } catch (error) {
        console.error("Error fetching usage count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageCount();

    // Refresh count every minute
    const interval = setInterval(fetchUsageCount, 60000);
    
    return () => clearInterval(interval);
  }, [bonusId]);

  if (isLoading || usageCount === null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {lastUsed && (
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Last used <strong>{lastUsed}</strong></span>
        </div>
      )}
      
      <div className="flex items-center gap-2 text-white/80 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>
          Used <strong>{usageCount}</strong> {usageCount === 1 ? 'time' : 'times'} today
        </span>
      </div>
    </div>
  );
} 