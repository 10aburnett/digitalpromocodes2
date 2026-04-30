import proofManifest from "@data/proof-manifest.json";

// Check if proof exists for a slug using the manifest
function proofExists(slug: string) {
  return (proofManifest.slugs || []).includes(slug);
}

// Generate proof path for a given slug
function proofPathForSlug(slug: string) {
  const PROOF_VERSION = proofManifest.version || "2025-09";
  return `/images/howto/${slug}-proof-${PROOF_VERSION}.webp`;
}

type Props = {
  slug: string;
  brand: string;
  currency: string;
  hasTrial?: boolean;
  siteOrigin: string; // e.g., https://whoppromocodes.com
  hasRealCode?: boolean; // Whether the offer has a real promo code
};

export default function HowToSchema({
  slug, brand, currency, hasTrial, siteOrigin, hasRealCode = true
}: Props) {
  const a = `${siteOrigin}/images/howto/whop-ui-map-2025-09.png`;
  const bPath = proofPathForSlug(slug);
  const b = `${siteOrigin}${bPath}`;

  const images = [a];
  // Check if B exists and include it
  const hasB = proofExists(slug);
  if (hasB) {
    images.push(b);
  }

  // Offer-specific steps that match the visible "How to apply this promo code" section
  // These are unique per offer (include brand name) for better SEO
  const ctaText = hasRealCode ? "Reveal Code" : "Go to Offer";

  const json = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to redeem a ${brand} promo code`,
    "description": `Step-by-step instructions to apply a promo code for ${brand} on Whop checkout.`,
    "image": images,
    "tool": [{ "@type": "HowToTool", "name": "Online Checkout" }],
    "totalTime": "PT2M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Visit the offer page",
        "text": `Click "${ctaText}" to visit ${brand} and access your exclusive offer.`
      },
      {
        "@type": "HowToStep",
        "name": "Apply at checkout",
        "text": `Follow the instructions on the ${brand} checkout page to apply your savings.${hasRealCode ? " Enter your promo code in the coupon field." : ""}`
      },
      {
        "@type": "HowToStep",
        "name": "Complete your purchase",
        "text": `Finish payment to unlock your ${brand} access and any included bonuses.${hasTrial ? " Note: if there's a trial, the discount applies to your first paid period." : ""}`
      },
      {
        "@type": "HowToStep",
        "name": "Access your content",
        "text": `Your ${brand} membership will appear in your Whop Library. For Discord-based products, connect your Discord account to activate permissions.`
      }
    ]
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}
