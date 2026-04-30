'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSocialProof, createSocialProofFromOffer } from '@/contexts/SocialProofContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { hasRealCode, assertCtaMatchesCode } from '@/lib/promo-label';

interface OfferPageClientProps {
  offer: {
    id: string;
    name: string;
    affiliateLink: string | null;
  };
  firstPromo: {
    id: string;
    code: string | null;
    title: string;
    type?: string;
    value?: string;
  } | null;
  promoCode: string | null;
  promoTitle: string;
  onTrackingComplete?: () => void; // Callback to refresh stats
}

export default function OfferPageClient({
  offer,
  firstPromo,
  promoCode,
  promoTitle,
  onTrackingComplete,
}: OfferPageClientProps) {
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { addNotification, isHydrated } = useSocialProof();
  const { t } = useLanguage();

  // Determine if offer has a real code (SEO-critical decision)
  const hasCode = useMemo(() => hasRealCode(promoCode), [promoCode]);

  // DEV REGRESSION GUARD: Check CTA/code mismatch
  useEffect(() => {
    if (hasMounted) {
      const ctaText = hasCode ? t('whop.revealCode') : t('whop.goToOffer');
      assertCtaMatchesCode(ctaText, hasCode);
    }
  }, [hasMounted, hasCode, t]);

  // Shared button styling so SSR + CSR match exactly
  // Rounded-md (no pill), large + bold so the reveal CTA reads as the dominant action on the page.
  const baseButtonClass =
    'w-full inline-flex items-center justify-center rounded-md px-6 py-4 min-h-[52px] text-base sm:text-lg font-bold tracking-tight ' +
    'transition-all duration-200 hover:brightness-105 hover:shadow-lg hover:-translate-y-0.5 ' +
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 ' +
    'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none disabled:hover:translate-y-0';

  // Extract a numeric promo value if possible (e.g. "20% off" → 20)
  const promoNumericValue = useMemo(() => {
    if (!firstPromo?.value) return undefined;
    const match = firstPromo.value.match(/[\d.]+/);
    if (!match) return undefined;
    const n = Number(match[0]);
    return Number.isFinite(n) ? n : undefined;
  }, [firstPromo?.value]);

  // Ensure hydration compatibility - delay client-only rendering
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Reset codeRevealed state when offer changes (e.g., language switch)
  useEffect(() => {
    setCodeRevealed(false);
  }, [offer.id, offer.name]);

  // Auto-hide revealed code after 10 seconds to force re-click (cookie re-drop cycle)
  // When user returns from competitor sites, they must click "Reveal Code" again,
  // which triggers the reverse redirect and re-drops our affiliate cookie
  useEffect(() => {
    if (codeRevealed) {
      const hideTimer = setTimeout(() => {
        setCodeRevealed(false);
      }, 10_000);
      return () => clearTimeout(hideTimer);
    }
  }, [codeRevealed]);

  // Auto-reveal code when page loads with ?revealed=true (from reverse redirect)
  // Multiple OfferPageClient instances exist on the same page, so delay URL cleanup
  // to ensure ALL instances read the param before it's removed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('revealed') === 'true') {
      setCodeRevealed(true);
      setTimeout(() => {
        if (window.location.search.includes('revealed=true')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }, 200);
    }
  }, []);

  const trackRevealCode = useCallback(
    async (offerId: string, promoCodeId: string | null): Promise<boolean> => {
      console.log('🔥 OfferPageClient: trackRevealCode called with:', {
        offerId,
        promoCodeId,
        offerName: offer.name,
        timestamp: new Date().toISOString(),
      });

      try {
        const requestBody = {
          casinoId: offerId, // Using offerId as casinoId for compatibility
          bonusId: promoCodeId, // Using promoCodeId as bonusId for compatibility (can be null)
          actionType: 'code_copy', // Consistent with stats
        };

        console.log('📤 OfferPageClient: Sending tracking request:', requestBody);

        const response = await fetch('/api/tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ OfferPageClient: Tracking successful:', result);
          return true;
        } else {
          const errorData = await response.text();
          console.error('❌ OfferPageClient: Tracking failed:', response.status, errorData);
          return false;
        }
      } catch (error) {
        console.error('❌ OfferPageClient: Error tracking reveal code:', error);
        return false;
      }
    },
    [offer.name],
  );

  const handleCtaClick = async () => {
    console.log('🔥 OfferPageClient: CTA button clicked!', {
      offerName: offer.name,
      offerId: offer.id,
      firstPromoId: firstPromo?.id,
      hasCode,
      timestamp: new Date().toISOString(),
    });

    // Fire tracking BEFORE any navigation (use sendBeacon for reliability)
    if (offer) {
      const trackingData = JSON.stringify({
        casinoId: offer.id,
        bonusId: firstPromo?.id || null,
        actionType: 'code_copy',
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([trackingData], { type: 'application/json' });
        navigator.sendBeacon('/api/tracking', blob);
      } else {
        fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: trackingData,
          keepalive: true,
        }).catch(() => {});
      }
      if (onTrackingComplete) onTrackingComplete();
    }

    // Trigger social proof notification before navigation
    if (hasMounted && isHydrated) {
      const socialProofData = createSocialProofFromOffer({
        whopName: offer.name,
        promoCode,
        promoValue: promoNumericValue,
        promoType: firstPromo?.type,
        promoText: promoTitle,
      });
      addNotification(socialProofData);
    }

    // "Reverse redirect" pattern (industry standard for coupon sites):
    // 1. Open a NEW tab with THIS page + ?revealed=true — browser gives it focus
    // 2. Redirect the CURRENT tab to the affiliate link — now in background
    // Result: user sees the revealed code in foreground, affiliate loads behind
    if (offer?.affiliateLink) {
      const revealUrl = `${window.location.pathname}?revealed=true`;
      const codeTab = window.open(revealUrl, '_blank');

      if (codeTab) {
        // New tab has focus showing the code. Redirect this tab to affiliate.
        setTimeout(() => {
          window.location.href = offer.affiliateLink!;
        }, 100);
        return; // Stop here — this tab is navigating away
      } else {
        // Popup blocked: fall back to opening affiliate in new tab normally
        window.open(offer.affiliateLink, '_blank', 'noopener,noreferrer');
      }
    }

    // Fallback reveal (popup blocked or no affiliate link)
    setCodeRevealed(true);
  };

  const handleCopyCode = async () => {
    if (!promoCode) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promoCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = promoCode;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  // Show initial button state during SSR and until mounted to prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="w-full">
        <button
          className={baseButtonClass}
          style={{ backgroundColor: 'var(--accent-color)', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
          disabled
          aria-label={hasCode ? 'Reveal discount code' : 'Go to offer page'}
        >
          {hasCode ? t('whop.revealCode') : t('whop.goToOffer')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!codeRevealed ? (
        // Initial button - "Reveal Code" if has code, "Go to Offer" if no code
        <button
          onClick={handleCtaClick}
          className={baseButtonClass}
          style={{ backgroundColor: 'var(--accent-color)', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
          aria-label={hasCode ? 'Reveal discount code' : 'Go to offer page'}
        >
          {hasCode ? t('whop.revealCode') : t('whop.goToOffer')}
        </button>
      ) : promoCode ? (
        // Has promo code - clickable copy button
        <div className="w-full flex flex-col items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className="w-full border-2 font-bold py-4 px-6 min-h-[52px] rounded-md text-center text-base sm:text-lg tracking-tight transition-all duration-200 hover:shadow-md cursor-pointer"
            style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--accent-color)', color: 'var(--text-color)' }}
            aria-label={copied ? 'Code copied to clipboard' : `Copy code ${promoCode}`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 min-w-0">
                <span
                  className="block text-xs uppercase tracking-wide mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('whop.yourCode')}
                </span>
                <span
                  className="text-lg sm:text-xl font-semibold break-all"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {promoCode}
                </span>
              </div>
              <div className="flex-shrink-0">
                {copied ? (
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--success-color, #22c55e)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--text-secondary)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                )}
              </div>
            </div>
          </button>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {copied ? t('whop.codeCopied') : t('whop.offerOpenedInTab')}
          </span>
        </div>
      ) : (
        // No promo code - show clean message card (not a giant pill)
        <div
          className="w-full rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}
            >
              No code
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-color)' }}
            >
              {t('whop.noCode')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
