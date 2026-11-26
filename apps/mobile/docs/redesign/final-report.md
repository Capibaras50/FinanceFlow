# Final report — Finance Flow redesign v2 (Caja Fuerte)

Date: 2026-11-25. Scope: `apps/mobile` (Android, iOS, web/PWA), root web-server config and the five documents in `docs/redesign/`. The NestJS backend, shared packages, package manifests and lockfiles were left unchanged. The share-intent *flow* is unchanged; only its web object-URL cleanup and the service worker's same-origin `/api/` guard were hardened.

## 1. Outcome

The first redesign (*Tinta y Cobre*) was rejected by the user as obsolete: too quiet, hairline-led, without real skeletons, insufficiently rich icons and movement. This pass replaces it with **Caja Fuerte**, a strongbox system: graphite/sage panels with 2–3px strokes, safety-orange signal, mint/coral/blue semantic bands, heavy Outfit numerals, weighted `Glyph` plates, shaped skeleton loading states and mechanical motion (dial, shutter, press, stamp).

It is a **system replacement, not a feature rewrite**: routes, params, endpoint calls, auth/storage, financial calculations and Spanish copy are preserved. Nothing was committed or pushed; the work stays uncommitted on `desing/frontend`.

The Caja Fuerte change set was **45 modified tracked files** (`4,451` insertions, `2,760` deletions), **12 new source files** and **5 design documents**. The later performance/SEO hygiene pass added targeted startup, bundle, context, list and cache fixes without changing any visual token or component.

## 2. What changed

### Tokens and foundations

- `src/theme/colors.ts`: complete dark/light Caja Fuerte palette. Every pre-existing `ThemeColors` key is retained; new keys are `primarySolid`, `onPrimarySolid`, `stroke`, `strokeStrong`, `skeletonBase`, `skeletonShine` and a single `scrim`. Legacy `gradient` arrays remain as identical-stop compatibility values with no call sites.
- `src/theme/typography.ts`: Outfit 700 for figures/headings/labels (display up to 42/48, tabular), Inter 500/400 for reading, `maxFontSizeMultiplier: 1.35` on large figures.
- `src/theme/spacing.ts` + `src/theme/outlineColor.ts`: 4px rhythm, `contentMaxWidth 1120`, `readingMaxWidth 720`, `wideBreakpoint 1024`, `touchTarget 44`, `strokeWidth thin/medium/thick`, motion and skeleton tokens, web focus-ring helper.
- `src/theme/index.ts`: exports the new tokens without removing existing exports.

### New primitives (v2)

| Primitive | Role |
|---|---|
| `Skeleton` | Block/line/circle/rows/balance/screen placeholders with shimmer gated by reduced motion; decorative shapes hidden from assistive tech. |
| `Glyph` | Ionicons glyph on a rounded metal plate with notch/badge and optional active rotation; replaces naked 20px icons in headers, actions, cards and auth marks. |
| `Dial` + `CountUp` | Mechanical dial and one-time count-up for the real balance; static final state with reduced motion. |
| `BalanceHero` | The single orchestrated Home panel: heavy balance, dial, thick rule, income/expense meter. |
| `StatePanel` | Centralised loading/empty/error presentation with `rows`, `balance`, `card` and `plain` skeleton variants and `Glyph` plates for empty/error. |

`useReducedMotion` handles `prefers-reduced-motion` on web and `AccessibilityInfo` on native; `useResponsiveLayout` drives the wide/narrow decision point. `NavRail` supplies left navigation at ≥1024dp; phones retain bottom tabs.

### Shared components

`GlassCard`, `GradientHeader`, `GradientButton`, `Input`, `FocusFadeIn`, `TabBarIcon`, `StatusBadge`, `ScreenLayout`, `Avatar`, `CategoryChip`, `ContactCard`, `DebtCard`, `TransactionCard`, `DateTimePickerModal`, `Snackbar` and `AppAlert` were re-skinned as weighted panels: 2px default / 3px structural strokes, solid fills, 56dp inputs/buttons, press springs, 44dp targets, roles/labels/states/hints, visible web focus rings and reduced-motion fallbacks. All original exported names and prop shapes remain.

