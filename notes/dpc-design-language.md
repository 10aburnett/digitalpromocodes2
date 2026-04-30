# Digital Promo Codes — Design Language

Direction proposal for the visual rebrand. **No code changes in this doc.** Reviewing this is the gate; once the layout direction is signed off (Step B), implementation proceeds in reviewable chunks (Steps C, D, E).

**One-line positioning:** A deliberately-designed deal aggregator. Tight, professional, modern, utility-first. The opposite of Monkey Thrifter (warm/playful). Curation-driven, not freshness-driven — the data we have supports honest curation, not "verified today" claims.

**Brand foundation (locked from prior approvals):**
- Manrope (font) via `next/font/google`, variable, drop-in
- Teal-600 `#0891B2` accent + slate neutrals + deep navy chrome
- Light-mode-first; dark mode preserved via theme toggle
- Signature moments (a) custom 2px teal underline on prose links, (b) reusable Verified chip as a single shared component
- (Rejected: dotted dividers, decorative-only)

---

## Typography

Pick: **Manrope** (Google Fonts, free, drop-in via `next/font/google`).

- Display (h1, h2): `Manrope 700` — confident but not heavy
- UI / labels / buttons: `Manrope 600`
- Body: `Manrope 500` (better screen rendering than 400)
- Numerals (price, stats): `Manrope 700` with `font-feature-settings: 'tnum'` for tabular figures
- Mono only for code values: `Geist Mono` or `JetBrains Mono` (pick one before step E, use everywhere code is shown)

Type scale (refined in CSS):
- h1: 40–48px / line-height 1.1
- h2: 28–32px / 1.2
- h3: 20px / 1.3
- Body: 15–16px / 1.55
- Small / labels: 13px / 1.4 / +0.02em letter-spacing

---

## Density / spacing

Hybrid rhythm: **tight where data lives, airy where the eye rests.**

- Offer cards / lists → tight (16–20px card padding, 12–16px gaps)
- Sections / page chrome → generous (80–120px vertical padding between major sections)
- Container caps: `max-w-7xl` (1280px) for the homepage shell, `max-w-3xl` (768px) for the offer-detail reading column

---

## Components

### Cards
- Border-first elevation: 1px `slate-200` border default, 1px `slate-300` border on hover
- Shadow: tight directional `0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)`
- `rounded-lg` (8px) — sharper than the existing `rounded-xl`
- Hover: 1px translateY + slightly stronger shadow + border darken (no scale transform)

### Buttons
- **Primary CTA** (Reveal Code, Submit, Visit): `rounded-md` (6px), teal-600 fill, white text, weight 600. **Drop the rounded-full pill aesthetic.**
- **Secondary**: `rounded-md`, white fill, slate-300 border, slate-900 text, hover slate-50 fill
- **Ghost / tertiary**: no border, slate-700 text, slate-100 hover
- **Tag pills** (category labels, "Top pick" badge): keep `rounded-full` — different semantic from buttons

### Inputs
- `rounded-md`, slate-200 border, slate-50 background
- Focus: 2px teal-600 ring offset 1px from border. No drop shadow.
- 12/14px padding

### Verified chip (signature moment b — single shared component)
- Single `<VerifiedChip />` component lives at `src/components/ui/VerifiedChip.tsx` (or wherever the codebase keeps shared UI; component location TBD on inspection)
- Visual: slate-900 1px border, teal-600 check icon, "Verified" label in slate-900 weight 600
- **Static trust signal — no date.** "Verified" without "X days ago." Admin-curated.
- Reused on: offer cards, blog post bylines (where relevant), stat blocks. One component, multiple consumers.

### Cards — what they show (revised, no timestamp language)
Each offer card shows:
- Brand logo
- Brand name (display weight)
- Category pill
- Discount value (if available)
- Rating (if present)
- "Get Code" or "Reveal" CTA

**Zero timestamp-based copy.** No "Verified 4 hours ago", no "Added today", no "Updated this week." The data doesn't support it.

---

## Layout direction — Path 1: curation-tiered

