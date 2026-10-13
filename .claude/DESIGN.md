# Prymal --- Design Direction

## 1. Design intent

Prymal should feel like a bold, modern running product with the energy
of a game. It should be motivating and slightly wild, but the core
running interface must remain calm, legible, and easy to use outdoors.

The first screen is **runner-first**, not a territory-game dashboard.
The user should immediately understand how to start a run and see a
quick sense of progress.

## 2. Brand concept

-   Working name: **prymal.**
-   Personality: playful, energetic, competitive, exploratory,
    confident.
-   Early tagline idea: **"RUN WILD. CLAIM YOUR WORLD."** Not final.
-   Visual motif: movement, routes, maps, territory, progress.
-   Avoid: generic corporate fitness UI, excessive gradients, noisy
    dashboards, tiny labels, decorative complexity, or a childish
    cartoon style.

## 3. Initial color tokens

Use these as starting tokens and centralize them so they can be adjusted
later.

  -------------------------------------------------------------------------
  Token                     Value                   Intended use
  ------------------------- ----------------------- -----------------------
  `background`              `#111411`               Main app background

  `surface`                 `#20241F`               Cards and raised
                                                    surfaces

  `accent`                  `#DFFF69`               Primary action, key
                                                    highlights, selected
                                                    navigation

  `textPrimary`             `#FFFFFF`               Main text

  `textSecondary`           `#A2A69A`               Supporting text

  `borderSubtle`            `#343A30`               Dividers and subtle
                                                    borders

  `textOnAccent`            `#17200B`               Text/icons on lime
                                                    button

  `textOnAccentSecondary`   `#34401F`               Supporting text on lime
                                                    surfaces
  -------------------------------------------------------------------------

Do not hard-code these colors repeatedly across unrelated files. Use a
small theme/constants module if it fits the existing project structure.
Avoid introducing a styling library for this simple first screen.

## 4. Typography and hierarchy

-   Use clear, strong headlines.
-   Use readable body text and subdued but legible secondary labels.
-   Use tabular-looking or consistently aligned numerals for stats when
    possible.
-   Keep labels short: "This week", "Total runs", "Recent activity".
-   Prioritize readable sizes and contrast on a phone used outdoors.
-   Use the system font initially unless a custom font is already
    installed and licensed.

Suggested hierarchy: 1. Wordmark. 2. Screen headline. 3. Primary Start a
Run action. 4. Stat values. 5. Section headings. 6.
Supporting/empty-state text.

## 5. Layout principles

-   Respect safe areas, Android status/navigation bars, and device
    notches.
-   Use a scrollable layout if needed for shorter devices; don't force
    content off-screen.
-   Use comfortable tap targets (aim around 44--48 dp or more for
    primary actions).
-   Use consistent spacing, card padding, and corner radii.
-   Keep the Start a Run button visually dominant.
-   Avoid excessive card nesting and separators.
-   Bottom navigation should have clear selected and unselected states.
-   Use icons only when they improve scanning; labels should still be
    visible for navigation.
-   Ensure the design works on narrow Android phones as well as larger
    screens.

## 6. Home screen specification --- first UI milestone

### Header

-   Brand wordmark: `prymal.`
-   Small supporting label: `YOUR RUNNING JOURNEY`
-   Optional profile icon on the right, but do not make it look
    functional unless it has a real action.

### Welcome block

-   Small contextual eyebrow or greeting.
-   Headline: `Ready to move?`
-   Supporting copy: `Every run starts somewhere.`
-   Do not rely on a hard-coded weekday/date that can become stale.

### Primary action

-   Large lime button/surface.
-   Label: `Start a run`.
-   Supporting label: `Track your next adventure`.
-   Use an appropriate play/route icon if available.
-   It must not imply GPS recording works until the run flow exists.
    During the Home-only milestone, either make it a clearly marked
    not-yet-available placeholder or a disabled action with clear
    supporting text. Prefer avoiding a dead-looking button that appears
    to work but does nothing.

### Stats

Two compact stat cards: - `This week` --- initial mock value `0.0 km`. -
`Total runs` --- initial mock value `0`. - Mock values must be easy to
replace with real data later. Don't scatter fake values through
components.

### Recent activity

-   Heading: `Recent activity`.
-   Empty state: `Your first run starts here`.
-   Supporting copy: `Complete a run to see your progress.`
-   A subtle route/map/footsteps icon is optional.
-   When real runs exist, this section should eventually show a concise
    list instead of the empty state.

### Bottom navigation

Three destinations: - Home. - Activities. - Profile.

Only implement real navigation if the project already supports it
cleanly and the destinations have a defined placeholder screen. If the
first milestone is just Home, do not add a heavy navigation dependency
only to create decorative tabs. A static visual may be used temporarily
if clearly not presented as fully functional navigation; ideally use
existing project navigation.

## 7. Interaction states

For the Home-only milestone: - Show stable empty-state data. - Do not
request location permission on Home. - Do not start timers or GPS
tracking from mock UI. - If Start a Run is not yet implemented,
communicate that honestly. - If navigation targets are placeholders,
make that status clear and don't create misleading affordances.

For future run screens: - Make recording status prominent. - Distinguish
idle / recording / paused / finished. - Use obvious controls that are
easy to tap while moving, but don't encourage interaction while running
in unsafe circumstances. - Display units consistently (km and min/km by
default for the initial India-based development context; consider
localization/preferences later). - Handle no GPS fix, weak accuracy,
permission denial, and zero-distance pace gracefully.

## 8. Accessibility and usability

-   Use accessible labels for icon-only controls.
-   Ensure lime-on-dark and text contrast are strong.
-   Do not convey state through color alone.
-   Support Android font scaling where reasonable.
-   Avoid small, low-contrast secondary labels.
-   Respect reduced motion preferences where applicable.
-   Don't place essential text inside images.

## 9. Design implementation rules

-   Inspect the current project before choosing file locations.
-   Use the project's existing styling approach if it is simple and
    consistent.
-   Keep colors and spacing centralized only as much as needed; don't
    build a design system framework prematurely.
-   Prefer native React Native primitives unless the app already has an
    appropriate UI library.
-   Do not add decorative illustrations or animations just to make the
    first screen feel complete.
-   No need to install a custom icon library for the first screen if
    suitable icons aren't already available; use text or simple
    native-compatible alternatives.
-   Validate the screen on the founder's Android phone, not only in a
    simulator.

## 10. Reference layout (conceptual)

Top to bottom: 1. `prymal.` wordmark and optional profile affordance. 2.
`YOUR RUNNING JOURNEY`. 3. `Ready to move?` 4.
`Every run starts somewhere.` 5. Large lime `Start a run` primary
action. 6. Two stat cards: weekly distance and total runs. 7. Recent
activity empty state. 8. Bottom navigation: Home / Activities / Profile.

This is a direction, not a requirement to copy a generated mockup pixel
for pixel. Optimize for a real device and the current project's
capabilities.
