# Design system v2 — Caja Fuerte

This document replaces the earlier *Tinta y Cobre* specification. The user rejected that direction as obsolete: too quiet, too hairline-led and not expressive enough. The new direction is a **strongbox**: thick strokes, solid panels, weighted icon plates, shaped skeletons and mechanical motion. It preserves every exported name and prop shape so the 21 screens keep compiling.

## 1. Principle

Money lives in a safe, not on a sheet of paper. Surfaces are raised frames with 2–3px strokes; figures are heavy and tabular; icons sit on plates with a notch; loading states keep the shape of the data; motion is a dial turn, a shutter, a press or a stamp — never decorative looping.

Depth comes from **weight**, not glass or gradients. Gradients exist only as compatibility tokens with identical stops and have no call sites.

## 2. Colour tokens

`src/theme/colors.ts` keeps every historical `ThemeColors` key. New keys: `primarySolid`, `onPrimarySolid`, `stroke`, `strokeStrong`, `skeletonBase`, `skeletonShine`, `actionBorder`.

The two themes are deliberately different by explicit user choice. Dark keeps the app logo palette (`assets/icon.png`: navy `#0B1326`, purple `#8B3BE1`, cyan `#06B6D4`, pink `#D645A9`); light restores the original Caja Fuerte palette (sage `#E9EFEC`, signal orange `#B8430A` / `#C2410C`, blue `#3155B5`, mint/coral ledger signals). Every accent role — `primary`, `primarySolid`, containers, solid buttons/FABs, icons, chips, focus rings and `actionBorder` — follows its theme's accent. Text roles use accessible tints of the same hues so both themes stay at WCAG 2.2 AA. Component structure, spacing and motion are unchanged.

| Token | Dark | Light | Role |
|---|---|---|---|
| `background` | `#0B1326` | `#E9EFEC` | Logo navy / original sage canvas |
| `surface` | `#111D36` | `#FFFFFF` | Primary panel |
| `surfaceContainerHigh` | `#182747` | `#F4F8F5` | Raised steel / nested panel |
| `surfaceContainerHighest` | `#223259` | `#E9EFEC` | Plate backing |
| `surfaceContainerLow` | `#0E1830` | `#F7FAF8` | Recessed field |
| `primary` | `#B98CFF` | `#B8430A` | Logo purple / signal orange: text, icons, borders, active |
| `primarySolid` | `#8B3BE1` | `#C2410C` | Solid action / FAB |
| `onPrimarySolid` | `#FFFFFF` | `#FFFFFF` | Text on solid action |
| `primaryContainer` | `#2E1A52` | `#FFE3D2` | Selected fill |
| `actionBorder` | `#8B3BE1` | `#B8430A` | Button/FAB outline: logo purple / signal orange |
| `secondary` | `#06B6D4` | `#3155B5` | Logo cyan / original blue: debts / neutral information |
| `secondaryContainer` | `#083344` | `#E1E8FF` | Cyan / blue selected fill |
| `inversePrimary` | `#943DDB` | `#FF8A4C` | Other purple / bright orange swatch |
| `warning` | `#8B3BE1` | `#B8430A` | Warning follows theme accent |
| `info` | `#06B6D4` | `#3155B5` | Info follows theme secondary |
| `tertiary` | `#F0A6D8` | `#4F615C` | Pink / annotation accents |
| `error` | `#FDA4AF` | `#B02E2E` | Rose / coral expense |
| `errorContainer` | `#46152D` | `#FFE1DE` | Selected expense state |
| `success` | `#5EEAD4` | `#0B6E56` | Teal / mint earning |
| `successContainer` | `#083A36` | `#DCF5EA` | Selected earning state |
| `onSuccessContainer` | `#B7F7E9` | `#0B4F3E` | Text on selected earning state |
| `onBackground` / `onSurface` | `#F2F6FF` | `#101716` | Primary text |
| `onSurfaceVariant` | `#AFC0D8` | `#4F615C` | Muted text |
| `outline` | `#5A7096` | `#B7C6C1` | Standard stroke |
| `strokeStrong` | `#9FB4D6` | `#6E837D` | Structural stroke |
| `skeletonBase` | `#182747` | `#E1E9E5` | Loading block |
| `skeletonShine` | `#223259` | `#F3F7F5` | Loading shimmer |
| `scrim` | `rgba(5, 9, 20, 0.78)` | `rgba(16, 23, 22, 0.42)` | Modal backdrop (single token) |
| `gradient` | identical-stop pairs | identical-stop pairs | Kept for API compatibility; unused |