### Navigation, shell and web metadata

- `MainTabNavigator.tsx`: solid 60px Add plate that turns 45° on press; bottom sheet slides in like a shutter; weighted tab plates and a 3px top stroke; `NavRail` on wide screens. Route names and targets are unchanged.
- `RootNavigator.tsx`: weighted splash dial; the single `deliverSharedImage()` gate and auth/deeplink logic are untouched. `NavigationContainer` now receives a theme built from Caja Fuerte tokens so cards and the canvas behind transitions use `colors.background` instead of React Navigation's default white sheet.
- `App.tsx`: font-loading state uses a thick framed mark with the `Dial` and a live label; no skeleton is shown while no data is being fetched.
- `public/index.html`: `noindex, nofollow, noarchive, nosnippet` for generic and Google crawlers, `color-scheme: dark light`, `theme-color: #101516`, Spanish `noscript`. No canonical public URL, sitemap, OG pages or structured data.
- `public/manifest.json`: theme/background `#101516`; `share_target` and icons unchanged.

### Screens

| Area | Main visual change | Behaviour retained |
|---|---|---|
| Home | `BalanceHero` with dial/count-up; `SkeletonBalance` + `SkeletonRows` on first load; `Glyph` quick actions, notification badge and debt slot | Same five parallel API calls, `loadDataRef`/`useFocusEffect`, debt totals, merged/sorted transactions, navigation |
| Transactions (list, detail, add expense/earning) | Weighted header plate, skeleton rows on initial load, compact spinner for pagination, heavier signed amounts and filter sheet | `PAGE_SIZE` 10, filters/sort, single-pass grouping, `walletsById` Map, FlashList `getItemType` and `${type}-${id}` keys, long-press delete, DTOs |
| Wallets / Categories | Shaped skeletons for total, wallet cards and breakdown; `Glyph` wallet/app plates; thick segmented filters | Tap-to-edit, long-press delete, CRUD modals, balance calculations, FlashList, `PAGE_SIZE` 100, dedupe and `totalsByCategory` Map |
| Debts / Contacts / Detail | Skeleton rows/cards during load, `Glyph` header plates, heavier chips and signed rows | Bidirectional debt logic, payments, ImagePicker, contact requests, `relatedProfileIds` Set, debt totals, prefilled AddDebt navigation |
| Chat / Scanner | Chat-bubble skeletons while fetching, typing dots, busy buttons during upload, camera-permission spinner, solid confirm panel | FlashList retry scrolling, 50-message load/reverse, markdown, compression constants, `consumePendingSharedImage()`, 413 handling |
| Auth / Profile / Exports | Strongbox logo plates on login/recover, 3px framed inputs and buttons, thick menu rows and report chips | Validation, password rules, Google login, reset flow, pending-receipt notice, avatar upload, theme toggle, UTC report bounds |

A later refinement applies one ledger colour code across Movimientos and Categorías: **expenses red (`colors.error`) and earnings green (`colors.success`)**. Transaction cards carry a 3px semantic frame, the Gastos/Ingresos tabs and totals use the same tokens, and category rows, breakdown bars and type selectors follow the code. Selected states add a tinted container, thicker border and checkmark; user-defined category colours remain as small markers. Accessibility labels already include "gasto"/"ingreso", so the distinction is not colour-only.

Shaped skeletons are reserved for blank-page waits that present real data structures. Short or indeterminate waits (font boot, permission request, contact search, pagination, upload confirmation, web route chunks) use a spinner or the existing action button on a themed surface; no skeleton is placed inside controls. The shimmer tops out at `0.36` opacity so a shine never becomes a white flash.

## 3. Contract preservation

