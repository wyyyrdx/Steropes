# Steropes Frontend — Light + Dark Mode Redesign Plan (v2)

> **Document version:** 2026-09-19 (revised)
> **Scope:** Visual + theming redesign only. No new features, pages, or dependencies.
> **Deliverable:** This plan, reviewed and approved before any implementation.
> **Ground truth for current state:** `frontend_implementation_plan.md`

---

## SECTION 1 — CURRENT STATE AUDIT

### 1.1 Design Strengths Worth Keeping

1. **Token-based design system via CSS custom properties.** Every component CSS references `--color-*`, `--space-*`, `--radius-*`, `--shadow-*` tokens rather than hardcoded values. A theme swap is therefore mechanically simple, provided token names are preserved.
2. **4px spacing scale** (`--space-1` through `--space-20`). Coherent, well-adopted, never violated. Preserve verbatim.
3. **Tier-color semantic system** (green/amber/red) with **icon + label + color** redundancy. Excellent for accessibility; survives unmodified across themes.
4. **Typography system** (Inter + JetBrains Mono). Well-structured; heading/body/label/caption/mono/metric tiers with separated weight and line-height tokens.
5. **Consistent card anatomy.** `MetricCard`, `ChartCard`, `FrameCard`, `HardwareChip` share the same surface/border/radius/shadow recipe — one token swap themes all of them.
6. **Reduced-motion handling** in `LiveIndicator.css`, `CascadeStatusFlow.css`, `LiveStreamWidget.css`.
7. **Mobile bottom tab bar** with `env(safe-area-inset-bottom)` and a clean 767px breakpoint.
8. **SR-only utility + screen-reader data tables** for charts. Solid accessibility foundation.

### 1.2 Design Weaknesses / Opportunities

1. **Dark-mode-only.** No light theme; users in bright environments (stage lighting, projector) see washed-out colors.
2. **Hardcoded RGBA in `Header.css`** (`rgba(15, 23, 42, 0.85)`) — fails in light mode unless tokenized.
3. **Leftover Vite scaffold CSS in `App.css`** (185 lines) referencing undefined variables. Dead code — delete during migration.
4. **Shadows tuned for dark surfaces.** `rgba(0,0,0,0.3–0.5)` opacities will look harsh on white.
5. **Tier background tokens use transparency.** Semi-transparent values layered over dark surfaces; on light surfaces the same values produce different apparent colors.
6. **Missing hover/press feedback** on `TierBadge` and `ActionBadge` when used as interactive controls (e.g., in `TierFilter`).
7. **`--color-text-inverse` semantic drift.** Currently `#0d0f1a` (the dark base). In light mode, "inverse" must become white. Where it's used today must be audited to confirm every usage really means "text on a colored background."
8. **Chart tooltip styling.** `CHART_DEFAULTS` references CSS vars, but Recharts may not re-resolve vars on theme switch without a React re-render.

### 1.3 Technical Debt / Constraints the Redesign Must Respect

| Constraint | Detail |
|---|---|
| `.sr-only` must live in a stable location | Move to `utilities.css` so it can never be lost during refactoring. |
| Recharts v3 `accessibilityLayer` | Interacts awkwardly with custom accessibility layers. One strategy per chart. |
| CSP-safe styling | No CSS-in-JS. Plain CSS files + CSS custom properties only. |
| Token-name preservation | Do NOT rename existing tokens. Only add new ones. |
| Component count | 21 UI + 5 layout + ~18 feature + 4 chart components. |
| Mobile tab bar pattern | 767px breakpoint + fixed bottom must survive. |
| 26 passing tests | Must continue to pass; any Header DOM change updates its test in the same phase. |
| Dead Vite CSS | `App.css` must be deleted and its import removed. |
| Theme storage key | `steropes-theme` in `localStorage` — exposed as `THEME_STORAGE_KEY` in `src/constants/theme.ts`. |

---

## SECTION 2 — REDESIGN DIRECTION

### 2.1 Design Principles