Rules:
- No hex or `rgba()` literals in screens/components; everything comes from `useTheme()`.
- Semantic state is never colour-only: amounts carry sign + icon + label; status chips carry Spanish text; selection carries `accessibilityState`.
- Modal backdrops use only `colors.scrim`.
- **Ledger colour code:** expenses are always `colors.error` (rose) and earnings always `colors.success` (teal) in Movimientos and Categorías. It is applied to transaction card frames (3px), Gastos/Ingresos tabs, summary figures, category breakdown bars, category row plates and type selectors. Selection additionally uses the matching container tint, a thicker border and a checkmark, so it never relies on hue alone. User-chosen category colours survive as small markers, not as the semantic signal.

### Contrast verification (WCAG 2.2 AA)

Computed against the actual tokens:

| Pair | Dark | Light |
|---|---:|---:|
| Primary accent on panel | 6.59:1 | 5.46:1 |
| Muted text on panel | 9.06:1 | 6.57:1 |
| Secondary on panel | 6.90:1 | 6.78:1 |
| Text on solid action | 5.51:1 | 5.18:1 |
| Success on panel | 11.33:1 | 6.21:1 |
| Error on panel | 8.86:1 | 6.41:1 |
| Tertiary on panel | 8.90:1 | 6.57:1 |
| Button border (`actionBorder`) on panel | 3.04:1 | 5.46:1 |
| Primary text on canvas | 7.27:1 | 15.59:1 |

All normal-text pairs exceed 4.5:1 in both themes. The `actionBorder` outline is exact logo purple `#8B3BE1` in dark (3.04:1 on panel, 3.36:1 on the navy canvas) and the original signal orange `#B8430A` in light (5.46:1 on white, 4.69:1 on the sage canvas), so both clear the 3:1 non-text contrast target. Skeleton blocks are decorative (`accessible={false}`) and the containing region announces "Cargando…" politely.

## 3. Typography

One bundled pair, no new font dependency: **Outfit 700** for figures, headings and labels; **Inter 500/400** for reading. Web falls back to `System` as before.

| Token | Native family / size / line | Use |
|---|---|---|
| `displayLg` | Outfit 700, 42/48, -0.03em, tabular | Hero balance |
| `displayMd` | Outfit 700, 30/36, tabular | Large totals |
| `headlineLg` | Outfit 700, 28/34 | Screen title |
| `headlineMd` | Outfit 700, 22/28 | Section title |
| `headlineSm` | Outfit 700, 18/24 | Card title |
| `titleLg` | Outfit 700, 17/22 | Row emphasis / amounts |
| `titleMd` | Inter 500, 15/21 | Form label |
| `bodyLg` | Inter 500, 15/22 | Body |
| `bodyMd` / `bodySm` | Inter 400, 15/22 · 13/19 | Secondary body / annotation |
| `labelLg` / `labelMd` | Outfit 700, 14/18 · 12/16 | Buttons / labels |

Sentence case everywhere. Large figures use `maxFontSizeMultiplier: 1.35`; other text scales with the OS.

## 4. Weight, spacing, layout

- 4px grid: `xs 4, sm 8, md 16, lg 24, xl 32, 2xl 48, container 20`.
- Radius: `sm 6, md 12, lg 20, xl 24, 2xl 28, full 9999`.
- **Stroke weights**: `thin 1`, `medium 2`, `thick 3`. Default panel = medium; structural boundaries and active states = thick. Hairlines were removed from all screens.
- `ScreenLayout`: centred `1120` for dashboards/lists, `720` for reading views; wide screens (≥1024dp) use `NavRail`, phones keep the bottom bar.
- Touch targets ≥44dp; primary button height 56; glyph plates 48 by default.
- Motion durations: `press 160`, `reveal 260`, `dial 480`, `shutter 340`, `stamp 320`, `shimmer 1400`.

