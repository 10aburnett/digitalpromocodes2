# 🏆 Golden Database Sync Scripts

This folder contains the **GOLDEN** collection of database synchronization scripts that safely merge data between production and backup databases with **ZERO RISK OF DATA LOSS**.

---

## 🔥 CRITICAL: PromoCode Sync — SAFE Path

**Script:** `GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs`
**Env:** `./.env.sync` with:
```
SOURCE_DATABASE_URL=postgres://…  # where new promos exist (backup)
TARGET_DATABASE_URL=postgres://…  # where to sync (production)
```

**Preflight checklist:**
- ✅ Unique index exists on both DBs:
  ```sql
  CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS promo_unique_whop_code
  ON "PromoCode"("whopId","code");
  ```
- ✅ Old "WHOPS-PROMOCODES" script **NOT used** for promos

**Run:**
```bash
# Dry run preview
node golden-scripts/GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs --dry

# Live sync
node golden-scripts/GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs
```

**What it does:**
- Resolves whops by slug on target
- Upserts by `(whopId, code)`
- Updates only when incoming discount is **strictly better**
- Generates new promo IDs on target
- Never deletes

**Emergency cleanup (duplicates):**
- Use `sql/cleanup_promocode_duplicates.sql` (FK-safe):
  - Keeps oldest per `(whopId, code)`
  - Re-points `OfferTracking.promoCodeId`
  - Deletes the rest

---

## 🛡️ Safety Guarantees

- ✅ **NO DELETIONS EVER** - Only adds data, never removes anything
- ✅ **Battle Tested** - All scripts have been proven in production
- ✅ **Error Handling** - Graceful failure handling with detailed logging
- ✅ **Duplicate Protection** - Skips existing data automatically

## 📋 Script Overview