1. **Data-first hierarchy.** Metrics, tier badges, and confidence values are primary anchors. Decorations (glows, gradients) are secondary and never compete with legibility.
2. **Calm in dark, crisp in light.** Dark retains monitoring-dashboard depth; light uses warm whites and soft grays.
3. **Motion only when it informs.** Live-pulse, cascade-node animation, scan-line signal liveness. Hover feedback is instant (<150ms).
4. **One design, two palettes.** Identical layout/spacing/typography; only colors and shadows change.
5. **Contrast-verified by default.** Every text/background pair passes WCAG AA. Enforced as a build-time rule, not a post-hoc fix.
6. **Progressive disclosure.** Dense data lives in tooltips and modals, not on card surfaces.

### 2.2 Visual References

- **Linear App** — restrained surfaces, professional, works well in both themes.
- **Grafana 11** — monitoring-dashboard DNA with a restrained light mode.
- **Vercel Dashboard** — dual-theme parity; neither theme feels bolted on.

Target mood: **a professional monitoring tool that reads clearly under stage lighting (light mode) and looks impressive in a dimmed demo room (dark mode).**

### 2.3 What Changes vs. What Stays

| Item | Decision |
|---|---|
| Token names | **Keep** |
| Spacing scale | **Keep** |
| Radii scale | **Keep** |
| Typography scale | **Keep** (add tight letter-spacing on h1/h2) |
| Shadow scale | **Refine** — per-theme tokens |
| Tier/status foreground colors | **Refine** — lighter in dark, darker in light |
| Tier/status background colors | **Replace** — opaque pastels in light, `rgba()` in dark |
| Primary accent | **Refine** — keep `#6366f1` for light; use `#818cf8` for dark |
| Header layout | **Refine** — tokenize bg; add theme toggle |
| Mobile tab bar | **Keep** |
| Chart theming | **Refine** — commit to CSS-var-passing strategy |
| `App.css` | **Remove** |
| `.sr-only` | **Move to `utilities.css`** |
| Focus ring | **Keep** |
| `OfflineBanner` text color | **Refine** — use `--color-text-inverse` |

---

## SECTION 3 — LIGHT + DARK MODE ARCHITECTURE

### 3.1 Theming Mechanism

**Recommendation:** Media-query default + manual override persisted to `localStorage`.

**Requirements:**
1. `data-theme="light"` or `data-theme="dark"` on `<html>`.
2. Inline `<script>` in `index.html` (before any stylesheet) that reads localStorage, falls back to `prefers-color-scheme`, and sets `data-theme` before paint.
3. `useTheme()` hook exposing `{ theme, toggleTheme }`, listening for OS changes when no manual override exists.
4. `:root` defines dark as default; `[data-theme="light"]` overrides; `[data-theme="dark"]` explicit for clarity.

### 3.2 Token Strategy

**Recommendation:** Keep existing token names, swap values per theme.

Zero component-CSS edits required for the base theme swap. The token definition files are the only files whose contents change.

### 3.3 Full Palette

#### Dark Theme

| Token | Value |
|---|---|
| `--color-bg-base` | `#0d0f1a` |
| `--color-bg-surface` | `#13162b` |
| `--color-bg-elevated` | `#1a1d35` |
| `--color-bg-subtle` | `#1f2340` |
| `--color-border` | `#2a2d4a` |
| `--color-border-strong` | `#3a3d5c` |
| `--color-text-primary` | `#e8eaf6` |
| `--color-text-secondary` | `#a0a3b8` |
| `--color-text-muted` | `#6b6f8a` |
| `--color-text-inverse` | `#0d0f1a` |
| `--color-primary` | `#818cf8` |
| `--color-primary-hover` | `#a5b4fc` |
| `--color-primary-subtle` | `#1e2050` |
| `--color-success` | `#4ade80` |
| `--color-success-bg` | `rgba(34,197,94,0.15)` |
| `--color-warning` | `#fbbf24` |
| `--color-warning-bg` | `rgba(245,158,11,0.15)` |
| `--color-error` | `#f87171` |
| `--color-error-bg` | `rgba(239,68,68,0.15)` |
| `--color-info` | `#38bdf8` |
| `--color-info-bg` | `rgba(56,189,248,0.12)` |
| `--color-neutral` | `#9ca3af` |
| `--color-neutral-bg` | `rgba(156,163,175,0.12)` |
| `--color-tier-1` | `#4ade80` |
| `--color-tier-1-bg` | `rgba(34,197,94,0.15)` |
| `--color-tier-2` | `#fbbf24` |
| `--color-tier-2-bg` | `rgba(245,158,11,0.15)` |
| `--color-tier-3` | `#f87171` |
| `--color-tier-3-bg` | `rgba(239,68,68,0.15)` |
| `--chart-tier-1` | `#4ade80` |
| `--chart-tier-2` | `#fbbf24` |
| `--chart-tier-3` | `#f87171` |
| `--chart-avoided` | `#818cf8` |
| `--chart-grid` | `#2a2d4a` |
| `--color-header-bg` | `rgba(13,15,26,0.85)` |
| `--modal-backdrop-opacity` | `0.7` |

