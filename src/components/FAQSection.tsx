'use client';

import { useState, useEffect } from 'react';
import { FaqItem, parseFaqContent } from '@/lib/faq-types';
import RenderPlain from '@/components/RenderPlain';
import { looksLikeHtml, toPlainText } from '@/lib/textRender';

interface LegacyFAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs?: LegacyFAQItem[];
  faqContent?: string | null;
  whopName?: string;
}

// Helper function to determine FAQ content type
function getFaqAnswerType(answerText: string): { text: string; isHtml: boolean } {
  return {
    text: answerText,
    isHtml: looksLikeHtml(answerText)
  };
}

export default function FAQSection({ faqs = [], faqContent, whopName }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [displayFaqs, setDisplayFaqs] = useState<Array<{question: string, answer: string, isHtml: boolean}>>([]);
  const [jsonLd, setJsonLd] = useState<any>(null);

  useEffect(() => {
    console.log('🔍 FAQ Debug - faqContent:', faqContent);
    console.log('🔍 FAQ Debug - faqContent type:', typeof faqContent);
    
    // Priority 1: Use structured FAQ content if available
    if (faqContent && faqContent.trim() !== '') {
      const parsed = parseFaqContent(faqContent);
      console.log('🔍 FAQ Debug - parsed result:', parsed);
      console.log('🔍 FAQ Debug - is parsed array:', Array.isArray(parsed));
      
      if (Array.isArray(parsed)) {
        // Structured FAQs from our editor - now support plain text
        const structuredFaqs = parsed.map(faq => {
          const answerType = getFaqAnswerType(faq.answerHtml);
          return {
            question: faq.question,
            answer: answerType.text,
            isHtml: answerType.isHtml
          };
        });
        console.log('✅ FAQ Debug - Using structured FAQs:', structuredFaqs);
        setDisplayFaqs(structuredFaqs);
        
        // Generate JSON-LD for structured FAQs (use plain text for schema)
        generateJsonLd(parsed, whopName);
        return;
      } else if (typeof parsed === 'string') {
        // Legacy text content
        console.log('📝 FAQ Debug - Using legacy text content:', parsed);
        setDisplayFaqs([{
          question: "FAQ Information",
          answer: parsed,
          isHtml: false
        }]);
        setJsonLd(null);
        return;
      }
    }
    
    // Priority 2: Fall back to legacy hardcoded FAQs
    console.log('⚠️ FAQ Debug - Falling back to hardcoded FAQs');
    if (faqs && faqs.length > 0) {
      const legacyFaqs = faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer,
        isHtml: false
      }));
      setDisplayFaqs(legacyFaqs);
      setJsonLd(null);
    }
  }, [faqContent, faqs, whopName]);

  const generateJsonLd = (faqItems: FaqItem[], whopName?: string) => {
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          // For JSON-LD, always use plain text
          "text": toPlainText(faq.answerHtml)
        }
      }))
    };
    setJsonLd(jsonLdData);
  };

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (displayFaqs.length === 0) {
    return null; // Don't render if no FAQs
  }

  return (
    <>
      {/* JSON-LD for structured FAQs */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <section
        className="rounded-2xl border px-6 py-5 sm:px-8 sm:py-7 transition-theme"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--background-color)',
        }}
      >
        <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
          Questions about this offer
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Quick answers to things buyers often ask before using a promo code.
        </p>
        <div className="space-y-3">
          {displayFaqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            return (
              <div
                key={index}
                className="rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5 transition-all duration-200"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                {/* Question Header - Clickable */}
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="text-sm sm:text-base font-medium" style={{ color: 'var(--text-color)' }}>
                    {faq.question}
                  </h3>
                  {/* Plus/minus icon in circle */}
                  <span
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--background-color)',
                    }}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {/* Answer Content - Collapsible */}
                <div
                  className={`transition-all duration-200 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div
                    className="mt-2.5 pt-2.5 border-t text-sm leading-relaxed"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    {faq.isHtml ? (
                      <div
                        className="prose prose-sm max-w-none whitespace-break-spaces prose-headings:text-current prose-p:text-current prose-ul:text-current prose-ol:text-current prose-li:text-current prose-strong:text-current prose-em:text-current prose-a:text-blue-600 hover:prose-a:text-blue-700"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    ) : (
                      <RenderPlain text={faq.answer} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
} 