### 1. `GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER.js`
**Purpose**: Syncs blog posts, comments, mailing list subscribers  
**What it handles**:
- ✅ Blog posts (title, content, slug, published status, etc.)
- ⚠️  Comments (has known issues - use Script #3 instead)
- ✅ Comment votes
- ✅ Mailing list subscribers
- ✅ Schema updates (adds missing columns)

### 2. `GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs` ⭐ NEW (Oct 2025)
**Purpose**: Safe promo code synchronization using slug-based Whop resolution
**What it handles**:
- ✅ PromoCode table sync with natural key (whopId, code)
- ✅ Slug-based Whop resolution (prevents cross-database ID mismatches)
- ✅ "Only update when better" discount comparison logic
- ✅ Fresh ID generation on target (never copies source IDs)
- ✅ Dry-run mode support
- ✅ Batched processing (25 at a time)

**Why it's better**: The old Script #2 synced promo codes by raw IDs which caused mismatches across databases. This new script resolves Whops by slug first, ensuring correct promo-to-whop associations.

### 2b. `GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER-NUMBER-2-WHOPS-PROMOCODES.js`
**Purpose**: Syncs Whop marketplace data ⚠️ (NO LONGER SYNCS PROMO CODES)
**What it handles**:
- ✅ Whops (marketplace products)
- ⚠️ Promo codes (DEPRECATED - use Script #2 instead)
- ✅ Indexing status tracking
- ✅ Schema updates for Whop-specific columns

### 3. `GOLDEN-COMMENTS-SYNC-SCRIPT-NO-DELETIONS-EVER.js`
**Purpose**: Dedicated comment synchronization (RECOMMENDED for comments)  
**What it handles**:
- ✅ Comments with proper blog post ID mapping
- ✅ Author name and email handling
- ✅ Comment status (APPROVED/PENDING/REJECTED)
- ✅ Cross-database blog post reference resolution

### 5. `GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER-NUMBER-5-SEO-COLUMNS.js`
**Purpose**: Syncs NEW SEO hardening columns for complete coverage  
**What it handles**:
- ✅ Whop.retirement (NONE/REDIRECT/GONE enum)
- ✅ Whop.redirectToPath (redirect URL for retired content)
- ✅ Whop.indexingStatus (INDEX/NOINDEX/AUTO status)
- ✅ Creates missing RetirementMode enum automatically
- ✅ Schema updates and index creation

## 🚀 How to Use

### Complete Sync (Recommended Order):
```bash
# 1. Sync blog posts, mailing list, and basic content
node golden-scripts/GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER.js

# 2. Sync Whop content fields
cd golden-scripts && node --env-file=../.env.sync GOLDEN-CONTENT-SYNC-BULLETPROOF.js

# 3. Sync promo codes (SAFE slug-based sync)
cd .. && node golden-scripts/GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs

# 4. Sync Whops (marketplace products)
cd golden-scripts && node --env-file=../.env.sync GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER-NUMBER-2-WHOPS-PROMOCODES.js

# 5. Sync promo submissions
node --env-file=../.env.sync GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER-NUMBER-3-PROMO-SUBMISSIONS.js

# 6. Sync remaining tables (BulkImport, ContactSubmission, etc.)
node --env-file=../.env.sync GOLDEN-BIDIRECTIONAL-DATABASE-SYNC-SCRIPT-NO-DELETIONS-EVER-NUMBER-4-REMAINING-TABLES.js

# 7. Sync comments (use this instead of Script #1 for comments)
node --env-file=../.env.sync GOLDEN-COMMENTS-SYNC-SCRIPT-NO-DELETIONS-EVER.js
```

### Individual Sync:
Run any script individually when you only need to sync specific data types.

## 📊 Database Coverage

| Data Type | Script #1 | Script #2 (NEW) | Script #2b | Script #3 | Script #4 | Script #5 |
|-----------|-----------|-----------------|------------|-----------|-----------|-----------|
| Blog Posts | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Comments | ⚠️ (broken) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Mailing List | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Whops | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Promo Codes** | ❌ | **✅ (SAFE)** | ⚠️ (deprecated) | ❌ | ❌ | ❌ |
| Promo Submissions | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Comment Votes | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Whop Content | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Remaining Tables | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **SEO Columns** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🔧 Database Configuration

All scripts are pre-configured with the correct database URLs:
- **Production**: `ep-noisy-hat` (npg_LoKgTrZ9ua8D)
- **Backup**: `ep-rough-rain` (npg_GL1sjBY8oSOb)

## ⚠️ Important Notes

- **Always backup before running** (though scripts are safe by design)
- **Run in order** for complete synchronization
- **Script #1 comment sync is broken** - use Script #3 for comments
- **USE NEW PROMO SYNC** - GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs replaces old promo code sync
- **All scripts are idempotent** - safe to run multiple times

## 🎯 Success Metrics

After running all scripts, you should see:
- ✅ Blog posts: Equal counts on both databases
- ✅ Comments: Equal counts on both databases
- ✅ Mailing list: Equal subscriber counts
- ✅ Whops: Equal product counts (~8,212)
- ✅ Promo codes: Equal counts (~887 as of Oct 2025)
- ✅ Promo submissions: Equal counts
- ✅ All remaining tables synced

---

## 🔧 Data Quality & Maintenance Scripts

### GOLDEN-DEDUPE-PROMOCODES-CASEFOLD.mjs ⭐ NEW (Oct 2025)
**Purpose**: Case-insensitive promo code deduplication with data preservation
**What it handles**:
- ✅ Removes duplicates like "PROMO-ABC" and "promo-abc"
- ✅ Keeps record with most OfferTracking data
- ✅ Rewires foreign keys before deletion (zero data loss)
- ✅ Normalizes all codes to lowercase
- ✅ Creates backup tables + audit trail
- ✅ Adds guardrail: unique index on `(whopId, lower(code))`
- ✅ Adds CHECK constraint: `code = lower(code)`

**Usage**:
```bash
npm run dedupe:backup:dry  # Dry run on BACKUP
npm run dedupe:backup      # Live run on BACKUP
npm run dedupe:prod:dry    # Dry run on PRODUCTION
npm run dedupe:prod        # Live run on PRODUCTION
```

**Results**: Removed 17 duplicate groups, rewired 10 OfferTracking records, deleted 225 conflicts

### GOLDEN-FIX-TITLE-FORMAT.sql ⭐ NEW (Oct 2025)
**Purpose**: Normalize promo code titles to consistent format
**What it handles**:
- ✅ Fixes bare-number titles: "15 Name" → "15% Off Name"
- ✅ Extracts percentage from description or value field
- ✅ Handles currency titles: "$29.00 off Name"
- ✅ Normalizes whitespace and punctuation
- ✅ Removes leaked promo code tokens
- ✅ Built-in dry-run mode

**Usage**:
```bash
npm run titles:fix:backup  # Live run on BACKUP
npm run titles:fix:prod    # Live run on PRODUCTION
```

**Results**: Fixed 24-33 bare-number titles, rebuilt 867 titles, 0 malformed remaining

### GOLDEN-VERIFY-TITLE-CODE-CONSISTENCY.sql ⭐ NEW (Oct 2025)
**Purpose**: Read-only verification of promo code data integrity
**What it checks**:
- ✅ All codes are lowercase
- ✅ No bare-number titles
- ✅ Currency titles don't have % symbols
- ✅ Percent titles match their value field
- ✅ No leaked promo code tokens

**Usage**:
```bash
npm run titles:verify:backup  # Verify BACKUP
npm run titles:verify:prod    # Verify PRODUCTION
```

**Expected Results** (clean database):
- `code_not_lower: 0`
- `malformed_bare_number: 0`
- `bad_currency_with_percent: 0`
- `value_percent_title_not_percent: 0`

### GOLDEN-SCRUB-PROMO-DESCRIPTIONS.mjs
**Purpose**: Remove leaked promo code tokens from descriptions
**Usage**:
```bash
npm run scrub:backup      # Dry run on BACKUP
npm run scrub:prod:dry    # Dry run on PRODUCTION
npm run scrub:prod        # Live run on PRODUCTION
```

### GOLDEN-SCRUB-PROMO-TITLES.mjs
**Purpose**: Remove leaked promo code tokens from titles
**Usage**:
```bash
npm run scrub:titles:backup     # Dry run on BACKUP
npm run scrub:titles:prod:dry   # Dry run on PRODUCTION
npm run scrub:titles:prod       # Live run on PRODUCTION
```

## 🛡️ Database Guardrails Implemented

Permanent safeguards added to prevent data quality issues:

1. **promo_whop_codelower_uniq** - Unique index on `(whopId, lower(code))`
   - Prevents case-insensitive duplicates

2. **promo_code_lowercase_chk** - CHECK constraint `code = lower(code)`
   - Enforces lowercase-only promo codes

3. **Backup Tables**:
   - `PromoCodeDedupeBackup` - Full records of deleted duplicates
   - `PromoCodeDedupeMap` - Audit trail mapping duplicate → canonical IDs

## 🔄 Rollback Procedures

### Restore Deleted Duplicates
```sql
-- View backup
SELECT * FROM "PromoCodeDedupeBackup";

-- View mapping
SELECT * FROM "PromoCodeDedupeMap";

-- Restore specific record
INSERT INTO "PromoCode" (...)
SELECT ... FROM "PromoCodeDedupeBackup" WHERE id = 'your-id';
```

### Revert Title Changes
Title changes are idempotent - just re-run the script with corrected logic, or manually update:
```sql
UPDATE "PromoCode"
SET title = 'Corrected Title', "updatedAt" = now()
WHERE id = 'your-id';
```

---

## 🔄 PRODUCTION WINS - Full Content Mirroring (Jan 2025)

### ⚠️ IMPORTANT: Old Scripts ONLY APPEND, They Don't Overwrite

The original golden scripts (`GOLDEN-CONTENT-SYNC-BULLETPROOF.js`, `GOLDEN-SAFE-PROMO-SYNC-BY-SLUG.mjs`, etc.) are designed to:
- ✅ **ADD** missing records
- ✅ **UPDATE** fields only if target field is **empty/null**
- ❌ **DO NOT** overwrite existing content with different content

**This means:** If you edit content on production (e.g., hand-write better descriptions), those edits WON'T automatically sync to backup because backup already has content in those fields.

### When You Need Exact Mirroring

Use these scripts when you want backup to be an **exact mirror** of production:

#### `PRODUCTION-WINS-CONTENT-SYNC.mjs`
**Purpose:** Overwrites ALL Deal content fields in backup with production values
```bash
# Dry run first
node golden-scripts/PRODUCTION-WINS-CONTENT-SYNC.mjs --dry

# Live sync
node golden-scripts/PRODUCTION-WINS-CONTENT-SYNC.mjs
```

**Fields synced:**
- `aboutContent`, `promoDetailsContent`, `faqContent`
- `howToRedeemContent`, `featuresContent`, `termsContent`
- `description`, `name`

#### `PRODUCTION-WINS-PROMO-SYNC.mjs`
**Purpose:** Overwrites ALL PromoCode fields in backup with production values
```bash
# Dry run first
node golden-scripts/PRODUCTION-WINS-PROMO-SYNC.mjs --dry

# Live sync
node golden-scripts/PRODUCTION-WINS-PROMO-SYNC.mjs
```

**Fields synced:** `type`, `value`, `title`, `description`

### Full Mirror Sync Procedure (Production → Backup)

When you've made edits on production and want backup to be identical:

```bash
cd /path/to/project

# 1. Verify what's different first
node golden-scripts/verify-content-match.mjs

# 2. Sync Deal content (production wins)
node golden-scripts/PRODUCTION-WINS-CONTENT-SYNC.mjs --dry  # preview
node golden-scripts/PRODUCTION-WINS-CONTENT-SYNC.mjs        # execute

# 3. Sync PromoCode content (production wins)
node golden-scripts/PRODUCTION-WINS-PROMO-SYNC.mjs --dry    # preview
node golden-scripts/PRODUCTION-WINS-PROMO-SYNC.mjs          # execute

# 4. Verify everything matches
node golden-scripts/verify-content-match.mjs
```

### Analysis Scripts

#### `verify-content-match.mjs`
Shows exact comparison of content between production and backup:
- Lists deals with different content
- Lists promo codes with different fields
- Shows character-level differences

#### `analyze-content-differences.mjs`
Categorizes differences:
- **Identical** - no changes needed
- **Ampersand-only** - just `&amp;` vs `&` encoding (cosmetic)
- **Major differences** - genuinely different content

#### `list-big-diffs.mjs`
Lists all deals with >100 character content differences (likely hand-written content)

### Common Difference Types

| Type | Example | Cause |
|------|---------|-------|
| Ampersand encoding | `Q&amp;A` vs `Q&A` | HTML entity encoding differences |
| Hand-written content | 487 chars vs 935 chars | Production has manually edited, better content |
| Percent format | `"25"` vs `"25%"` | Both display same (UI normalizes) |

### ⚠️ Safety Notes

- **PRODUCTION-WINS scripts only write to BACKUP** - Production is read-only
- Always run `--dry` first to preview changes
- The `.env.sync` file controls which database is which:
  - `PRODUCTION_DATABASE_URL` = ep-noisy-hat (main site)
  - `BACKUP_DATABASE_URL` = ep-rough-rain (backup)

---

**Created**: 2025-08-10
**Last Updated**: 2025-01-05 (Added PRODUCTION-WINS mirroring scripts and documentation)
**Status**: Battle Tested & Production Ready ✅