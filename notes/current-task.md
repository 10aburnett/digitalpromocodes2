# Current task — Sidebar filter bug + Reveal-code prominence + Favicon followup

Three issues to address in one continuous run.

---

## ISSUE 1 — Homepage sidebar category filter is broken (HIGH PRIORITY, functional bug)

**User report:** clicking on "Trading" / "Sports Betting" / "Reselling" / etc. in the homepage sidebar does NOTHING. The page doesn't filter, doesn't visibly update.

**Root cause confirmed by code inspection** (`src/components/BrowseAllList.tsx` lines 59-60):

```ts
const [search] = useState(initialSearch);
const [category] = useState(initialCategory);
```

These are `useState` with NO setter declared and NO `useEffect` that syncs them when the props change. When the sidebar's `<Link href="/?whopCategory=TRADING">` navigates, the URL updates and `(public)/page.tsx` re-renders with new props — but `BrowseAllList`'s internal `category` state is locked to whatever value `initialCategory` had at first mount. Subsequent `fetchOffers(p, search, category, sortBy)` calls reference the stale local state, so the API request never includes the new category filter, and the list never re-fetches when the prop changes.

**Fix approach** — pick whichever you think is cleanest:

A. **Derive from URL on every render** (cleanest): drop the `[search]` and `[category]` local state entirely. Use `useSearchParams()` from `next/navigation` to read them live every render. This also handles the back/forward `popstate` flow since `useSearchParams` re-renders on URL change.

B. **Sync via useEffect**: keep local state but add a setter and a `useEffect` that watches `initialCategory` / `initialSearch` props, calls the setters, AND triggers `fetchOffers` with the new values. Reset to page 1 when category or search changes.

C. **Remount via key**: in `(public)/page.tsx`, key the `BrowseAllList` component on `<BrowseAllList key={`${activeCategory}-${currentSearch}`} ... />` so React remounts it on every filter change. Crude but works.

I'd recommend **A** — it's the most idiomatic for App Router client components and it removes the drift class entirely. **B** is fine if A creates issues.

**Also verify the full chain works after the fix:**

1. Click sidebar category → URL has `?whopCategory=TRADING` (or similar)
2. URL param → `BrowseAllList` re-fetches with category filter applied
3. The active category in the sidebar shows the visual `aria-current="page"` highlight (this part already works since `HomeSidebar` reads `activeCategory` from page-level searchParams)
4. **Strips collapse when a filter is active**: per the original C2 spec, Top Picks + Category Strips should disappear when a category or search is active so the filtered list takes focus. Verify this still works after the fix — if it was relying on stale state, it might be broken.
5. Click "All offers" → URL clears → list shows all offers → strips reappear