Rejected freshness/trending framings (data doesn't support them — see `~/.claude/projects/-Users-alexburnett-Downloads-digitalpromocodes/memory/data_hygiene_findings.md` for histograms). The visual identity of Direction C survives — vertical-feed feel, browse-not-search, sticky chrome, max-w-3xl reading columns. The data driving the homepage shifts from "what's fresh" to "what we curate + what you filter."

### Homepage section composition (top to bottom)

1. **Sticky header** — slim, full-width, slate-50 bg, 1px slate-200 border-bottom. Logo (single-color "Digital Promo Codes" wordmark in slate-900). Inline search input (full-fat — primary chrome element). Browse dropdown for categories. Theme toggle.
2. **Promo Drop banner** (purple, dismissible — UNTOUCHED per `promo_banner_untouchable.md` memory)
3. **Page wrapper** (`max-w-7xl`, side-padding) splits into two columns on desktop:
   - **Left sidebar** (~260px, sticky from top below header):
     - Categories list (radio/checkbox group from `WhopCategory` enum)
     - Discount range slider
     - Search input (mirrors header, scoped to current view)
     - Divider
     - "Submit a code ↗" CTA (sidebar, NOT header — framing is curation, submission welcomed)
   - **Main column** (`max-w-3xl` reading width, ~960px effective with sidebar):
     - **Top Picks** — 5 cards, equal-width horizontal grid (desktop). Ranked by `displayOrder` (admin-controlled). Copy: "Top picks" or "Featured offers." Avoid "Editor's picks today" / "Hand-picked" / anything implying live editorial activity.
     - **Category strip 1** — e.g. "Trading Tools" — 4–6 cards in a 3-up grid. "View all Trading Tools →" link top-right.
     - **Category strip 2** — e.g. "Communities" — same pattern.
     - **Category strip 3** (optional, if a third high-value category fits) — same.
     - **Browse All** — vertical list (full-width within main column, single-column rows). Header row shows "Showing 1–50 of 1,455" + sort dropdown. Pagination at bottom.
4. **Footer** — slim. Single row of links (About, Contact, Submit, Privacy, Terms) + social icons + copyright.

Categories chosen for strips: my proposal is 2–3 strips drawn from the heaviest-populated `WhopCategory` enum values. Final choice deferred until we can query offer counts per category — small follow-up before Step C.

### Offer-detail composition (top to bottom)

**Above-the-fold (no scroll required):**
- Brand logo (large, ~80–96px square)
- Brand name (display weight, h1)
- Rating + category pill (small inline row)
- **Reveal block** — prominent: discount headline (e.g., "50% off — best discount"), Reveal Code button (primary CTA, teal-600 fill), alternative codes expandable beneath.
- "Visit [Brand] ↗" secondary CTA below the reveal block.

**No verified-date stamp at the top.** No "verified X days ago" anywhere. The static `<VerifiedChip />` may appear next to the brand name as the trust signal — it carries no date.

**Below-the-fold (single column, max-w-3xl reading width, vertical stack — all 15 sections preserved, reordered for reading flow):**

1. Quick facts (small structured grid: category, listing type, price)
2. Using your discount (renamed from "How to redeem")
3. Visual guide (screenshots, if present)
4. About the platform (was "About {Brand}")
5. Offer breakdown (was "Promo details")
6. Important conditions (was "Terms & conditions")
7. Questions you might have (was "FAQ")
8. Platform features (conditional on `featuresContent` existing)
9. **Popularity** (was "Promo stats" — REFRAMED to all-time count instead of "last 24h" since tracking data is stale; copy becomes "Used N times" without timestamp)
10. Community feedback (was "Reviews")
11. Community promo submissions (existing CommunityPromoSection)
12. More deals like this (was "Recommended for you")
13. Alternative options (was "Similar offers")
14. Submit a code for [Brand] CTA
15. Verified-by-Digital-Promo-Codes trust block (the chip rendered larger as a section anchor; static, no date)

**Right rail behavior on wide desktop (≥1280px):**
- Sticky right column (~300px wide) appears alongside the main reading column
- Contents: persistent reveal block (so user never has to scroll back up to get the code) + small TOC ("On this page: Quick facts, Using your discount, FAQ, …" — anchors to section headings)
- Main column's *inline* reveal block is removed at this breakpoint to avoid duplication; the right rail is the canonical reveal location
- TOC is the second-priority element; reveal block is always above it

**On narrow desktop / tablet / mobile (<1280px):**
- No right rail. Reveal block stays inline in the main column, above the fold.
- Sticky mini-bar pattern: once user scrolls past the inline reveal block, a slim bar pins to viewport top showing "Brand — discount [Reveal Code]" — single-line, dismissible.

### Wide-screen handling rationale

The user came to get a code. The right-rail-with-persistent-reveal pattern delivers that without forcing scroll-back. On wide screens we have the gutter space, so we use it. On narrow screens the gutter doesn't exist, so the sticky mini-bar fills the same role.

This is the (a) sticky-sidebar option from earlier discussion, applied differently by viewport width.

---

## Accent application rules

Where teal-600 (`#0891B2`) appears (the brand moments):
- Primary CTAs (Reveal Code, Submit, Share, Visit)
- Active nav state (the 2px underline)
- Form focus rings
- Brand wordmark (step d1)
- Verified chip check icon
- "Top picks" tag pills
- Search bar focus + icon
- Inline text links in prose (with the 4px-offset 2px underline — signature a)

Where teal does NOT appear:
- Card surfaces — neutral white/slate
- Body text — slate-900/700
- Borders — slate-200
- Section backgrounds — slate-50
- Generic icons (info, chevron, etc.) — slate-500
- Stat numbers (count, percentage) — slate-900 bold

Rule of thumb: strip every teal pixel and the page should still read as a complete, structured deal site. Teal is icing.

---

## Iconography

Stay on **Heroicons**. No library swap.
- Default: outline weight (1.5px stroke), `slate-500`
- Solid only for state (verified check, error, success)
- Sizes: 16 / 20 / 24
- Active / strong: `slate-900`. Branded moments: teal-600.

---

## ASCII wireframes

### Homepage — desktop 1440 (sidebar + main column)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ STICKY HEADER                                                                         │
│ [Digital Promo Codes]    [🔍  Search offers, brands, categories…]    [Browse ▼] [☀] │
└──────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ PURPLE PROMO-DROP BANNER (untouched, dismissible)                                     │
└──────────────────────────────────────────────────────────────────────────────────────┘

  ┌── max-w-7xl, px-6 ─────────────────────────────────────────────────────────────┐
  │                                                                                  │
  │  ┌─SIDEBAR ~260px──┐  ┌─MAIN COLUMN ────────────────────────────────────────┐  │
  │  │ sticky          │  │                                                       │  │
  │  │                  │  │  ── TOP PICKS ──                                      │  │
  │  │ CATEGORIES       │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │  │
  │  │ ◉ All            │  │  │ card │ │ card │ │ card │ │ card │ │ card │         │  │
  │  │ ○ Trading        │  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │  │
  │  │ ○ Web Design     │  │                                                       │  │
  │  │ ○ Communities    │  │  ── TRADING TOOLS ──            View all Trading →   │  │
  │  │ ○ Trading Tools  │  │  ┌────────┐ ┌────────┐ ┌────────┐                     │  │
  │  │ ○ Free Trials    │  │  │  card  │ │  card  │ │  card  │                     │  │
  │  │ ○ Lifetime       │  │  └────────┘ └────────┘ └────────┘                     │  │
  │  │                  │  │  ┌────────┐ ┌────────┐ ┌────────┐                     │  │
  │  │ DISCOUNT         │  │  │  card  │ │  card  │ │  card  │                     │  │
  │  │ [─────●────]     │  │  └────────┘ └────────┘ └────────┘                     │  │
  │  │  0 — 100%        │  │                                                       │  │
  │  │                  │  │  ── COMMUNITIES ──             View all Communities → │  │
  │  │ SEARCH           │  │  ┌────────┐ ┌────────┐ ┌────────┐                     │  │
  │  │ [_____________] │  │  │  card  │ │  card  │ │  card  │                     │  │
  │  │                  │  │  └────────┘ └────────┘ └────────┘                     │  │
  │  │ ─────────────    │  │                                                       │  │
  │  │                  │  │  ── BROWSE ALL ──                                     │  │
  │  │ ┌──────────────┐│  │  Showing 1–50 of 1,455            [Sort: Default ▼]  │  │
  │  │ │ Submit ↗     ││  │  ┌────────────────────────────────────────────────┐  │  │
  │  │ │  a code      ││  │  │ [logo] Brand Name           Category    [Get→]│  │  │
  │  │ └──────────────┘│  │  │        1-line description                       │  │  │
  │  │                  │  │  └────────────────────────────────────────────────┘  │  │
  │  │                  │  │  ┌────────────────────────────────────────────────┐  │  │
  │  │                  │  │  │ [logo] Brand Name           Category    [Get→]│  │  │
  │  │                  │  │  └────────────────────────────────────────────────┘  │  │
  │  │                  │  │   …(40+ more rows in vertical list)                  │  │
  │  │                  │  │                                                       │  │
  │  │                  │  │            [← prev]  1 2 3 … 30  [next →]            │  │
  │  └──────────────────┘  └───────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│ FOOTER (slim) — About · Contact · Submit · Privacy · Terms       [socials]   © 2026 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Homepage — mobile 375

```
┌──────────────────────────────┐
│ STICKY HEADER                │
│ [DPC]            [🔍] [☰]   │
└──────────────────────────────┘
[ purple banner, dismissible ]

  ── TOP PICKS ──
  ┌──┐┌──┐┌──┐┌──┐ →    (horizontal scroll)
  └──┘└──┘└──┘└──┘

  ── TRADING TOOLS ──        view all →
  ┌──┐┌──┐┌──┐ →
  └──┘└──┘└──┘

  ── COMMUNITIES ──          view all →
  ┌──┐┌──┐┌──┐ →
  └──┘└──┘└──┘

  ── BROWSE ALL ──
  [ ⚙ Filter ]   [ Sort ▼ ]   1,455 offers

  ┌────────────────────────────┐
  │ [logo] Brand        [Get→]│
  │        Cat · 1-liner       │
  └────────────────────────────┘
  ┌────────────────────────────┐
  │ [logo] Brand        [Get→]│
  └────────────────────────────┘
  …(vertical list)

  Filter ⚙ button → bottom-sheet:
   • Categories
   • Discount range
   • Search

   [← prev]  ·  1 2 3  ·  [next →]

┌──────────────────────────────┐
│ Submit ↗  a code             │
│ FOOTER · About · Contact …  │
└──────────────────────────────┘
```

### Offer detail — desktop 1440 (right rail)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ STICKY HEADER                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────┘
[ purple banner ]

  ┌── max-w-6xl, px-6 ─────────────────────────────────────────────────────────────┐
  │                                                                                  │
  │  ┌─MAIN max-w-3xl ────────────────────────┐  ┌─RIGHT RAIL ~300px ──────────┐  │
  │  │                                          │  │ sticky from top              │  │
  │  │  [LOGO ◇]  ToolSuite Promo Code         │  │                              │  │
  │  │            ⭐⭐⭐⭐  · Trading             │  │  ┌─REVEAL BLOCK──────────┐  │  │
  │  │            [✓ Verified] (chip, no date) │  │  │ 50% off — best deal    │  │  │
  │  │                                          │  │  │                         │  │  │
  │  │  (no inline reveal — right rail owns it) │  │  │ [  Reveal Code  ]      │  │  │
  │  │                                          │  │  │                         │  │  │
  │  │  ── Quick facts ──                      │  │  │ [Visit ToolSuite ↗]   │  │  │
  │  │  Category · Trading                     │  │  │                         │  │  │
  │  │  Listing type · Paid                    │  │  │ Other codes ▸           │  │  │
  │  │  Price · …                               │  │  └────────────────────────┘  │  │
  │  │                                          │  │                              │  │
  │  │  ── Using your discount ──              │  │  ── On this page ──          │  │
  │  │  1. …                                    │  │  • Quick facts               │  │
  │  │  2. …                                    │  │  • Using your discount       │  │
  │  │                                          │  │  • Visual guide              │  │
  │  │  ── Visual guide ──                     │  │  • About the platform        │  │
  │  │  [img] [img] [img]                       │  │  • Offer breakdown           │  │
  │  │                                          │  │  • Important conditions      │  │
  │  │  ── About the platform ──               │  │  • Questions                 │  │
  │  │  long-form prose…                        │  │  • Platform features         │  │
  │  │                                          │  │  • Popularity                │  │
  │  │  ── Offer breakdown ──                  │  │  • Community feedback        │  │
  │  │  ── Important conditions ──             │  │  • Community submissions     │  │
  │  │  ── Questions you might have ──         │  │  • More deals like this      │  │
  │  │  ── Platform features ──                │  │  • Alternative options       │  │
  │  │  ── Popularity (used N times) ──        │  │                              │  │
  │  │  ── Community feedback ──               │  │                              │  │
  │  │  ── Community submissions ──            │  │                              │  │
  │  │  ── More deals like this ──             │  │                              │  │
  │  │  ── Alternative options ──              │  │                              │  │
  │  │                                          │  │                              │  │
  │  │  [  Submit a code for ToolSuite  ]      │  │                              │  │
  │  │                                          │  │                              │  │
  │  │  ── Verified by Digital Promo Codes ── │  │                              │  │
  │  │  (chip + short methodology blurb)        │  │                              │  │
  │  └──────────────────────────────────────────┘  └──────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────────────────────────┘

[ FOOTER ]
```

### Offer detail — mobile 375 (sticky mini-bar pattern)

```
┌──────────────────────────────┐
│ STICKY HEADER                │
└──────────────────────────────┘
[ purple banner ]

[LOGO ◇]
ToolSuite Promo Code
⭐⭐⭐⭐  · Trading
[✓ Verified]

┌─REVEAL BLOCK (inline)────────┐
│ 50% off — best deal           │
│                                │
│ [    Reveal Code    ]          │
│                                │
│ Other codes ▸                  │
└────────────────────────────────┘

[ Visit ToolSuite ↗ ]

(once user scrolls past inline reveal:)
┌─STICKY MINI-BAR (top of viewport)──┐
│ ToolSuite — 50% off  [Reveal Code] │
└──────────────────────────────────────┘

── Quick facts ──
…
── Using your discount ──
…
── Visual guide ──
…
── About the platform ──
…
…(all 15 sections in vertical stack)…

[Submit a code for ToolSuite]

── Verified by Digital Promo Codes ──
[chip + short blurb]

┌──────────────────────────────┐
│ FOOTER                       │
└──────────────────────────────┘
```

---

## What this doesn't cover (deferred)

- Logo / wordmark glyph (step d1) — single-color "Digital Promo Codes" wordmark in slate-900
- OG image, favicon (step i) — single-color wordmark on slate-50 bg
- Email template restyling — out of rebrand scope
- Admin UI restyling — out of rebrand scope
- Blog index, blog post, about, contact, submit, terms, privacy, subscribe, how-to-redeem — covered by Step E sweep using same design language

## Approval gate

Awaiting signoff on:
1. Layout direction Path 1 + curation-tiered framing as above
2. Right-rail-with-reveal-block pattern on wide desktop, sticky-mini-bar on narrow
3. Offer-detail section reorder + reframing of Popularity / Verified (no timestamps)
4. Sidebar composition (categories + discount range + search + Submit CTA — no verified-date filter)

If signed off, the next steps are:
- Step C: Implement homepage. Single reviewable diff. Screenshot 1440 + 375. Pause.
- Step D: Implement offer detail. Same. Pause.
- Step E: Sweep secondary templates. Pause at each.

Typecheck after each. Full build before each step closes.
