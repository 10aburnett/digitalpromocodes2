'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  label: string;
  icon: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active section

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for any fixed headers
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="bg-[#3e4050] rounded-xl px-4 py-3 mb-6 sticky top-4 z-10 shadow-lg">
      <div className="flex items-center justify-center relative">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap text-white/70 hover:text-white hover:bg-[#343541]"
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className={item.icon ? "hidden sm:inline" : ""}>{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* Fade indicator for mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#3e4050] to-transparent pointer-events-none sm:hidden"></div>
      </div>
    </nav>
  );
} 