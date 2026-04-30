'use client';

import React from 'react';

interface CopyButtonProps {
  text: string;
  displayText?: string;
  className?: string;
}

export default function CopyButton({ text, displayText, className = "" }: CopyButtonProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(text);
  };

  return (
    <button
      onClick={handleCopy}
      className={`bg-[#2c2f3a] text-white px-2.5 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 ${className}`}
      title={text}
    >
      <span>{displayText || text}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-80">
        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
      </svg>
    </button>
  );
} 