'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSwipe } from '@/hooks/useSwipe';
import { normalizeImagePath } from '@/lib/image-utils';

interface ScreenshotGalleryProps {
  screenshots: string[];
  casinoName: string;
}

export default function ScreenshotGallery({ screenshots, casinoName }: ScreenshotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Handle ESC key and arrow keys globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      
      switch (e.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          navigateGallery('prev');
          break;
        case 'ArrowRight':
          navigateGallery('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    // Prevent body scrolling when gallery is open
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setCurrentIndex(null);
    // Re-enable body scrolling when gallery is closed
    document.body.style.overflow = '';
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    if (currentIndex === null) return;
    
    if (direction === 'prev') {
      setCurrentIndex(prev => 
        prev === null ? null : (prev === 0 ? screenshots.length - 1 : prev - 1)
      );
    } else {
      setCurrentIndex(prev => 
        prev === null ? null : (prev === screenshots.length - 1 ? 0 : prev + 1)
      );
    }
  };

  // Setup swipe handlers for mobile
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => navigateGallery('next'),
    onSwipeRight: () => navigateGallery('prev'),
    threshold: 30
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {screenshots.map((screenshot, index) => (
          <div 
            key={index} 
            className="relative rounded-lg overflow-hidden aspect-video bg-[#2c2f3a] cursor-pointer"
            onClick={() => openGallery(index)}
          >
            <Image
              src={normalizeImagePath(screenshot)}
              alt={`${casinoName} screenshot ${index + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Gallery Overlay */}
      {currentIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeGallery}
          onTouchStart={swipeHandlers.onTouchStart}
          onTouchMove={swipeHandlers.onTouchMove}
          onTouchEnd={swipeHandlers.onTouchEnd}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              closeGallery();
            }}
            aria-label="Close gallery"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Current Image */}
          <div 
            className="relative w-[90%] h-[80%] max-w-4xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
          >
            <Image
              src={normalizeImagePath(screenshots[currentIndex])}
              alt={`${casinoName} screenshot ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          <button 
            className="absolute left-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigateGallery('prev');
            }}
            aria-label="Previous screenshot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <button 
            className="absolute right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigateGallery('next');
            }}
            aria-label="Next screenshot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white/90 text-sm">
            {currentIndex + 1} / {screenshots.length}
          </div>
        </div>
      )}
    </>
  );
} 