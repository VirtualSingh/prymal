# Prymal --- Product Brief

## 1. Product summary

**Prymal is a running tracker that will evolve into a playful,
competitive, real-world territory game.**

The initial product must be useful even before the game layer exists: a
runner can start a run, track distance and duration, see pace and a
route, finish the activity, and review saved runs. Over time, running
becomes a way to explore, compete, build identity with friends or a
pack, and claim territory in the real world.

Working name: **Prymal**. Treat the name as provisional until app-store,
domain, and trademark checks have been completed. Do not imply that the
name is legally cleared.

Brand direction discussed: primal energy, movement, competition,
exploration, playful game mechanics. An early tagline idea was **"RUN
WILD. CLAIM YOUR WORLD."** This is a working concept, not locked final
marketing copy.

## 2. Product ambition

Create a mobile experience that makes going for a run feel like more
than logging exercise. The product should connect: - **Movement:** real
GPS-based running and activity tracking. - **Progress:** personal stats,
history, streaks, and goals. - **Play:** territory capture, XP, scores,
and unlockable customization. - **Competition:** leaderboards, rivals,
and territory ownership. - **Belonging:** packs or groups, invites, and
shared challenges. - **Exploration:** make familiar streets and parks
feel like a playable world.

The core loop, once mature, is: go out for a run → record real movement
→ earn progress and/or claim territory → compare with rivals or your
pack → return to defend, explore, and improve.

## 3. Initial target user

Start with people who run outdoors and enjoy measurable progress. The
experience should be approachable for casual runners while leaving room
for competitive players. Avoid assuming that users are elite athletes.

Initial priorities: - Fast path from opening the app to understanding
how to start. - Reliable, readable run stats. - Trustworthy recording
and saving. - A motivating, playful personality without overwhelming the
tracker. - Clear privacy controls around location and routes.

## 4. Product principles

1.  **Utility first:** the first release must work as a running tracker,
    not merely look like a game.
2.  **Test early:** get a basic screen onto the founder's Android phone
    quickly, then build and validate one vertical slice at a time.
3.  **Real data over fake claims:** mock data is acceptable in early UI
    work but must be identified as mock data and replaced when real
    activity data exists.
4.  **Simple before complex:** do not build the entire future game
    architecture before a real run can be recorded and saved.
5.  **Playful, not childish:** the brand can be bold and energetic while
    the interface stays clear and usable.
6.  **Location is sensitive:** be transparent about recording and
    sharing, and do not expose routes by default.
7.  **Progress should be visible:** both the app and the development
    process should make progress easy to understand.
8.  **Offline resilience matters:** a run should not be lost just
    because mobile data is weak. Implement durable local handling when
    the tracking milestone is reached.

## 5. MVP scope: the first useful tracker

The first useful version should aim to support this journey:

1.  Open the app and land on Home.
2.  Tap Start a Run.
3.  Understand and grant location permission if needed.
4.  See that the run is actively recording.
5.  View elapsed time, distance, pace, and route as available.
6.  Pause and resume.
7.  Finish and confirm the activity.
8.  See a run summary.
9.  Save the run and find it in Activities.
10. Reopen the app and see previously saved activities.

Implementation should be incremental. First build the Home UI with mock
data; then build the tracking flow; then persistence/history. Do not try
to implement all ten steps in one giant change.

### Home screen first milestone

-   Prymal wordmark.
-   Motivating headline.
-   Prominent Start a Run action.
-   Weekly distance.
-   Total runs.
-   Recent activity area with an empty state for new users.
-   Bottom navigation presentation: Home, Activities, Profile.

Initial placeholder stats can show zero values (for example, 0.0 km and
0 runs). Do not invent completed workouts.

### Run tracking milestone

-   Explicit idle, recording, paused, and finished states.
-   Elapsed time.
-   Distance based on filtered GPS samples.
-   Pace with sensible handling when distance is zero or GPS is poor.
-   Route line/map when map integration is ready.
-   Start, pause, resume, and finish controls.
-   Clear permission, GPS accuracy, and failure messaging.
-   Protect against duplicate timers, duplicate point writes, and stale
    updates.
-   Test real outdoor runs; simulator/mock coordinates are not a
    substitute for real GPS validation.

### Activity history and summary

-   Persist each completed run.
-   Show date, distance, duration, average pace, and route preview when
    available.
-   Show a summary immediately after finishing.
-   Support empty/loading/error states.
-   Keep the first version focused; avoid social feeds and complex
    analytics.

