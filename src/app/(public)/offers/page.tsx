import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// NOTE: /offers is a UX hub (noindex, follow).
// Revisit indexability in 4-6 weeks once individual pages have authority.
// This prevents hub cannibalization of leaf pages during launch phase.
export const metadata: Metadata = {
  title: 'All Promo Codes & Offers | WhopPromoCodes',
  description: 'Browse our complete directory of verified promo codes and exclusive offers. Find discounts on courses, trading tools, and digital products.',
  robots: {
    index: false,
    follow: true,
  },
};

interface OfferListItem {
  slug: string;
  name: string;
  category: string | null;
  logo: string | null;
}

async function getCohortOffers(): Promise<OfferListItem[]> {
  // Get all cohort slugs
  const cohortSlugs = Array.from(LAUNCH_COHORT_SLUGS);

  if (cohortSlugs.length === 0) {
    return [];
  }

  // Fetch offer details from database
  const offers = await prisma.deal.findMany({
    where: {
      slug: { in: cohortSlugs },
      NOT: { retirement: 'GONE' }
    },
    select: {
      slug: true,
      name: true,
      category: true,
      logo: true,
    },
    orderBy: { name: 'asc' }
  });

  return offers;
}

// Group offers by first letter for easier navigation
function groupByLetter(offers: OfferListItem[]): Map<string, OfferListItem[]> {
  const groups = new Map<string, OfferListItem[]>();

  for (const offer of offers) {
    const firstChar = offer.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';

    if (!groups.has(letter)) {
      groups.set(letter, []);
    }
    groups.get(letter)!.push(offer);
  }

  return groups;
}

export default async function OffersHubPage() {
  const offers = await getCohortOffers();
  const grouped = groupByLetter(offers);
  const letters = Array.from(grouped.keys()).sort();

  return (
    <main
      className="min-h-screen pb-16 pt-8"
      style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* Header */}
        <header className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-color)' }}
          >
            All Promo Codes & Offers
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Browse {offers.length} verified offers with exclusive promo codes
          </p>
        </header>

        {/* Alphabet Navigation */}
        <nav
          className="mb-8 rounded-2xl border p-4"
          style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
          aria-label="Jump to letter"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--accent-color)] hover:text-white"
                style={{ backgroundColor: 'var(--background-tertiary)', color: 'var(--text-color)' }}
              >
                {letter}
              </a>
            ))}
          </div>
        </nav>

        {/* Offers List */}
        <div className="space-y-8">
          {letters.map((letter) => {
            const letterOffers = grouped.get(letter) || [];

            return (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                <h2
                  className="text-xl font-bold mb-4 pb-2 border-b"
                  style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
                >
                  {letter}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {letterOffers.map((offer) => (
                    <Link
                      key={offer.slug}
                      href={`/offer/${offer.slug}`}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-0.5"
                      style={{
                        backgroundColor: 'var(--background-secondary)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      {/* Logo */}
                      <img
                        src={offer.logo || '/logo.svg'}
                        alt={`${offer.name} logo`}
                        width={40}
                        height={40}
                        loading="lazy"
                        className="w-10 h-10 rounded-lg object-contain border flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--background-tertiary)',
                          borderColor: 'var(--border-color)',
                        }}
                      />

                      {/* Name & Category */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-sm font-semibold line-clamp-1"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {offer.name}
                        </h3>
                        {offer.category && (
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {offer.category}
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <span
                        className="flex-shrink-0"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <nav className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to home
            </Link>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Have a promo code to share?{' '}
              <Link
                href="/submit"
                className="font-medium underline hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-color)' }}
              >
                Submit it here
              </Link>
              {' '}to help others save.
            </p>
          </div>
        </nav>
      </div>
    </main>
  );
}
