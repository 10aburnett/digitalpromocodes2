// src/components/offer/HowToSection.tsx
// Whop-specific, fully rewritten, no figures, SEO-safe, modernised wording

type Props = {
  brand: string;
};

export default function HowToSection({ brand }: Props) {
  return (
    <section
      aria-labelledby="howto-title"
      className="mt-6 rounded-2xl shadow-theme-promo p-6 sm:p-8 transition-theme"
      style={{ backgroundColor: "var(--background-secondary)" }}
    >
      <h2
        id="howto-title"
        className="text-xl sm:text-2xl font-bold mb-4"
        style={{ color: "var(--text-color)" }}
      >
        How to Apply a Promo Code on Whop
      </h2>

      <div
        className="space-y-4 leading-relaxed text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        <p>
          Whop uses a unified checkout layout, so applying a promo code for{" "}
          <strong>{brand}</strong> is normally quick and intuitive. The steps
          below explain exactly where to enter your code and how to ensure it
          registers correctly.
        </p>

        <p>
          <strong>1. Open the checkout page for the product or plan you want.</strong><br />
          Whop displays your chosen tier on the right-hand side, along with the
          price and billing period.
        </p>

        <p>
          <strong>2. Locate the "Add coupon" or "Have a code?" link.</strong><br />
          This appears next to the order summary. If a code is auto-filled from a
          previous session or extension, remove it first so you can add your best
          discount manually.
        </p>

        <p>
          <strong>3. Enter your promo code exactly as provided.</strong><br />
          Whop normally accepts codes regardless of capitalisation, but avoid
          spaces or autofill errors. After applying the code, the total should
          update immediately.
        </p>

        <p>
          <strong>4. If the price doesn't change:</strong><br />
          It may mean the code only applies to a different billing cycle,
          one-time purchase, or new-customer plan. Switching the tier or removing
          and re-adding the code usually resolves this.
        </p>

        <p>
          <strong>5. Trials & renewals:</strong><br />
          When a trial is available, the discount commonly applies to the first
          paid period. Check the renewal line in the summary to confirm the exact
          amount and date.
        </p>

        <p>
          <strong>6. Browser tools and extensions:</strong><br />
          Some coupon extensions or aggressive autofill scripts can override the
          input field. If your code refuses to apply, try incognito mode or
          temporarily disabling extensions.
        </p>

        <p>
          <strong>7. After completing your order:</strong><br />
          Your access will appear in your Whop Library. For Discord-based
          products, use "Manage → Connect Discord" to activate permissions.
        </p>

        <p className="text-sm italic opacity-70">
          These steps reflect the most common Whop checkout behaviour. Minor interface
          variations exist depending on the seller.
        </p>
      </div>
    </section>
  );
}
