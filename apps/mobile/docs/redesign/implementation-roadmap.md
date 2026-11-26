# Implementation roadmap — Finance Flow redesign

Status legend: `[done]`, `[pending]`, `[blocked]`. Dates are omitted; order is the commit order. The v2 *Caja Fuerte* pass supersedes the visual decisions of phases 1–6; those phases remain as completion history.

## Phase 0 — Discovery and contract lock `[done]`

- Full mobile + backend inspection (see `audit.md`).
- OpenAPI located in `apps/backend/src/main.ts` → `/api/json` in non-production; no static spec file.
- Baseline `npx tsc --noEmit`: clean. No test/lint harness.
- Skills loaded: frontend-design, accessibility, seo, react-best-practices, expo-data-fetching, design-mobile-apps, composition-patterns, typescript-advanced-types, context7-mcp.
- Outputs: `audit.md`, `design-direction.md`, `design-system.md`, this roadmap.

Acceptance: API contract documented, no invented endpoints, no source files modified during audit.

## Phase 1 — Tokens and foundations `[done]`

Files: `src/theme/colors.ts`, `typography.ts`, `spacing.ts`, `theme/index.ts`, `context/ThemeContext.tsx`.

Actions:
1. Replace palette values with Caja Fuerte while preserving every `ThemeColors` key and `getThemeColors`/`getSystemThemeMode` exports.
2. Retune typography, enable tabular numerals for values, add `maxFontSizeMultiplier` guidance.
3. Export responsive/radius/motion tokens from the theme index.
4. Keep theme persistence via SecureStore unchanged.

Validation: `npx tsc --noEmit`; grep for hard-coded hex colours in `src/` after migration; contrast check on the six role colours.

## Phase 2 — Shared components and primitives `[done]`

Files: `GlassCard`, `GradientHeader`, `GradientButton`, `Input`, `FocusFadeIn`, `TabBarIcon`, `StatusBadge`, `ScreenLayout`, new `StatePanel`, hooks `useReducedMotion`, `useResponsiveLayout`.

Actions:
- De-gradient/de-glass the shared components without changing exported props.
- Add 44dp targets, focus rings, live regions, reduced-motion and font-scale handling.
- Add responsive `maxWidth` and `NavRail` for wide screens.
- Centralise loading/empty/error states.

Validation: tsc; spot-check every import site from the grep map; web/native platform build check; a11y annotation scan.

## Phase 3 — Navigation and shell `[done]`

Files: `RootNavigator.tsx`, `MainTabNavigator.tsx`, `App.tsx`, `public/index.html`, `manifest.json`.

Actions:
- Keep auth gating, deep links and the single `deliverSharedImage()` gate untouched.
- Swap bottom tabs for a rail at ≥1024dp (web/tablet), keep native bottom bar, keep Add sheet.
- Set noindex robots meta + colour-scheme; keep share_target and SW flow intact.
- Preserve font-loading gate and provider order.

Validation: route table diff against Phase 0; deep-link smoke checks; share-intent gating review; web HTML metadata check.

## Phase 4 — Priority screens `[done]`

Order: Home → Transactions/Detail/Add → Auth (Login/Register/Forgot/Reset) → Wallets/Categories → Debts/Contacts/Detail → Chat/Scanner/Profile/Exports.

Actions per screen:
- Replace inline gradient/glass styling with tokens and shared components.
- Apply the ledger spine: balance/total first, hairline divider, actions, then list.
- Wire `StatePanel` for loading/empty/error; keep all API params and focus-refetch behaviour.
- Add/verify roles, labels, states, hints, live regions and 44dp targets.

Validation per module: tsc, route/API diff, loading-empty-error review, a11y scan, reduced-motion check, native/web review of the changed screen.

## Phase 5 — Performance, accessibility and SEO pass `[done]`

- Confirm memoization, FlashList `getItemType`, stable callbacks and Maps remain intact after visual edits.
- Automated contrast check of final token pairs; keyboard traversal on web; TalkBack/VoiceOver label review.
- Verify no user/financial data in static HTML metadata; noindex present; no sitemap/OG pages.
- Core Web Vitals: document that no production web analytics exist; measure locally with build preview if tooling is available, otherwise state as a limitation.

## Phase 6 — Validation and report `[done]`

- Final `npx tsc --noEmit`.
- Backend contract re-check (no endpoint/DTO changed by the client redesign).
- `git diff --stat` review; ensure no secrets, no generated `android/`/`dist/` churn, no unrequested dependencies.
- Write `docs/redesign/final-report.md` with changes, validation evidence, known limitations and follow-ups.

## V2 — Caja Fuerte `[done]`

Trigger: the user rejected the first direction as obsolete and asked for real skeletons, a genuinely new idea, richer icons, more motion and more visual weight.

