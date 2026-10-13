# Prymal --- Claude Code Handover Pack

This folder contains the project context and working agreements for
Claude Code.

## Files

-   `CLAUDE.md` --- read-first instructions, autonomy boundaries,
    engineering workflow, validation rules.
-   `PRODUCT.md` --- product vision, MVP, future features, technology
    direction, and open questions.
-   `DESIGN.md` --- visual direction and the runner-first Home screen
    specification.
-   `ROADMAP.md` --- ordered milestones and completion criteria.
-   `PROGRESS.md` --- current known state, validation status, and next
    action.

## How to use

1.  Copy these Markdown files into the root of the existing `prymal`
    repository. Keep the exact filenames.
2.  Do not replace the app's existing `package.json`, entry point, app
    configuration, or other code with anything from this handover pack.
3.  Open Claude Code from the repository root.
4.  Ask Claude to read `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`,
    `ROADMAP.md`, and `PROGRESS.md`, inspect the repository, and
    implement only Milestone 1.
5.  Let Claude run safe checks and make changes, then review its report
    and test the screen on the Android phone.
6.  Once the milestone is validated, commit the working version to
    GitHub using the founder's normal workflow.

## Suggested first Claude Code prompt

Read `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`, `ROADMAP.md`, and
`PROGRESS.md` fully. Inspect the existing repository and Git status
before editing anything. Preserve all existing work. Implement only
Milestone 1: the runner-first Prymal Home screen described in
`DESIGN.md`. Use mock data, keep dependencies minimal, and do not
implement GPS, authentication, Supabase, or territory mechanics yet. Run
all relevant checks available in this project, report their exact
results, update `PROGRESS.md` and `ROADMAP.md`, and tell me exactly what
to test on my Android phone. Do not push to GitHub or perform
destructive Git operations.

## Important

These documents describe intended product direction and known
founder-reported setup status. They do not prove that code features
exist or tests pass. Claude must inspect the actual repository and
update the progress record based on evidence.
