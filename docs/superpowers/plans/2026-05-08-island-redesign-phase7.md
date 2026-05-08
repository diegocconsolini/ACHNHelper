# Phase 7 — Personality Density + Polish (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** The "PostHog easter eggs" phase. Where the metaphor stops being a skin and becomes personality. Plus the perf/a11y graduation that the cumulative 4.4 MB asset weight requires. Phase 7 closes the redesign.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md` (Phase 7 section)
**Roadmap reference:** `docs/superpowers/plans/2026-05-07-island-redesign-roadmap.md` (Phase 7 section)

**Prerequisite:** Phases 1-6 shipped to main. All 32 tools hosted. Cumulative weight 4.4 MB.

**Estimate:** 6-8 days calendar time.

---

## What Phase 7 ships

### 1. Performance — lazy-load all illustration

The biggest single thing. All 25 character + chrome + tool-background WebPs currently load eagerly. With Phase 6 they are 4.4 MB; on first paint that's a meaningful LCP hit on slow connections.

- Add `loading="lazy"` to every `<img>` tag in `src/characters/Greeting.jsx`, `EmptyState.jsx`, `LoadingState.jsx`, `HostFloatingTip.jsx`, `src/island/SidebarMap.jsx` (the map img), `src/island/MapLocation.jsx` (signpost-bg), and the wooden-plaque `<img>` in `src/App.jsx`.
- ToolFrame's CSS background-image overlay can't be lazy-loaded the same way, but the browser already defers fetching for `display:none` elements — verify by inspecting Network tab. If still eager, switch ToolFrame to use a real `<img>` with `loading="lazy"` positioned under content.
- Verify Lighthouse perf score doesn't regress vs. 5.0.0 baseline.

### 2. Regenerate missing Phase 6 assets

Phase 6 batch dropped 7 of 8 prompts. Re-queue them one at a time in Midjourney, slower this time:

- `pelly-postoffice.webp` (Pelly portrait — currently falls back to Isabelle for VillagerGiftGuide)
- `luna-dream.webp` (Luna portrait — DreamAddressBook still uses Isabelle)
- `kk-plaza.webp` (KKCatalogue currently uses dashboard-bulletin)
- `events-stargazing.webp` (SeasonalEventCalendar + CelesteMeteorTracker reuse dashboard-bulletin)
- `luna-dreambed.webp` (DreamAddressBook uses island-misc fallback / no bg)
- `bulletin-community.webp` (CommunityHub + Notifications + TradingBoard reuse dashboard-bulletin)
- `island-misc.webp` (~12 long-tail tools currently render with no background overlay)

Once landed, swap the per-tool `background=` props from their fallback to the canonical asset. Register Pelly + Luna in the character registry (bump 11 → 13 hosts).

### 3. Personality density — easter eggs

Density is what separates "themed app" from "PostHog-quality experience." Layer in:

- **Loan reminder tooltip** on Bell Calculator's loan input — Tom Nook murmurs "yes yes, no interest, no rush" if you hover over the loan amount input for 1.5s.
- **Mr. Resetti** appears as a `SpeechDialog` if the user refreshes the page 5+ times in 30 seconds. ("What are ya doin'?? You can't just keep restarting!").
- **Bunny Day decorations** — on April 4-13 dates, render an `🥚` floating in the sidebar map corner with subtle bob animation.
- **Halloween orange tinting** — on Oct 30-31, add an `::before` overlay on the wooden-plaque header tinting it orange.
- **Hidden K.K. Slider gig poster** — an `<img>` of `kk-slider-strumming` (small, ~40px) pinned to the corner of `dashboard-bulletin.webp` background on the Dashboard. Click → SpeechDialog: "You found me! New album drops Saturday."
- **Trash labeled "Recycle Bin"** — find the existing `🗑` Trash icon in Wishlist's remove action; relabel to "Recycle Bin" with leaf-pile drawing.
- **Fake Dodo Code** — easter-egg page at `/dodo` with an input that politely refuses any code with an Isabelle SpeechDialog: "I don't recognize that code, mayor… are you sure it's right?"
- **Real meteor shower detection** — cron-driven via Vercel Cron + an API route that checks the day's NASA meteor data; if a real shower is happening, surface a Celeste `SpeechDialog` on Dashboard mount.

That's 8 easter eggs — match PostHog's "one per page" density target.

### 4. Animations

- **Idle-bob** already exists on `LoadingState`. Extend to optional `Greeting` portraits — toggleable per-tool via `animate` prop, off by default.
- **Leaves drifting** — small `<img>` of `leaf-bullet` floating across the bottom of the wooden-plaque header. CSS `@keyframes` from off-screen-right → off-screen-left, 30s duration, 5 leaves at staggered delays.
- **Sky tinting** — port deferred Phase 2 time-of-day to the landing page background and the 404. Read user local hour, interpolate between `tokens.color.skyDay`, `skySunset`, `skyNight` for the page bg.
- **K.K. Slider strum** — on the 404 page, add an SVG note pulse over K.K.'s guitar with `animation: kk-strum 1.2s ease-in-out infinite`.

All animations respect `@media (prefers-reduced-motion: reduce)` — already enforced in LoadingState.

### 5. Optional sound

- Single MP3 of an ACNH-style "click" sound (~5 KB) played on **major** button hover. Toggleable via a "Sound effects" switch on `UserProfile`. **Off by default** so users opt in.
- Verify no autoplay; sound only plays after user interaction (browser autoplay policy).