## 5. Components (compat-preserving)

| Export | Visual behaviour after v2 | Compatibility |
|---|---|---|
| `GlassCard` | Heavy panel: solid raised surface, 2px stroke, 20px radius. Name and props unchanged. | `glowColor` tints the border. |
| `GradientHeader` | Solid header with a 3px lower stroke and a short orange notch. | `gradient` prop accepted, unused. |
| `GradientButton` | Solid `primarySolid` fill, 3px border, 56px height, spring compression on press, web focus ring. | Props unchanged. |
| `Input` | 56px field, 2px stroke, 3px on focus, bold label, linked error with live region. | Props unchanged. |
| `FocusFadeIn` | Opacity + 14px rise on each focus, spring-settled; instant with reduced motion. | API unchanged. |
| `Glyph` (new) | Ionicons glyph on a rounded metal plate with a notch and optional badge; turns 90° when active. Decorative. | Additive. |
| `BalanceHero` (new) | The one orchestrated panel: labelled balance, `Dial`, thick rule, income/expense meter. | Additive. |
| `Dial` (new) | Mechanical dial that turns with the settled balance; static with reduced motion. | Additive. |
| `CountUp` (new) | Counts the real balance into place once; announces the final spoken value. | Additive. |
| `Skeleton*, StatePanel` (new) | Shaped shimmering placeholders; `StatePanel` variants `rows`, `balance`, `card`, `plain`. | Additive; old call sites keep working. |
| `TransactionCard` / `DebtCard` | Glyph plates, thick coloured edge, heavy signed tabular amounts. | Memoization retained. |
| `ContactCard` / `Avatar` / `CategoryChip` | Thick frames, square colour marker, checkmark for selected chips. | APIs unchanged. |
| `TabBarIcon` / `NavRail` | Plates instead of naked icons; active plate rotates once. | APIs unchanged. |
| `StatusBadge` | Icon + Spanish label + thick tinted border. | API unchanged. |
| `Snackbar`, `AppAlert`, `DateTimePickerModal` | Thick borders, solid actions, instant states with reduced motion. | APIs unchanged. |

## 6. States, skeletons and motion

Every data screen distinguishes loading from empty:

| State | Presentation |
|---|---|
| Loading | Shaped skeletons that mirror the real layout (balance + meter, avatar/line/amount rows, card blocks, chat bubbles, upload bar). One polite live announcement per region. No bare spinner on a blank page. |
| Empty | Glyph plate + specific Spanish sentence + primary action where meaningful. |
| Error | Coral plate, "No pudimos cargar tus datos…", solid `Reintentar` action, `role="alert"`. |
| Submitting | Solid button with busy state; upload screens use a shaped progress skeleton. |
| Success | Non-blocking snackbar with `role="status"`. |

Motion inventory (all skipped when `useReducedMotion()` is true):
1. Home balance dial turns and the figure counts up.
2. Skeletons shimmer while resolving and are replaced by the same-shaped content.
3. Add control rotates 45° on press; its sheet slides in like a shutter.
4. Focus entrance rises 14px; active plates rotate; chat dots bounce while awaiting a reply.
5. Buttons compress on press; success feedback uses a brief stamp scale.

No cascades, parallax or infinite decorative loops.

## 7. Accessibility contract

- Actionable elements carry role, label, state/hint and ≥44dp targets; web focus ring is visible.
- Decorative icons and skeleton shapes are `accessible={false}`; parents own the spoken label.
- Errors are linked by `nativeID`/labelledBy and use live regions; amounts include sign and spoken value.
- Contrast verified above; state never colour-only; reading order follows visual order.
- Reduced motion disables transforms, loops, count-up and shimmer.

## 8. Web/SEO contract

- Private authenticated app: `noindex, nofollow, noarchive, nosnippet` for generic and Google crawlers; no sitemap, OG pages, structured data or user data in metadata.
- Spanish `lang`, title/description, `color-scheme: dark light`, `theme-color: #0B1326`.
- Share target, service worker and the single `deliverSharedImage()` gate remain untouched.

## 9. Non-goals

No backend changes, invented endpoints, new dependencies, navigation-library migration, changes to financial calculations, auth/storage, or share-intent behaviour.
