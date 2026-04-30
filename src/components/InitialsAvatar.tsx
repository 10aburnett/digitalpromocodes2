import React from 'react';
import { getInitialsData } from '@/lib/initials-utils';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
  style?: React.CSSProperties;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

// Brand colors for all initials avatars
const BRAND_BACKGROUND_COLOR = '#FA4616'; // Bold orange-red
const BRAND_TEXT_COLOR = '#FCF6F5'; // Off-white

export default function InitialsAvatar({ 
  name, 
  size = 'lg', 
  shape = 'square',
  className = '',
  style = {}
}: InitialsAvatarProps) {
  const { initials } = getInitialsData(name);
  
  const combinedStyle = {
    backgroundColor: BRAND_BACKGROUND_COLOR,
    color: BRAND_TEXT_COLOR,
    ...style,
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${shapeClasses[shape]} 
        flex items-center justify-center 
        font-bold 
        select-none 
        transition-all 
        duration-200
        ${className}
      `}
      style={combinedStyle}
      title={`${name} - ${initials}`}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}

// Export a hook for getting initials data if needed elsewhere
export function useInitialsData(name: string) {
  return getInitialsData(name);
} 