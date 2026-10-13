# Prymal --- Progress Log

> This file records actual repository and test status. Claude Code must
> update it after each meaningful work session. Do not mark tasks
> complete based on plans alone.

## Current status

**Overall phase:** Milestone 1 (Home screen) implemented, passing
automated checks, and rendering correctly on the founder's Android phone
(Expo Go). Ready to commit, then begin Milestone 2.

**Founder-reported facts:** - \[x\] Created the Expo app and named it
`prymal`. - \[x\] Connected and ran the app on an Android phone. - \[x\]
Pushed the initial setup to a GitHub repository. - \[x\] Selected Option
A: runner-first Home screen. - \[x\] Agreed on an initial dark charcoal
/ green-black visual direction with lime accent. - \[x\] Agreed to work
in small steps and test the basic application as soon as possible.

**Verified by repository inspection (2026-10-13):**

- [x] Expo SDK `~57.0.27` (installed 57.0.27), React Native 0.86.3,
  React 19.2.3, TypeScript ~6.0.3 with `strict: true`.
- [x] Template: Expo **blank TypeScript** template. Entry: `index.ts` →
  `registerRootComponent(App)` → `App.tsx`. No `src/app/` directory.
- [x] Navigation: **none installed** (no Expo Router, no React
  Navigation).
- [x] Git: branch `main`, one commit (`5214368 Initial commit`). Working
  tree at session start was **not** clean — `App.tsx` had a staged
  founder edit ("Hello from Prymal!", red background). That staged
  version was left untouched in the Git index; the Home screen is an
  unstaged change on top of it.
- [x] Planning docs live in `.claude/` and are untracked in Git.
- [x] No lint config, no test runner, no `typecheck`/`lint`/`test` npm
  scripts. `npx tsc --noEmit` works via the installed TypeScript.
- [x] `npx expo start` launches and serves an Android bundle from the
  current tree (local check only, see session log).

## Current milestone

**Milestone 1 --- Runner-first Home screen**

Status: **Implemented; automated checks pass; renders correctly on the
founder's Android phone (2026-10-13).** Founder confirmed Start a run
is inert on tap, as intended. Still unconfirmed: layout at max font
size and in 3-button navigation mode.

Desired behavior: - Prymal wordmark. - Friendly, motivating headline. -
Prominent Start a Run action. - Weekly distance and total runs. - Recent
activity empty state. - Home / Activities / Profile navigation
presentation. - Dark surfaces and bright lime accent. - Mock data only;
no fake GPS or fake recording.

## Session log

### Handover baseline --- 2026-10-13

**Known changes:** No code changes made by this handover document. These
documents are planning and execution guidance.

**Validation:** Founder previously reported the starter app connected
and ran on Android and the initial setup was pushed to GitHub. This has
not been independently re-run during preparation of this document.

**Next action:** Inspect the repository and complete Milestone 1 from
`ROADMAP.md`.

### Milestone 1 implementation --- 2026-10-13

**Milestone / status:** Milestone 1 --- implemented, automated checks
pass, physical-device validation **not yet done**.

**What changed:**

- Home screen, top to bottom: `prymal.` wordmark (lime dot), `YOUR
  RUNNING JOURNEY`, eyebrow `Welcome, runner`, headline `Ready to
  move?`, `Every run starts somewhere.`, large lime `Start a run` card,
  two stat cards (`This week` 0.0 km, `Total runs` 0), `Recent activity`
  empty state (`Your first run starts here` / `Complete a run to see
  your progress.`), bottom navigation bar.
- `Start a run` is a **non-pressable** lime surface with a visible `Run
  tracking coming soon` pill and an accessibility label saying it's not
  available yet. No timers, GPS, or permission requests.
- Bottom nav is **presentational only**: Home shows as selected (lime
  label + indicator bar); Activities and Profile show a `Soon` label and
  are marked disabled for screen readers. Nothing is tappable.
- Mock data is isolated in `src/data/homeSummary.ts`
  (`getHomeSummary()`), with zero values and an empty run list. No
  invented workouts.
- Colors/spacing/radii from `DESIGN.md` centralised in `src/theme.ts`.
- Safe areas handled with `react-native-safe-area-context` (top inset on
  the scroll area, bottom inset on the nav bar). Content scrolls on short
  screens. Status bar set to light text.

**Files changed:**

