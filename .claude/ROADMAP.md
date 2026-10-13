# Prymal --- Development Roadmap

## Working rule

Build one small, testable milestone at a time. Get the app running on
the founder's Android phone as early as possible. Don't skip validation
or implement future game systems ahead of the tracker.

Statuses: - `[ ]` Not started - `[-]` In progress - `[x]` Completed and
validated - `[!]` Blocked / needs a decision

Claude must update these checkboxes only when the status is supported by
repository inspection, command results, or actual device testing. Record
what kind of validation occurred.

## Milestone 0 --- Baseline and repository inspection

-   [x] Expo app created and named `prymal` (founder-reported).
-   [x] App connected and running on Android through the development
    setup (founder-reported).
-   [x] Initial setup pushed to GitHub (founder-reported).
-   [x] Inspect repository structure and actual template. (2026-10-13:
    Expo SDK 57 blank TypeScript template, `index.ts` → `App.tsx`.)
-   [x] Inspect `package.json`, app entry point, installed navigation,
    TypeScript configuration, and Git status. (No navigation library;
    no lint/test config; `strict` TS.)
-   [x] Confirm how to launch the app from the current repository.
    (`npx expo start` — verified locally serving an Android bundle.)
-   [x] Align `PROGRESS.md` with the actual repository.

**Exit criteria:** Claude can describe the real project structure and
launch command without guessing. Existing work is preserved.

## Milestone 1 --- Runner-first Home screen (do this first)

-   [x] Implement the Prymal Home screen using `DESIGN.md`. (Typecheck +
    bundle pass; renders on founder's Android phone in Expo Go,
    2026-10-13 screenshot.)
-   [x] Use mock data only for initial stats and recent activity.
    (Verified by code inspection: `src/data/homeSummary.ts`.)
