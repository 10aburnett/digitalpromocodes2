// Google Analytics configuration
// GA ID must be set via NEXT_PUBLIC_GA_ID environment variable
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track promo code usage
export const trackPromoCodeUsage = (promoCode: string, whopName: string) => {
  event({
    action: 'promo_code_reveal',
    category: 'engagement',
    label: `${whopName} - ${promoCode}`,
  });
};

// Track affiliate link clicks
export const trackAffiliateLinkClick = (whopName: string, affiliateLink: string) => {
  event({
    action: 'affiliate_link_click',
    category: 'conversion',
    label: whopName,
  });
};

// Track search queries
export const trackSearch = (query: string) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
  });
};

// Track page engagement
export const trackPageEngagement = (page: string, timeOnPage: number) => {
  event({
    action: 'page_engagement',
    category: 'engagement',
    label: page,
    value: timeOnPage,
  });
};