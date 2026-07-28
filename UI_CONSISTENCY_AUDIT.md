# UI Consistency Audit — Sequential Assignment Modal (`AssignPopup`) & App-Wide Patterns

**Scope:** `AssignPopup` (`src/App.tsx:790-1118`), cross-referenced against every other modal, card, and control in `src/App.tsx` (2905 lines) and `src/index.css`.
**Status:** Analysis only — no code changed.

## Baseline note

`src/index.css` contains only `@import 'tailwindcss';` — there is no `@theme`, no CSS custom properties, and no shared `Button`/`Card`/`Modal` component. Every value below is chosen ad hoc per call site, which is the root cause of most findings. The one exception is the `HUE` / `STATUS_HUE` / `ENTRY_HUE` token table (`App.tsx:141-185`), which is a real design-token system and should be the model the rest of the app converges on.

Also: `App.tsx:2516` sets `fontFamily: "'Inter', system-ui, sans-serif"` but Inter is never loaded anywhere (no `@font-face`, no Google Fonts link) — the app silently renders in `system-ui`.

---

## 1. Color

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| `AssignPopup`'s own chain-entry card colors (`App.tsx:967-975`) duplicate — but don't reuse — the centralized `HUE`/`ENTRY_HUE` tokens (`App.tsx:141-185`): different shade step (300 vs 200) and different opacity technique (`/40` suffix vs. flat `-50`/`-100`) for the same semantic states (e.g. `active`). This is the flagship modal not using the app's own design-token system. | Derive chain-card backgrounds/borders from `HUE[ENTRY_HUE[status]]` like every other status-colored element does. | **High** |
| Left-accent-stripe ("this row/panel is selected/current") implemented three different ways: `border-l-4` (`StatCard`, 668), `border-l-[3px]` (`DetailPane`, 1276), `shadow-[inset_3px_0_0_0_#3b82f6]` (`ContactsTable` selected row, 1691) | Standardize on `border-l-4 border-blue-500` (the class-based approach, already used twice) | **Medium** |
| `bg-[#111827]` on the sidebar (2519) hardcodes the exact hex of Tailwind's `gray-900` | Use `bg-gray-900` | Low |
| Violet reused for two unrelated meanings: `HUE.violet` (Total/New Contacts KPI) vs. pharmacy "Question" inquiry-type chips (1053-1069, 1430, 1836, 2809) | No collision today (never shown together), but pick a distinct hue for one of the two concepts if either scope grows | Low |

## 2. Typography Hierarchy

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| Field/section label has three competing recipes for the same role: (a) `text-[10px] font-bold text-gray-400 uppercase tracking-wide(r)` — AssignPopup itself (999, 1041, 1088), `DetailPane` (1320, 1448), `StatCard` (673), sidebar (2567, 2628); (b) `text-[11px] font-bold text-gray-400 uppercase tracking-wider` — `ManualFormModal` labels (2010, 2024, 2035, 2048); (c) `text-[11px] font-semibold text-gray-500`, no uppercase — filter-panel labels (2234-2305, 2702-2790) | Standardize on (a), the dominant pattern used by AssignPopup, DetailPane, StatCard, and the sidebar: `text-[10px] font-bold text-gray-400 uppercase tracking-wider`. Migrate ManualFormModal down to 10px; decide deliberately whether filter labels adopt the eyebrow treatment or stay a documented second category. | **Medium** |
| `NotesModal` subtitle uses an arbitrary `text-[10.5px]` (1547) vs. the `text-[12px]` convention used by every other modal subtitle (AssignPopup 938, ReturnModal 1134, ManualFormModal 2001) | Use `text-[12px]` | **Medium** |
| Docked/chat-style popup headings (`NotesModal` 1546, `MessageBoxModal` 737) use `text-[13px] font-semibold`, 2px smaller than the four centered dialogs' `text-[15px] font-semibold` (937, 1133, 1175, 2000) | Likely intentional given smaller chrome — document it as a deliberate "docked panel" vs. "centered dialog" rule rather than leaving it as unstated drift | Low |
| 183 occurrences of arbitrary `text-[Npx]` sizes (9px–15px) vs. Tailwind's named scale (`text-sm`, `text-base`), which is essentially unused | Not urgent to fix everywhere, but new work should draw from a documented set of pixel sizes rather than picking a fresh value each time | Low |