#### Light Theme

| Token | Value |
|---|---|
| `--color-bg-base` | `#f8f9fc` |
| `--color-bg-surface` | `#ffffff` |
| `--color-bg-elevated` | `#ffffff` |
| `--color-bg-subtle` | `#f1f3f9` |
| `--color-border` | `#e2e4eb` |
| `--color-border-strong` | `#c8cbd6` |
| `--color-text-primary` | `#1a1d2e` |
| `--color-text-secondary` | `#5b6078` |
| `--color-text-muted` | `#8b90a5` |
| `--color-text-inverse` | `#ffffff` |
| `--color-primary` | `#6366f1` |
| `--color-primary-hover` | `#4f46e5` |
| `--color-primary-subtle` | `#eef2ff` |
| `--color-success` | `#16a34a` |
| `--color-success-bg` | `#dcfce7` |
| `--color-warning` | `#d97706` |
| `--color-warning-bg` | `#fef3c7` |
| `--color-error` | `#dc2626` |
| `--color-error-bg` | `#fee2e2` |
| `--color-info` | `#0284c7` |
| `--color-info-bg` | `#e0f2fe` |
| `--color-neutral` | `#6b7280` |
| `--color-neutral-bg` | `#f3f4f6` |
| `--color-tier-1` | `#16a34a` |
| `--color-tier-1-bg` | `#dcfce7` |
| `--color-tier-2` | `#d97706` |
| `--color-tier-2-bg` | `#fef3c7` |
| `--color-tier-3` | `#dc2626` |
| `--color-tier-3-bg` | `#fee2e2` |
| `--chart-tier-1` | `#16a34a` |
| `--chart-tier-2` | `#d97706` |
| `--chart-tier-3` | `#dc2626` |
| `--chart-avoided` | `#6366f1` |
| `--chart-grid` | `#e2e4eb` |
| `--color-header-bg` | `rgba(248,249,252,0.85)` |
| `--modal-backdrop-opacity` | `0.4` |

### 3.4 Contrast Verification

**Dark theme — key pairs:**

| Foreground | Background | Ratio | AA? |
|---|---|---|---|
| text-primary `#e8eaf6` | bg-surface `#13162b` | 13.1:1 | ✅ |
| text-secondary `#a0a3b8` | bg-surface `#13162b` | 6.3:1 | ✅ |
| text-muted `#6b6f8a` | bg-surface `#13162b` | 3.5:1 | ⚠ Large-only |
| tier-1 `#4ade80` | tier-1-bg over surface | 7.2:1 | ✅ |
| tier-2 `#fbbf24` | tier-2-bg over surface | 8.9:1 | ✅ |
| tier-3 `#f87171` | tier-3-bg over surface | 5.6:1 | ✅ |
| primary `#818cf8` | bg-surface `#13162b` | 5.8:1 | ✅ |

**Light theme — key pairs:**

| Foreground | Background | Ratio | AA? |
|---|---|---|---|
| text-primary `#1a1d2e` | bg-surface `#ffffff` | 16.1:1 | ✅ |
| text-secondary `#5b6078` | bg-surface `#ffffff` | 5.8:1 | ✅ |
| text-muted `#8b90a5` | bg-surface `#ffffff` | 3.5:1 | ⚠ Large-only |
| tier-1 `#16a34a` | tier-1-bg `#dcfce7` | 4.6:1 | ✅ |
| tier-2 `#d97706` | tier-2-bg `#fef3c7` | 4.5:1 | ✅ |
| tier-3 `#dc2626` | tier-3-bg `#fee2e2` | 5.4:1 | ✅ |
| primary `#6366f1` | bg-surface `#ffffff` | 4.6:1 | ✅ |
| text-inverse `#ffffff` | primary `#6366f1` | 4.6:1 | ✅ |
| text-inverse `#ffffff` | error `#dc2626` | 5.6:1 | ✅ |