**Verify with these specific clicks** (use Playwright if you've got it, or click manually on the dev server at :3000):

- Click "Trading" in sidebar → URL has `?whopCategory=TRADING` → list shows only TRADING offers (count drops from ~1455 to ~527) → Top Picks + Category Strips collapse
- Click "Sports Betting" → URL updates → list shows ~220 SPORTS_BETTING offers → strips collapsed
- Click "All offers" → URL clears → list shows all 1455 → strips reappear
- Browser back button after a category click → returns to "All offers" cleanly

**Screenshot proof at end:** 1440 with TRADING selected (filtered list visible, strips collapsed) + 1440 with no filter (strips visible, all offers in Browse All).

---

## ISSUE 2 — Reveal code section needs to be MUCH more prominent

**User feedback verbatim:** *"the reveal code section is not obvious enough, this needs to be much more central and easy to spot for the user, this is the most important part."*

The reveal/copy-code action IS the conversion event for this site. It needs to be the visually dominant element on offer-detail, not a quiet card.

**Concrete direction:**

### A. High-contrast reveal card

Replace the current quiet white reveal card with one that draws the eye unmistakably:

- **2px teal-600 (`#0891B2`) border** (currently subtler), OR a teal-50 tinted background, OR both.
- **Larger internal padding** (24-32px on desktop, 20-24px on mobile).
- **Stronger drop shadow** than other cards on the page — this card should look elevated above its surroundings, not flush with them.
- **Subtle teal-50 (or rgba teal at very low opacity) background tint** to lift it from the white/slate-50 surrounding sections.

### B. Reveal CTA button — loudest element on the page

- **Larger button**: minimum 48px tall on desktop, full-width within the card.
- **Display-weight font** (Manrope 700), 16-18px text.
- **Teal-600 fill, white text.** Currently approved, just needs to be bigger.
- **Strong hover state**: slightly darker teal + 1px translateY + slightly stronger shadow.
- **Optional micro-animation**: a very subtle pulse/breathing on the CTA (e.g., box-shadow oscillating with a 3s interval at low intensity). Use sparingly — discuss before adding if you think it crosses into "annoying" territory. If unsure, skip it; visual weight alone should suffice.

### C. Discount headline ABOVE the button

If the offer has a discount value, render a large display-weight headline directly above the CTA button:

- **24-32px Manrope 700**, slate-900 (or teal-600 if it reads better against the card bg).
- Format: "50% OFF" or "$50 OFF" or "Best Deal" — use whatever data is on the promo (`firstPromo?.value` or similar).
- This is the visual hook that pulls the eye before it lands on the CTA.

If no discount data exists for the offer, fall back to a static "Get your code" or "Reveal" headline at the same display weight.

### D. Micro-copy

A small slate-500 line ABOVE the discount headline OR below the CTA:

- "Click to reveal — limited time" or "Tap to copy your code"
- 12-13px, helps frame the action for users unfamiliar with the reveal pattern.

### E. Right rail (≥1280px) sizing

The current right rail is ~320px. Bump to 340-360px so the reveal card has room to breathe with the new padding and headline.

Optional: very subtle teal-50 tint on the right rail BACKGROUND (not the reveal card itself) to visually distinguish the rail from the main column. Subtle — like 3% teal opacity. Skip if it makes the rail look too "tabbed away" from the content.

### F. Mobile/tablet inline reveal card (<1280px)

Currently overlaps the navy band by `-mt-12 sm:-mt-16`. Keep the overlap concept but make the CARD itself much more prominent:

- All the changes from A/B/C/D applied here too (teal border, larger padding, larger CTA, discount headline)
- Make sure the overlap looks intentional and "frames" the reveal action — half on the navy edge, half below

### G. The bar to hit

If you screenshot the new offer-detail and ask "where's the action on this page?" — the reveal card should be the unmistakable answer within 1-2 seconds. If it takes scanning to find, it's still too subtle.

Test by squinting at the screenshot — the reveal card should be the brightest/strongest visual element after the navy hero band.

### Files most likely to touch

- `src/components/offer/OfferHero.tsx` (if reveal is inside hero)
- `src/app/(public)/offer/[slug]/page.tsx` (if reveal is rendered at page level alongside hero)
- Possibly `src/components/OfferPageClient.tsx` (the existing reveal flow component — DO NOT refactor its state/handlers, only the visual housing it sits in)

The reveal-code FLOW logic is NEW LOCK protected. The CARD AROUND IT is fully open.

---

## ISSUE 3 — Favicon PNG/ICO regeneration (still deferred)

This is being handled manually by the user via realfavicongenerator.net. No agent action needed unless you discover a way to programmatically convert the SVGs in this run.

Optional: if `magick` / `rsvg-convert` / `sharp` got installed since last attempt (worth a quick `which` check), regenerate the PNG/ICO set from the new `public/logo.svg` and `public/favicon.svg`. If still no tooling, leave it.

---

## Execution

Continuous run, no pauses. Single consolidated update at the end.

**Order of work:**

1. **Sidebar filter bug** (highest blast radius — affects user navigation across the entire homepage). Fix + verify with manual clicks at :3000 + screenshot proof.
2. **Reveal-code prominence** redesign — apply A through G.
3. **Favicon tooling check** (optional, skip if no tooling).

**Screenshots required at end:**

- Sidebar fix:
  - 1440 with TRADING filter applied (filtered list visible, strips collapsed)
  - 1440 with no filter (strips visible, full list)
- Reveal block:
  - Offer-detail at 1440 (right rail with new prominent reveal card)
  - Offer-detail at 1024 (inline overlap with new prominence)
  - Offer-detail at 375 (mobile inline reveal — should be the dominant element after the hero)

**Locks all still apply** (NEW LOCK list, PromoBanner untouched, no timestamp language, reveal-code FLOW logic untouched). The visual housing around the reveal flow is fully open; the flow's state machine, handlers, and tracking calls are not.

Begin with the sidebar fix.
