'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages, Language } from '@/lib/i18n';

// Short code mapping for compact display
const shortCodes: Record<Language, string> = {
  en: 'EN',
  es: 'ES',
  nl: 'NL',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  zh: 'ZH',
};

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  const currentLanguage = languages[language];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 hover:opacity-80"
        style={{
          borderColor: 'var(--border-color)',
          color: 'var(--text-color)',
          backgroundColor: 'var(--background-secondary)',
        }}
        aria-label="Change site language"
      >
        <span className="w-4 h-4 rounded-sm overflow-hidden flex items-center justify-center text-sm">
          {currentLanguage.flag}
        </span>
        <span className="hidden sm:inline">{shortCodes[language] || currentLanguage.name}</span>
        <span className="sr-only">Change site language</span>
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 min-w-[160px] rounded-xl border shadow-lg z-50 py-1.5"
          style={{
            backgroundColor: 'var(--background-color)',
            borderColor: 'var(--border-color)',
          }}
        >
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code as Language)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors duration-150"
              style={{
                color: language === code ? 'var(--accent-color)' : 'var(--text-color)',
                backgroundColor: language === code ? 'var(--background-secondary)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (language !== code) {
                  e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="w-4 h-4 rounded-sm overflow-hidden flex items-center justify-center text-sm">
                {lang.flag}
              </span>
              <span>{lang.name}</span>
              {language === code && (
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: 'var(--accent-color)' }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 