| Check | Evidence |
|---|---|
| Endpoints | Unique `*Api.*` identifiers compared against `HEAD`: **50 → 50**, zero added and zero removed. No file under `src/services/` was modified. |
| Routes/params | The five tab routes and 14 stack screens keep their names; all `navigate('...')` targets and `route.params.*` accesses are unchanged. |
| Theme API | All original `ThemeColors` keys remain; `ThemeColors` is still derived from the dark palette. `getThemeColors`, `getSystemThemeMode`, palettes and provider order are unchanged. |
| Data loading | `useCallback` + `loadDataRef` + `useFocusEffect` discipline retained; loading skeletons only replace the *presentation* of the wait, not the fetch logic or filters. |
| Auth/storage | JWT/cookie handling, SecureStore keys, refresh/rotation, guards and provider order are unchanged. Bootstrap now skips the refresh-token read for signed-out users, and the context value is memoized. |
| Share intent | `share_target`, `sharedImage.ts`, native handler and the single delivery gate are unchanged. Web handler now revokes its blob URL, scanner revokes replaced previews, and `sw.js` never caches same-origin `/api/` requests. `app.json` web metadata only (no plugin/intent-filter change). |
| Backend | Zero modified files under `apps/backend`; the contract discrepancies in `audit.md` §3 are intentionally preserved. |
| Dependencies | Zero changes to `package.json`, `pnpm-lock.yaml` or any workspace manifest; no migration to Expo Router or Reanimated usage added. |
| Content | No `Lorem`, `mock`, `fake`, `dummy` or `TODO/FIXME` strings in `src/**/*.tsx`; no user or financial data in static metadata. |

## 4. Validation evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (`apps/mobile`) | **Pass**, no errors (after fixing `TextInput` error-announcement typing via `accessibilityHint`). |
| `npx expo export --platform all` | **Pass** — web 913 modules, iOS 1130, Android 1123; 40 assets; no platform resolution errors. Web main chunk is ~1.5 MB plus a 45 KB chunk (down from ~1.83 MB + 45 KB before icon-path pruning). |
| Static colour scan (`src/**/*.tsx`) | **Pass** — no `LinearGradient`, hex literal, `rgba()` literal or hairline/border-width-1 declaration remains; colours come from `useTheme()` tokens. |
| `git diff --check` | **Pass** — no whitespace errors; Windows LF→CRLF normalisation warnings only. |
| Accessibility annotation scan | Roles, labels, states, hints, live regions and `hitSlop` retained/increased across the v2 pass; decorative glyphs and skeletons hidden from assistive tech; loading regions announced politely. |
| Contrast computation | All documented text pairs exceed 4.5:1 in both themes; lowest is text-on-solid-action at `5.18:1`. Full table in `design-system.md`. |
| Reduced motion | `useReducedMotion` is read by `FocusFadeIn`, `TabBarIcon`, `Glyph`, `Skeleton`, `CountUp`, `Dial`, `BalanceHero`, `RootNavigator`, `MainTabNavigator`, `App.tsx`, `Snackbar`, `AppAlert`, `DateTimePickerModal` and the chat typing indicator. |
| SEO privacy | `noindex`/`nofollow`/`noarchive`/`nosnippet` present for generic and Google crawlers; root `robots.txt` disallows all crawlers; no sitemap, OG tags, canonical, structured data or user data in static HTML. Lighthouse SEO remains intentionally capped by `noindex`. |
| Module review | Every screen group was typechecked and reviewed for API/route diffs, skeleton/empty/error states, a11y semantics, reduced motion and responsive width limits after its edits. |
| Test/lint harness | None exists in `apps/mobile`; `tsc` and the Expo exports are the automated gates available. |

### Contrast summary (v2)

| Pair | Dark | Light |
|---|---:|---:|
| Primary text on panel | 14.97:1 | 18.16:1 |
| Muted text on panel | 8.00:1 | 6.57:1 |
| Signal text on panel | 6.93:1 | 5.46:1 |
| Text on solid action | 6.62:1 | 5.18:1 |
| Mint on panel | 9.87:1 | 6.21:1 |
| Coral on panel | 6.84:1 | 6.41:1 |
| Blue on panel | 7.06:1 | 6.78:1 |

Semantic state is never colour-only: amounts carry sign + icon + text, chips carry Spanish labels, and selection/focus carry `accessibilityState`.

## 4b. Performance and SEO hygiene pass (post-approval)

The approved Caja Fuerte design was treated as fixed. Performance/SEO changes affect startup, network, render churn and technical metadata. A later bug-fix round repaired web theme persistence and narrow-phone amount inputs without changing tokens, copy or screen structure.

