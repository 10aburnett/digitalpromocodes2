# Claude Code Instructions

## 🎯 PROJECT BRIEF — REBRAND FORK

**This is "Digital Promo Codes"** — a rebrand fork of the original CryptoBonuses / WhopPromoCodes site.

### What this project is
This repo is one of two visual rebrand forks of the parent site. All three sites share the same Neon production database, so they show identical content (whops, promo codes, comments, votes, blog posts) but each has its own visual identity, brand name, domain, and deploy.

- **This site:** Digital Promo Codes (this repo, located at `/Users/alexburnett/Downloads/digitalpromocodes`)
- **Sister site:** Monkey Thrifter (separate repo at `/Users/alexburnett/Downloads/monkeythrifter`, domain `monkeythrifter.com`) — independent codebase, same DB
- **Parent site:** CryptoBonuses / WhopPromoCodes (at `/Users/alexburnett/Downloads/cryptobonusesnew copy 2`) — the original

### Goal
Rebrand the visuals, copy, and identity of THIS repo to "Digital Promo Codes". **Do NOT change functionality, schema, or DB connections.** This is a CSS / branding / copy pass, not a feature project.

### What's already done
- ✅ Cloned from the parent repo (full git history preserved)
- ✅ All `.env*` files copied (DB connection unchanged — points at the same Neon prod DB)
- ✅ `package.json` `name` field updated to `digitalpromocodes`
- ✅ Local `origin` remote removed (user will add a new GitHub remote later)

### What's NOT done — the rebrand pass
The following still need to be done. Wait for the user's direction on visual style (colors, fonts, vibe) before starting:
- Brand name everywhere in copy: "CryptoBonuses", "Whop Promo Codes", "whoppromocodes", etc. → "Digital Promo Codes"
- Color palette (likely in `tailwind.config.*` and global CSS)
- Logo, favicon, OG image (in `public/`)
- `<head>` metadata: page titles, meta descriptions, OG tags, canonical URL
- Footer, About page, legal pages, any brand-specific copy
- Email-from addresses, support contact info if any

### Critical operational facts
- **DB is shared across three sites.** Any DB write (admin moderation, comments, votes, scripts that mutate data) affects all three. Treat every write as production-impacting.
- **All DB safety rules below apply with extra weight** — this DB now serves multiple live sites.
- **Port collision:** `npm run dev` is hardcoded to `PORT=3000` in `package.json`. If running multiple sites locally at once, change one to a different port.
- **SEO duplicate content risk** (for the user, not for code): two domains showing identical content. Worth discussing canonical URL strategy before launch.

### Where to start when the user gives direction
1. Find brand name strings: grep for `CryptoBonuses`, `cryptobonuses`, `Whop Promo Codes`, `whoppromocodes`, `WhopPromoCodes` (case variants)
2. Find color tokens: `tailwind.config.*`, `globals.css`, any theme files
3. Find brand assets: `public/` (logo, favicon, og-image)
4. Find metadata: `app/layout.tsx`, `app/**/page.tsx`, `next-sitemap.config.*`, any OpenGraph definitions

---

## 🚨 CRITICAL DATABASE SAFETY RULES 🚨

### ❌ ABSOLUTELY FORBIDDEN COMMANDS - NEVER USE:
- `npx prisma db push --force-reset` ❌
- `prisma db push --force-reset` ❌  
- `npx prisma migrate reset` ❌
- `prisma migrate reset` ❌
- `npx prisma db reset` ❌
- `prisma db reset` ❌
- ANY command with "reset" or "--force" ❌

### 🧠 MANDATORY BEHAVIORAL COMPLIANCE:
**BEFORE EVERY DATABASE COMMAND I MUST ASK:**
1. Does this command contain "reset", "--force-reset", or "--force"?
2. If YES → STOP IMMEDIATELY. Use safe alternative.
3. If NO → Double-check it's in approved list below.
4. NEVER test dangerous commands "to see if they work" - this caused data loss

**I have made this mistake 5+ times. I MUST break this destructive pattern.**

### 📋 BACKGROUND:
- These commands have caused data loss **4+ times**
- Comments, votes, and critical user data permanently destroyed
- User has backup database specifically because of repeated force-reset mistakes
- User is rightfully furious about this recurring incompetence

### ✅ SAFE DATABASE OPERATIONS ONLY:
- `npx prisma db push` (safe schema updates)
- `npx prisma migrate dev` (safe development migrations)  
- `npx prisma migrate deploy` (safe production migrations)
- `npx prisma generate` (always safe)

### 🛡️ MANDATORY PROCEDURE FOR SCHEMA CHANGES:
1. **NEVER use destructive commands**
2. **ALWAYS create proper migrations:**
   ```bash
   npx prisma migrate dev --name "describe-your-change"
   ```
3. **Test on backup database first**
4. **Run golden sync scripts after changes**
5. **If schema issues arise - CREATE migrations, don't delete data**

### 🔥 IF SCHEMA CONFLICTS OCCUR:
- **DO NOT** use reset commands to "fix" schema issues
- **CREATE** proper migration files to add missing columns
- **USE** `ALTER TABLE` statements in migrations if needed
- **PRESERVE** all existing data at all costs

## Project Structure

### Database Management:
- **Production DB**: `ep-noisy-hat-abxp8ysf-pooler.eu-west-2.aws.neon.tech`  
- **Backup DB**: `ep-rough-rain-ab2qairk-pooler.eu-west-2.aws.neon.tech`
- **Golden Scripts**: Located in `/golden-scripts/` folder for data synchronization

### Testing & Deployment:
- Run `npm run dev` for local development
- Run `npm run build` to test production build
- Run `npm run lint` for code quality checks
- Always test promo code submissions after database changes

### Key Features:
- Promo code submission system with debounced search (150ms delay)
- Community-driven content with admin moderation
- Blog system with comments and voting
- Whop marketplace integration with affiliate tracking

## Safeguards Implemented:
1. `NEVER-FORCE-RESET.md` - Critical safety documentation
2. `scripts/database-safety-guard.js` - Command validation script  
3. `.bashrc-safety` - Shell aliases to block dangerous commands
4. This `CLAUDE.md` file with explicit instructions

**REMEMBER: The backup database exists because of repeated force-reset mistakes. Never repeat this pattern.**