## 3. Button Variants

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| Radius clash between two chip-style controls inside the *same* `AssignPopup` modal: pharmacy inquiry-type toggle uses `rounded-full` (1052, 1069), "Add to chain" dept buttons use `rounded-lg` (1094) | Pick one radius for "choice chip" buttons and apply it to both | **Medium** |
| Disabled-state styling differs across four near-identical primary modal buttons: AssignPopup Save has the full triad `disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600` (1110); ManualFormModal Submit drops the hover guard (2068); ReturnModal Return drops `cursor-not-allowed` entirely (1153); ConfirmModal Confirm has no disabled state at all (1185) | Apply the full triad everywhere a primary button can be disabled | **Medium** |
| Cancel button (`px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800`) and primary/danger button shape (`px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors`) are otherwise consistent across all four dialogs (1105/1110, 1149/1153, 1182/1185, 2063/2068) — no shared `Button` component enforces this, so it's consistent only by careful copy-paste | Extract a shared `Button` component (primary/secondary/destructive variants) to make this consistency structural rather than incidental | Low |
| Clear-filters button uses orange (`text-orange-500 bg-orange-50`, 2313, 2798) — the only orange *button* in the app; orange elsewhere is only the PRIO badge | Acceptable as an intentional "reset" affordance color, but confirm it's deliberate rather than accidental | Low |

## 4. Card Styles

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| Top-level content cards ("Customer Inbox", "Manual Inquiries", `ContactsTable` wrapper) consistently use `bg-white rounded-2xl border border-gray-100 shadow-sm` (1653, 2224, 2692); AssignPopup's chain-entry cards and `DetailPane`'s Return Details card use a flatter `rounded-xl border p-4`/`p-3` with **no shadow** (966, 1294) | Consistent in practice (nested/inline cards go flat, top-level page cards get `shadow-sm`) but undocumented — write this down as an explicit rule so it isn't broken by accident | Low |
| Success toast (`ManualPage`, 2177: `rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5`) is the only toast/banner in the app — no sibling pattern to check consistency against | Flag for review once a second toast/banner is added | Low |

## 5. Border Radius Usage

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| Two small, absolutely-positioned floating menus use different radii for no functional reason: PFSD-note popover (`DetailPane`, 1386) is `rounded-2xl`; view-switcher dropdown (`App`, 2627) is `rounded-xl` | Standardize all floating menus/dropdowns/popovers on `rounded-xl`; reserve `rounded-2xl` for full modal dialogs and top-level page cards | **Medium** |
| Otherwise the radius scale is applied fairly consistently by role: `rounded-full` (avatars, pills, badges, dots), `rounded-2xl` (modals, top-level cards), `rounded-xl` (nested cards, primary/danger buttons, chain buttons), `rounded-lg` (form inputs/selects, table action buttons) | No action needed beyond fixing the popover/dropdown clash above | — |