**Rule:** `--color-text-muted` is restricted to non-essential metadata ≥13px. Never for actionable or essential content. Enforced by code review.

### 3.5 Theme Toggle UI

- **Control:** Icon button, sun/moon (`Sun`, `Moon` from Lucide).
- **Desktop:** Header right side, immediately left of `LiveIndicator`.
- **Mobile:** Same position (header right side).
- **Interaction:** Click toggles theme. Icon cross-fades (150ms). `data-theme` updates synchronously; localStorage written.
- **Tooltip:** "Switch to light mode" / "Switch to dark mode".
- **Accessibility:** `aria-label` updates dynamically; Enter/Space operable.

### 3.6 Theme Persistence & First-Load

| Aspect | Implementation |
|---|---|
| Storage key | `steropes-theme` — exposed as `THEME_STORAGE_KEY` in `src/constants/theme.ts` |
| Stored values | `"light"`, `"dark"`, or absent (follow OS) |
| First-load default | localStorage → `prefers-color-scheme` fallback |
| Flash prevention | Inline `<script>` in `index.html`, before stylesheets, before React mount |
| OS change handling | `matchMedia` listener; applies only if no manual override exists |
| Feature-flag fallback | If `VITE_ENABLE_THEME_TOGGLE=false`: `useTheme()` returns `theme='dark'` always; toggle button does not render; inline script forces `data-theme="dark"` |

### 3.7 Token File Organization
src/styles/
tokens/
_primitives.css raw hex values (e.g. --raw-indigo-500)
_dark.css [data-theme="dark"] { --color-: ... }
_light.css [data-theme="light"] { --color-: ... }
_shadows.css per-theme shadow tokens
_index.css @import all above; :root fallback = dark
typography.css unchanged
reset.css unchanged
utilities.css .sr-only, focus-ring helpers
globals.css body rules, :focus-visible, links

Import order in `main.tsx`: `reset.css` → `tokens/_index.css` → `typography.css` → `utilities.css` → `globals.css`.

---

## SECTION 4 — COMPONENT-BY-COMPONENT REDESIGN

> **Note:** every subsection below is a **verification pass**, not a prediction. The implementer runs a grep audit for hardcoded color values (`#`, `rgba(`, `rgb(`, `hsl(`) in the component's CSS file; if none, the component auto-adapts via tokens and requires no edits. If values are found, replace each with the appropriate token.

### 4.1 Primitives — Audit Checklist

| Component | Expected Change |
|---|---|
| Button | None expected; verify via audit |
| IconButton | None expected; verify |
| LoadingSkeleton | None expected; verify pulse color adapts |
| Divider | None expected |
| Tooltip | Verify shadow is token-based; may need per-theme `--shadow-md` |
| ProgressBar | None expected |
| MockBadge | None expected |

### 4.2 Domain — Audit Checklist

| Component | Expected Change |
|---|---|
| TierBadge | Verify color/bg tokens adapt; check for hardcoded borders |
| ActionBadge | Same as TierBadge |
| StatusBadge | Verify dot color uses status tokens |
| ConfidenceBar | None expected |
| ConfidenceGauge | None expected |
| MetricCard | Verify accent top-border uses status tokens; verify shadow token |

**Special audit:** grep `--color-text-inverse` across the codebase. Confirm every usage is "text on a colored background." If any usage is really "text that should be light in dark mode", that usage must be changed to `--color-text-primary`.

### 4.3 Composites — Audit Checklist

| Component | Expected Change |
|---|---|
| Modal | Replace hardcoded backdrop opacity with `--modal-backdrop-opacity` |
| DateRangePicker | None expected |
| ChartCard | None expected |
| LiveIndicator | None expected; verify reduced-motion guard exists |
| StaleDataBanner | None expected |
| SectionHeader | None expected |
| OfflineBanner | Change text color from `--color-bg-base` to `--color-text-inverse` |

