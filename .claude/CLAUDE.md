# Prymal --- Claude Code Project Instructions

> This file is the primary operating contract for Claude Code in this
> repository. Read it before making changes. Product requirements live
> in `PRODUCT.md`, visual guidance in `DESIGN.md`, milestones in
> `ROADMAP.md`, and durable execution status in `PROGRESS.md`.

## 1. Mission

Build **Prymal**, a mobile running tracker that will gradually grow into
a playful, real-world territory-capture running game. The immediate goal
is to get a small, reliable, testable running-tracker application onto
the founder's Android phone as quickly as practical.

The founder is an experienced frontend engineer (Angular, TypeScript,
JavaScript) who is newer to React Native and Expo. They use Windows, VS
Code, GitHub, Claude Code, and an Android phone. Prefer clear,
reviewable TypeScript and explain non-obvious React Native / Expo
choices briefly in progress notes.

## 2. Current known state --- verify before assuming

Known from the founder: - The Expo app has been created and named
**prymal**. - The app connected and ran on the founder's Android
phone. - The initial setup was pushed to a GitHub repository. - The
founder selected a **runner-first** Home screen (Option A), not a
game-first dashboard. - The intended early Home screen has a prominent
Start a Run action, weekly distance, total runs, recent activity, and
Home / Activities / Profile navigation. - Initial visual direction: dark
charcoal/green-black surfaces with a bright lime accent. - No feature
beyond the starter app should be assumed complete unless verified in the
repository and on-device.

The exact installed Expo template, navigation setup, package versions,
repository URL, current Git branch, and existing files are not known in
this document. **Inspect them. Do not overwrite or recreate the app.**

## 3. Read these documents

Before implementation: 1. Read `PRODUCT.md`. 2. Read `DESIGN.md`. 3.
Read `ROADMAP.md`. 4. Read `PROGRESS.md`. 5. Inspect the actual project
files and compare the documented state with reality.

If these files conflict, follow this priority: 1. The founder's latest
explicit instruction. 2. `PRODUCT.md` for product scope. 3. `DESIGN.md`
for visual decisions. 4. `ROADMAP.md` for sequencing. 5. `PROGRESS.md`
for current status (it records reality; it cannot override product
requirements). 6. These general engineering instructions.

## 4. Operating mode and autonomy

The founder intends to run Claude Code in auto mode. Work independently
within the agreed scope and avoid asking for approval for every routine
decision.

### Do autonomously

-   Inspect the repository and installed dependencies.
-   Make small, coherent changes for the current milestone.
-   Reuse existing project conventions where reasonable.
-   Implement accessible, responsive UI that works on a real Android
    phone.
-   Run available lint, type-check, tests, and Expo validation commands.
-   Fix issues caused by your changes.
-   Add or update focused tests where useful.
-   Update `PROGRESS.md` and `ROADMAP.md` after meaningful work.
-   Create Git commits only if the environment and instructions clearly
    permit it; do not push to a remote unless explicitly asked.

### Stop and ask the founder before

-   Deleting user data, repository history, or significant existing
    work.
-   Running destructive commands or resetting/force-pushing Git history.
-   Making paid purchases, provisioning paid infrastructure, or creating
    billable services.
-   Publishing the app, submitting to app stores, or deploying a public
    service.
-   Making legal, privacy, or account-security commitments.
-   Adding a major dependency or changing the application architecture
    in a way that is difficult to reverse, when a reasonable alternative
    exists.
-   Accessing, printing, committing, or transmitting secrets, API keys,
    credentials, or personal data.
-   Expanding scope significantly beyond the current milestone.

Never expose secret values in logs, screenshots, commits, documentation,
or chat. Use environment variables and ignored local configuration for
secrets. Do not commit `.env` files or signing credentials.

## 5. Work in small, verifiable milestones

-   Complete the **current milestone only**, then validate it before
    moving to the next one.
-   Do not attempt to implement the entire roadmap in a single pass.
-   Prefer the smallest complete user-visible vertical slice over
    scaffolding for hypothetical future features.
-   Do not add territory capture, social systems, avatars, XP,
    subscriptions, or other future game systems before the basic running
    tracker works.
-   If a prerequisite is missing, implement only the prerequisite needed
    for the current milestone.
-   If a command fails, diagnose the cause and fix it when safe; do not
    hide or silently ignore the failure.
-   If a required validation cannot run, document exactly why and what
    the founder must do.

## 6. First-session procedure

On the first session, do these in order:

1.  Inspect the repository: list files, read `package.json`, inspect the
    app entry point, existing navigation, TypeScript config, and Git
    status.
2.  Check the installed Expo / React Native versions and the existing
    template. Do not assume Expo Router or a particular folder structure
    is installed.
3.  Check whether the working tree contains uncommitted changes.
    Preserve them.
4.  Compare actual repository state with `PROGRESS.md`; correct the
    status document if needed.
5.  Implement only the first milestone in `ROADMAP.md`: a polished,
    functional runner-first Home screen using mock data, unless
    repository inspection reveals a blocking issue.
6.  Keep dependencies minimal. Prefer the project's existing libraries
    and patterns. Do not add navigation libraries merely to render a
    single screen.