-   [x] Include wordmark, welcome headline, prominent Start a Run
    action, weekly distance, total runs, recent activity empty state.
    (All visible on founder's Android phone, 2026-10-13 screenshot.)
-   [x] Include Home / Activities / Profile navigation only in a way
    supported by the existing setup; avoid adding unnecessary
    dependencies. (Static, non-pressable bar; Activities/Profile
    labelled "Soon"; no navigation library added. Bar sits above the
    gesture handle on device.)
-   [x] Keep Start a Run honest: no fake GPS or fake recording.
    (Non-pressable surface with "Run tracking coming soon"; verified by
    code inspection.)
-   [x] Verify TypeScript/build checks available in the repository.
    (`tsc --noEmit` pass; `expo export --platform android` pass; no lint
    or tests configured.)
-   [x] Launch through Expo and ask founder to validate on Android.
    (Founder ran it in Expo Go on their Android phone and reported "the
    app is working", with a screenshot, and confirmed Start a run is
    inert on tap. Not yet confirmed: large-font layout.)
-   [x] Update `PROGRESS.md` with files changed, checks, and device test
    status.

**Exit criteria:** Home renders cleanly on the founder's Android phone,
layout fits the screen, no runtime error, and the founder confirms it
looks acceptable.

## Milestone 2 --- Navigation and screen skeletons

-   [x] Add or complete Home, Activities, and Profile navigation if it
    is not already available. (Expo Router tabs under `src/app/`;
    typecheck + Android bundle pass; founder confirmed navigation works
    on Android phone, 2026-10-13.)
-   [x] Create simple, consistent empty states for Activities and
    Profile. (Shared `EmptyState` component; reached on device via the
    tabs.)
-   [x] Confirm back behavior and Android layout. (`backBehavior=
    "firstRoute"`; founder confirmed Android back works on device,
    2026-10-13.)
-   [x] Keep screens deliberately simple; no auth or cloud backend
    required yet unless needed by existing architecture. (Verified by
    code inspection.)

**Exit criteria:** The user can move between the basic app sections and
return Home without errors.

## Milestone 3 --- Run flow and permission handling

-   [ ] Add a clear Start Run entry.
-   [ ] Explain location permission in context.
-   [ ] Handle granted, denied, and unavailable location states.
-   [ ] Implement run state transitions: idle → recording → paused →
    recording → finished.
-   [ ] Track elapsed duration correctly through pause/resume.
-   [ ] Prevent duplicate intervals/subscriptions and clean up location
    watchers correctly.
-   [ ] Keep a visible recording state and safe finish/cancel
    interactions.
-   [ ] Validate on Android with permission edge cases.

**Exit criteria:** A user can start, pause, resume, and finish a run
without the timer or location watcher duplicating or leaking.

## Milestone 4 --- GPS route and metrics

-   [ ] Integrate Expo Location using APIs compatible with the installed
    Expo SDK.
-   [ ] Collect timestamped GPS samples with accuracy metadata.
-   [ ] Filter obviously poor or impossible samples conservatively.
-   [ ] Calculate distance using accepted samples; handle low accuracy
    and zero distance.
-   [ ] Calculate pace without showing Infinity/NaN or misleading
    values.
-   [ ] Add a route map only after verifying map library compatibility
    and required setup.
-   [ ] Test outdoors on a real Android phone; document observed
    limitations.
-   [ ] Research development-build requirements before implementing
    background/locked-screen tracking.

**Exit criteria:** An outdoor run produces plausible time, distance,
pace, and route data, with clear behavior when GPS is weak.

## Milestone 5 --- Summary and local durability

-   [ ] Show a useful summary after finishing.
-   [ ] Store completed runs locally first if that is the simplest
    reliable route for the chosen architecture.
-   [ ] Restore saved activities after app restart.
-   [ ] Handle interrupted app sessions and incomplete runs
    thoughtfully.
-   [ ] Test no network / weak network where relevant.

**Exit criteria:** The founder can finish a run, see the summary,
close/reopen the app, and find the saved run.

## Milestone 6 --- Activity history

-   [ ] Show a list of saved runs.
-   [ ] Include date, distance, duration, and average pace.
-   [ ] Add a run detail screen if needed.
-   [ ] Provide loading, empty, and error states.
-   [ ] Add focused tests for formatting and calculations.

**Exit criteria:** Previous runs are easy to find and their values are
consistent with the run summary.

## Milestone 7 --- Supabase account and cloud sync

-   [ ] Decide whether sign-in is needed for the first usable release.
-   [ ] Set up Supabase using safe environment configuration.
-   [ ] Implement auth only when needed, with clear
    signed-in/signed-out/loading/error states.
-   [ ] Design profiles/runs/run_points schema based on actual
    requirements.
-   [ ] Enable and test row-level security; users must not read or
    mutate another user's private data.
-   [ ] Add sync and conflict/error behavior without risking local run
    loss.
-   [ ] Never commit secrets or expose service-role credentials in the
    app.

**Exit criteria:** A user's data is correctly scoped and can be
retrieved across app sessions/devices as intended.

## Milestone 8 --- Reliability and first MVP polish

-   [ ] Test permission denial and later permission recovery.
-   [ ] Test app backgrounding and interruption behavior in the actual
    build type.
-   [ ] Test screen sizes, safe areas, and readable stats.
-   [ ] Check location accuracy and distance calculation on multiple
    real runs.
-   [ ] Handle accidental finish, empty runs, duplicate saves, and app
    restart.
-   [ ] Add privacy explanation and route visibility decisions.
-   [ ] Fix high-impact defects before expanding scope.

**Exit criteria:** Core run recording and review are stable enough for
repeated personal use.

## Milestone 9 --- Game foundation (only after tracker is reliable)

-   [ ] Product-design territory geometry and capture rules.
-   [ ] Decide how a run can claim territory and how claims can be
    contested.
-   [ ] Design a map layer for territory.
-   [ ] Design anti-cheat/fairness constraints.
-   [ ] Add progression/score only when it has a clear relationship to
    activity.
-   [ ] Test that game mechanics do not encourage unsafe routes or risky
    behavior.

**Exit criteria:** Territory rules are explicit and testable before they
are coded.

## Later ideas --- not committed MVP scope

-   [ ] Leaderboards and rivals.
-   [ ] Packs/teams and invites.
-   [ ] Streaks, XP, and currency.
-   [ ] Avatar customization (skins, shoes, clothes).
-   [ ] Lock-screen/live activity status where supported.
-   [ ] Shared challenges and richer social features.
-   [ ] Name, domain, trademark, and app-store availability checks
    before public launch.

## Immediate next action

Milestones 1 and 2 are validated on the founder's Android phone. Next:
start Milestone 3 (run flow and permission handling).
