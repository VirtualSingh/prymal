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

-   [x] Add a clear Start Run entry. (Home card opens `/run`;
    confirmed on device 2026-10-14.)
-   [x] Explain location permission in context. (Explainer before the
    system prompt; confirmed on device 2026-10-14.)
-   [x] Handle granted, denied, and unavailable location states.
    (Undetermined, denied/can-ask-again, blocked → Open settings, phone
    location off → Turn on location, error → Try again. Founder
    confirmed permission flows on device 2026-10-14; the "error" state
    can't be triggered manually.)
-   [x] Implement run state transitions: idle → recording → paused →
    recording → finished. (Pure reducer, unit-tested; UI confirmed on device
    2026-10-14.)
-   [x] Track elapsed duration correctly through pause/resume.
    (Timestamp-based; unit-tested incl. multiple pause/resume cycles;
    confirmed on device 2026-10-14.)
-   [x] Prevent duplicate intervals/subscriptions and clean up location
    watchers correctly. (One interval keyed on status; watcher removed
    on cleanup, including if it resolves after unmount. Verified by code
    review; on device, pause/resume and leaving the screen behaved
    correctly, 2026-10-14. No leak-detection tooling was used.)
-   [x] Keep a visible recording state and safe finish/cancel
    interactions. (Status badge, finish confirmation, discard guard on
    close/back. Confirmed on device 2026-10-14.)
-   [x] Validate on Android with permission edge cases. (Founder
    confirmed permission flows on device, 2026-10-14.)
-   [x] Tab bar icons (founder request, 2026-10-13): Ionicons via
    `@react-native-vector-icons/ionicons`, filled when selected. Confirmed
    on device 2026-10-14.

**Exit criteria:** A user can start, pause, resume, and finish a run
without the timer or location watcher duplicating or leaking.

## Milestone 4 --- GPS route and metrics

**Decision (founder, 2026-10-14):** Option A --- foreground-only in Expo
Go, screen kept on during runs. Background tracking is a later,
separate step.

-   [x] Integrate Expo Location using APIs compatible with the installed
    Expo SDK. (`watchPositionAsync` checked against the SDK 57 docs and
    types; watcher confirmed on device in Milestone 3.)
-   [-] Collect timestamped GPS samples with accuracy metadata.
    (Implemented; outdoor check pending.)
-   [-] Filter obviously poor or impossible samples conservatively.
    (Accuracy > 25 m, stale > 30 s, duplicate/out-of-order, > 12 m/s
    jumps, jitter below max(5 m, accuracy). Unit-tested; thresholds
    need outdoor tuning.)
-   [-] Calculate distance using accepted samples; handle low accuracy
    and zero distance. (Unit-tested; outdoor check pending.)
-   [-] Calculate pace without showing Infinity/NaN or misleading
    values. (`--:--` until 100 m; unit-tested; device check pending.)
-   [-] Keep the screen on while a run is in progress
    (`expo-keep-awake`). Device check pending.
-   [-] Add a route map only after verifying map library compatibility
    and required setup. **Built for Expo Go 2026-10-15** (founder: "implement
    further features"): `react-native-maps 1.27.2` (SDK 57 version), dark
    static preview on run details, plus per-km splits. Device check
    pending. Google Cloud project "prymal" with billing created by the
    founder 2026-10-15 (next steps in `PROGRESS.md`: enable Maps SDK for
    Android, restricted key, budget alert, package name + SHA-1).
    **Still needs the founder before any real build:**
    `react-native-maps` works in Expo Go with no setup, but Android
    development/production builds need a Google Maps API key restricted
    to the app's package name and SHA-1 (Maps SDK for Android, Google
    Cloud project). Route points are already recorded (and now saved in
    `run_points`) for a later map. **Pricing checked 2026-10-14** on
    Google's pricing page: the native "Maps SDK" SKU has an "Unlimited"
    free cap and no listed price, but the Cloud project must have billing
    enabled (card on file). Avoid Map IDs/cloud styling and Street View,
    which may fall under charged SKUs.
-   [ ] Test outdoors on a real Android phone; document observed
    limitations.
-   [-] Research development-build requirements before implementing
    background/locked-screen tracking. (Initial notes in `PROGRESS.md`
    2026-10-14. Not implemented.)

**Exit criteria:** An outdoor run produces plausible time, distance,
pace, and route data, with clear behavior when GPS is weak.

## Milestone 5 --- Summary and local durability

**Note:** Built 2026-10-14 before Milestone 4's outdoor validation, at
the founder's request ("defer all the real testing… start building more
stuff"). All device tests are collected in `TESTING.md`.

-   [-] Show a useful summary after finishing. (Duration, distance, pace,
    GPS counts, save status. Device check pending.)
-   [-] Store completed runs locally first if that is the simplest
    reliable route for the chosen architecture. (`expo-sqlite`: `runs`,
    `run_points`; auto-save on Finish. Real-SQLite tests pass; device
    check pending.)
-   [-] Restore saved activities after app restart. (Device check
    pending.)
-   [-] Handle interrupted app sessions and incomplete runs
    thoughtfully. (Checkpoint every 15 s / on pause / on background;
    recovered on next launch at checkpoint time, tagged "Recovered".
    Tested against real SQLite; device check pending.)
-   [x] Test no network / weak network where relevant. (Not relevant
    yet: all storage is local and no network is used.)

**Exit criteria:** The founder can finish a run, see the summary,
close/reopen the app, and find the saved run.

## Milestone 6 --- Activity history

-   [-] Show a list of saved runs. (Activities tab, newest first; Home
    shows 3 most recent + real weekly distance / total runs. Device check
    pending.)
-   [-] Include date, distance, duration, and average pace. (Device
    check pending.)
-   [-] Add a run detail screen if needed. (`/activity/[id]` with delete.
    Device check pending.)
-   [-] Provide loading, empty, and error states. (Implemented for Home,
    Activities, and details; error states can't easily be triggered by
    hand.)
-   [x] Add focused tests for formatting and calculations. (62 tests:
    formatting, pace, track filter, session reducer, run records, weekly
    stats, and storage against real SQLite.)

**Exit criteria:** Previous runs are easy to find and their values are
consistent with the run summary.

## Milestone 6b --- Own build + background tracking (founder must-have)

**Founder decision 2026-10-17:** recording must continue when the runner
switches to another app (e.g. Spotify, YouTube). Expo Go can't do this
("Foreground and background services are not available in Expo Go for
Android"), so this needs the app's own (development) build.

-   [x] Founder confirms the Android package name (leaning
    `com.rethinklabs.prymal`) → set `android.package` in `app.json`.
    (Confirmed 2026-10-17; set.)
-   [-] Choose a build route. **Chosen 2026-10-17: EAS cloud builds.**
    Founder created an Expo account; the project is linked as
    `@rethinklabs/prymal`, and `eas.json` has development / preview APK /
    production profiles. **First development build succeeded 2026-10-17**
    (attempt 2, `81c47380…`; attempt 1 failed on a lock-file mismatch,
    fixed in `e56ac40`). Not yet installed on the phone. **Local on Windows:** Android Studio (SDK +
    bundled JDK), then `npx expo run:android`; no Expo account needed.
    `eas build --local` is not an option (Expo: "we do not support Windows
    for local builds"). **Cloud:** EAS Build, which needs an Expo account
    (free tier).
-   [-] (Implemented 2026-10-17; device check pending.) Background location: `expo-task-manager` +
    `Location.startLocationUpdatesAsync` with an Android foreground-service
    notification while recording. Config plugin
    `isAndroidBackgroundLocationEnabled` (+ foreground service). Expo docs:
    on Android "you must request both foreground and background
    permissions"; background is granted in system settings ("Allow all
    the time") on Android 11+, so explain it in-app first.
-   [-] Keep the current foreground-only watcher as a fallback when
    running in Expo Go. (Implemented; also used without "Allow all the
    time". Device check pending.)
-   [-] Maps API key in the build, kept out of git. (Wiring done in
    `app.config.ts` via `GOOGLE_MAPS_ANDROID_API_KEY`; verified with a
    dummy value. Waiting on the founder's key + EAS variable. The SHA-1
    comes from EAS-managed credentials after the first build.)
-   [ ] Test on the phone: switch to other apps mid-run, screen locked,
    battery-saver behaviour of the phone's brand, and swipe-away (Expo
    docs: "Background location will stop if the user terminates the
    app").
-   [ ] Before any Play Store release: Google Play review/declarations for
    background location and the location foreground service.

**Exit criteria:** A run keeps recording distance while the founder uses
other apps and with the screen locked, on the founder's phone.

## Milestone 7 --- Supabase account and cloud sync

**Founder decision 2026-10-17:** sign-in is wanted eventually but
**deferred**; the founder is the only user for now.

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

**Started 2026-10-17** (founder: "work on reliability and polish"). Code
changes are listed below; all device checks are in `TESTING.md` for the
full-build session on 2026-10-18.

-   [-] Test permission denial and later permission recovery. (GPS row
    now says when location is off mid-run; the background permission
    downgrade falls back to the foreground watcher. Device test:
    `TESTING.md` B1, C3, C5.)
-   [-] Test app backgrounding and interruption behavior in the actual
    build type. (Background service falls back to the foreground watcher
    if it can't start, and the UI states what's really running. Device
    test: C2, B4.)
-   [-] Test screen sizes, safe areas, and readable stats. (Run screen,
    permission gate, and summary now scroll. Device test: B7.)
-   [ ] Check location accuracy and distance calculation on multiple
    real runs. (Device test: C1; needs several real runs.)
-   [-] Handle accidental finish, empty runs, duplicate saves, and app
    restart. ("Very short run" Discard/Save on finish < 1 min and
    < 100 m; "No GPS signal yet" confirmation on Start; no checkpoint
    after discard, so a discarded run can't come back as "recovered";
    saves were already idempotent and recovery already existed. Device
    test: B2, B4.)
-   [-] GPS signal-lost detection: no reading for 10 s while recording →
    "GPS signal lost" instead of a stale "GPS good". (Device test: C3.)
-   [-] Add privacy explanation and route visibility decisions. (Profile
    "Your data" card states local-only storage, location only during
    runs (incl. background with notification), and that maps load Google
    tiles; Delete all runs added 2026-10-15; battery-saver help card
    2026-10-17. Route sharing/visibility decisions wait for cloud sync.)
-   [ ] Fix high-impact defects before expanding scope. (After the
    2026-10-18 test session.)

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

Milestone 8 code is done and passes automated checks. Next: the founder
pushes to GitHub and approves an EAS **preview build** (standalone APK
with the Maps key) for the full-build test session on 2026-10-18,
following `TESTING.md` top to bottom. Then fix whatever that session
finds. Milestone 7 (Supabase/login) is deferred by the founder.