- `App.tsx` --- now renders `SafeAreaProvider` + `HomeScreen` + light
  `StatusBar` (unstaged; the founder's staged edit is still in the index).
- `src/theme.ts` (new)
- `src/data/homeSummary.ts` (new)
- `src/screens/HomeScreen.tsx` (new)
- `src/components/BottomNav.tsx` (new)
- `package.json`, `package-lock.json` --- added
  `react-native-safe-area-context ~5.7.0` via `npx expo install`.
- `.claude/PROGRESS.md`, `.claude/ROADMAP.md`

**Commands run and results (automated, on Windows dev machine):**

- `npx expo install react-native-safe-area-context` --- installed
  `~5.7.0` (SDK 57 compatible). npm reported 22 audit vulnerabilities
  (7 moderate, 15 high) across the dependency tree; not investigated
  this session.
- `npx tsc --noEmit` --- exit 0, no errors.
- `npx expo-doctor` --- 20/21 checks passed. 1 failed: `expo` expected
  `~57.0.28`, found `57.0.27` (patch mismatch, pre-existing, not caused
  by this change). Exit 1.
- `npx expo export --platform android` (output to a temp dir, not the
  repo) --- `Android Bundled 54036ms index.ts (593 modules)`, exit 0.
- `CI=1 npx expo start --port 8099` + fetch of
  `/index.bundle?platform=android&dev=true` --- `packager-status:running`,
  HTTP 200, ~4.19 MB, `Android Bundled 14937ms index.ts (751 modules)`.
  Server stopped afterwards.
- Lint: **not run** --- no ESLint configured. `npx expo lint` would add
  ESLint dependencies and config; deferred rather than expand scope.
- Unit tests: **not run** --- no test runner configured.

**Physical-device validation:** **None yet.** A successful bundle does
not prove the screen renders without runtime errors or looks right.

**Founder testing needed (Android phone, Expo Go):**

1. `npx expo start`, scan the QR code, app opens without a red error
   screen.
2. Wordmark and header aren't hidden under the status bar; status bar
   icons are light/readable on the dark background.
3. Bottom nav sits above the Android gesture bar / 3-button bar, not
   under it, and the system nav buttons/handle are visible.
4. `Start a run` card is the most prominent element and clearly reads
   as "coming soon"; tapping it does nothing and doesn't look broken.
5. Stat cards show `0.0 km` and `0` side by side without clipping.
6. Recent activity empty state is visible (scroll if needed).
7. Activities / Profile show `Soon`; Home looks selected.
8. Optional: raise Android font size to max and check nothing overlaps
   badly.

**Known issues / limitations:**

- `app.json` still has `userInterfaceStyle: "light"`. Left unchanged
  because Expo docs state Android dev builds ignore it without
  `expo-system-ui`. If the Android navigation bar buttons are hard to
  see, the fix is a dark system-bar configuration (likely
  `expo-system-ui` or `expo-navigation-bar`) --- decide after the phone
  test.
- `expo` is one patch behind SDK expectations (57.0.27 vs 57.0.28).
  Not upgraded inside this feature milestone.
- No lint or tests configured.
- Nav bar and Start a run are intentionally non-interactive.

**Decisions made:**

- Added `react-native-safe-area-context` (Expo-recommended, bundled in
  Expo Go, no dev build needed) because Android edge-to-edge requires
  safe-area insets; without it the bottom nav would overlap system bars.
- No navigation library: Milestone 1 is a single screen; real tabs are
  Milestone 2. Note that `AGENTS.md` assumes Expo Router routes under
  `src/app/`, but Expo Router is not installed, so `src/app/` was not
  used --- keep that path free in case Expo Router is adopted.
- No icon library: play triangle and route glyph are drawn with plain
  Views; nav uses text labels only.

**Next single action:** Founder runs `npx expo start` and checks the
Home screen on the Android phone against the checklist above.

### Milestone 1 device validation --- 2026-10-13

**Milestone / status:** Milestone 1 --- validated on a physical Android
phone (founder's device, Expo Go, gesture navigation).

**Evidence:** Founder reported "the app is working" and shared a
screenshot. From the screenshot:

- [x] App renders with no error screen.
- [x] Header is clear of the status bar; status-bar icons are light and
  readable.
- [x] Bottom nav sits above the gesture handle; the handle is visible
  (white) against the dark bar. The earlier concern about
  `userInterfaceStyle: "light"` making system-bar icons dark did **not**
  show up on this device.
- [x] Start a run is the dominant element; "Run tracking coming soon"
  pill is legible.
- [x] `0.0 km` / `0` stat cards side by side, not clipped.
- [x] Recent activity empty state visible without scrolling.
- [x] Home shows as selected; Activities / Profile show "Soon".
- [x] Tapping Start a run does nothing --- founder confirmed on device
  (intended: non-pressable until Milestone 3).
- [ ] Max Android font size --- not tested.
- [ ] 3-button navigation mode --- not tested (device uses gestures).

**Note:** The round gear button at the top right of the screenshot is
Expo Go's floating developer-menu button, not part of Prymal's UI. It
won't appear in a standalone/development build.

**Automated checks:** Unchanged since the implementation entry (no code
changes in this step).

**Known issues / limitations:** Same as the implementation entry. Large
empty space below Recent activity on tall phones is expected while
there's no run data.

**Next single action:** Founder confirms the look is acceptable and
commits the Milestone 1 work; then begin Milestone 2.

## Required update template for future sessions

Append a dated entry with: - **Milestone / status:** - **What
changed:** - **Files changed:** - **Commands run:** - **Validation
results:** distinguish automated checks from physical-device tests. -
**Founder testing needed:** - **Known issues / limitations:** -
**Decisions made:** - **Next single action:**

## Validation record

Do not claim these checks have passed until run in the actual
repository.

  -----------------------------------------------------------------------
  Check                               Current status
  ----------------------------------- -----------------------------------
  Expo starts from current repository Pass (2026-10-13, local dev
                                      server served Android bundle)

  Android physical-device test        Home UI renders correctly in Expo
                                      Go on founder's phone (2026-10-13,
                                      screenshot); Start a run inert on
                                      tap (confirmed); max-font check
                                      not yet done

  TypeScript check                    Pass (`npx tsc --noEmit`,
                                      2026-10-13)

  Lint                                Not configured; not run

  Unit tests                          Not configured; not run

  Android JS bundle (expo export)     Pass (2026-10-13)

  expo-doctor                         20/21; `expo` patch 57.0.27 vs
                                      expected 57.0.28 (pre-existing)

  Production build (EAS/native)       Not run

  GPS outdoor test                    Not started

  Run persistence/restart test        Not started
  -----------------------------------------------------------------------