- [done] V2.1 Tokens: graphite/sage canvas, orange signal, mint/coral/blue bands, `strokeWidth` (`thin/medium/thick`), 42px heavy display type, motion and skeleton tokens. All legacy keys preserved.
- [done] V2.2 Primitives: `Glyph` (weighted icon plate with notch/badge/active rotation), `Dial`, `CountUp`, `BalanceHero`, `Skeleton` family (block/line/circle/rows/balance/screen).
- [done] V2.3 Weight pass: every hairline border in `src/**` replaced by a 2px structural stroke; panels use 3px boundaries; header plates, cards, chips, avatars and tab icons are heavier.
- [done] V2.4 Skeletons: shaped loading states on Inicio, Movimientos (initial + pagination), Carteras, Categorías, Deudas, Detalle de deuda/contacto, Contactos, Chat, Escáner y permisos de cámara. Loading is distinct from empty everywhere.
- [done] V2.5 Motion: balance dial + count-up, focus rise, press springs, Add shutter rotation, shimmer, chat dots; all gated by `useReducedMotion()`.
- [done] V2.6 Navigation/web: weighted tab plates, Add plate, mechanical rail, thicker tab bar, `theme-color` updated to `#101516` (later realigned to logo navy `#0B1326`); noindex and share flow unchanged.
- [done] V2.7 Validation: `npx tsc --noEmit`; all-platform Expo export; contrast recomputation; contract/route/endpoint diff; no new dependencies.

Validation: tsc clean, web/iOS/Android export successful, no hard-coded colours in screens, contrast pairs ≥5.18:1.

## Performance + SEO hygiene `[done]`

Trigger: the user approved the Caja Fuerte design and asked for performance/SEO improvements after "calificaciones regulares". The design is treated as fixed.

- [done] Native fonts reduced to the three faces referenced by `typography.ts`; web skips font loading entirely because it uses `System`.
- [done] Native splash handoff: prevent auto-hide at module scope, hide once fonts + auth hydration settle; font failure can no longer trap the loading state.
- [done] Direct `Ionicons` subpath imports across 31 files; web main bundle ~1.83 MB → ~1.5 MB.
- [done] Memoized auth and alert context values; signed-out bootstrap skips refresh-token read.
- [done] Transactions summary fetched in parallel with list; explicit filter override presence fixes stale filters on clear.
- [done] Chat auto-scroll flag, debounced/sequenced contact search, web blob URL revocation in scanner/share handler.
- [done] `robots.txt` (`Disallow: /`), single injected description/theme-color, `sw.js` `/api/` bypass, nginx immutable caching for hashed assets.
- [done] Web-only lazy route chunks (`lazyScreens.web.tsx`); native keeps eager screens. Main JS 1,548 KB → ~1,000 KB; local Lighthouse 67 → 72, TBT 260 ms → 120 ms, unused JS 788 KiB → 584 KiB.
- [done] Theme persistence: web `localStorage` adapter + pre-paint inline script; native `SecureStore` unchanged and splash gated on `isHydrated`. Headless Chrome reload verified `data-theme="light"` and light palette.
- [done] Amount-form hardening: fixed `$` prefix, `minWidth: 0`, focus-border compensation, narrow-phone type tokens and `KeyboardAvoidingView` in expense/earning/debt forms.
- [done] Validation: `tsc --noEmit`, all-platform Expo export, 50/50 API identifiers, `git diff --check`.

Deferred deliberately: tab-focus stale-time caching (data-freshness risk) and any indexable SEO content (conflicts with the private authenticated posture; SEO's only failing audit is `is-crawlable`).

## Skeleton alignment `[done]`

Trigger: the user reported that skeletons were displaced and did not respect the real app's size, shape, location or colour. No design token or loaded screen was changed.

- [done] `Skeleton.tsx`: `SkeletonLine` now forwards `radius`, shimmer uses `motion.shimmer`, and named primitives reproduce the loaded `BalanceHero` dial/rule/meter/legend, semantic transaction/debt cards, wallet plates, category rows/summary, movement rows, chat bubbles, contact cards/profile and detail headers/bodies.
- [done] Line heights and plates follow `typography` and `layout` tokens (18/16/22/48 px instead of generic 11–16 px bars); frames use `strokeWidth`, `borderRadius`, `surfaceContainerHigh` and error/success/primary borders from `useTheme()`.
- [done] Screen call sites reserve the loaded slots: Home hero/debts/recent transactions, Transactions footer/total/initial list, Debts summary/list, Wallets balance/cards/movements, Categories summary/rows, Chat bubbles, Scanner dual actions/header, Contacts initial/search rows, ContactDetail and DebtDetail/TransactionDetail chrome. Categories rows now appear below “Mis Categorías” and empty states are suppressed while loading.
- [done] `StatePanel` loading no longer adds the empty/error reading-width padding; web lazy fallbacks are route-shaped instead of one list.
- [done] Validation: `npx tsc --noEmit`, all-platform `expo export --platform all` (`finance-flow-v2-export-10`), `git diff --check`, 50/50 `*Api.*` identifiers and 16/16 route names. Final local Lighthouse: performance 70, SEO 63, CLS 0.01, TBT 200 ms. Visual screenshot diff remains blocked by the absence of a connected device.

## Guardrails (all phases)

- Do not touch backend, DTOs, financial calculations, auth/storage logic or the central share-image gate.
- Do not add dependencies or migrate navigation libraries.
- Do not invent placeholders, fake balances or demo users.
- After any `app.json` share-intent change: `npx expo prebuild --clean` then `npx expo run:android` (per `AGENTS.md`).
- Preserve Spanish copy and the existing route names/params.
