# Prymal --- Progress Log

> This file records actual repository and test status. Claude Code must
> update it after each meaningful work session. Do not mark tasks
> complete based on plans alone.

## Current status

**Overall phase:** Milestone 1 done and committed (`37ee4a5`).
Milestone 2 (navigation + screen skeletons) done: automated checks pass,
tabs and Android back behavior confirmed on the founder's Android phone,
committed as `3d5777d`. Milestone 3 (run flow + permission) and tab
icons done: automated checks pass and founder confirmed them on the
Android phone (2026-10-14), committed as `1d5413a`. Milestones 4
(GPS distance + pace, `8709b86`), 5 (local saving + crash recovery), and
6 (Activities list + run details, `c808723`), plus a route map, per-km
splits, and a Profile screen (2026-10-15), are implemented and pass
automated checks but are **not device-tested**. At the founder's
request, all device testing is deferred to `.claude/TESTING.md`.

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
- [x] Navigation: **none installed** at session start (no Expo Router,
  no React Navigation). Expo Router added in Milestone 2 --- see below.
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

**Milestones 4--6 --- GPS metrics, local saving, activity history**

Status: **Implemented; automated checks pass; all device testing pending
(see `TESTING.md`).** Milestones 5--6 were built before Milestone 4 was
validated outdoors, at the founder's explicit request.

Desired behavior: live distance and pace (M4); runs auto-saved on Finish
and recovered if the app closes mid-run (M5); Home shows real stats and
recent runs, Activities lists all runs, details screen with delete (M6).
No map (deferred), no background tracking, no cloud sync.

**Previous milestones:** Milestones 1 (`37ee4a5`), 2 (`3d5777d`), and 3
(`1d5413a`) validated on the founder's Android phone. Unconfirmed minor
checks from Milestone 1: max font size, 3-button navigation mode.

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

**Outcome:** Committed as `37ee4a5` on 2026-10-13 (local only, not
pushed).

### Milestone 2 implementation --- 2026-10-13

**Milestone / status:** Milestone 2 --- implemented, automated checks
pass, physical-device validation **not yet done**.

**What changed:**

- Added **Expo Router** and switched the app entry to it. Routes now live
  in `src/app/` as `AGENTS.md` requires:
  - `src/app/_layout.tsx` --- root `Stack` (header hidden) holding the tab
    group, a dark navigation theme built from `src/theme.ts`, and a light
    status bar.
  - `src/app/(tabs)/_layout.tsx` --- bottom tabs: Home, Activities,
    Profile. Uses `Tabs` from `expo-router/js-tabs` (plain `Tabs` from
    `expo-router` is marked deprecated in this version). Each tab's
    "icon" is a short lime bar above the selected label, so no icon
    library is needed and selection isn't shown by color alone.
    `backBehavior="firstRoute"`: Android back from Activities/Profile
    goes to Home, and back on Home exits.
  - `src/app/(tabs)/index.tsx`, `activities.tsx`, `profile.tsx` --- thin
    route files that render the screens in `src/screens/`.
- New shared components: `Screen` (dark background, top safe area,
  scrolling, optional title/subtitle) and `EmptyState` (card with
  optional decoration; `RouteGlyph` moved here from Home).
- New screens:
  - Activities --- "Activities" / "Your run history", empty state "No runs
    yet" / "Runs you record will be saved here. Run tracking is coming
    soon."
  - Profile --- "Profile" / "You and your settings", empty state "Profile
    coming soon" / "Your runner profile and settings will live here."
- Home: same content and look as Milestone 1, now built from `Screen` +
  `EmptyState`. The static Milestone 1 bottom bar is replaced by the real
  tab bar.
- Removed: `App.tsx`, `index.ts` (old entry, unused under Expo Router),
  `src/components/BottomNav.tsx` (replaced by real tabs).

**Files changed:**

- New: `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`,
  `src/app/(tabs)/index.tsx`, `src/app/(tabs)/activities.tsx`,
  `src/app/(tabs)/profile.tsx`, `src/components/Screen.tsx`,
  `src/components/EmptyState.tsx`, `src/screens/ActivitiesScreen.tsx`,
  `src/screens/ProfileScreen.tsx`
- Modified: `src/screens/HomeScreen.tsx`, `package.json` (`main` →
  `expo-router/entry`, new deps), `package-lock.json`, `app.json`
  (`scheme: "prymal"`, `plugins: ["expo-router"]`), `tsconfig.json`
  (`@/*` → `./src/*` path alias)
- Deleted: `App.tsx`, `index.ts`, `src/components/BottomNav.tsx`
- `.claude/PROGRESS.md`, `.claude/ROADMAP.md`

**Commands run and results (automated, on Windows dev machine):**

- `npx expo install expo-router react-native-screens expo-linking
  expo-constants` --- installed `expo-router ~57.0.26`,
  `react-native-screens ~4.26.0`, `expo-linking ~57.0.12`,
  `expo-constants ~57.0.21`; CLI auto-added the `expo-router` config
  plugin to `app.json`. npm audit warnings were reported again; not
  investigated.
- `npx tsc --noEmit` --- exit 0, no errors.
- `npx expo-doctor` --- 20/21 passed. Same single pre-existing failure:
  `expo` expected `~57.0.28`, found `57.0.27`. Exit 1.
- `npx expo export --platform android --clear` (temp output dir) ---
  exit 0, bundle `entry-*.hbc` 2.7 MB. Confirmed by searching the bundle
  that all five route files (`_layout`, `(tabs)/_layout`, `index`,
  `activities`, `profile`) and each screen's copy are included.
- `CI=1 npx expo start --port 8099` --- logged `Using src/app as the root
  directory for Expo Router`; manifest `launchAsset` →
  `expo-router/entry.bundle`, fetched with HTTP 200 (~6.3 MB), `Android
  Bundled 31824ms node_modules\expo-router\entry.js (1423 modules)`.
  Server stopped afterwards.
- Lint / unit tests: not configured; not run.

**Physical-device validation:** **None yet.**

**Founder testing needed (Android phone, Expo Go):**

1. Run `npx expo start --clear` (`--clear` because the entry point
   changed), then reload the app in Expo Go. No red error screen.
2. Home looks the same as before, apart from the new tab bar.
3. Tap Activities, then Profile. Each shows its title and empty-state
   card. The lime bar and lime label move to the selected tab.
4. On Activities or Profile, press Android back (gesture or button):
   you should land on **Home**. Press back again on Home: the app should
   exit/background.
5. The tab bar sits above the gesture handle and the text is readable.
6. Start a run still does nothing when tapped.

**Known issues / limitations:**