7.  Run the available checks and launch/verify with Expo if the
    environment supports it.
8.  Update `PROGRESS.md` with what changed, commands run, outcomes,
    manual testing still needed, and the single next action.
9.  Give the founder a concise report: what works, what was tested, what
    they should test on the phone, and any blocker.

Do not proceed into GPS tracking, authentication, database integration,
or other milestones until the Home screen milestone is validated.

## 7. Engineering principles

-   TypeScript first. Avoid `any`; if unavoidable, explain and contain
    it.
-   Use functional React components and hooks.
-   Follow the installed Expo and React Native versions rather than
    blindly applying tutorials for other versions.
-   Prefer simple, readable code over premature abstraction.
-   Keep UI, data access, and domain logic reasonably separated without
    building an elaborate framework.
-   Use stable keys for lists.
-   Handle loading, empty, error, and permission states for real data
    features.
-   Make tap targets comfortable for mobile; support safe areas and
    different Android screen sizes.
-   Use accessible labels and sufficient contrast.
-   Avoid blocking the UI with expensive synchronous work.
-   Keep components small when that improves clarity, but don't split
    every line into a component.
-   Avoid duplicate sources of truth and unnecessary state.
-   Don't fabricate real metrics. Clearly mark mock data as sample data
    until connected to persisted activities.
-   Don't claim a feature is tested on-device unless it was actually
    tested on a physical device or clearly identified emulator.

## 8. Dependency and platform rules

-   The chosen direction is **React Native + Expo + TypeScript**.
-   **Supabase** is the planned backend for authentication and
    persistence, when those milestones are reached.
-   **Expo Location** is the planned GPS/location API.
-   **React Native Maps** is a possible map library for the route
    screen; verify compatibility with the actual Expo SDK before
    installing it.
-   Background GPS tracking may require an Expo development build and
    platform configuration; Expo Go alone may not support all production
    tracking behavior. Do not promise locked-screen tracking until
    tested in an appropriate build.
-   Expo Router was proposed as a navigation option, but inspect the
    repository first and use what is already installed unless there is a
    clear reason to change.
-   Before adding/upgrading a package, check compatibility with the
    project's installed Expo SDK and use the relevant Expo installation
    command where appropriate.
-   Do not upgrade Expo / React Native versions as part of an unrelated
    feature.

## 9. GPS, privacy, and safety

When location functionality is introduced: - Ask for foreground location
permission in context and explain why it is needed. - Handle permission
denied, location unavailable, weak accuracy, and GPS timeout states
gracefully. - Do not record or upload location in the background without
explicit user-facing consent and a clear product need. - Avoid logging
precise coordinates in production logs. - Make start, pause, resume, and
finish states unambiguous. - Protect users from accidental activity loss
where practical. - Keep raw GPS samples and derived run summaries
clearly distinguished. - Do not share routes or expose home/work
locations by default. - Make it clear when a run is recording.

## 10. Definition of done for each milestone

A milestone is not done merely because code was written. It is done
when: - The scoped behavior is implemented. - Relevant type checks,
lint, tests, or build checks pass where available. - Any unavailable
checks are explicitly documented. - No unrelated files or configuration
were changed unnecessarily. - The founder has a short, actionable
on-device test checklist when physical testing is needed. -
`PROGRESS.md` and `ROADMAP.md` reflect the actual result. - Known
limitations and follow-up work are recorded.

## 11. Progress tracking format

Update `PROGRESS.md` after every meaningful milestone or session.
Include: - Current milestone and status. - Implemented behavior. - Files
changed. - Validation commands and exact outcomes. - Manual device
testing needed / completed. - Known bugs and limitations. - Decisions
made and why. - One next recommended action.

Use checkboxes in `ROADMAP.md`. Never mark a task complete based only on
intention. If a task is partially complete, say so.

## 12. Communication style

Be direct, concise, and specific. Avoid long generic explanations and
avoid claiming success without evidence. Report exact commands and test
outcomes. When asking the founder to do something, give one clear action
at a time. The founder prefers milestone-by-milestone development and
early real-device testing.

## 13. Git hygiene

-   Inspect `git status` before changes and before any commit.
-   Preserve founder changes.
-   Never run `git reset --hard`, force push, or delete branches without
    explicit permission.
-   Do not commit secrets, build artifacts, caches, or local environment
    files.
-   Do not automatically push commits to GitHub.
-   If making commits is appropriate, use a focused message and report
    the commit hash.

## 14. Immediate objective

The next product deliverable is a **runner-first Home screen**: - Dark
charcoal / green-black visual treatment. - Bright lime accent. - Prymal
wordmark. - Friendly, motivating headline. - Prominent Start a Run
button. - Weekly distance and total-run stats. - Recent activity empty
state. - Home / Activities / Profile navigation presentation.

Use mock data only for this first UI milestone. The Start a Run button
should not pretend GPS tracking exists; it can be a clearly identified
placeholder or disabled/not-yet-implemented action until the run flow is
built. Do not add dead interactive controls that imply a working
feature.

After this screen is implemented and tested, follow `ROADMAP.md` in
order.
