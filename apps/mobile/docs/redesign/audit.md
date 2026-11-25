# Redesign audit — Finance Flow

Date: 2026-11-25. Scope: `apps/mobile` (Android, iOS, web/PWA), its shared packages (`packages/api-client`, `packages/shared-types`) and the NestJS backend in `apps/backend` as the API source of truth. This is a read-only audit; no application source was changed to produce it.

## 1. Method and sources

- Inspected every file under `apps/mobile/src` (21 screens, 15 UI components, 2 layouts, 2 share handlers, 3 navigation files, theme/context/hooks/services/utils), the root entry points, Expo/native/web config, `public/` assets and the workspace package scripts.
- Inspected all 12 backend controllers, DTOs, entities, guards, auth flow, error handling and bootstrap.
- Used the **generated OpenAPI document** as the contract source, not assumptions: `DocumentBuilder`/`SwaggerModule` in `apps/backend/src/main.ts`.
- Ran `npx tsc --noEmit` in `apps/mobile`: **clean baseline**.
- No tests, lint config or test/lint/typecheck scripts exist in the mobile app; backend has Jest configured but zero specs.

## 2. Stack and constraints

| Area | Current |
|---|---|
| SDK | Expo `~56.0.15`, React Native `0.85.3`, React/React DOM `19.2.3`, `react-native-web ^0.21.2` |
| Navigation | React Navigation 7 (`@react-navigation/native`, `native-stack`, `bottom-tabs`), **not** Expo Router; no `app/` directory |
| Lists | `@shopify/flash-list 2.0.2` in Transactions, Categories and Chat |
| Animations | RN `Animated` + `react-native-reanimated ~4.3.1` installed; `FocusFadeIn` and tab icon use `Animated.spring` |
| Auth | JWT + httpOnly cookies; web uses `withCredentials`, native uses SecureStore tokens with axios refresh/rotation |
| Fonts | Outfit + Inter already bundled and loaded in `App.tsx` before navigation renders |
| Web | `public/index.html`, `manifest.json`, `sw.js`; single-page output, lang `es`, dark theme colour |
| Tests | None in mobile; no lint/typecheck scripts; `tsc --noEmit` is the only automated gate today |
| Notable plugin | `expo-share-intent ^7` (SDK 56 line; v8 requires SDK 57). Native share requires `expo prebuild --clean` after any `app.json` plugin change |

## 3. API source of truth

Swagger is present but environment-gated:

- `apps/backend/src/main.ts` builds the document with title *Finance Flow API*, version `1.0`, bearer/cookie/OAuth2 (Google) security schemes.
- UI: `http://localhost:3001/api`; JSON: `http://localhost:3001/api/json` (dev only: `NODE_ENV !== 'production'`). No global API prefix; `/api` is only Swagger (Docker Nginx adds `/api/` in production).
- There is **no static `openapi.json`/`swagger.yaml`** in the repo. The README endpoint table is stale and still lists interactive docs as a roadmap item; the generated document is authoritative.
- The local `.env` files contain real-looking secrets. They must not be read into client code, docs or screenshots.

67 endpoints across 12 controllers were catalogued: auth (8), users (9), categories (6), wallets (7), expenses (5), earnings (5), transactions (2), receipts (5), debts (7), contacts (9), chat (3), exports (2). The shared API client covers all of them. Confirmed client↔contract matches include filter params (`category`, `wallet`, `name`, `sortBy`, `sortOrder`, `page`, `limit`), camelCase wallet balances, debt enums and multipart uploads.

### Contract discrepancies to preserve or document (do not silently “fix” in the client)

