'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import PromoBanner from './PromoBanner';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { SocialProofProvider, useSocialProof } from '@/contexts/SocialProofContext';
import SocialProofPopupManager from './SocialProofPopup';
import { SITE_BRAND } from '@/lib/brand';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  faviconUrl: string;
}

function LayoutContent({ children, faviconUrl }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const { notifications, removeNotification } = useSocialProof();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Gate active-state UI behind a mount flag — prevents hydration mismatch when
  // LanguageContext + ThemeContext shift values between SSR and first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentYear = new Date().getFullYear();

  const getLocalizedPath = (path: string) => {
    if (language === 'en') return path;
    return `/${language}${path}`;
  };

  // Admin routes render bare children (no chrome)
  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute) return <>{children}</>;

  return (
    <>
      {/* PROMO DROP BANNER — separate brand, not part of DPC visual identity. Do not restyle. */}
      {!isBannerDismissed && (
        <PromoBanner onDismiss={() => setIsBannerDismissed(true)} />
      )}

      {/* SLIM STICKY HEADER — single row: wordmark, inline search, theme toggle */}
      <header
        className={`sticky ${isBannerDismissed ? 'top-0' : 'top-[44px] md:top-[52px]'} z-40 border-b backdrop-blur-md transition-theme`}
        style={{
          backgroundColor: 'var(--background-color)',
          borderColor: 'var(--border-color)',
          transition: 'top 0.3s ease, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div className="mx-auto w-[92%] max-w-7xl">
          <div className="flex items-center gap-4 md:gap-6 py-3 md:py-4">
            {/* Wordmark — single-color, slate-900. Routes to home. */}
            <Link
              href={getLocalizedPath('/')}
              className="flex-shrink-0 font-semibold tracking-tight text-base md:text-lg whitespace-nowrap"
              aria-label={`${SITE_BRAND} home`}
              style={{ color: 'var(--text-color)' }}
            >
              {SITE_BRAND}
            </Link>

            {/* Inline search form — submits via GET to /?search=… so OffersGridClient picks it up */}
            <form
              action="/"
              method="GET"
              role="search"
              className="hidden sm:flex flex-1 max-w-2xl items-center"
            >
              <label htmlFor="header-search" className="sr-only">Search offers</label>
              <div className="relative w-full">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  id="header-search"
                  name="search"
                  type="search"
                  placeholder="Search offers, brands, categories…"
                  className="w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-color)',
                  }}
                />
              </div>
            </form>

            {/* Right cluster — theme toggle + mobile menu trigger */}
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />

              {/* Mobile: search icon (focuses search input on tablet+, opens menu on phone) + hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--text-color)',
                }}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile-only search row — full-width below the brand row, so search is always visible */}
          <form
            action="/"
            method="GET"
            role="search"
            className="sm:hidden pb-3"
          >
            <label htmlFor="mobile-top-search" className="sr-only">Search offers</label>
            <div className="relative w-full">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                id="mobile-top-search"
                name="search"
                type="search"
                placeholder="Search offers, brands, categories…"
                className="w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-color)',
                }}
              />
            </div>
          </form>

          {/* Desktop nav — under header, single row, slim */}
          <nav className="hidden md:flex items-center gap-6 pb-3" aria-label="Main navigation">
            {[
              { href: getLocalizedPath('/'), label: t('nav.home'), match: (p: string) => p === '/' || p === `/${language}` },
              { href: '/offers', label: 'Offers', match: (p: string) => p === '/offers' },
              { href: getLocalizedPath('/blog'), label: 'Blog', match: (p: string) => p.startsWith('/blog') },
              { href: '/how-to-redeem', label: 'How to Redeem', match: (p: string) => p === '/how-to-redeem' },
              { href: '/subscribe', label: 'Subscribe', match: (p: string) => p === '/subscribe' },
              { href: getLocalizedPath('/about'), label: t('nav.about'), match: (p: string) => p === '/about' || p === `/${language}/about` },
              { href: getLocalizedPath('/contact'), label: t('nav.contact'), match: (p: string) => p === '/contact' || p === `/${language}/contact` },
            ].map((item) => {
              const isActive = mounted && item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative pb-2 text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--text-color)' : 'var(--text-secondary)',
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* MOBILE NAV PANEL */}
        {isMobileMenuOpen && (
          <>
            <button
              aria-label="Close menu overlay"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <div
              className="fixed inset-x-0 top-0 z-50 border-b shadow-lg"
              style={{
                backgroundColor: 'var(--background-color)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="mx-auto w-[92%] max-w-6xl py-4">
                <div className="flex items-center justify-between mb-4">
                  <Link
                    href={getLocalizedPath('/')}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-semibold tracking-tight text-base"
                    style={{ color: 'var(--text-color)' }}
                  >
                    {SITE_BRAND}
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                    aria-label="Close menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile search */}
                <form action="/" method="GET" role="search" className="mb-4">
                  <label htmlFor="mobile-header-search" className="sr-only">Search offers</label>
                  <input
                    id="mobile-header-search"
                    name="search"
                    type="search"
                    placeholder="Search offers, brands, categories…"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-color)',
                    }}
                  />
                </form>

                {/* Mobile nav links */}
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {[
                    { href: getLocalizedPath('/'), label: t('nav.home') },
                    { href: '/offers', label: 'Offers' },
                    { href: getLocalizedPath('/blog'), label: 'Blog' },
                    { href: '/how-to-redeem', label: 'How to Redeem' },
                    { href: '/subscribe', label: 'Subscribe' },
                    { href: getLocalizedPath('/about'), label: t('nav.about') },
                    { href: getLocalizedPath('/contact'), label: t('nav.contact') },
                    { href: '/submit', label: 'Submit a code' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </header>

      {/* MAIN CONTENT */}
      <div
        className="transition-theme"
        style={{ backgroundColor: 'var(--background-color)' }}
      >
        {children}
      </div>

      {/* SLIM FOOTER */}
      <footer
        className="border-t mt-12 transition-theme"
        style={{
          backgroundColor: 'var(--background-secondary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left: wordmark + copyright */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span
                className="font-semibold tracking-tight text-sm"
                style={{ color: 'var(--text-color)' }}
              >
                {SITE_BRAND}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                © {currentYear} {SITE_BRAND}. {t('footer.rights')}
              </span>
            </div>

            {/* Middle: link row */}
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" aria-label="Footer">
              <Link href={getLocalizedPath('/about')} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.about')}
              </Link>
              <Link href={getLocalizedPath('/contact')} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.contact')}
              </Link>
              <Link href="/submit" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                Submit a code
              </Link>
              <Link href={getLocalizedPath('/privacy')} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                {t('footer.privacy')}
              </Link>
              <Link href={getLocalizedPath('/terms')} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                {t('footer.terms')}
              </Link>
              <Link href="/unsubscribe" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                Unsubscribe
              </Link>
            </nav>

            {/* Right: social icons (placeholders — real handles TBD, personal LinkedIn killed) */}
            <div className="flex items-center gap-2" aria-label="Social links">
              {/* TODO: replace href with new brand Instagram URL */}
              <a
                href="#"
                aria-label="Instagram (coming soon)"
                className="p-1.5 rounded-full border transition-colors hover:bg-[var(--background-tertiary)]"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              {/* TODO: replace href with new brand X / Twitter URL */}
              <a
                href="#"
                aria-label="X / Twitter (coming soon)"
                className="p-1.5 rounded-full border transition-colors hover:bg-[var(--background-tertiary)]"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* TODO: replace href with new brand LinkedIn URL — personal profile removed */}
              <a
                href="#"
                aria-label="LinkedIn (coming soon)"
                className="p-1.5 rounded-full border transition-colors hover:bg-[var(--background-tertiary)]"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* TODO: replace href with new brand YouTube URL */}
              <a
                href="#"
                aria-label="YouTube (coming soon)"
                className="p-1.5 rounded-full border transition-colors hover:bg-[var(--background-tertiary)]"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Social Proof Popup Manager */}
      <SocialProofPopupManager notifications={notifications} onRemove={removeNotification} />
    </>
  );
}

export function ConditionalLayout({ children, faviconUrl }: ConditionalLayoutProps) {
  return (
    <SocialProofProvider>
      <LayoutContent faviconUrl={faviconUrl}>{children}</LayoutContent>
    </SocialProofProvider>
  );
}