### 4.4 Layout — Audit Checklist

| Component | Expected Change |
|---|---|
| Header | Replace `rgba(15,23,42,0.85)` with `--color-header-bg`. Add `ThemeToggle` child |
| NavLink | None expected |
| MobileTabBar | Verify top shadow uses shadow token in light mode |
| AppLayout | None expected |

### 4.5 Feature Components

Audit each of the following in both themes. Report any hardcoded colors found.

- **Dashboard:** `LiveStreamWidget`, `CurrentDetectionCard`, `ConfidenceGaugeLive`, `CascadeStatusFlow`, `CostSavingsGrid`, `HardwareChip`, `HardwareStatusGrid`, `TimelineItem`, `DecisionsTimeline`
- **Frames:** `FramesFilterBar`, `TierFilter`, `ActionFilter`, `FramesGallery`, `FrameCard`, `FrameImagePlaceholder`, `FrameDetailsModal`, `DecisionSection`, `ConfidenceBreakdownSection`, `CostSection`, `MovementSection`
- **Analytics:** `AnalyticsDatePicker`, `OverviewCardsRow`, `TierDonutChart`, `CostComparisonChart`, `AdaptiveThresholdCard`, `ThresholdHistoryChart`, `EscalationPerformanceChart`

**Known specific fixes:**
- `CascadeStatusFlow.css` has a hardcoded `#fff` — replace with `--color-text-inverse`.
- `CascadeStatusFlow` tier glow may need light-mode tuning (increase spread or opacity via per-theme tier-shadow tokens).

### 4.6 Charts — Recharts Theming Strategy (DEFINITIVE)

**The problem:** Recharts resolves CSS custom properties at render time via `getComputedStyle`. When `data-theme` changes but React does not re-render the chart, the chart may continue displaying the old theme's computed colors. This is the single highest-risk item in the redesign.

**The decision (committed):**

1. **Force a remount on theme change** by placing `key={theme}` on each chart's `<ResponsiveContainer>`. This guarantees Recharts re-resolves every CSS var. Charts have no persistent user state (no zoom, no pan, no filter selection), so remount is safe.
2. **Do NOT rely on CSS-var auto-update** — remounting is the deterministic solution.
3. **Change `buildTierChartData()` to return CSS-var reference strings** (`'var(--chart-tier-1)'` etc.) instead of hardcoded hex values. This is the fix for §7.4 risk #2. The file to change is `src/utils/chartHelpers.ts`.
4. **Same approach for `buildCostChartData()`** if it returns any hardcoded fills.

**Recharts element theming reference:**

| Element | Theming source | Notes |
|---|---|---|
| `CartesianGrid` stroke | `var(--chart-grid)` | Auto-adapts on remount |
| `XAxis`/`YAxis` tick fill | `var(--color-text-secondary)` | Auto-adapts on remount |
| `Tooltip` `contentStyle` | `CHART_DEFAULTS` (references vars) | Auto-adapts on remount |
| `Bar` `fill` | `var(--chart-tier-*)` | Must come from helper as var string |
| `Pie` `Cell` `fill` | Same as Bar | Same fix |

### 4.7 EmptyState / ErrorState — Audit Checklist (NEW)

These components are frequently visible on first load (before data arrives) and on error. Both must be verified in light mode.

| Component | Expected change |
|---|---|
| EmptyState | Icon (muted), title (h4 primary), description (body-sm secondary), action button. Verify all four elements adapt. |
| ErrorState | Alert icon + message. Warning variant uses `--color-warning`; error variant uses `--color-error`. Verify on both surfaces. |

### 4.8 States Audit (NEW)

Every loading, empty, error, and stale state must be verified in both themes. This includes:
- LoadingSkeleton variants (text, card, circle, timeline-row, frame-card)
- EmptyState (all usages)
- ErrorState (both severities)
- StaleDataBanner
- OfflineBanner

---

## SECTION 5 — TYPOGRAPHY, SPACING, MOTION

### 5.1 Typography
Keep the current system. Two refinements:
- Add `letter-spacing: -0.01em` to `--text-h1` and `--text-h2`.
- Confirm `font-weight: 500` on labels.

### 5.2 Spacing
No changes.

### 5.3 Radii & Shadows

