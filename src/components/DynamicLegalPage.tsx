'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface DynamicLegalPageProps {
  title: string;
  content: string;
  lastUpdated: string;
}

export default function DynamicLegalPage({ title, content, lastUpdated }: DynamicLegalPageProps) {
  const { language, t } = useLanguage();

  // Helper function to get localized paths
  const getLocalizedPath = (path: string) => {
    if (language === 'en') {
      return path;
    }
    return `/${language}${path}`;
  };

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'nl': 'nl-NL',
      'zh': 'zh-CN'
    };

    const locale = localeMap[language] || 'en-US';

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get ISO date string for datetime attribute
  const getISODate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Determine if this is privacy or terms page
  const isPrivacyPage = title.toLowerCase().includes('privacy') || title.toLowerCase().includes('privacidad') || title.toLowerCase().includes('privacybeleid') || title.toLowerCase().includes('confidentialité') || title.toLowerCase().includes('datenschutz') || title.toLowerCase().includes('politica') || title.toLowerCase().includes('privacidade') || title.toLowerCase().includes('隐私');

  // Privacy page sections
  const privacySections = [
    { id: 'introduction', title: t('privacy.introduction.title'), content: t('privacy.introduction.content') },
    {
      id: 'information-we-collect',
      title: t('privacy.infoCollect.title'),
      content: `<h3>${t('privacy.infoProvide.title')}</h3><p>${t('privacy.infoProvide.content').replace(/\n/g, '<br>')}</p><h3>${t('privacy.infoAuto.title')}</h3><p>${t('privacy.infoAuto.content').replace(/\n/g, '<br>')}</p>`
    },
    { id: 'how-we-use-information', title: t('privacy.howUse.title'), content: t('privacy.howUse.content').replace(/\n/g, '<br>') },
    { id: 'information-sharing', title: t('privacy.sharing.title'), content: t('privacy.sharing.content').replace(/\n/g, '<br>') },
    { id: 'cookies', title: t('privacy.cookies.title'), content: t('privacy.cookies.content').replace(/\n/g, '<br>') },
    { id: 'security', title: t('privacy.security.title'), content: t('privacy.security.content').replace(/\n/g, '<br>') },
    { id: 'your-rights', title: t('privacy.rights.title'), content: t('privacy.rights.content').replace(/\n/g, '<br>') },
    { id: 'contact-us', title: t('privacy.contact.title'), content: t('privacy.contact.content').replace(/\n/g, '<br>') },
  ];

  // Terms page sections
  const termsSections = [
    { id: 'agreement-to-terms', title: t('terms.agreement.title'), content: t('terms.agreement.content') },
    { id: 'use-license', title: t('terms.license.title'), content: t('terms.license.content').replace(/\n/g, '<br>') },
    { id: 'disclaimer', title: t('terms.disclaimer.title'), content: t('terms.disclaimer.content').replace(/\n/g, '<br>') },
    { id: 'responsible-use', title: t('terms.responsible.title'), content: t('terms.responsible.content').replace(/\n/g, '<br>') },
    { id: 'contact-information', title: t('terms.contactInfo.title'), content: t('terms.contactInfo.content').replace(/\n/g, '<br>') },
  ];

  const sections = isPrivacyPage ? privacySections : termsSections;

  // Key points for sidebar
  const privacyKeyPoints = [
    'We only collect information necessary to operate WhopPromoCodes.',
    'We never sell your personal data to third parties.',
    'You can request access, correction, or deletion of your information.',
    'We use industry-standard security practices to safeguard your data.',
  ];

  const termsKeyPoints = [
    'Using the site means you agree to these terms.',
    'Promo codes and offers may change or expire without notice.',
    'We are not responsible for third-party products or services.',
    'Contact us if you have questions about how any clause applies.',
  ];

  const keyPoints = isPrivacyPage ? privacyKeyPoints : termsKeyPoints;

  // Summary text for hero
  const privacySummary = 'How we collect, use, and protect your information when you use our platform.';
  const termsSummary = 'The rules and guidelines for using WhopPromoCodes and our affiliate services.';
  const summaryText = isPrivacyPage ? privacySummary : termsSummary;

  return (
    <div
      className="min-h-screen py-10 md:py-12 transition-theme"
      style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
    >
      <div className="mx-auto w-[90%] md:w-[95%] max-w-6xl space-y-8 md:space-y-10">

        {/* Back link */}
        <Link
          href={getLocalizedPath('/')}
          className="inline-flex items-center text-xs md:text-sm gap-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent-color)' }}
        >
          <span aria-hidden="true">←</span>
          <span>Back to homepage</span>
        </Link>

        {/* Top hero / summary card */}
        <section
          className="rounded-2xl border px-6 py-5 md:px-8 md:py-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
        >
          <div className="space-y-2">
            <p
              className="text-xs font-semibold tracking-[0.12em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Site policies
            </p>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--text-color)' }}
            >
              {isPrivacyPage ? t('privacy.title') : t('terms.title')}
            </h1>
            <p
              className="text-xs md:text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {summaryText}
            </p>
          </div>

          <div
            className="flex flex-col items-start md:items-end gap-2 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--accent-color)' }}
              />
              <span>
                Last updated:{' '}
                <time dateTime={getISODate(lastUpdated)}>{formatDate(lastUpdated)}</time>
              </span>
            </div>
            <p
              className="text-[11px] md:text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Please read this page carefully before using WhopPromoCodes.
            </p>
          </div>
        </section>

        {/* Main grid: content + side rail */}
        <section className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] items-start">

          {/* LEFT: main legal content */}
          <div
            className="rounded-2xl border px-5 py-6 md:px-7 md:py-8"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div
              className="space-y-8 md:space-y-10 text-sm md:text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: 'rgba(5,150,105,0.12)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <h2
                      className="text-base md:text-lg font-semibold"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <div
                    className="legal-content pl-9"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </section>
              ))}
            </div>
          </div>

          {/* RIGHT: sticky quick summary / key points */}
          <aside className="space-y-4 lg:space-y-5">
            {/* Key points card */}
            <div
              className="rounded-2xl border px-4 py-4 md:px-5 md:py-5"
              style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
            >
              <h2
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--text-color)' }}
              >
                Key points at a glance
              </h2>
              <ul
                className="space-y-2 text-xs md:text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* On this page TOC - sticky on desktop */}
            <div
              className="hidden lg:block rounded-2xl border px-4 py-4 md:px-5 md:py-5 sticky top-24"
              style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
            >
              <h2
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--text-color)' }}
              >
                On this page
              </h2>
              <nav className="space-y-1.5 text-xs md:text-sm">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </section>

        {/* Footer */}
        <footer
          className="pt-6 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Need clarification on anything above?{' '}
            <Link
              href="/contact"
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-color)' }}
            >
              Reach out to us
            </Link>
          </p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .legal-content h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--text-color);
          }

          .legal-content h3:first-child {
            margin-top: 0;
          }

          .legal-content p {
            margin-bottom: 0.75rem;
            line-height: 1.7;
          }

          .legal-content p:last-child {
            margin-bottom: 0;
          }

          .legal-content ul,
          .legal-content ol {
            margin-bottom: 0.75rem;
            padding-left: 1.25rem;
          }

          .legal-content li {
            margin-bottom: 0.375rem;
            line-height: 1.7;
            list-style-type: disc;
          }

          .legal-content strong {
            color: var(--text-color);
            font-weight: 600;
          }

          .legal-content a {
            color: var(--accent-color);
            text-decoration: none;
            transition: opacity 0.2s;
          }

          .legal-content a:hover {
            text-decoration: underline;
          }
        `
      }} />
    </div>
  );
}