1. `DELETE /expenses/:id` returns `200` + numeric id, although Swagger declares `204`.
2. `GET /wallets/balance/:id` returns a **one-element array**, Swagger documents an object.
3. `GET /contacts/pending/received/count` returns `{count}`, Swagger declares `[Contact]`.
4. `FilterTransactionDto.sortBy='createdAt'` is accepted by validation but the SQL whitelist uses `created_at`, so it falls back to default ordering. The UI currently sends `createdAt`; keep the value but do not promise a behaviour the backend does not deliver.
5. `wallets`, `categories` and `receipts` hardcode `skip = (page-1)*10` regardless of `limit`.
6. Some service catch blocks rewrap `NotFoundException` as `BadRequestException` (404 → 400).
7. Errors use NestJS default shape `{statusCode, message: string|string[], error}`; no custom exception filter. ValidationPipe uses `whitelist: true, forbidNonWhitelisted: true` — extra query/body fields cause 400.
8. Global throttle 60/min; login & forgot-password 5/min; chat 10/10 min. UI should surface 429 clearly.

## 4. Product and UX findings

### Strengths

- Feature-complete: expenses/earnings CRUD, wallets, categories with breakdown, debts (bidirectional contact debts + payment with receipt), contacts, receipt scanner (native camera + web file + share intent), AI chat with markdown, XLSX exports, theme toggle.
- Data loading is already disciplined in most screens: `useCallback` + `loadDataRef` + `useFocusEffect`, `Promise.all` parallel fetches, FlashList, Maps for O(1) lookups and memoized cards/contexts.
- Around 145 accessibility annotations exist (roles, labels, states, hints, live regions, hit slops).
- Auth gating, deep links and shared-image delivery are centralized in `RootNavigator`; share handlers never navigate directly.

### Design/system problems

| # | Finding | Impact |
|---|---|---|
| D1 | Violet/pink/cyan gradients and glassmorphism dominate (`GradientHeader`, `GradientButton`, `GlassCard`, FAB). Numbers are rendered on gradient surfaces and inside tinted glass cards. | Financial values lose contrast and hierarchy; the app reads as a generic SaaS template rather than an account book. |
| D2 | One radius (`xl = 16`) is applied nearly everywhere; surfaces are distinguished only by translucency and glow. | Weak hierarchy, visual noise, no platform-native restraint. |
| D3 | Large display scale (`displayLg` 40/48) and `headlineLg` 28 are too loud for dense ledger data; tabular numerals are not enabled. | Amount columns do not align; long values wrap unpredictably. |
| D4 | FocusFadeIn slides **every** tab screen on every focus; no reduced-motion check. | Motion is decorative rather than informative and can cause discomfort. |
| D5 | No responsive layout: mobile-width padding is used on all screens; no max content width or wide-screen arrangement. | Desktop/tablet web stretches text and cards to unreadable widths. |
| D6 | Loading/error/empty states are inconsistent: some screens show a centered spinner, others show empty text or nothing. | Users cannot tell whether data is loading, missing or failed. |
| D7 | Auth screens are the first impression but use the same glass/gradient kit as data screens. | Weak trust signal at sign-in. |
| D8 | No web focus-visible styling; RN `TouchableOpacity` has no explicit keyboard focus treatment. | Keyboard users can lose position, especially on web/PWA. |

### Accessibility gaps (WCAG 2.2 AA target)

- Contrast needs verification after any palette change: light-mode `primary`/`primaryContainer` are both `#06B6D4`, so white text on primary and primary-on-white are both marginal; dark `onSurfaceVariant '#CCC3D8'` on `#131B2E` is acceptable but several tinted glass surfaces (`surfaceContainerHigh + 'D9'`) make the effective background unpredictable.
- Target sizes: several icon buttons (chat send/attach, filter icons, back buttons) have no `minHeight/minWidth: 44` guarantee; `hitSlop` exists only on some destructive controls.
- Dynamic font scaling: fixed font sizes and fixed-height rows will clip when the OS font scale increases; no `allowFontScaling` strategy or `maxFontSizeMultiplier` is defined globally.
- Reduced motion is not detected anywhere.
- Reading order on web is the RN tree order; decorative icons are not consistently hidden from screen readers.
- Colour is sometimes the only state carrier (e.g. priority chips, income/expense amounts rely mostly on sign/icon but some badges rely on colour).