| Area | Change | Evidence / impact |
|---|---|---|
| Font startup | `App.tsx` uses platform-specific `useAppFonts`: native loads only `Outfit_700Bold`, `Inter_400Regular`, `Inter_500Medium` via individual package subpaths; web resolves to a no-op hook and renders immediately with `System`. Font errors no longer trap the loading screen. | Emitted font assets dropped from 27 files (~6.7 MB) to 3 files (~740 KB). Web no longer downloads/gates on ~1.6 MB of unused TTFs. |
| Native splash | `index.ts` imports a native-only splash module that calls `preventAutoHideAsync()` at module scope; `App.tsx` hides it once fonts and auth hydration settle. | Removes native-splash → custom-splash flash; avoids a second loading screen. |
| Icon bundle | All 31 `Ionicons` imports moved from the `@expo/vector-icons` barrel to `@expo/vector-icons/Ionicons`. Type-only glyph names updated too. | Web main bundle dropped from ~1.83 MB to ~1.5 MB; only the Ionicons font/glyph map is emitted instead of 19 families. |
| Auth context | `useAuthProvider()` memoizes the context value; signed-out native bootstrap skips `getRefreshToken()`. | Fewer re-renders across all `useAuth()` consumers; one less SecureStore read for logged-out users. |
| Transactions | `getSummary()` now starts in parallel with the list request; filter overrides use property presence so `undefined` can clear a filter. Removed network RTT per focus/tab switch and fixed stale-filter refetch after “Limpiar filtros”. | Same endpoints and DTOs; one less sequential request and correct totals after clearing filters. |
| Chat | Scroll-to-bottom now marks success once instead of re-arming up to ten timers per message; a new sent message resets the flag. | Less layout/scroll work; users are no longer yanked down while reading history. |
| Contacts | Profile search is debounced 300 ms with a request id; stale responses are discarded. | Fewer API calls and no out-of-order results while typing. |
| Scanner / share | Web blob URLs are revoked when replaced, cancelled, uploaded or on unmount; the PWA share handler revokes its own URL after handoff. | No memory growth from repeated receipt previews; share delivery path unchanged. |
| Web head | Description/theme-color injected once from `app.json` (aligned to `#101516`); added root `robots.txt` with `Disallow: /`; `sw.js` bypasses same-origin `/api/`; nginx adds immutable caching for hashed assets and `no-cache` for shell/SW. | Clean single metadata tags, crawler defence in depth, no authenticated API caching, faster repeat loads. |
| Provider churn | `AppAlert` context value memoized. | Small reduction in re-renders while the alert modal mounts. |
| Route chunks | `lazyScreens.tsx` / `lazyScreens.web.tsx`: login, Home and the navigator shell stay eager; all other stack and tab screens are web-only async imports. Native still re-exports eager screens. Web fallbacks are route-shaped (form, list, detail, chat, scanner, categories, debts), not one generic list; `withSuspense` wraps each in `colors.background` so a code-split route never exposes a white canvas. | Expo export emits 21 web chunks: main 1,548 KB → ~1.0–1.1 MB, shared chunk 168 KB; local Lighthouse route-split run 67 → 72 (later reruns 69–72), TBT 110–230 ms, unused JS 584–609 KiB. Route names, params, deep links and share delivery are unchanged. |
| Skeleton alignment | `Skeleton.tsx` now forwards `radius`, shimmers with `motion.shimmer`, and exposes named shapes that reuse the loaded components' frames, strokes, icon plates, line heights, meters, bubbles and action rows. Call sites in Home, Movimientos, Carteras, Categorías, Deudas, Contactos, Detalles, Chat y Escáner reserve the same slots as the loaded UI; Categories rows sit below “Mis Categorías” and Caja Fuerte semantic borders stay error/success. `StatePanel` no longer adds reading-width padding to loading shapes. A later correction removed skeletons from non-data waits (boot, camera permission, contact search, pagination, upload buttons) and capped the shimmer at `0.36` opacity. | Loading no longer swaps the hero for a shorter generic card or replaces two action buttons with one block. Spanish loading labels and WCAG live regions are unchanged. No device was attached, so this is a structural/token match verified by code, tsc and all-platform export, not a pixel screenshot diff. |
| Theme persistence | `themeStorage` platform adapter: web uses `localStorage` and reads it synchronously before React renders; native keeps `SecureStore`. An inline head script applies the same key before first paint and updates `theme-color`. `ThemeContext` exposes `isHydrated`, and the native splash now waits for it. | Headless Chrome reload with `finance_flow_theme=light` now emits `<html data-theme="light">` and light palette (`rgb(233,239,236)`) before hydration. Native Keychain path is unchanged and no longer flashes dark after splash; no device was attached for a smoke test. |
| Amount forms | Fixed-width non-shrinking `$` prefix, `minWidth: 0` input, focus-border compensation in shared `Input`; expense/earning/debt amounts drop from 30/42 px to 22 px below 380 dp. `KeyboardAvoidingView` (iOS) and safe-area bottom padding applied to the three forms. | Long currency values no longer clip or visually shift on 320–375 dp phones; desktop/PWA uses the same headline tokens as before. Spanish labels and `decimal-pad` remain. |

