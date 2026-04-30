# Build Optimization Notes

## Current Build Time: ~30 minutes

This is intentional for optimal user experience.

---

## Why Builds Are Slow

The `generateStaticParams` function in `src/app/(public)/offer/[slug]/page.tsx` pre-renders ALL indexable offer pages (~669 pages) at build time.

```typescript
// Location: src/app/(public)/offer/[slug]/page.tsx (around line 59-80)

export async function generateStaticParams() {
  const offers = await prisma.deal.findMany({
    where: {
      indexingStatus: 'INDEX',
      retirement: 'NONE',
    },
    select: { slug: true },
    take: 5000,  // <-- This renders ALL pages
    orderBy: { displayOrder: 'asc' },
  });
  // ...
}
```

Each page makes multiple database queries during build, resulting in:
- 669 pages × ~3 seconds each = ~30 minutes

---

## How To Make Builds Faster (If Needed)

### Option 1: Reduce pre-rendered pages (Recommended)

Change `take: 5000` to a smaller number:

```typescript
take: 100,  // Only pre-render top 100 pages
```

**Result:** ~5-8 minute builds
**Trade-off:** Pages beyond top 100 load in 1-2s on first visit (then cached)

### Option 2: Disable static generation entirely

```typescript
export async function generateStaticParams() {
  return [];  // Don't pre-render any pages
}
```

**Result:** ~2-3 minute builds
**Trade-off:** All pages load in 1-2s on first visit (then cached via ISR)

### Option 3: Skip in development only (already implemented)

```typescript
if (process.env.NODE_ENV !== 'production') {
  return [];  // Fast dev builds
}
```

---

## Current Settings (Optimal UX)

| Setting | Value | Purpose |
|---------|-------|---------|
| `take` | 5000 | Pre-render all pages |
| `revalidate` | 60 | Refresh cached pages every 60s |
| `dynamicParams` | true | Allow new pages to be generated on-demand |

---

## When To Consider Faster Builds

- If you're deploying multiple times per day
- If Vercel build minutes become a concern
- If you have thousands more pages in the future

---

## Quick Toggle Commands

### Switch to FAST builds (for rapid development/deployment):
Edit `src/app/(public)/offer/[slug]/page.tsx` and change:
```typescript
take: 5000,  // Change to:
take: 50,    // Only pre-render top 50 pages
```

### Switch to SLOW builds (optimal user experience):
Edit `src/app/(public)/offer/[slug]/page.tsx` and change:
```typescript
take: 50,    // Change to:
take: 5000,  // Pre-render all pages
```

---

## Related Files

- `src/app/(public)/offer/[slug]/page.tsx` - Static generation config
- `src/app/(public)/page.tsx` - Homepage caching (`revalidate = 60`)
- `src/app/api/offers/route.ts` - API caching for pagination
- `prisma/schema.prisma` - Database indexes

---

*Last updated: February 2026*
*Build optimization implemented as part of performance overhaul*