### SEO / web privacy

- The web app is **entirely authenticated private financial data**. There are no public marketing pages. Therefore the correct SEO strategy is to prevent indexing rather than add sitemaps/OG pages: `robots: noindex, nofollow` plus `<meta name="robots">`, canonical self URL only where a stable public URL exists, and no structured data that implies public content.
- `public/index.html` has title/description and Spanish lang, but no robots meta, no canonical policy, and no explicit `color-scheme`.
- Never emit user names, balances or transaction text into static HTML or metadata. Client-only rendering already avoids this; keep it that way.
- Icons exist but image `alt` equivalents are the responsibility of RN `accessibilityLabel`s; decorative icons should be `accessible={false}`.

### Performance

- Already good: FlashList, memoization, Maps, cached number formatter, focus-based refetch, no double-fetch loops.
- Remaining risks: gradient-heavy header/button re-renders, `FocusFadeIn` animating whole screens, web bundle carrying native-only share intent (mitigated by `.web.tsx` split), and no measurable Core Web Vitals baseline because no web analytics/build tooling is configured.

## 5. Validation baseline

| Check | Result |
|---|---|
| `npx tsc --noEmit` (mobile) | Pass |
| Mobile test runner | None |
| Mobile lint | None |
| Backend Jest specs | 0 |
| Swagger JSON reachable (dev) | Yes at `http://localhost:3001/api/json` when backend runs with `NODE_ENV != production` |
| Secrets exposed in client | None found in `src`; env values remain in backend `.env` files (do not touch) |

## 6. Audit conclusion

The app is functionally complete and technically sound. The redesign should therefore be a **system replacement with API compatibility**, not a feature rewrite: swap the visual language at the token and shared-component level, add responsive/reduced-motion/a11y primitives, then refine the highest-value screens (Home, Transactions, Auth) while preserving every endpoint call and navigation route. The contract discrepancies in §3 are backend realities to be respected, not silently changed from the client.

## 7. Post-redesign disposition (v2 Caja Fuerte)

This document remains the **pre-redesign baseline**. The first visual pass (*Tinta y Cobre*) was rejected by the user as obsolete; the implemented pass is **Caja Fuerte** (`design-direction.md`, `design-system.md`, `final-report.md`). Findings D1–D8 were resolved as follows:

| Finding | v2 resolution |
|---|---|
| D1 gradients/glass on financial values | Gradients have no call sites; panels are solid weighted surfaces with token colours only. |
| D2 single radius / translucency-only hierarchy | Radius scale `sm→2xl`, `strokeWidth thin/medium/thick`, raised vs recessed surfaces, `Glyph` plates. |
| D3 oversized display / no tabular figures | 42/48 heavy display with tabular numerals and capped font scale; hierarchy is weight-led. |
| D4 decorative motion without reduced-motion check | Motion inventory reduced to dial/shutter/press/stamp, all gated by `useReducedMotion`. |
| D5 no responsive layout | `ScreenLayout` max widths plus `NavRail` at ≥1024dp; bottom tabs retained on phones. |
| D6 inconsistent loading/empty/error | `Skeleton` family + `StatePanel` variants on every data screen; one polite announcement per loading region. |
| D7 weak auth first impression | Strongbox `Glyph` mark, framed inputs and solid actions on all four auth screens. |
| D8 no web focus treatment | `outlineColor` focus ring on buttons, inputs, chips and pressables; roles/labels/states retained. |

The accessibility gaps in §4 were addressed at token and component level (verified contrast table in `design-system.md`, 44dp targets, dynamic-font cap, reduced motion, decorative icons hidden, redundant semantic cues). Contract discrepancies in §3 were deliberately left untouched. The audit's read-only constraint applies only to the creation of this baseline, not to the later implementation pass.