Intentionally **not** changed: route names/params, endpoint set (50 unique `*Api.*` identifiers identical to `HEAD`), auth/storage semantics, financial calculations, Spanish copy, Caja Fuerte tokens, spacing, screens, `share_target`, native share plugin config, backend, dependencies or lockfiles. Stale-time caching on tab focus was evaluated but deferred because it risks showing outdated balances; indexable SEO content was rejected because it conflicts with the private-app posture.

## 5. Repository hygiene

- No generated `dist/`, `android/`, `ios/` or lockfile churn was added to the repo; the export was written to the approved temp directory.
- No backend, DTO, secret or `.env` file was read into client code or docs.
- Untracked local tooling artifacts `.agents/` and `skills-lock.json` were created by the skill harness, not by the application redesign; they can be ignored or removed before committing.
- The five required documents exist under `apps/mobile/docs/redesign/`: `audit.md`, `design-direction.md`, `design-system.md`, `implementation-roadmap.md`, `final-report.md`.

## 6. Limitations and follow-ups

1. **Manual assistive-technology review is still required.** Static annotation coverage and token contrast are verified, but TalkBack/VoiceOver, keyboard traversal and 200% font-scale walkthroughs were not run here. Treat WCAG 2.2 AA as the design target, not a completed certification.
2. **No device smoke test was run.** The Android/iOS JS bundles compile, but the share-to-receipt flow, camera permissions, native splash timing and Google login should be exercised on a device. Only `app.json` web metadata changed — the share plugin/intent filters did not — so `expo prebuild --clean` is not required for this pass.
3. **Lighthouse was run against a local static export, not production.** Best route-split run: performance 67 → 72; final skeleton-aligned export (`finance-flow-v2-export-10`): performance 70, SEO 63, FCP 0.6 s, LCP 9.9 s, CLS 0.01, TBT 200 ms, Speed Index 4.0 s, unused JS 609 KiB. SEO's only remaining failure is `is-crawlable`, which is the intentional `noindex`; the app has no analytics/CWV baseline. The Python test server does not emit nginx cache headers, so its cache audit is not representative of the deployed config.
4. **Backend contract discrepancies remain.** See `audit.md` §3; they were deliberately not “fixed” from the client. `sortBy='createdAt'` still falls back to default ordering and should be handled in a separate, contract-owned change.
5. **Web fonts intentionally fall back to `System`.** Only the three referenced native faces are bundled; adding web font files would be a separate, design-visible decision.

## 7. Final status

The v2 Caja Fuerte design is complete and unchanged. TypeScript is clean, all three platforms export successfully, the endpoint set and route map are unchanged, and no dependency, backend, auth/storage semantic, share-flow or financial-calculation change was introduced. The later performance/SEO pass only removes waste and hardens technical metadata; the skeleton pass aligns loading shapes with the approved UI and then restricts them to real data waits, with a themed navigation canvas and a subdued shimmer to remove white flashes. The work remains uncommitted on `desing/frontend`.