### 6. Comprehensive a11y audit

- Focus rings on every redesigned interactive element (`SidebarMap` hotspots, `MapLocation` flyout buttons, `SpeechDialog` buttons, `HostFloatingTip` triggers). Already partially done; verify with `:focus-visible` audit.
- ARIA labels on every character portrait (already present via `alt` attribute — verify).
- Reduced-motion media query covers all keyframe animations.
- Color contrast WCAG AA across all new chrome — `ink` on `paper` is 8:1 (excellent); verify all paper-bg + ink-text combos.
- Screen reader test on `SidebarMap` flyout opens (the menu role + aria-current already exist; verify announcement order).
- Keyboard navigation: Tab through SidebarMap should reach every location + sub-tool; Esc closes flyouts; Enter activates.

### 7. Performance pass

- Total illustration assets target: **<2.5 MB** (currently 4.4 MB). Achieve via:
  - Re-encode all backgrounds at q60 (currently q70). Each shrinks ~15-20%.
  - Re-encode portraits at q75 (currently q82). Each shrinks ~10%.
  - Combined: should hit ~3 MB. With lazy-loading the LCP impact is negligible regardless.
- Lighthouse must not regress vs. 5.0.0 baseline. If performance score drops by more than 5 points, narrow scope: drop 2-3 backgrounds and let those tools render with no overlay.

### 8. Final visual identity audit

End-to-end smoke flow as defined in spec:

1. Landing → watercolor island hero → click "Try as Guest"
2. Portal loads → SidebarMap with Isabelle plaque header → Dashboard greets you
3. Click Bell Calculator → Tom Nook's ledger → loan tooltip works
4. Click any of 32 tools → each has a host greeting + themed background
5. Refresh 5x in 30 seconds → Mr. Resetti SpeechDialog appears
6. Sign out → Isabelle SpeechDialog "Heading back to the airport"
7. Visit `/typo-url` → K.K. Slider 404 with strum animation

…all without ever showing the old dark-mode SaaS chrome.

---

## Files

**New:**
- `app/dodo/page.jsx` — fake Dodo Code easter egg page
- `src/island/MeteorAlert.jsx` — Celeste cron-driven meteor surfacer
- `app/api/cron/meteor-check/route.js` — Vercel Cron endpoint
- `vercel.json` — add cron entry for daily meteor check
- `src/components/ResettiTrap.jsx` — refresh-counter + Resetti SpeechDialog
- `src/island/leaves-drift.css` (or inline keyframe) — drifting-leaves animation
- `public/island/sounds/click.mp3` — 5 KB click sound (only added if user-approved)

**Modified:**
- All 7 components with `<img>` tags get `loading="lazy"`
- `src/App.jsx` mounts `<ResettiTrap />`
- `src/SettingsContext.jsx` adds `soundEffects: false` default
- `src/artifacts/UserProfile.jsx` adds the sound toggle
- `src/artifacts/BellCalculator.jsx` adds the loan-input tooltip
- `src/artifacts/Wishlist.jsx` relabels remove action to "Recycle Bin"
- `app/not-found.jsx` adds time-of-day sky + K.K. strum animation
- `package.json` — bump 5.5.0 → 6.0.0 (major version: redesign complete)

## Estimated leaf breakdown

1. Lazy-load all illustration `<img>` (1 day) — quick mechanical change, big perf win
2. Mr. Resetti refresh trap (0.5 day)
3. Bunny Day + Halloween calendar overlays (0.5 day)
4. Loan-reminder tooltip on Bell Calculator (0.5 day)
5. K.K. easter egg on Dashboard (0.5 day)
6. Dodo Code easter-egg page (0.5 day)
7. Drifting-leaves animation on plaque header (0.5 day)
8. Time-of-day sky on landing + 404 (0.5 day)
9. K.K. strum animation on 404 (0.25 day)
10. Sound effects toggle + click sound (0.5 day)
11. Re-encode all assets at lower q (0.25 day)
12. Comprehensive a11y audit (1 day)
13. Lighthouse perf check + final smoke (0.5 day)
14. Bump to 6.0.0 + close phase + close master epic (#129) (0.25 day)

**Total: ~7 days.** Generous; many leaves can run in parallel.

---

## Done criteria

- All illustration `<img>` lazy-loaded
- Lighthouse perf score within 5 points of pre-redesign baseline
- 8 easter eggs landed
- All animations respect prefers-reduced-motion
- Cumulative asset weight <3 MB after re-encode
- Master epic #129 closed
- Version 6.0.0 deployed

## Risk register

| Risk | Mitigation |
|------|------------|
| Re-encoding at lower q makes assets visibly worse | Spot-check before+after; revert if any portrait breaks |
| Mr. Resetti easter egg annoys users in dev refresh loops | Only count "non-dev-server" page loads; gate on `process.env.NODE_ENV === 'production'` |
| Sound effects break for users with no audio output | Already opt-in (off by default); guard with try/catch around `Audio.play()` |
| Bunny Day and Halloween checks break tests | Use a test-friendly date helper; dates can be mocked |
| Vercel Cron requires payment plan upgrade | Free tier supports 1 cron/day. Use that. If unavailable, ship Celeste meteor as a static "every Wednesday is meteor day" hint |
| Time-of-day sky tinting flashes on hydration | Use CSS variables set on `<html>` element by initial server render; client re-reads on mount only if needed |

## Open questions

None pre-execution. The whole redesign closes with Phase 7.