- `expo` one patch behind (unchanged, pre-existing).
- No tab icons yet (indicator bar + labels only). An icon set can be
  added later; `@expo/vector-icons` is available in this SDK if wanted.
- `experiments.typedRoutes` from the Expo Router install guide was not
  enabled, to avoid generated type files for three routes. It can be
  turned on later.
- Lint and tests still not configured.

**Decisions made:**

- **Expo Router over hand-rolled tab state:** `AGENTS.md` requires Expo
  Router with routes under `src/app/`. Milestone 3 also needs stacked
  screens (active run, summary), which a router gives us without
  restructuring later. This changes the app entry, so it is a real
  architecture change. It's reversible by restoring `index.ts`/`App.tsx`
  from Git.
- Root `Stack` wrapping `(tabs)` follows the Expo Router tabs guide, and
  it is where the run screens will be pushed in Milestone 3.
- Route files stay thin; screen code stays in `src/screens/` (per
  `AGENTS.md`: keep non-route code outside `src/app/`).

**Next single action:** Founder runs `npx expo start --clear` and checks
the tabs and Android back behavior on the phone against the checklist
above.

### Milestone 2 device validation --- 2026-10-13

**Issue hit first:** On the phone, bundling failed with `Invalid call at
line 2: process.env.EXPO_ROUTER_APP_ROOT` in
`expo-router/_ctx.android.js`. **Cause:** the founder's `expo start`
server (PID 15352) was started at 23:08, before `expo-router` was
installed at 23:21. That Metro process had already decided expo-router
wasn't installed, so it never filled in the router root path. Not a code
defect. **Fix:** stop the old server and run `npx expo start --clear`.
**Lesson:** after adding a package that changes the entry point or the
Babel setup, always restart Metro with `--clear`.

**Result after restart:** Founder reported "the navigation is working
now" on their Android phone (Expo Go).

- [x] App bundles and runs with Expo Router.
- [x] Switching between Home / Activities / Profile works.
- [x] Android back from Activities/Profile → Home → exit --- founder
  confirmed "the back is also working fine".

**Automated checks:** Unchanged since the implementation entry.

**Commit:** `3d5777d` (local only, not pushed).

**Next single action:** Start Milestone 3 (run flow and permission
handling).

### Milestone 3 implementation (+ tab icons) --- 2026-10-13

**Milestone / status:** Milestone 3 --- implemented, automated checks
pass, physical-device validation **not yet done**.

**What changed:**

- **Tab icons** (founder request): Home `home`, Activities `footsteps`,
  Profile `person` from Ionicons; filled when selected, outline
  otherwise. The Milestone 2 indicator bar is removed.
- **Start a run** on Home is now a real button that opens the run screen
  (`/run`), presented full screen over the tabs. The "coming soon" pill
  and hand-drawn play triangle are replaced by Ionicons.