## 6. Shadow Usage

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| `shadow-2xl` (the app's heaviest tier, used everywhere else for true full-screen modal dialogs) is also applied to a 224px note popover (1386) and a 200px view-switcher dropdown (2627), making small floating menus look disproportionately heavy | Reserve `shadow-2xl` for modal dialogs; use `shadow-lg`/`shadow-xl` for small anchored popovers/dropdowns | **Medium** |
| `shadow-lg` appears exactly once in the whole file (`DetailPane` side panel, 1276) — an orphaned middle tier in an otherwise two-tier (`sm`/`2xl`) system | Either adopt `shadow-lg` as a documented third tier (e.g., for side panels) or fold `DetailPane` into the existing two tiers | Low |

## 7. Hover States

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| `transition-all` used exactly once — AssignPopup's chain-entry card (966) — versus scoped transitions (`transition-colors`, `transition-opacity`, `transition-transform`) used everywhere else (~50+ occurrences); `transition-all` risks animating unintended properties (e.g., layout shifts) and is a performance outlier | Replace with `transition-colors` (or an explicit `transition-[background-color,border-color]`) | **Medium** |
| Close ("×") button hover color varies: AssignPopup uses `hover:text-gray-500` (942) while ReturnModal, ConfirmModal, and NotesModal all use `hover:text-gray-600` (1136, 1176, 1549) | Standardize on `hover:text-gray-600` | Low |
| Close button glyph size also varies: `text-2xl` (AssignPopup/ReturnModal/ConfirmModal, 942/1136/1176) vs. `text-xl` (NotesModal, 1549) vs. `text-lg` (DetailPane, 1287 — smaller pane, arguably justified) | Standardize centered-dialog close buttons on `text-2xl`; keep DetailPane's smaller size as a documented exception | Low |

## 8. Focus States

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| The Priority `<select>` in `ContactsTable` (1849) uses `focus:ring-1` while every other form control in the app (`DateFilterInput` 642, AssignPopup's note textarea 1020, ReturnModal 1145, NotesModal 1583, ManualFormModal 2019/2030/2043/2057, all filter inputs 2242-2779) uses `focus:ring-2` — a real accessibility regression (thinner, less visible focus indicator) with no stated reason | Change to `focus:ring-2` to match every other control | **High** |
| Icon-only buttons (close ×, pencil-edit toggle, remove ✕) have no explicit `focus-visible` ring anywhere (e.g. AssignPopup close 942, remove-entry 990, pencil toggle 1002-1007) — they fall back to the browser's default outline, which is visually and behaviorally inconsistent with the deliberate `focus:ring-2` treatment on every input/select | Add a consistent `focus-visible:ring-2 focus-visible:ring-blue-400 rounded` to icon-only buttons | **Medium** |

## 9. Spacing Rhythm / Section Spacing

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| `ReturnModal` (1131, 1138) and `ConfirmModal` (1174, 1178) use `p-6` for header/body, while `AssignPopup` (935, 945) and `ManualFormModal` (1998, 2008) use `px-6 py-5` — a ~4px vertical rhythm drift between four otherwise-identical centered-dialog components | Standardize on `px-6 py-5` for header/body (majority pattern) and `px-6 py-4` for footer (already unanimous across all four) | **Medium** |
| Header/footer divider recipe (`border-b border-gray-100` / `border-t border-gray-100`) is identical and consistent across every modal and DetailPane (935/1104, 1131/1148, 1174/1181, 1998/2062, 1544/1571, 1278/1473) | No action needed — this is the most consistent structural pattern in the app; use it as the reference when fixing other spacing issues | — |
| `gap-2` / `gap-1.5` / `gap-2.5` used near-interchangeably for icon/text row grouping with no rule tying the value to icon or text size (e.g. 978, 998, 1046 vs. 1280, 1355, 1387) | Low visual impact; worth a documented gap scale if the file is refactored into components | Low |
| `DetailPane`'s "Activity Log" section gets an extra tinted-panel treatment (`border-t border-gray-100 bg-gray-50/50`, 1447) beyond the plain divider used by comparably-distinct sub-sections inside AssignPopup | Stylistic choice, not necessarily wrong — flag for a deliberate decision rather than silent drift | Low |

## 10. Animation Timing

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| Only two explicit `duration-*` values exist anywhere: `duration-150` (NotesModal docking transition, 1541) and `duration-200` (sidebar width transition, 2519); everything else relies on Tailwind's implicit 150ms default | Either define a documented duration scale (e.g., 150ms micro-interactions, 200ms layout transitions) or drop the explicit values to stay consistent with the implicit default | Low |
| `animate-ping` (StepDot markers, 278/286/294/302) and `animate-pulse` (current-step badge dot, 1402) both signal "live/current" but are visually different animations applied to adjacent elements describing the same state | Likely intentional layering; confirm intent, otherwise consolidate to one primitive | Low |

## 11. Icon Sizing

| Inconsistent pattern | Recommended standard | Priority |
|---|---|---|
| Arbitrary `w-[18px] h-[18px]` used for sidebar nav icons (2537-2576) and `StatCard`'s `IconChip` (651) — 18px sits off the app's own 3-tier scale (`w-3.5`, `w-4`, `w-5`) | Snap to `w-5 h-5` (20px, matches `StepDot`'s marker size) or `w-4 h-4` to fold into the existing scale | Low |
| `SendIcon` uses a one-off `w-4.5 h-4.5` (781), not matched anywhere else | Snap to `w-4 h-4` or `w-5 h-5` | Low |
| General icons otherwise cluster consistently into three tiers by role: `w-3 h-3` (inline micro glyphs), `w-3.5 h-3.5` (action/button icons — used consistently throughout AssignPopup), `w-4 h-4` (header-level utility icons) | No action needed beyond the two outliers above | — |

---

## Priority Summary (highest impact first)

| # | Issue | Location(s) | Priority |
|---|---|---|---|
| 1 | AssignPopup chain-card colors bypass the centralized `HUE`/`ENTRY_HUE` token system | `App.tsx:967-975` vs `141-185` | **High** |
| 2 | Priority `<select>` uses `focus:ring-1` instead of `focus:ring-2` (accessibility) | `App.tsx:1849` | **High** |
| 3 | Chip-button radius clash within AssignPopup (`rounded-full` vs `rounded-lg`) | `App.tsx:1052/1069` vs `1094` | Medium |
| 4 | Floating popover radius clash (`rounded-2xl` vs `rounded-xl`) | `App.tsx:1386` vs `2627` | Medium |
| 5 | `shadow-2xl` overused on small popovers/dropdowns | `App.tsx:1386, 2627` | Medium |
| 6 | Left-accent-stripe implemented 3 different ways | `App.tsx:668, 1276, 1691` | Medium |
| 7 | Modal header/body padding drift (`p-6` vs `px-6 py-5`) | `App.tsx:1131/1138/1174/1178` vs `935/945` | Medium |
| 8 | Disabled-state triad incomplete on 3 of 4 primary modal buttons | `App.tsx:1110, 1153, 1185, 2068` | Medium |
| 9 | Field-label style has 3 competing variants | `App.tsx:999` vs `2010-2048` vs `2234-2305` | Medium |
| 10 | NotesModal subtitle uses arbitrary `text-[10.5px]` | `App.tsx:1547` | Medium |
| 11 | `transition-all` outlier on AssignPopup chain card | `App.tsx:966` | Medium |
| 12 | Icon-only buttons lack a focus-visible ring | `App.tsx:942, 990, 1002-1007` | Medium |
| 13 | `bg-[#111827]` duplicates `gray-900` token | `App.tsx:2519` | Low |
| 14 | Arbitrary `w-[18px]` icon size off the icon scale | `App.tsx:651, 2537-2576` | Low |
| 15 | Close-button hover color/size varies across modals | `App.tsx:942/1136/1176/1549, 1287` | Low |
| 16 | Only two explicit animation durations, undocumented | `App.tsx:1541, 2519` | Low |
| 17 | `fontFamily: 'Inter'` declared but never loaded | `App.tsx:2516` | Low |

## Recommended Next Steps (not yet implemented)

1. Fix the two **High** items first — both are quick, low-risk, single-line changes with outsized correctness/accessibility impact.
2. Address the **Medium** items as a batch pass over the four centered-dialog components (`AssignPopup`, `ReturnModal`, `ConfirmModal`, `ManualFormModal`) since most of them stem from the same four components drifting from each other.
3. Consider extracting shared `Button`, `Modal`, and `Card` primitives (or at minimum a documented Tailwind class-string constants file) so future components inherit consistency instead of relying on copy-paste discipline.
4. Treat the `HUE`/`STATUS_HUE`/`ENTRY_HUE` token table (`App.tsx:141-185`) as the template for how color should be centralized elsewhere (spacing, radius, shadow scales).
