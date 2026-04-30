# Adding New Offers to the Site

This document outlines the complete process for adding new offers (whops) to whoppromocodes.com with editorial reviews.

## Overview

When adding new offers, you need to update:
1. **Database** - Add `featuresContent` (editorial reviews) to both databases
2. **Database fields** - Set indexing/retirement status in both databases
3. **Launch Cohort** - Add slugs to the allowlist so pages are accessible
4. **Sitemaps** - Regenerate to include new offer URLs

---

## Step 1: Import Editorial Reviews to Backup Database

First, import the `featuresContent` (HTML editorial reviews) to the **BACKUP** database.

```typescript
// scripts/temp-import.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:***@ep-rough-rain-ab2qairk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

const reviews = [
  {
    slug: "example-slug",
    featuresContent: `<section class="product-review">...</section>`
  },
  // ... more reviews
];

async function importReviews() {
  for (const review of reviews) {
    await prisma.deal.update({
      where: { slug: review.slug },
      data: { featuresContent: review.featuresContent }
    });
    console.log(`✅ ${review.slug}`);
  }
  await prisma.$disconnect();
}

importReviews();
```

Run with: `npx tsx scripts/temp-import.ts`

---

## Step 2: Sync to Production Database

After verifying imports in backup, sync `featuresContent` to **PRODUCTION** database.

```typescript
// Sync script pattern
const backupDb = new PrismaClient({ /* backup connection */ });
const productionDb = new PrismaClient({ /* production connection */ });

for (const slug of slugs) {
  const backup = await backupDb.deal.findUnique({ where: { slug } });
  if (backup?.featuresContent) {
    await productionDb.deal.update({
      where: { slug },
      data: { featuresContent: backup.featuresContent }
    });
  }
}
```

---

## Step 3: Update Database Fields (Both DBs)

Set the following fields for all new offers in **BOTH** databases:

| Field | Value | Description |
|-------|-------|-------------|
| `retired` | `false` | Offer is active |
| `retirement` | `'NONE'` | Not retired (must be 'NONE', not null) |
| `indexing` | `'INDEX'` | Should be indexed |
| `indexingStatus` | `'INDEX'` | Current indexing status |

```typescript
await prisma.deal.update({
  where: { slug },
  data: {
    retired: false,
    retirement: 'NONE',
    indexing: 'INDEX',
    indexingStatus: 'INDEX'
  }
});
```

---

## Step 4: Add to Launch Cohort

Add slugs to **BOTH** files:

### 4a. `src/lib/launch-cohort.ts`

This controls which offer pages are publicly accessible.

```typescript
export const LAUNCH_COHORT_SLUGS = new Set<string>([
  // ... existing slugs ...
  // === NEW BATCH (X slugs) - YYYY-MM-DD ===
  'new-slug-1',
  'new-slug-2',
  // etc.
]);
```

### 4b. `scripts/build-sitemaps-clean.ts`

This controls which offers appear in the sitemap.

1. Update `EXPECTED_COHORT_COUNT` to new total
2. Add slugs to `LAUNCH_COHORT_SLUGS` array

```typescript
const EXPECTED_COHORT_COUNT = 186; // Update this number

const LAUNCH_COHORT_SLUGS = [
  // ... existing slugs ...
  // === NEW BATCH (X slugs) - YYYY-MM-DD ===
  'new-slug-1',
  'new-slug-2',
  // etc.
];
```

---

## Step 5: Regenerate Sitemaps

Run the sitemap generation script:

```bash
npx tsx scripts/build-sitemaps-clean.ts
```

This generates:
- `public/sitemap.xml` (index)
- `public/sitemap-offers.xml` (all cohort offers)
- `public/sitemap-static.xml` (static pages)
- `public/sitemap-blog.xml` (blog posts)

---

## Step 6: Commit and Push

```bash
git add src/lib/launch-cohort.ts scripts/build-sitemaps-clean.ts public/sitemap*.xml
git commit -m "feat: Add X new offers to launch cohort (Y total)"
git push origin development
git checkout main && git merge development && git push origin main
git checkout development
```

---

## Database Connection URLs

| Database | Host | Purpose |
|----------|------|---------|
| Backup | `ep-rough-rain-ab2qairk-pooler.eu-west-2.aws.neon.tech` | Testing, staging |
| Production | `ep-noisy-hat-abxp8ysf-pooler.eu-west-2.aws.neon.tech` | Live site |

**Note:** Production URL is stored in `.env.local` (gitignored). Never commit database credentials.

---

## Checklist

Use this checklist when adding new offers:

- [ ] Import `featuresContent` to BACKUP database
- [ ] Verify imports look correct
- [ ] Sync `featuresContent` to PRODUCTION database
- [ ] Update database fields in BACKUP (retired=false, retirement=NONE, indexing=INDEX, indexingStatus=INDEX)
- [ ] Update database fields in PRODUCTION (same fields)
- [ ] Add slugs to `src/lib/launch-cohort.ts`
- [ ] Add slugs to `scripts/build-sitemaps-clean.ts`
- [ ] Update `EXPECTED_COHORT_COUNT` in sitemap script
- [ ] Run `npx tsx scripts/build-sitemaps-clean.ts`
- [ ] Verify sitemap count matches expected
- [ ] Commit changes
- [ ] Push to development branch
- [ ] Merge and push to main branch

---

## Troubleshooting

### "Can't reach database server"
- Neon databases hibernate when inactive
- Wake up by visiting Neon console or making a query
- Check if credentials are correct

### Sitemap validation fails
- Ensure `EXPECTED_COHORT_COUNT` matches actual slug count
- Ensure all slugs exist in database and are not retired

### Offer page returns 404
- Check slug is in `src/lib/launch-cohort.ts`
- Check `NEXT_PUBLIC_LAUNCH_MODE=cohort` is set
- Check database has `retired=false` and `retirement='NONE'`
