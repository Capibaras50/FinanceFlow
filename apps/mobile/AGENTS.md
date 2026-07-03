# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Session Context (July 2, 2026)

## Changes
- **api-client**: `client.get()` now accepts optional `params` for query parameters; `ExpensesApi.getAll()` and `EarningsApi.getAll()` accept `ExpenseFilterParams`/`EarningFilterParams` (category, wallet, sortBy, sortOrder, page, limit)
- **TransactionDetailScreen**: Changed `useEffect` → `useFocusEffect` with `useCallback` so data reloads after editing a transaction
- **TransactionListScreen**: Added filter modal (category + wallet chip pickers), passes filter params to API calls, fixed `useFocusEffect` deps, added `loadData` filter overrides for correct closure behavior; added sortBy (Monto/Fecha) + sortOrder (Mayor a menor/Menor a mayor) toggle chips in filter modal
- **ProfileScreen**: Added missing `usersApi` import (pre-existing TS error)
- **TypeScript**: Both mobile and api-client compile cleanly

## Smooth Transitions (July 2, 2026)
- **FocusFadeIn** — new component (`src/components/ui/FocusFadeIn.tsx`) wraps tab screens and slides up content via `Animated.spring` each time the tab gains focus; no data gating, always renders content immediately
- **Data-load reload** — useFocusEffect reloads data in background on each tab focus without blocking render
- **Auth screen transitions** — Login, Register, ForgotPassword, ResetPassword now use `animation: 'slide_from_right'` for consistent stack navigation feel
- **TabBarIcon bounce** — active tab icon scales up via `Animated.spring` for tactile feedback when switching tabs



## Setup
- `node-linker=hoisted` in `.npmrc` (required for CMake path length)
- Backend runs on port 3001 (`pnpm start:dev` in `apps/backend/`)
- Device on same WiFi as PC (`192.168.8.13`) to reach backend
- After `npx expo run:android`, if phone shows "Cancel" prompt → `adb uninstall com.financeflow.app` then manually install APK
- JDK 17 at `C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot`

## Fixed Runtime Crashes
- HomeScreen `navigation.getParent()?.navigate('Transactions')` → changed to direct tab navigation
- Missing `GET /wallets/balance` and `GET /wallets/balance/:id` backend endpoints (added to wallet controller)
- `GET /chat` missing `@Query('take')` parameter (added so frontend can request >10 messages)
- Wallet `NaN` bug: `WalletBalance` type used snake_case (`total_expenses`, `total_earnings`) but API returns camelCase (`totalExpenses`, `totalEarnings`)
- `GlassCard` hardcoded dark colors → dynamic theme colors via `colors.surfaceContainerHigh`
- Removed broken navigation items from ProfileScreen (`Receipts`, `Settings`)

## Theme System
- `src/theme/colors.ts` — dark + light palettes, `getThemeColors()`
- `src/context/ThemeContext.tsx` — `ThemeProvider` with SecureStore persistence
- `src/hooks/useTheme.ts` — exposes `colors`, `mode`, `toggleTheme`, `isDark`
- Every screen/component updated to use `useTheme()` instead of static `colors` import
- Theme toggle switch in ProfileScreen under "APARIENCIA" section
- Light mode: warm lavender `#F5F0FF` background, `primaryContainer: #7C3AED` in BOTH modes
- `CategoryChip.tsx` uses dynamic `onPrimaryContainer` for text color in light mode

## Features Added
- **Chat typing animation** — bouncing dots with fade-in, rendered outside FlatList
- **Markdown rendering** — `react-native-markdown-display` for AI messages with themed styles
- **Category CRUD** — modal with name/description/color picker, tap edit, long-press delete
- **Wallet CRUD** — modal with name input, tap edit, long-press delete, "Nueva" header button
- **AddEarningScreen** — create + edit mode with category/wallet selectors
- **TransactionDetailScreen** — full detail view with edit + delete
- **AddExpense/AddEarning edit mode** — route params `expenseId`/`earningId`, delete icon in header
- **FAB selection** — `Alert.alert` choosing between "Gasto" and "Ingreso"
- **RootNavigator** — registered `AddEarning`, `TransactionDetail` with proper animation config

## Backend AI Fix
- **Problem**: Gemma model crashed with `"Error rendering prompt with jinja template: 'Cannot perform operation on in undefined values'"` when `system` message content was empty
- **Fix**: Added proper Spanish system prompt in `chat.service.ts`
- **Fix**: Modified `buildMessages()` in `ai.service.ts` to filter empty messages and skip system prompt when empty

## Stitch Redesign
- Project ID: `422944985202763848`
- Design system applied: "Finance Flow - Colorful Theme" (dark mode, Outfit font, purple/pink/cyan accents, ROUND_FULL)
- 5 polished screens generated: Login, Home Dashboard, AI Chat, Transactions List, Receipt Scanner
- Variants for Teal, Púrpura, and Aura color schemes also generated

## Full App Redesign (June 29, 2026)
- **Color palette**: Two distinct themes — dark mode uses **lila plateado** (`#D2BBFF` primary, `#7C3AED` container, `#0B1326` bg), light mode uses **Teal/Cyan** (`#06B6D4` primary, `#F0FDFA` bg)
- **GlassCard**: Enhanced glassmorphism with stronger shadows, dynamic `primary` glow
- **TransactionCard**: Added icon containers (`trending-down`/`trending-up`), category name display, redesigned layout
- **Tab bar**: Gradient FAB with border, active tab accent, 72px height
- **HomeScreen**: Quick actions row (Ingresos→AddEarning/Gastos→AddExpense/Escanear/IA Chat) with icon boxes, monthly summary with dynamic progress bars (proportional to max), notification icon
- **TransactionListScreen**: Gradient header with sparkle icon, pill tab switcher, total summary card, search with filter icon, empty state with icon
- **ChatScreen**: Gradient header, AI sparkle branding, glassmorphism user/AI bubbles with "Finance Flow IA" tag, attach button, border-styled input
- **WalletsScreen**: Gradient header, wallet cards with real earnings/expenses, recent movements with icons
- **CategoriesScreen**: Total spending breakdown with category progress bars, color picker, "Añadir" button
- **ProfileScreen**: Rounded 24px avatar container, 40px icon containers, cleaner spacing
- **Auth screens**: Login with gradient logo, Register with back button
- **Removed hardcoded static data**: No fake trend percentages, no AI insight cards with hardcoded text
- All existing functionality (CRUD, chat, theme toggle, AI, markdown) preserved
- TypeScript compiles cleanly

## Key Constants
- `EXPO_PUBLIC_API_URL=http://192.168.8.13:3001`
- `REACT_NATIVE_PACKAGER_HOSTNAME` may be needed if Metro doesn't detect network interface
- `src/theme/colors.ts` exports both palettes
- `src/context/ThemeContext.tsx` provides reactive colors