Radii: no changes.

**Per-theme shadows:**

| Token | Dark | Light |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)` | `0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)` |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2)` | `0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)` |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.5), 0 10px 10px rgba(0,0,0,0.2)` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` |
| `--shadow-tier-1` | `0 0 12px rgba(74,222,128,0.2)` | `0 0 12px rgba(22,163,74,0.15)` |
| `--shadow-tier-2` | `0 0 12px rgba(251,191,36,0.2)` | `0 0 12px rgba(217,119,6,0.15)` |
| `--shadow-tier-3` | `0 0 12px rgba(248,113,113,0.2)` | `0 0 12px rgba(220,38,38,0.15)` |

### 5.4 Motion
- Durations: 150ms micro, 200ms state, 300ms structural, 1.5–4s ambient.
- Easing: `ease-out` for interactive, `ease-in-out`/`linear` for ambient.
- Theme switch: snap instantly (no page transition). Icon button cross-fades its own icon at 150ms.
- All animations respect `prefers-reduced-motion`. See §6.4 for enforcement.

---

## SECTION 6 — ACCESSIBILITY PLAN

### 6.1 Contrast Targets
WCAG 2.1 AA floor. All pairs in §3.4 meet it.

### 6.2 Color Independence
Confirmed: tier system uses icon + label + color in both themes.

### 6.3 Focus Indicators
`outline: 2px solid var(--color-primary); outline-offset: 2px`. `--color-primary` adapts per theme; both values pass 3:1 UI contrast.

### 6.4 Reduced Motion — AUDIT-BASED ENFORCEMENT (REVISED)

Rather than asserting guards exist, run this audit:

1. Grep all CSS files for `animation:` and `@keyframes`.
2. For each match, verify a `@media (prefers-reduced-motion: reduce)` block exists in the same file that disables the animation.
3. **Known gaps** (from the earlier diagnostic report): `LoadingSkeleton`, `LiveIndicator` were missing guards. Confirm these are now fixed.
4. **Additional gaps to check:** Button spinner (`.btn-spinner`), Tier-2 reposition animation in `CascadeStatusFlow`.
5. List every animation and its guard status in a report before Phase 11.

### 6.5 Screen Reader Support
- `.sr-only` in `utilities.css`.
- SR-only tables verified present in all 4 chart components (`TierDonutChart`, `CostComparisonChart`, `ThresholdHistoryChart`, `EscalationPerformanceChart`). **Add if missing** — verify in Phase 7.
- `aria-live="polite"` on DecisionsTimeline.
- `aria-label` on all icon-only buttons.
- `aria-modal="true"` + focus trap in Modal.
- `aria-label` on ThemeToggle updates per theme.

---

## SECTION 7 — MIGRATION STRATEGY

### 7.1 Token Migration
Zero component-CSS edits required for the base theme swap. Only:
- `globals.css`: extract color block into `tokens/_dark.css` + `tokens/_light.css`.
- `main.tsx`: update import order.
- Two known hardcoded-color files: `Header.css`, `CascadeStatusFlow.css`.
- One shadow-related file: `MobileTabBar.css` (verify top shadow uses token).

### 7.2 Migration Order
See roadmap (§8). Order is: tokens → toggle → primitives → domain → composites → layout → charts → pages → accessibility → QA.

### 7.3 Testing Checkpoints
| After Phase | Verify |
|---|---|
| 1a | Dark theme unchanged. Light theme palette applies via DevTools `data-theme` toggle. |
| 1b | No FOWT on first load. OS preference honored. |
| 2 | Toggle works. Persistence across refresh. Header test updated. |
| 3–6 | Primitives/domain/composites/layout render in both themes. Screenshots saved. |
| 7 | All 4 charts render correctly in both themes. Theme switch mid-session updates charts. |
| 8–10 | Full-page screenshots in both themes at 3 breakpoints. |
| 11 | axe-core scan: 0 critical/serious. Keyboard nav works. Reduced-motion verified. |
| 12 | Demo run-through passes in both themes. |