- **Run screen** (`src/screens/RunScreen.tsx`):
  - **Permission gate** (shown only before a run starts). Checking never
    prompts. The system dialog appears only after the user taps "Allow
    location" on Prymal's explainer. States: not asked yet / denied but
    can ask again → explainer + Allow location; permanently denied →
    Open settings; phone location off → Turn on location (Android's
    in-app dialog); error → Try again. Every state has "Not now". The
    screen re-checks when the app returns from Settings.
  - **Run states**: Ready to start → Recording → Paused ⇄ Recording →
    Finished. Big `mm:ss` / `h:mm:ss` timer; badge shows "Recording"
    (lime, with dot) or "Paused" (pause icon), so state is not shown by
    color alone.
  - **Controls**: Start; Pause / Resume; Finish (confirmation dialog: "You
    won't be able to resume it").
  - **Leaving mid-run** (X button or Android back) asks "Discard this
    run?" --- Keep running / Discard.
  - **Finished**: "Run complete" + duration + "This run isn't saved yet."
    Done returns Home.
  - **GPS status row**: Searching for GPS… / GPS good ±N m / GPS signal
    weak ±N m (> 20 m) / GPS unavailable. Note under it: "Distance and
    pace arrive in the next update."
- **Logic**:
  - `src/features/run/runSession.ts` --- pure reducer. Elapsed time is
    computed from `Date.now()` timestamps, not by counting ticks, so
    it's right after pauses and when JS timers are throttled. Invalid
    transitions (double start, pause while paused, anything after
    finish) are ignored.
  - `useRunSession` --- one 250 ms display interval, only while
    recording, cleared on every status change/unmount.
  - `useLocationPermission` --- check/request/open settings/turn on
    location; only the newest check may update state.
  - `useGpsSignal` --- one `watchPositionAsync` per enabled period;
    removed on cleanup, including when the subscription resolves after
    the screen has closed. **Reads accuracy only; coordinates are not
    stored or logged.**
- **Tests**: `npm test` runs Node's built-in test runner on
  `src/**/*.test.ts` (Node 24 runs TypeScript directly, so no Jest or
  other framework was added). 12 tests cover the reducer and duration
  formatting.

**Files changed:**

- New: `src/app/run.tsx`, `src/screens/RunScreen.tsx`,
  `src/components/Button.tsx`, `src/features/run/runSession.ts`,
  `src/features/run/runSession.test.ts`,
  `src/features/run/useRunSession.ts`,
  `src/features/location/useLocationPermission.ts`,
  `src/features/location/useGpsSignal.ts`
- Modified: `src/app/_layout.tsx` (run screen in root stack),
  `src/app/(tabs)/_layout.tsx` (icons), `src/screens/HomeScreen.tsx`
  (Start a run navigates), `src/screens/ActivitiesScreen.tsx` (empty-state
  copy), `app.json` (plugins: `@react-native-vector-icons/ionicons`,
  `expo-location` with background location explicitly off),
  `package.json` / `package-lock.json`, `tsconfig.json`
  (`allowImportingTsExtensions` for the test import)
- `.claude/PROGRESS.md`, `.claude/ROADMAP.md`

**Dependencies:**

- Added `expo-location ~57.0.21` (SDK 57 version, included in Expo Go).
- Added `@react-native-vector-icons/ionicons ^13.1.5` (works in Expo Go;
  loads its font through Expo's font loader). **Not**
  `@expo/vector-icons`: Expo's icon guide says it "will be deprecated
  and is not recommended" and points to `@react-native-vector-icons`.
- Added `react-dom 19.2.3` as a direct dependency. **Why:** installing
  expo-router in Milestone 2 made npm auto-install `react-dom@19.3.0` as
  a web-only peer. That needs React ≥ 19.3, but SDK 57 pins React 19.2.3,
  so npm refused every later install (`ERESOLVE`). Pinning `react-dom`
  to the SDK's expected 19.2.3 via `npx expo install react-dom` fixed it.
  Harmless on Android (react-dom isn't loaded there), but it was already
  in the Milestone 2 lockfile.
- Added dev dependency `@types/node ~24.19.2` (types for `node:test`;
  TypeScript 6 no longer auto-loads `@types/*`).
- New npm scripts: `npm test`, `npm run typecheck`.

**Commands run and results (automated, on Windows dev machine):**

- `npx expo install expo-location @react-native-vector-icons/ionicons`
  --- first attempt failed with npm `ERESOLVE` (react-dom, above);
  succeeded after `npx expo install react-dom`. CLI auto-added the
  Ionicons config plugin.
- `npm test` --- 12 tests, 12 pass, 0 fail.
- `npx tsc --noEmit` / `npm run typecheck` --- exit 0.
- `npx expo-doctor` --- 20/21; same pre-existing `expo` 57.0.27 vs
  ~57.0.28 patch mismatch only. Exit 1.
- `npx expo export --platform android --clear` (temp dir) --- exit 0,
  `Android Bundled 34518ms ... (1286 modules)`, Ionicons.ttf included.
  Searched the bundle: `./run.tsx`, permission copy, discard prompt, GPS
  strings, `footsteps-outline` present.
- `CI=1 npx expo start --port 8099` + Android bundle fetch --- HTTP 200,
  `Android Bundled 34846ms ... (1449 modules)`. Server stopped after.
- Lint: still not configured.

**Physical-device validation:** **None yet.** Unit tests cover the timer
logic; permission flows, GPS, and dialogs can only be checked on the
phone.

**Founder testing needed (Android phone, Expo Go):**

Restart Metro first: stop the running `expo start` (Ctrl+C), then
`npx expo start --clear`.

*Note for Expo Go:* the location permission belongs to **Expo Go**, not
Prymal, so Android's dialog says "Expo Go", and "Open settings" opens
Expo Go's app settings. To reset between tests: Settings → Apps →
Expo Go → Permissions → Location.

1. Tabs show icons; selected icon is filled and lime.
2. Home → tap Start a run → run screen slides up.
3. **First time / permission not granted:** Prymal's explainer appears
   *before* any system dialog. Tap Allow location → Android dialog →
   choose "While using the app" → screen shows the timer at `00:00`,
   "Ready to start", and "Searching for GPS…" then "GPS good/weak ±N m".
4. **Deny path:** reset permission, open run screen, Allow location →
   "Don't allow". Explainer remains. Deny again → screen switches to
   "Location is blocked" + Open settings. Open settings, allow location,
   come back → run screen updates to Ready without restarting.
5. **Location off:** turn off phone location (quick settings), open the
   run screen → "Your phone's location is off" → Turn on location shows
   Android's dialog; accept → Ready.
6. **Run:** Start → badge "Recording", timer counts. Pause → "Paused",
   timer freezes. Wait ~10 s → Resume → timer continues from where it
   paused (paused time not counted). Repeat pause/resume a few times;
   tapping fast must not break the timer.
7. Finish → confirmation → Finish → "Run complete" with duration →
   Done → Home.
8. **Discard guard:** start a run, then press Android back (and,
   separately, the X) → "Discard this run?" → Keep running keeps the
   timer going; Discard returns Home. Before starting, X/back close with
   no prompt.
9. Keep the screen **on** during this test (see limitations).

**Known issues / limitations:**

- **Foreground only.** If the screen locks or the app is backgrounded,
  GPS updates stop (Expo Go / foreground permission). The timer stays
  correct because it's timestamp-based, so the elapsed time includes
  time spent locked. Background tracking needs a development build and
  the background permission; it's a Milestone 4+ decision.
- No distance, pace, route, or saving yet (Milestones 4--5). Home stats
  are still mock zeros.
- Screen may dim/lock during a run; keep-awake not added yet.
- "GPS signal weak" uses a fixed 20 m threshold; tune with real outdoor
  data in Milestone 4.
- `expo` patch mismatch unchanged; lint not configured.

**Decisions made:**

- Wall-clock timestamps (not tick counting) for elapsed time, so the
  timer can't drift and survives JS throttling/backgrounding.
- GPS watcher runs while the run screen is open (including before Start)
  so the signal can lock on before running; it stops at Finish or when
  leaving the screen.
- Permission gate only blocks *starting*. If access changes mid-run, the
  timer continues and the GPS row reports the problem, rather than
  throwing the run away.
- Node's built-in test runner instead of Jest/jest-expo: zero extra
  framework for pure-logic tests. Revisit if component tests are needed.

**Next single action:** Founder restarts with `npx expo start --clear`
and runs the Milestone 3 checklist above on the Android phone.

### Milestone 3 device validation --- 2026-10-14

**Milestone / status:** Milestone 3 (+ tab icons) --- validated on the
founder's Android phone (Expo Go).

**Evidence:** Founder reported: "the icons are there, location
permissions and other steps are also working fine." This is recorded as
a pass for checklist items 1--8 above, based on that summary. Items
weren't reported one by one.

- [x] Tab icons visible.
- [x] Permission explainer, allow / deny / blocked → settings, location
  off flows.
- [x] Start / pause / resume / finish, finish confirmation, discard
  guard.
- [ ] "Couldn't check location access" error state --- not testable by
  hand; code path only.
- [ ] Indoor-only so far: GPS signal readings not yet judged outdoors
  (Milestone 4 needs real outdoor runs anyway).

**Automated checks:** Unchanged since the implementation entry.

**Next single action:** Start Milestone 4. First decision: whether
Milestone 4 stays foreground-only in Expo Go or moves to a development
build for background/locked-screen tracking.

**Commit:** `1d5413a` (local only, not pushed).

### Milestone 4 implementation --- 2026-10-14

**Milestone / status:** Milestone 4 --- implemented, automated checks
pass, **outdoor device testing not yet done**.

**Decision recorded:** Founder replied "I like the option" to the
A (foreground, screen on, Expo Go) vs B (background, development build)
question. Interpreted as **A**, the recommended option; the founder was
told how to correct this if they meant B.

**What changed:**

- **GPS readings → route → distance** (`src/features/run/track.ts`, pure):
  readings are only used while recording. A reading is ignored if its
  accuracy is missing or worse than 25 m, if it's more than 30 s old when
  received (cached fixes), if it's a duplicate or out of order, or if it
  implies faster than 12 m/s (~43 km/h). Movement smaller than
  max(5 m, the readings' accuracy) is treated as jitter: the start point
  is held, so standing still adds nothing, but slow real movement still
  adds up. After 5 jump rejections in a row, the filter assumes the
  previous point was the bad one and restarts from the current position
  without adding the gap. Distance is the great-circle (haversine) sum
  between accepted points.
- **Pause/resume:** each resume starts a new route segment, so ground
  covered while paused isn't counted.
- **Raw vs derived data:** raw readings aren't stored. Accepted route
  points (lat/lon/accuracy/time) are kept in memory for the current run
  only; distance is derived from them. Nothing is persisted or logged.
- **Pace:** average pace = elapsed recording time / distance. Shows
  `--:--` until 100 m, and never Infinity/NaN or slower than 99:59/km.
- **Run screen:** Distance (km, 2 decimals, truncated) and Avg pace
  (/km) under the timer. The screen stays on while recording or paused
  (`expo-keep-awake`, released at finish or on leaving). The finished
  summary shows duration, distance, avg pace, and "GPS: N route points ·
  M readings ignored" (to help judge GPS quality while tuning).
- `formatDuration` moved to `src/features/run/format.ts` alongside the
  new distance/pace formatters.

**Files changed:**

- New: `src/features/run/track.ts`, `src/features/run/track.test.ts`,
  `src/features/run/format.ts`, `src/features/run/format.test.ts`
- Modified: `src/features/run/runSession.ts` (track + `sample` action),
  `src/features/run/runSession.test.ts`, `src/features/run/useRunSession.ts`
  (`addSample`), `src/features/location/useGpsSignal.ts` (passes readings
  on), `src/screens/RunScreen.tsx` (stats, keep-awake, summary),
  `package.json` / `package-lock.json` (`expo-keep-awake ~57.0.2`)
- `.claude/PROGRESS.md`, `.claude/ROADMAP.md`

**Commands run and results (automated, on Windows dev machine):**

- `npx expo install expo-keep-awake` --- installed `~57.0.2` (npm moved
  the copy from inside `expo` to the top level).
- `npm test` --- 36 tests, 36 pass. (First run: 34/36. Both failures
  were mistakes in the test data, not the filter: one final reading
  implied 13 m/s, which the filter correctly rejected, and one bound was
  60 m vs a computed 60.00004 m. Tests fixed.)
- `npx tsc --noEmit` --- exit 0.
- `npx expo-doctor` --- 20/21; only the pre-existing `expo` 57.0.27 vs
  ~57.0.28 mismatch.
- `npx expo export --platform android --clear` (temp dir) --- exit 0,
  `Android Bundled 77174ms ... (1291 modules)`. Confirms Metro resolves
  the `./track.ts` import with its extension.
- `CI=1 npx expo start --port 8099` + Android bundle fetch --- HTTP 200,
  `Android Bundled 58633ms ... (1451 modules)`. Server stopped after.

**Physical-device validation:** **None yet.** Unit tests use synthetic
GPS tracks; real-world distance accuracy can only be judged outdoors.

**Founder testing needed (outdoors, Android phone, Expo Go):**

Restart Metro first: Ctrl+C, then `npx expo start --clear`.

1. **Standing still test:** open the run screen outdoors, wait for "GPS
   good", Start, stand still ~1 minute. Distance should stay at or very
   near `0.00`; pace stays `--:--`.
2. **Known-distance test:** walk or run a distance you know (a 400 m
   track lap, or a route measured in Google Maps), ideally with another
   running app recording at the same time. Note Prymal's distance vs the
   reference.
3. **Pause test:** during a run, Pause, walk ~100 m, Resume. That 100 m
   must not be added.
4. Confirm the screen doesn't turn off by itself while recording or
   paused.
5. After finishing, report from the summary: duration, distance, avg
   pace, route points, readings ignored, and what the GPS row mostly
   showed (good / weak ±N m).

**Known issues / limitations:**

- **Foreground only:** GPS stops if the screen is turned off manually or
  the app is backgrounded; distance during that time is lost (the timer
  is still correct). Keep the app open on screen.
- Filter thresholds (25 m accuracy, 12 m/s, 5 m jitter, 30 s staleness)
  are first guesses; tune them with outdoor results.
- Jitter handling cuts tight corners slightly, so it may under-count a
  little on twisty routes. This is deliberate (conservative).
- Staleness check compares the GPS fix time to the phone clock. If the
  phone clock is off by more than 30 s, readings would be ignored.
  Android normally syncs the clock automatically.
- No route map (deferred, see decision below). No saving (Milestone 5).
- Screen-on running drains more battery.

**Background tracking research (initial notes, not implemented):**

- From the SDK 57 `expo-location` docs: "Foreground and background
  services are not available in Expo Go for Android." A **development
  build** is required.
- Config plugin options: `isAndroidBackgroundLocationEnabled` (adds
  `ACCESS_BACKGROUND_LOCATION`) and `isAndroidForegroundServiceEnabled`
  (adds `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`; defaults on
  when background is on). Both are currently set to `false` in
  `app.json`.
- Still to verify before implementing: the background-updates API
  (likely `startLocationUpdatesAsync` with `expo-task-manager`),
  notification requirements, Google Play's background-location policy
  and review requirements, and EAS account/build setup.

**Decisions made:**

- Option A (see above).
- **Route map deferred** --- `react-native-maps` works in Expo Go, but
  Android builds need a Google Maps API key in a Google Cloud project
  (Maps SDK for Android), restricted to the app's package name and
  SHA-1. That's an account/billing setup decision for the founder.
  Route points are already recorded for when a map is added.
- Conservative filtering: under-count slightly rather than add phantom
  distance.

**Next single action:** Founder does the outdoor tests above and
reports the summary numbers.

**Outcome:** Committed as `8709b86` on 2026-10-14 with outdoor testing
still pending. The founder chose to defer all device testing (next
entry).

### Milestones 5--6 implementation --- 2026-10-14

**Milestone / status:** Milestones 5 and 6 --- implemented, automated
checks pass, **device testing not done**. The founder said: "defer all
the real testing to a file, I'll test everything tomorrow morning, you
need to start building more stuff." The checklist is in
`.claude/TESTING.md`. Milestone 4 is also still untested outdoors.

**What changed:**

- **Local database** (`expo-sqlite`, included in Expo Go), file
  `prymal.db` on the device. Schema v1 (`PRAGMA user_version`):
  - `runs`: derived summary (id, start/finish time, moving duration,
    distance, route point count, ignored readings, recovered flag).
  - `run_points`: accepted GPS route points per run (segment, seq, lat,
    lon, accuracy, time). Deleted with the run via `ON DELETE CASCADE`.
    Raw readings are still not stored.
  - `active_run`: at most one checkpoint of the run in progress.
  The shape mirrors the planned Supabase `runs`/`run_points`. Run ids are
  `run_<time>_<random>` strings.
- **Auto-save on Finish:** after the Finish confirmation the run is saved
  in one transaction. Summary shows Saving… → "Saved to Activities", with
  **View run**. If saving fails: an error message, **Try saving again**,
  and the run is still recovered on the next launch.
- **Crash recovery:** while recording/paused, the session is
  checkpointed on every status change, every 15 s, and when the app
  leaves the foreground. On app start, a leftover checkpoint is saved as
  a run finished at the checkpoint time (time after the crash isn't
  counted), tagged **Recovered**. Discarding a run clears its checkpoint.
  All writes go through one ordered queue, so a late checkpoint can't
  resurrect a run that was already saved.
- **Home:** real "This week" distance (Monday 00:00 local time onward) and
  "Total runs"; Recent activity shows the 3 newest runs, plus **See all**
  when there are more. Loading and error states included. The mock data
  module `src/data/homeSummary.ts` was removed.
- **Activities:** `FlatList` of all runs, newest first (date, distance,
  duration, pace, Recovered tag), with loading / empty / error states.
- **Run details** (`/activity/[id]`): date, distance, duration, pace,
  route points, readings ignored, recovered note, **Delete run** (with
  confirmation).
- **Root layout:** `SQLiteProvider` runs migrations + recovery before
  screens render. A dark `ErrorBoundary` with Try again replaces a blank
  screen if the database fails to open.

**Files changed:**

- New: `src/features/runs/runRecord.ts` (+ `.test.ts`),
  `src/features/runs/runStore.ts` (+ `.test.ts`),
  `src/features/runs/useRunPersistence.ts`, `src/features/runs/useRuns.ts`,
  `src/components/RunListItem.tsx`, `src/screens/RunDetailScreen.tsx`,
  `src/app/activity/[id].tsx`, `.claude/TESTING.md`
- Modified: `src/app/_layout.tsx`, `src/screens/HomeScreen.tsx`,
  `src/screens/ActivitiesScreen.tsx`, `src/screens/RunScreen.tsx`,
  `src/components/Screen.tsx` (exports `ScreenHeader`, `screenStyles`),
  `src/features/run/format.ts` (+ test), `app.json` (`expo-sqlite`
  plugin), `package.json`, `package-lock.json`
- Deleted: `src/data/homeSummary.ts`
- `.claude/PROGRESS.md`, `.claude/ROADMAP.md`

**Commands run and results (automated, on Windows dev machine):**

- `npx expo install expo-sqlite` --- `~57.0.4`; CLI added its config
  plugin.
- `npm test` --- **62 tests, 62 pass**. This includes 10 storage tests
  that run `runStore.ts`'s real SQL against a real SQLite database
  (Node's built-in `node:sqlite`, SQLite 3.53.4) through a small adapter.
  They cover: schema created once / re-run safe; save + list; retry
  doesn't duplicate; newest first; delete cascades points; save clears
  the checkpoint; **a failed save rolls back and keeps the checkpoint**;
  recovery of an in-progress run at checkpoint time; recovery of a
  finished-but-unsaved run; a corrupt checkpoint is discarded. Not
  covered: expo-sqlite's own native behavior on the phone.
- `npx tsc --noEmit` --- exit 0.
- `npx expo-doctor` --- 20/21; only the pre-existing `expo` patch
  mismatch.
- `npx expo export --platform android --clear` (temp dir) --- exit 0,
  `Android Bundled 82018ms ... (1328 modules)`; bundle contains the
  details route, the schema SQL, and the new screen copy.
- `CI=1 npx expo start --port 8099` + Android bundle fetch --- HTTP 200,
  `Android Bundled 20839ms ... (1487 modules)`. Server stopped.

**Physical-device validation:** **None.** See `TESTING.md`.

**Known issues / limitations:**

- Recovery loses up to ~15 s at the end of a crashed run (the checkpoint
  interval). Finishing normally loses nothing.
- If the database fails to open, the whole app shows the error screen
  (every screen depends on it).
- Data lives only on this phone (inside Expo Go while testing). No
  export or backup until cloud sync (Milestone 7).
- Dates use the phone's locale via `Intl` (Hermes). Formatting wasn't
  unit-tested because it depends on locale.
- `SQLiteProvider` renders nothing for the few milliseconds while the DB
  opens.
- Still no route map; still foreground-only GPS.

**Decisions made:**

- Auto-save on Finish (instead of a separate Save button) so a run can't
  be lost by tapping away; deletion is available on the details screen.
- Recover interrupted runs automatically on launch, rather than asking.
  It's simpler, never blocks the user, and a recovered run is clearly
  tagged and can be deleted.
- `expo-sqlite` over AsyncStorage/key-value: runs + route points are
  relational, need atomic multi-row saves, and mirror the future
  Supabase schema.
- Lists reload on screen focus instead of using a shared cache, so there
  is no second source of truth to keep in sync.

**Maps pricing (founder question, researched 2026-10-14):** Google's
pricing page (updated 2026-10-08) lists the native **Maps SDK** SKU with
an **"Unlimited"** free monthly cap and no per-1,000 price. The Android
usage page says billing must be enabled on the Cloud project and an API
key is required. So native Android map loads cost $0, but a card/billing
account is needed. The separate "Dynamic Maps" SKU (10,000 free, then
$7/1,000) applies to other map types; which features would trigger it
(e.g. Map IDs / cloud styling) wasn't confirmed, so avoid those. In Expo
Go, maps work with no key at all.

**Next single action:** Founder works through `.claude/TESTING.md`
(indoor sections first, then outdoor) and sends back the results table.

**Commit:** `c808723` (pushed by the founder before the next session).

### Route map, splits, Profile --- 2026-10-15

**Milestone / status:** Milestone 4's deferred route map + extras;
implemented, automated checks pass, **device testing not done**.
Founder: "implement further features, I'll test everything today."
Interpreted as: build what needs no founder accounts or decisions. Cloud
sync (Milestone 7) stays parked because it needs a Supabase project and
a sign-in decision.

**What changed:**

- **Route map** on run details (`src/components/RouteMap.tsx`):
  `react-native-maps 1.27.2` via `npx expo install` (SDK 57 version,
  included in Expo Go; no API key needed there). It's a static preview:
  gestures off so it doesn't fight page scrolling; dark map via
  `userInterfaceStyle="dark"` (supported on Android per the library's
  types). That avoids custom map styling / Map IDs, which may fall under
  a charged SKU. Lime line per recording segment (paused gaps show as
  breaks), start and finish dots, framed to fit the route. Fewer than 2
  points shows "No route to show".
- **Per-km splits** on run details (`src/features/runs/routeGeometry.ts`):
  from saved route points. Kilometre boundaries are interpolated between
  points; paused gaps between segments are excluded; a final partial
  split is shown if ≥ 50 m. Split distances sum to the run's distance.
  Split times are moving time between GPS points, so they can total a
  little less than the run duration (noted on screen).
- **Profile screen** (replaces the "coming soon" skeleton): lifetime stats
  (runs, total distance, total time, longest run, fastest average pace
  among runs ≥ 1 km); a "Your data" card (stored only on this phone,
  Prymal doesn't upload or share it, location only while the run screen
  is open, maps download Google map images for the area); **Delete all
  runs** with a confirmation that names the count; app version.
- Storage: `getRunPoints`, `deleteAllRuns` (one transaction: runs →
  cascaded points, plus the checkpoint).

**Files changed:**

- New: `src/features/runs/routeGeometry.ts` (+ test),
  `src/components/RouteMap.tsx`
- Modified: `src/screens/RunDetailScreen.tsx` (map + splits),
  `src/screens/ProfileScreen.tsx` (rewritten),
  `src/features/runs/runRecord.ts` (+ test: `lifetimeStats`),
  `src/features/runs/runStore.ts` (+ test), `src/features/runs/useRuns.ts`
  (`useRunPoints`), `package.json`, `package-lock.json`
- `.claude/TESTING.md`, `.claude/PROGRESS.md`, `.claude/ROADMAP.md`

**Commands run and results (automated, on Windows dev machine):**

- `npx expo install react-native-maps` --- `1.27.2`. No config plugin was
  added (none is needed for Expo Go).
- `npm test` --- **75 tests, 75 pass**. First run: 70/71. The failure
  was in the test, not the code: it expected exactly 100,000 ms, but
  test points built from an approximate metres-per-degree constant give
  ~99,99x ms. Changed it to a tolerance.
- `npx tsc --noEmit` --- exit 0.
- `npx expo-doctor` --- 20/21; the `expo` patch mismatch now reads
  expected `~57.0.29`, found `57.0.27` (Expo shipped another patch;
  still not upgraded inside a feature change).
- `npx expo export --platform android --clear` (temp dir) --- exit 0,
  `Android Bundled 111904ms ... (1365 modules)`; bundle contains the map
  native component (`AIRMap`) and the new screen copy.
- `CI=1 npx expo start --port 8099` + Android bundle fetch --- HTTP 200,
  `Android Bundled 57077ms ... (1524 modules)`. Server stopped.

**Physical-device validation:** **None.** See `TESTING.md` §3b and
"Route map and splits".

**Known issues / limitations:**

- **Real builds need a Google Maps API key** (Maps SDK for Android,
  billing-enabled Cloud project, key restricted to package + SHA-1).
  Without it, a development/store build would show a blank map. Expo Go
  is unaffected.
- `userInterfaceStyle="dark"` on the map is from the library's typings,
  not yet seen on the device. If the map renders light, it's cosmetic.
- The map is a static preview (no pan/zoom); a full-screen interactive
  map can come later.
- Map tiles are fetched from Google when the details screen opens
  (stated in the Profile privacy card).

**Decisions made:**

- Static, gesture-free map preview: no scroll conflicts, cheaper to
  render.
- No custom JSON map styling or Map ID, to stay on the free native Maps
  SDK SKU.
- Profile has no name/avatar: there are no accounts yet, and inventing
  local identity now would conflict with Milestone 7's auth decision.

**Next single action:** Founder works through `.claude/TESTING.md`
(now including Profile, route map, and splits) and sends back the
results table.

**Commit:** `ee53c97` (local, not pushed).

### Google Cloud setup for maps --- 2026-10-15

**Founder-reported:** created a Google Cloud project named **prymal** and
enabled billing. Not verified by Claude: there's no console access, and
none is needed.

**Not needed for Expo Go testing.** Maps already work there with no key.
This setup is only for development/store builds.

**Remaining steps** (from Google's API-security page, updated 2026-10-13,
and Expo's react-native-maps and env-variable docs):

1. Founder: enable **Maps SDK for Android** in the project.
2. Founder: create an API key on the **Google Maps Platform Credentials**
   page. Immediately set **API restrictions → Maps SDK for Android only**.
3. Founder: add a **budget alert** on the billing account (Google's page
   warns: "You are financially responsible for charges caused by abuse
   of unrestricted API keys").
4. **Blocked on decisions:** the key's **application restriction**
   needs the Android **package name** (not set in `app.json` yet;
   permanent once published on Play) and the app's **SHA-1 signing
   fingerprint**. The fingerprint only exists once a signing key exists,
   i.e. after setting up EAS (Expo account + project) for a development
   build, or later from Play Console app signing for store builds.
5. Claude, once 4 is decided: wire the key into the build via the
   `react-native-maps` config plugin (`androidGoogleMapsApiKey`), read
   from an environment variable. Never commit it to git. Use `.env.local`
   locally (already gitignored via `.env*.local`) and an EAS environment
   variable for cloud builds.

**Security notes:** a Maps key in an Android app ships inside the app,
so it isn't truly secret. Its protection is the restrictions (package +
SHA-1 + API). Still keep it out of git and out of chat. Don't enable
other paid Google APIs (Places, Directions, Street View) in this project
without discussing cost first.

**Free trial (founder-reported 2026-10-17):** the account shows
₹28,796.63 credit with a 90-day expiry, i.e. Google Cloud's $300 Free
Trial "Welcome credit". Per Google's Free Program page (updated
2026-10-13): no automatic charges. The trial billing account auto-closes
when the credit is spent or 90 days pass; billing is then disabled on
its projects, there's a 30-day grace period, and then resources are
deleted. Charges only start after upgrading to a Paid account
("Activate"). **Implication:** before any real build relies on the Maps
key, the founder must upgrade to Paid, or the key's project loses
billing and maps go blank in builds. Native map loads still cost $0.
Expo Go is unaffected. The credit isn't needed for Prymal's current
plans; Supabase is billed separately.

**Next single action:** Founder enables Maps SDK for Android, creates an
API-restricted key, and sets a budget alert, then decides the Android
package name.

### Founder decisions --- 2026-10-17

- **Background tracking is a must-have:** a run must keep recording when
  the user switches apps (Spotify, YouTube). This means leaving Expo Go
  for the app's own development build. Planned as ROADMAP Milestone 6b.
- **Login wanted, but deferred:** single user (founder) for now.
- **Package name:** founder leaning `com.rethinklabs.prymal`
  ("rethinklabs" as a possible parent company). Alternative considered:
  `com.pushpendra.singh.prymal.run`. Awaiting confirmation; not yet set
  in `app.json`.
- **Build route question:** founder asked about building locally and
  installing the APK later, without an Expo account.

**Facts checked for these answers:**

- Local builds: `npx expo run:android` compiles with the locally
  installed Android SDK. `eas build --local` needs `eas login` and Expo
  states "we do not support Windows for local builds".
- This PC (checked 2026-10-17): no Android Studio, no Android SDK, no
  JDK/`java`, no `adb`; ANDROID_HOME/JAVA_HOME unset; 208.9 GB free on C:.
- Background location (SDK 57 expo-location docs): needs a development
  build; Android needs foreground + background permission; the
  foreground-service notification is required; it stops if the user
  terminates the app; Play review is needed for these permissions when
  publishing.
- Google's Android developer-verification rollout: first enforcement
  30 Sep 2026 in Brazil, Indonesia, Singapore, Thailand; global in 2027.
  India is not in the first wave (secondary sources; not confirmed on
  Google's own docs). Sources disagree on how adb installs are treated.
- Runs saved inside Expo Go stay in Expo Go's storage. They won't appear
  in the app's own build, which has separate storage.

**Next single action:** Founder confirms the package name and the build
route (local Android Studio recommended), and continues `TESTING.md` in
Expo Go meanwhile.

### Milestone 6b --- background recording + EAS setup --- 2026-10-17

**Milestone / status:** code done, automated checks pass; **no build run
yet, nothing device-tested.**

**Founder actions/decisions:** created an Expo account and logged in on
this PC (`eas whoami`: `pushpendra-singh`, also owner of org
`rethinklabs`); confirmed package `com.rethinklabs.prymal`. The build
route is now EAS cloud (Android Studio no longer needed).

**What changed:**

- `app.json`: `android.package` `com.rethinklabs.prymal`; `owner`
  `rethinklabs`; `extra.eas.projectId` `b139728b-cd94-496c-9bc8-dbe6e9a7cc19`
  (from `eas init --account rethinklabs`). `expo-location` plugin:
  `isAndroidBackgroundLocationEnabled: true`,
  `isAndroidForegroundServiceEnabled: true`, updated permission texts.
  `eas init` had also copied an explicit `android.permissions` list into
  `app.json`. It was removed so the plugin flags are the single source of
  truth; the introspected manifest still has all 5 permissions.
- `eas.json`: `development` (dev client, internal APK, env development),
  `preview` (internal APK, env preview), `production` (AAB,
  autoIncrement, env production); `appVersionSource: remote`.
- `app.config.ts`: adds the `react-native-maps` plugin with
  `androidGoogleMapsApiKey` **only if** `GOOGLE_MAPS_ANDROID_API_KEY` is
  set (local `.env.local` or an EAS "Sensitive" variable), and exposes
  only `extra.mapsConfigured: true/false` to JS, never the key.
- **Background recording** (`src/features/location/backgroundLocation.ts`):
  `expo-task-manager` task defined at bundle start-up (imported by the
  root layout), only outside Expo Go (`isRunningInExpoGo()`; the
  background-task package isn't available in Expo Go on Android).
  `startLocationUpdatesAsync` with a foreground-service notification
  ("Prymal is recording your run"), `killServiceOnDestroy: true`.
  Start/stop are serialized in a queue. Readings go to the run screen
  through a small relay. A fresh app start stops any leftover service.
- **Source selection** (`locationSource.ts`, pure + tested):
  background while recording if supported and "Allow all the time" is
  granted; otherwise the foreground watcher (before Start, while paused,
  in Expo Go, or without background permission). Pausing stops the
  service (the notification disappears).
- **Permissions:** the hook now also reports background access
  (`unsupported` in Expo Go). Before Start, the run screen offers a "Keep
  recording in other apps" card → `requestBackgroundPermissionsAsync`
  (opens Android settings on 11+). Running without it still works, with
  a "Keep Prymal open" warning.
- **Keep-awake** now only applies when background recording isn't
  available. With it, the screen may turn off.
- **Map guard:** in the app's own build without a key, the map shows
  "Route map isn't set up in this build yet" instead of rendering. Google
  Maps on Android can crash without a key; splits still show.
- Privacy copy updated so it stays true (permission explainer, Profile
  "Your data" card).
- `expo-dev-client ~57.0.20` and `expo-task-manager ~57.0.21` installed.
  Because of `expo-dev-client`, **plain `npx expo start` now targets the
  development build; use `npx expo start --go` (`npm run start:go`) for
  Expo Go.**

**Files changed:** `app.json`, `app.config.ts` (new), `eas.json` (new),
`package.json` (+ `start:go`), `package-lock.json`,
`src/app/_layout.tsx`, `src/features/location/backgroundLocation.ts`
(new), `src/features/location/locationSource.ts` (+ test, new),
`src/features/location/useGpsSignal.ts`,
`src/features/location/useLocationPermission.ts`,
`src/screens/RunScreen.tsx`, `src/screens/ProfileScreen.tsx`,
`src/components/RouteMap.tsx`, `.claude/TESTING.md`, `.claude/ROADMAP.md`,
`.claude/PROGRESS.md`

**Commands run and results:**

- `npx eas-cli@latest whoami` → logged in (EAS CLI 25.1.1).
- `npx eas-cli@latest init --account rethinklabs --non-interactive
  --force` → "Project successfully linked (ID: b139728b-…)"; it also set
  the project icon on expo.dev.
- `npx expo install expo-dev-client expo-task-manager` → OK.
- `npx expo config --type introspect` → package, owner, projectId
  correct; manifest permissions ACCESS_COARSE/FINE/BACKGROUND_LOCATION,
  FOREGROUND_SERVICE, FOREGROUND_SERVICE_LOCATION. With
  `GOOGLE_MAPS_ANDROID_API_KEY=TEST_PLACEHOLDER`: the
  `com.google.android.geo.API_KEY` meta-data is present and
  `mapsConfigured: true`; without it, both are absent/false.
- `npx eas-cli@latest config --platform android --profile development
  --non-interactive` → resolves; "No environment variables … found for
  the development environment on EAS" (expected).
- `npm test` → **81/81 pass**; `npx tsc --noEmit` → exit 0.
- `npx expo export --platform android --clear` → exit 0, 1369 modules;
  bundle contains the task name, notification text, and new copy.
- `CI=1 npx expo start --go --port 8099` + bundle fetch → the first
  request timed out after 280 s while Metro was still bundling; the retry
  got HTTP 200, 6.78 MB, 1528 modules. Metro printed an implausible
  duration (16723574 ms); timestamps show the real time was a few
  minutes. Server stopped.
- `npx expo-doctor` → 20/21: **4 patch mismatches** (expo 57.0.27 vs
  ~57.0.30, expo-constants, expo-linking, expo-router). Handled in a
  separate commit (next entry).

**Not verifiable without a build/device:** the foreground service
actually starting, Android's background-permission flow, behaviour in
other apps / with the screen locked, the OEM battery saver.

**Next single action:** Founder approves the first EAS development build.

**Commit:** `ec1ad24` (local).

### SDK 57 patch alignment --- 2026-10-17

`npx expo install --fix` before the first native build: expo 57.0.27 →
57.0.30, expo-linking 57.0.12 → 57.0.13, expo-router 57.0.26 → 57.0.28,
expo-constants installed 57.0.22 (within its existing range). It stays
within SDK 57. Done as a separate commit, since the first native build
compiles against these versions.

Results: `npx expo-doctor` → first run 20/21 with "Directory check failed
with unexpected server response" (a React Native Directory server
hiccup); re-run → **21/21 checks passed, no issues**, the first fully
clean doctor result. `npx tsc --noEmit` exit 0; `npm test` 81/81;
`npx expo export --platform android --clear` exit 0 (1369 modules);
`eas config` for the development profile resolves.

### First EAS development build --- 2026-10-17

**Founder approved** the first development build and set a build policy:
cloud builds only after 3+ features are pushed to GitHub, at most ~1 per
day (free plan: 15 Android builds/month).

**Build #1** (`09e10d08-3349-4f5f-bd78-2c40074a7f30`, profile
development, commit `a6df8bb`): EAS created and stored the Android
keystore in the cloud, uploaded the project (1.3 MB), and then
**ERRORED** in "Install dependencies":
`npm ci` → `EUSAGE … package.json and package-lock.json … are not in sync
… Missing: react-native-worklets@0.10.4 from lock file`.

**Root cause:** expo-router pulls in `react-native-reanimated` and
`react-native-worklets`. npm (locally 11.19 on Node 24) had auto-installed
reanimated 4.7.1 + worklets 0.13.0, but `expo-modules-core` only accepts
worklets `^0.7.4 … ^0.10.0` (`npm ls` showed it "invalid"). Local npm 11
tolerated it; the EAS builder (Node 22.23.1, **npm 10.9.8**) runs a
strict `npm ci` and rejected the lock file. SDK 57 expects reanimated
**4.5.1** and worklets **0.10.1**, and both are native modules compiled
into the app, so the wrong versions were also a native-build risk.

**Fix:** `npx expo install react-native-reanimated react-native-worklets`
→ pinned 4.5.1 / 0.10.1 as direct dependencies. Verified:
- `npm ls` → no invalid/missing packages (only "UNMET OPTIONAL" web/test
  extras).
- **Real `npx npm@10.9.8 ci --include=dev --ignore-scripts`** on a copy
  of package.json + lock → exit 0, 573 packages (reproduces the
  builder's install step).
- `npx tsc --noEmit` exit 0; `npm test` 81/81; `npx expo-doctor` 21/21;
  `npx expo export --platform android --clear` exit 0.

**Lesson:** before an EAS build, run `npm ls` (no "invalid") and an
`npm@10.9.8 ci` simulation, since local npm 11 is more lenient than the
builder's npm 10.

**Build #2** (`81c47380-0150-4890-8334-05030df56d13`, commit `e56ac40`):
**FINISHED** at 22:21. Queue ~74 min, build ~19 min. It reused the
cloud keystore. The builder's own `expo doctor` gave 21/21; `gradlew
:app:assembleDebug` → "BUILD SUCCESSFUL in 18m 20s"; `expo-location`
57.0.21 was autolinked. Artifact: `app-debug.apk`, **256 MB** (a debug
dev client with all ABIs; normal). The download expires 2026-10-31.
Remaining log warnings are Gradle/Kotlin noise; none were blocking.
**Not verified yet:** install on the phone, foreground-service
notification, background recording (`TESTING.md` §6).

Builds used this month: 2 of 15 (assuming failed builds count).

**Maps key next steps (founder):** expo.dev → rethinklabs → prymal →
Credentials → Android → `com.rethinklabs.prymal` → the keystore's
**SHA-1** → restrict the Google Maps key to that package + SHA-1 and to
the Maps SDK for Android → add the EAS variable
`GOOGLE_MAPS_ANDROID_API_KEY` (Sensitive; development, preview,
production). The map then appears from the **next** build (native
config), which per the build policy waits for 3+ pushed features.

**Maps key progress (founder-reported 2026-10-17):** application
restriction set to Android apps with package `com.rethinklabs.prymal` +
the EAS keystore SHA-1. Advised: API restriction → "Restrict key" → only
**Maps SDK for Android** (the key had 32 APIs selected by default, i.e.
everything enabled in the project); optionally disable unused Maps
Platform APIs project-wide. Later, for Play Store releases, add the Play
App Signing SHA-1 as a second entry.

**Update (founder-reported, same day):** disabled all project APIs except
Maps SDK for Android, and created the EAS variable. Verified by Claude
without printing the value: `eas env:list` → `GOOGLE_MAPS_ANDROID_API_KEY`,
visibility SENSITIVE, scope PROJECT, environments production, preview,
development. `eas config --profile development` → "loaded from the
'development' environment on EAS: GOOGLE_MAPS_ANDROID_API_KEY", the
react-native-maps plugin has a key, `extra.mapsConfigured: true`. **The
installed build #2 predates the key, so its map still shows the
placeholder; the next build includes it.** If anything else in Google
Cloud stops working because of the disabled APIs, re-enable that one
API; Prymal itself only needs Maps SDK for Android.

**Next single action:** Founder installs the development build and runs
`TESTING.md` §6 (background recording).

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
                                      2026-10-13, after Milestone 2)

  Milestone 2 tabs/back on device     Pass --- tabs and Android back
                                      confirmed by founder (2026-10-13)

  Lint                                Not configured; not run

  Unit tests                          Pass --- `npm test`, 75/75
                                      (2026-10-15, Node test runner,
                                      incl. 12 real-SQLite storage
                                      tests)

  Milestones 5--6 on device           Not yet tested --- see
                                      `TESTING.md`

  Milestone 3 run flow on device      Pass --- founder confirmed
                                      (2026-10-14)

  Android JS bundle (expo export)     Pass (2026-10-13)

  expo-doctor                         21/21 pass (2026-10-17, after
                                      `expo install --fix`)

  Production build (EAS/native)       Not run

  GPS outdoor test                    Not started --- Milestone 4 built,
                                      awaiting founder's outdoor runs

  Run persistence/restart test        Built; automated real-SQLite
                                      tests pass; device test pending
                                      (`TESTING.md` §1--2)
  -----------------------------------------------------------------------