### Profile

A minimal profile can follow the first working run flow. Authentication
should be introduced when there is a clear reason to persist or sync
user-owned data. Do not make signup a blocker for viewing a local
prototype unless product requirements later change.

## 6. Long-term feature vision --- not initial scope

These are future directions. Do not implement them before the core
tracker is reliable.

### Territory capture

-   Use real running routes to determine territory that a runner can
    claim.
-   Show owned territory and contested areas.
-   Allow rivals to capture or steal territory under clearly defined
    rules.
-   Show territory on a map and provide feedback after a run.
-   Prevent obvious exploits and avoid encouraging dangerous running
    behavior.

The exact territory geometry, capture rules, defense/decay rules, and
fairness model are not finalized. Do not invent a complicated system
now; record questions for later product design.

### Social and competition

-   Leaderboards.
-   Friends/rivals.
-   Packs or teams and invites.
-   Shared challenges or pack identity.
-   Activity visibility and privacy controls.

### Progression and personalization

-   Streaks, score, XP, or currency.
-   Avatar customization, including skins, shoes, and clothing.
-   Unlockables and progression.
-   Potential lock-screen/live activity status where supported by the
    chosen platform and build configuration.

These are ideas, not commitments for the first MVP. Avoid monetization
or pay-to-win mechanics unless explicitly decided later.

## 7. Core navigation direction

The initial information architecture is: - **Home:** start-run entry
point and a quick view of progress. - **Activities:** list of saved runs
and access to run details. - **Profile:** basic user identity and later
settings.

A dedicated active-run and run-summary experience will be added as the
run flow is implemented. Use the navigation solution already present in
the repository unless there is a compelling, documented reason to change
it.

## 8. Technology direction

Chosen direction: - React Native. - Expo. - TypeScript. - Supabase for
future authentication and cloud persistence. - Expo Location for device
location. - React Native Maps as a possible map display library, after
checking compatibility. - Expo Router was discussed as a navigation
option, but it is not confirmed to be installed. Inspect the repo before
making assumptions.

The founder is comfortable with JavaScript and TypeScript, experienced
with Angular, newer to React Native, and has some Supabase experience.

Important platform note: reliable background/locked-screen GPS tracking
can require a development build, permissions, and native configuration
beyond Expo Go. Verify this against the installed Expo SDK before
implementing or promising it.

## 9. Data concepts (future, not required for first screen)

Possible core entities: - **Profile:** user identity and preferences. -
**Run:** owner, start/end times, duration, distance, pace summary,
status, and timestamps. - **Run point:** latitude, longitude, timestamp,
and accuracy for a recorded GPS sample. - **Territory:** later entity
for a claimable geographic area, ownership, and claim history. - **Pack
/ membership:** later group and user relationships.

A preliminary backend idea is `profiles`, `runs`, and `run_points`, with
row-level security for user-owned data. This is not a finalized schema.
Design it when persistence is reached, with access control and location
privacy considered from the start. Never commit credentials.

## 10. Product success criteria

Early product success is not measured by how many features exist. It is
measured by whether a real user can: - Understand the Home screen
without explanation. - Start a run without confusion. - Record a
plausible route and distance outdoors. - Pause/resume and finish
reliably. - See a useful summary. - Find the run after reopening the
app. - Trust that recording status and location handling are clear.

The first milestone is visual and functional foundation. The first
meaningful MVP milestone is a run recorded and reviewed on a real
Android phone.

## 11. Naming and market note

Prymal is a working product name. Earlier brainstorming considered
TurfUp, Runzo, Turfz, DashUp, Roamz, and RunRiot; Prymal remained the
chosen working name. A preliminary web search suggested that the
territory-running category already has adjacent apps, so distinctive
positioning matters. No legal or store availability clearance has been
completed. Do not spend time building a brand-protection process into
the codebase; simply keep the name provisional until the founder checks
availability.

## 12. Open product questions --- defer unless blocking

-   Final name, logo, and tagline.
-   Exact territory geometry and capture/defense rules.
-   How leaderboards are ranked and how cheating is handled.
-   Whether accounts are required before the first run.
-   Cloud sync and offline-first details.
-   Activity visibility defaults and route privacy controls.
-   Whether the first public release targets Android only or Android and
    iOS.
-   Monetization, if any.

Do not interrupt the first Home screen milestone to resolve these
questions.