### 7.4 Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Recharts doesn't re-resolve CSS vars on theme switch | **Committed fix** | High | `key={theme}` on `ResponsiveContainer`; charts remount. |
| 2 | `chartHelpers.ts` returns hardcoded hex colors | **Committed fix** | Medium | Change to return `'var(--chart-tier-N)'` strings. |
| 3 | Semi-transparent tier backgrounds render poorly in light mode | **Addressed** | Medium | Light mode uses opaque pastels. |
| 4 | Modal backdrop too dark in light mode | Addressed | Low | Per-theme `--modal-backdrop-opacity`. |
| 5 | Flash of wrong theme on first load | Medium | Medium | Inline script in `index.html`. Test in production build. |
| 6 | Theme toggle breaks keyboard nav | Low | Medium | Standard IconButton with dynamic aria-label. |
| 7 | CascadeStatusFlow glow invisible in light mode | Medium | Low | Per-theme tier-shadow tokens. |
| 8 | `App.css` deletion breaks something | Low | High | Grep all imports and references first. |
| 9 | `--color-text-inverse` used incorrectly somewhere | Medium | Medium | Grep every usage; audit each. |
| 10 | Reduced-motion guard missing somewhere | Medium | Low | Grep-based audit; see §6.4. |
| 11 | A Header test breaks when ThemeToggle is added | Medium | Low | Update test in same phase. |

### 7.5 Rollback Plan

1. **Branch strategy:** All work on `feature/theme-redesign`. `main` retains dark-only design.
2. **Feature flag:** `VITE_ENABLE_THEME_TOGGLE`. When false: `useTheme()` returns `{ theme: 'dark', toggleTheme: noop }`; toggle button does not render; inline script forces dark.
3. **Per-phase revert:** Each phase is a discrete set of file changes; `git revert` is safe per phase.
4. **Token-name preservation:** Reverting token files restores the previous dark-only appearance exactly.

---

## SECTION 8 — IMPLEMENTATION ROADMAP

> **14 phases**, each prompt-sized, each ending in a verification gate.

### Phase 1a — Token files (no runtime changes)

- **Goal:** Create `src/styles/tokens/` files. Extract color block from `globals.css`. Add `utilities.css` with `.sr-only`.
- **Files:** `src/styles/tokens/_primitives.css`, `_dark.css`, `_light.css`, `_shadows.css`, `_index.css`; `src/styles/utilities.css`; `src/styles/globals.css` (edit); `src/main.tsx` (import order).
- **Acceptance:** Dark theme renders unchanged. `data-theme="light"` in DevTools shows light palette.
- **Gate:** Screenshot all 3 pages in dark; save as baseline.

### Phase 1b — Flash-prevention script

- **Goal:** Add inline `<script>` to `index.html`.
- **Files:** `index.html`.
- **Acceptance:** No FOWT on first load in production build. OS preference honored.
- **Gate:** Verify in `npm run build && npm run preview`.

### Phase 2 — Theme toggle + hook

- **Goal:** Build `useTheme()`, `ThemeToggle`, add to Header. Add `THEME_STORAGE_KEY` to `src/constants/theme.ts`.
- **Files:** `src/hooks/useTheme.ts`; `src/components/ui/ThemeToggle.tsx` + `.css`; `src/components/layout/Header.tsx` + `.css`; `src/constants/theme.ts`; Header test.
- **Acceptance:** Toggle works; persists; follows OS on first load.
- **Gate:** Manual click test; refresh test; OS-preference test.

### Phase 3 — Primitives

- **Goal:** Grep-audit primitives for hardcoded colors; fix any found.
- **Files:** `Button.css`, `IconButton.css`, `LoadingSkeleton.css`, `Divider.css`, `Tooltip.css`, `ProgressBar.css`, `MockBadge.css`.
- **Acceptance:** All primitives render correctly in both themes.
- **Gate:** Screenshot audit table.

### Phase 4 — Domain components

- **Goal:** Grep-audit domain components; audit `--color-text-inverse` usage; fix.
- **Files:** `TierBadge.css`, `ActionBadge.css`, `StatusBadge.css`, `ConfidenceBar.css`, `ConfidenceGauge.css`, `MetricCard.css`; `constants/tiers.ts` if needed.
- **Acceptance:** All domain components correct in both themes.
- **Gate:** Screenshot audit table.

### Phase 5 — Composites

