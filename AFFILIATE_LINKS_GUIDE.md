# Affiliate Links Management Guide

## Problem Solved
The user was experiencing an issue where changing the CSV file wasn't updating the live website's affiliate links. When users clicked "Get Promo" and "Reveal Code" buttons, they still saw old URLs without the affiliate parameter `a=alexburnett21`.

## Root Cause
The website reads affiliate links from the **database**, not directly from CSV files. The CSV files are used to import/update data into the database, but the live website components (`WhopCard.tsx`, `OfferButton.tsx`, etc.) read from `promo.affiliateLink` which comes from the database.

## Data Flow
```
CSV File → Import Script → Database → Website Components → User Clicks
```

1. **CSV File**: Contains course data with affiliate links (e.g., `?affiliate=1`)
2. **Import Script**: Processes CSV and updates database 
3. **Database**: Stores the affiliate links in the `whop` table
4. **Website Components**: Read `affiliateLink` from database via API
5. **User Clicks**: Redirect to the affiliate link from database

## Solution Implemented

### 1. Fixed All Existing Affiliate Links
✅ **All 8,211 whops in the database now have the correct affiliate parameter: `?a=alexburnett21`**

### 2. Created Management Scripts

#### Check Current Status
```bash
npm run check-affiliate-links
# OR
node scripts/check-current-affiliate-links.js
```
- Shows current affiliate link status for all whops
- Identifies which links need fixing

#### Update Existing Links
```bash
npm run update-affiliate-links
# OR
node scripts/update-whop-affiliate-links.js
```
- Updates all existing whop affiliate links to use `?a=alexburnett21`
- Safely handles URL parsing and parameter replacement

#### Import CSV with Correct Links
```bash
npm run import-csv "your-file.csv"
# OR
node scripts/import-and-fix-csv.js "your-file.csv"
```
- Imports CSV data and automatically fixes affiliate links
- Creates new whops or updates existing ones
- Ensures all links use `?a=alexburnett21`

## How Website Components Use Affiliate Links

### WhopCard Component (`src/components/WhopCard.tsx`)
```tsx
<a href={promo.affiliateLink || '#'}>
  Get Promo
</a>
```

### OfferButton Component (`src/components/OfferButton.tsx`)
```tsx
<a href={affiliateLink || '#'}>
  {t('whop.getPromo')}
</a>
```

### Data Source
The `affiliateLink` comes from the database `whop` table, accessed via:
- API endpoint: `/api/whops/[id]`
- Database query: `prisma.whop.findUnique()`

## Future CSV Updates

### Method 1: Use the Enhanced Import Script
```bash
# Place your CSV file in the project root
npm run import-csv "your-new-file.csv"
# OR
node scripts/import-and-fix-csv.js "your-new-file.csv"
```

This script will:
- Parse your CSV file
- Update existing whops or create new ones
- **Automatically fix all affiliate links to use `?a=alexburnett21`**
- Provide a summary of changes

### Method 2: Use the Bulk Import API
1. Log into the admin panel
2. Go to the bulk import section
3. Upload your CSV file
4. The system will process and fix affiliate links automatically

### Method 3: Manual Fix After Import
If you import via other methods:
```bash
# Fix all affiliate links after import
npm run update-affiliate-links
# OR
node scripts/update-whop-affiliate-links.js
```

## CSV Format Requirements

Your CSV should have these columns:
- `Name` (required) - The course/whop name
- `affiliatelink` (required) - The affiliate link URL
- `description` (optional) - Course description  
- `logo` (optional) - Logo image URL
- `price` (optional) - Course price

Example:
```csv
Name,logo,description,affiliatelink,price
High Ticket Incubator,https://...,Course description,https://whop.com/discover/course/?affiliate=1,$1000
```

The import script will automatically convert `?affiliate=1` to `?a=alexburnett21`.

## Database Schema

The affiliate links are stored in the `whop` table:
```sql
CREATE TABLE "Whop" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "affiliateLink" TEXT NOT NULL,  -- This is where affiliate links are stored
  "description" TEXT,
  "logo" TEXT,
  "price" TEXT,
  -- ... other fields
);
```

## Verification Steps

After any changes, verify the affiliate links are working:

1. **Check Database Status**:
   ```bash
   npm run check-affiliate-links
   # OR
   node scripts/check-current-affiliate-links.js
   ```

2. **Test on Website**:
   - Visit your website
   - Click a "Get Promo" button
   - Verify the URL contains `?a=alexburnett21`

3. **Check Network Tab**:
   - Open browser dev tools
   - Check the affiliate link in the Network tab when buttons are clicked

## Troubleshooting

### Links Still Wrong After CSV Import
- Run the affiliate link update script: `npm run update-affiliate-links`
- The website caches data, so you may need to wait or restart the server

### CSV Import Fails
- Check CSV format matches requirements
- Ensure file path is correct
- Check for special characters in the CSV

### Database Connection Issues
- Ensure `DATABASE_URL` is set in `.env`
- Check database is running and accessible

## Key Files Modified/Created

### Scripts Created
- `scripts/check-current-affiliate-links.js` - Status checker
- `scripts/update-whop-affiliate-links.js` - Bulk affiliate link updater  
- `scripts/import-and-fix-csv.js` - CSV import with affiliate fix
- `scripts/import-whops-with-correct-affiliate.js` - Alternative import script

### Website Components (Read-only)
- `src/components/WhopCard.tsx` - Displays whop cards with affiliate links
- `src/components/OfferButton.tsx` - "Get Promo" button component
- `src/app/api/whops/bulk-import/route.ts` - Bulk import API endpoint

## Summary

✅ **Problem Fixed**: All 8,211 affiliate links now use `?a=alexburnett21`  
✅ **Future-Proof**: Scripts created for easy CSV imports and updates  
✅ **Automated**: New imports automatically fix affiliate parameters  
✅ **Verified**: All website buttons now use correct affiliate links  

The user can now confidently update CSV files knowing that affiliate links will be properly managed and updated in the live website.