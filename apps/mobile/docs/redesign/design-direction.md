# Design direction v2 — Caja Fuerte

This supersedes the earlier *Tinta y Cobre* direction. The user rejected that proposal as obsolete: too quiet, too hairline-led, insufficient visual weight and motion. The new brief is explicit: a genuinely new idea, real skeleton loading states, richer icons, more movement and more "grosor" (visual weight), across phone, tablet and web.

> **Colour decision (final):** the two themes are intentionally different. Dark keeps the logo palette sampled from `assets/icon.png` — navy `#0B1326`, purple `#8B3BE1` for solid actions and borders, cyan `#06B6D4` secondary, pink accents. Light returns to the original Caja Fuerte palette — sage `#E9EFEC` canvas with signal orange `#B8430A` / `#C2410C`, blue secondary and mint/coral ledger signals. All roles (text, fills, borders, icons, chips, focus rings, `actionBorder`) follow their theme's accent. Text roles use accessible tints so WCAG 2.2 AA is preserved. Layout, typography, motion and component structure are unchanged.

## Subject and idea

Finance Flow is a personal safe for money: balances, movements, debts and receipts. The metaphor is a **caja fuerte** — a physical strongbox with a dial, a slot and heavy panels. That gives us specific material cues instead of another generic finance dashboard: thick frames, logo-purple signal in dark and signal orange in light, with cyan/blue and pink accents, teal/rose ledger signals, embossed icon plates and a dial that turns when the balance changes.

This is deliberately not a ledger-paper system. There are no hairline-only dividers, no quiet lavender/teal palette and no glass. Hierarchy comes from **weight**: 2–3px borders, 20–28px radii, heavy numerals, solid colour blocks and raised panels.

## Palette (v2)

| Role | Dark | Light | Use |
|---|---|---|---|
| Navy / sage canvas | `#0B1326` | `#E9EFEC` | App background |
| Panel | `#111D36` | `#FFFFFF` | Primary surface |
| Raised steel | `#182747` | `#F4F8F5` | Nested surface / skeleton base |
| Primary accent | `#B98CFF` (logo purple) | `#B8430A` (signal orange) | `primary` text, icons, borders, active state |
| Solid fill | `#8B3BE1` (logo purple) | `#C2410C` (orange) | `primarySolid` — solid button / FAB |
| Button/FAB border | `#8B3BE1` | `#B8430A` | `actionBorder` — matches each theme's accent |
| Secondary | `#06B6D4` (logo cyan) | `#3155B5` (blue) | Debts / neutral information |
| Teal | `#5EEAD4` | `#0B6E56` | Income / success |
| Rose | `#FDA4AF` | `#B02E2E` | Expense / error |
| Tertiary | `#F0A6D8` (pink) | `#4F615C` (annotation) | `tertiary` accents |
| Ink | `#F2F6FF` | `#101716` | Primary text |
| Annotation | `#AFC0D8` | `#4F615C` | Muted text |

All pairs used for normal text exceed 4.5:1 (verified in `design-system.md`). Semantic states always carry an icon, sign or label, never colour alone.

## Typography

One pair, already bundled: **Outfit 700** for figures, headings and labels; **Inter 500/400** for body. No new font dependency.

- Balance: Outfit 700, 42/48, tabular numerals, tight `-0.03em`
- Section: Outfit 700, 28/34
- Card title: Outfit 700, 17/22
- Body: Inter 500, 15/22
- Caption: Inter 400, 13/19
- Label: Outfit 700, 12/16, sentence case

Numbers are deliberately large and bold; they remain the subject, but now they read as stamped onto a panel rather than whispered on paper.

## Layout concept — "the safe front"

```
Phone                         Tablet / desktop (>= 1024dp)
┌────────────────────┐        ┌──────┬──────────────────────────┐
│ ● SAFE FRONT       │        │      │ ● SAFE FRONT             │
│ ┌────────────────┐ │        │ rail │ ┌──────────────────────┐  │
│ │ $ 12,480.50    │ │        │      │ │ $ 12,480.50  ↻ dial │  │
│ │ ▔▔▔▔▔▔▔▔▔▔▔▔▔ │ │        │      │ └──────────────────────┘  │
│ └────────────────┘ │        │      │ [actions] [debts] [list]  │
│ [◉] [◉] [◉] [◉]    │        │      │                          │
│ ━ DEBT SLOT ━━━━━  │        │      │                          │
│ ━ MOVEMENTS ━━━━━  │        │      │                          │
└────────────────────┘        └──────┴──────────────────────────┘
```

Left-aligned content in a centred column (`1120` wide, `720` for reading views). Panels use 2–3px strokes and medium radii. Wide screens keep the bottom-tab-free rail; phones keep bottom tabs but tab icons now sit on weighted plates.

## Motion

More present than v2, still answer-driven and always cancelled when reduced motion is requested:

1. **Entrance:** the balance dial rotates once and the figure counts up on first Home focus.
2. **Loading:** shaped skeletons shimmer while data resolves; they vanish into the real layout, not a generic spinner.
3. **Actions:** the Add sheet opens like a shutter with a short spring; primary buttons compress on press.
4. **Feedback:** successful saves use a brief stamp scale-in; errors keep a static alert role.
5. **Tabs/in-list:** active tab indicator glides; chat dots bounce only when motion is allowed.

No looping decoration, no per-card cascades, no parallax. Reduced motion turns all of this into static states.

## Icons

Ionicons remain the glyph source (no new dependency), but they are no longer naked 20px lines. A new `Glyph` component puts every important icon on a weighted plate: rounded square, 2–3px border, tinted container, optional notch/badge and an active rotation. This gives the interface a mechanical, secure feel and improves touch-target clarity.

## Self-critique against defaults

- Not cream + serif + terracotta: the base is cool graphite/grey-green with a safety-orange signal.
- Not near-black + acid green: orange is the single signal; mint/coral/blue are narrow semantic bands.
- Not a newspaper hairline grid: borders are 2–3px and panels are visibly raised.
- Not the SaaS rounded-card kit: cards share a strong frame but vary by role (dial hero, slot rows, action plates), and we avoid identical soft shadows.
- No ALL-CAPS eyebrows, no arrow-suffixed CTAs, no decorative numbered markers.
- The one memorable element is the safe-front balance dial, not scattered entrances.

## Principles

1. **Weight is hierarchy.** Use borders, fills and type weight before shadows or colour washes.
2. **Skeletons are part of the interface.** They mirror the real shape of the data and announce loading politely.
3. **Motion explains change.** Dial, shutter, press and stamp only; never decorative loops.
4. **Semantic colour is redundant.** Sign, icon and text always accompany colour.
5. **Same machine on every platform.** Phone, tablet and web share tokens; only the navigation shell changes.