- **Goal:** Grep-audit composites; fix backdrop opacity, OfflineBanner text.
- **Files:** `Modal.css`, `Modal.tsx` (if backdrop opacity is inline), `OfflineBanner.css`, other composites.
- **Acceptance:** All composites correct in both themes.
- **Gate:** Screenshot audit table.

### Phase 6 — Layout

- **Goal:** Tokenize Header bg; delete `App.css`; verify MobileTabBar shadow.
- **Files:** `Header.css`, `NavLink.css`, `MobileTabBar.css`, `AppLayout.css`; delete `App.css`; update `App.tsx` import if present.
- **Acceptance:** Layout correct in both themes. `App.css` gone with no side effects.
- **Gate:** Full-page screenshots.

### Phase 7 — Charts

- **Goal:** Force remount via `key={theme}`. Change `chartHelpers.ts` to return CSS-var strings. Verify all 4 charts.
- **Files:** 4 chart components; `src/utils/chartHelpers.ts`; `src/constants/chart.ts` if needed.
- **Acceptance:** All 4 charts render correct colors in both themes. Theme switch mid-session updates them. SR-only tables present in all 4.
- **Gate:** Screenshot each chart in both themes.

### Phase 8 — Dashboard page

- **Goal:** Full visual verification of Dashboard. Fix any hardcoded colors found.
- **Files:** Feature components under `src/features/dashboard/`.
- **Acceptance:** Dashboard correct in both themes at 1280/768/390.
- **Gate:** Screenshot at 3 breakpoints × 2 themes.

### Phase 9 — Frames page

- **Goal:** Full visual verification of Frames History.
- **Files:** Feature components under `src/features/frames/`.
- **Acceptance:** Frames correct in both themes at 3 breakpoints.
- **Gate:** Screenshot matrix.

### Phase 10 — Analytics page

- **Goal:** Full visual verification of Analytics.
- **Files:** Feature components under `src/features/analytics/`.
- **Acceptance:** Analytics correct in both themes.
- **Gate:** Screenshot matrix.

### Phase 11 — Accessibility sweep

- **Goal:** Reduced-motion audit (§6.4). Contrast re-verification. axe-core scan in both themes. Keyboard nav walkthrough.
- **Files:** Any CSS missing reduced-motion guards.
- **Acceptance:** 0 critical/serious axe violations. All animations have guards.
- **Gate:** Report with per-animation guard status.

### Phase 12 — Demo run-through

- **Goal:** Full competition demo in both themes.
- **Checklist:**
  - [ ] Dashboard loads with populated data (both themes)
  - [ ] Cost counter increments (if DEMO_MODE on)
  - [ ] Timeline shows events; clicking opens modal (both themes)
  - [ ] Cascade flow renders (both themes)
  - [ ] Frames page populated; filters work (both themes)
  - [ ] Analytics charts render; tooltips work (both themes)
  - [ ] Theme toggle works; no FOWT on refresh
  - [ ] No layout thrashing on theme switch
  - [ ] `npm run typecheck` passes
  - [ ] `npm run test -- --run` passes (26+ tests)
  - [ ] `npm run build` completes
- **Acceptance:** Every item passes.
- **Gate:** Demo-ready sign-off.

---

## SECTION 9 — OPEN QUESTIONS

| # | Question | Recommended Answer |
|---|---|---|
| 1 | Default theme on first load? | Follow OS preference |
| 2 | Toggle control style? | Sun/moon icon button |
| 3 | Keep indigo primary? | Yes |
| 4 | Tier colors shift in light mode? | Yes — darker variants |
| 5 | Redesign Header layout? | No |
| 6 | Redesign mobile tab bar? | No |
| 7 | Animate theme switch? | No — snap |
| 8 | Delete `App.css` now or later? | Phase 6 |
| 9 | Dark-mode primary: `#6366f1` or `#818cf8`? | `#818cf8` in dark |
| 10 | Three-way theme toggle? | Defer |

---

## SECTION 10 — OUT OF SCOPE

- No new pages, features, or dependencies.
- No backend integration changes.
- No data layer changes.
- No information architecture changes.
- No mobile-first redesign.
- No performance optimization pass.
- No animation redesign beyond reduced-motion guards.
- No test rewrite beyond Header test update in Phase 2.