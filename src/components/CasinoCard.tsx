'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { normalizeImagePath } from '@/lib/image-utils';
import { useLanguage } from '@/contexts/LanguageContext';

// Define the bonus type directly here to avoid import issues
interface Bonus {
  id: string;
  casinoName: string;
  bonusType: string;
  bonusValue: number;
  bonusText: string;
  logoUrl: string;
  promoCode?: string | null;
  affiliateLink: string;
  isActive: boolean;
  // Add the casinoId field for tracking
  casinoId?: string;
  // Add the bonusId field for tracking
  bonusId?: string;
}

interface CasinoCardProps {
  bonus: Bonus;
}

export default function CasinoCard({ bonus }: CasinoCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // More aggressive truncation on mobile only if casino name is long
  const getDisplayCode = () => {
    if (!bonus.promoCode) return bonus.promoCode;
    
    // Only truncate more aggressively on mobile if casino name is over 9 characters
    const shouldTruncateMore = isMobile && bonus.casinoName.length > 9;
    const maxLength = shouldTruncateMore ? 6 : 8;
    
    return bonus.promoCode.length > maxLength 
      ? `${bonus.promoCode.slice(0, maxLength)}..`
      : bonus.promoCode;
  };
  
  const displayCode = getDisplayCode();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bonus.promoCode) {
      navigator.clipboard.writeText(bonus.promoCode);
      setCopied(true);
      
      // Track the copy event
      if (bonus.bonusId && bonus.casinoId) {
        trackCopyCode(bonus.casinoId, bonus.bonusId);
      }
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetBonusClick = (e: React.MouseEvent) => {
    // Don't stop propagation - allow the link to work normally
    
    // Track the click event
    if (bonus.bonusId && bonus.casinoId) {
      trackOfferClick(bonus.casinoId, bonus.bonusId);
    }
  };

  const trackCopyCode = async (casinoId: string, bonusId: string) => {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          casinoId,
          bonusId,
          actionType: 'code_copy',
        }),
      });
    } catch (error) {
      console.error("Error tracking code copy:", error);
    }
  };

  const trackOfferClick = async (casinoId: string, bonusId: string) => {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          casinoId,
          bonusId,
          actionType: 'code_copy',
        }),
      });
    } catch (error) {
      console.error("Error tracking offer click:", error);
    }
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Load alternative logo paths to try
  const getAlternativeLogoPaths = (casinoName: string, originalPath: string) => {
    const cleanName = casinoName.replace(/[^a-zA-Z0-9]/g, '');
    return [
      `/images/${casinoName} Logo.png`,
      `/images/${casinoName.replace(/\s+/g, '')} Logo.png`,
      `/images/${cleanName} Logo.png`,
      `/images/${cleanName}Logo.png`,
      '/images/Simplified Logo.png'
    ];
  };

  // Try next image in case of error
  const handleImageError = () => {
    console.error(`Image failed to load: ${imagePath}`);
    
    // Get alternative paths
    const alternativePaths = getAlternativeLogoPaths(bonus.casinoName, imagePath);
    const currentIndex = alternativePaths.indexOf(imagePath);
    
    if (currentIndex < alternativePaths.length - 1) {
      // Try next alternative
      const nextPath = alternativePaths[currentIndex + 1];
      console.log(`Trying alternative logo path: ${nextPath}`);
      setImagePath(nextPath);
    } else {
      // All alternatives failed, show initials
      console.log(`All logo paths failed for ${bonus.casinoName}, showing initials`);
      setImageError(true);
    }
  };

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine the best logo path when component mounts
  useEffect(() => {
    try {
      const normalizedPath = normalizeImagePath(bonus.logoUrl);
      setImagePath(normalizedPath);
      setImageError(false); // Reset error state when path changes
      console.log(`Set image path for ${bonus.casinoName}: ${normalizedPath}`);
    } catch (error) {
      console.error(`Error setting image path for ${bonus.casinoName}:`, error);
      setImageError(true);
    }
  }, [bonus.logoUrl, bonus.casinoName]);

  return (
    <div className="relative">
      {bonus.promoCode && (
        <button
          onClick={handleCopy}
          className="absolute right-4 sm:right-5 top-5 z-10 bg-[#2c2f3a] text-white px-2 sm:px-2.5 py-1.5 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[#343747] hover:shadow-lg border border-transparent hover:border-[#68D08B] transition-all duration-200 flex items-center gap-1 sm:gap-1.5 group"
          title={bonus.promoCode}
        >
          <span className="text-white">{copied ? 'Copied!' : displayCode}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80 group-hover:text-[#68D08B] group-hover:opacity-100">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
          </svg>
        </button>
      )}
      <article className="relative bg-gradient-to-br from-[#3e4050] to-[#373846] p-5 rounded-xl shadow-lg border border-[#404055] transition-all hover:shadow-xl hover:border-[#68D08B]/20">
        <Link 
          href={`/${bonus.id}`} 
          className="block"
          title={`${bonus.casinoName} Promo Code - ${bonus.bonusText} (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#2c2f3a] flex items-center justify-center">
              {!imageError ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePath}
                    alt={`${bonus.casinoName} Promo Code - ${bonus.bonusText} (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                    priority={true}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center text-lg font-semibold px-1">
                  {getInitials(bonus.casinoName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl font-bold truncate ${bonus.promoCode ? 'pr-16 sm:pr-20' : 'pr-4'}`}>{bonus.casinoName}</h2>
              <p className="text-[#68D08B] text-base mt-1">{bonus.bonusText}</p>
            </div>
          </div>
        </Link>

        <a
          href={bonus.affiliateLink || '#'}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-full bg-[#68D08B] text-[#343541] font-bold py-3 px-4 rounded-lg text-center hover:bg-[#5abc7a] transition-all duration-200 block"
          onClick={handleGetBonusClick}
        >
          {t('whop.getPromo')}
        </a>
      </article>
    </div>
  );
} 