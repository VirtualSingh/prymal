# Prymal --- Pending Device Tests

> Everything below is built and passes automated checks (typecheck, unit
> tests, real-SQLite tests, Android bundle) but has **not** been tested on
> the phone yet. Work top to bottom. Tick boxes as you go and note
> anything odd in "Results". Created 2026-10-14.

## 0. Setup (do this first)

- [ ] In the terminal running Expo, press **Ctrl+C**, then run
      **`npx expo start --go --clear`** (or `npm run start:go -- --clear`).
      Since 2026-10-17 `expo-dev-client` is installed, so plain
      `npx expo start` now targets the app's own development build, not
      Expo Go. New native modules were also added, so an old server will
      break.
- [ ] Open the app in Expo Go. No red error screen.
- [ ] Location permission is owned by **Expo Go** while testing, so
      Android dialogs say "Expo Go". Reset it via Settings → Apps → Expo Go
      → Permissions → Location.
- [ ] Your saved runs live inside Expo Go's storage on the phone. Clearing
      Expo Go's data or uninstalling it deletes them.

## 1. Saving runs (indoors is fine) --- Milestone 5

- [ ] Home → Start a run → Start → wait ~20 s → Finish → confirm.
      Summary shows "Saving…" then **"Saved to Activities"**.
- [ ] Tap **View run**: run details open with date, distance, duration,
      pace, route points, readings ignored.
- [ ] Back → Home: **Total runs = 1**; the run appears under Recent
      activity. "This week" shows its distance (indoors this is likely
      0.0 km, which is expected).
- [ ] Activities tab lists the run with date, distance, duration, pace.
- [ ] Do two more short runs. Home shows the 3 newest; with 4+ runs a
      **See all** link appears and opens Activities. Newest is first.
- [ ] Fully close Prymal (swipe Expo Go away from recent apps), reopen:
      all runs are still there.

## 2. Crash recovery --- Milestone 5

- [ ] Start a run, keep it **recording ~40 s**, then swipe Expo Go away
      (don't Finish). Reopen Prymal. Home shows a run tagged
      **Recovered**. Its duration is roughly 15--40 s (it's saved up to the
      last automatic save, which happens every 15 s while recording).
      Details screen shows the "Saved automatically after Prymal closed"
      note.
- [ ] Start a run, **Pause** after ~20 s, swipe Expo Go away. Reopen: a
      Recovered run with ~20 s duration (paused time not counted).
- [ ] Start a run, then leave it via **X → Discard**. Close and reopen
      Prymal: **no** recovered run appears for it.
- [ ] Open the run screen but **don't** press Start, close the app,
      reopen: no new run appears.

## 3. Run details and delete --- Milestone 6

- [ ] Tap a run → details. Back arrow and Android back both return.
- [ ] **Delete run** → confirmation → Delete → you're back on the list
      and the run is gone. Home's Total runs drops by one.
- [ ] Cancel on the delete confirmation keeps the run.

## 3b. Profile (indoors is fine) --- added 2026-10-15

- [ ] Profile tab shows Runs, Total distance, Total time, Longest run,
      Fastest pace (1 km+). Numbers match your saved runs. Fastest pace
      shows `--:--` until you have a run of at least 1 km.
- [ ] "Your data" card is readable.
- [ ] **Delete all runs** → confirmation names the number of runs →
      Cancel keeps everything; Delete all empties Profile, Home (Total
      runs 0), and Activities.
- [ ] With no runs, the Delete all button is hidden.
- [ ] App version shows at the bottom ("Prymal 1.0.0").

## 4. Outdoor GPS --- Milestone 4 (needs going outside)

Keep the app open and the screen on for all of these.

- [ ] **Standing still:** wait for "GPS good", Start, stand still ~1 min.
      Distance stays at or very near `0.00`; pace stays `--:--`.
- [ ] **Known distance:** walk/run a distance you know (400 m track lap,
      or a route measured in Google Maps), ideally with another running
      app recording too. Compare distances.
- [ ] **Pause:** Pause, walk ~100 m, Resume. That 100 m must not be added.
- [ ] Screen doesn't turn off by itself while recording or paused.
- [ ] Avg pace appears after ~100 m and looks plausible.
- [ ] The finished run is saved and shows the same numbers in Activities.

### Route map and splits (after an outdoor run) --- added 2026-10-15

- [ ] Open the outdoor run's details: a **dark map** shows your route as a
      lime line, a white-ringed dot at the start and a lime dot at the
      finish. The whole route fits in the frame.
- [ ] The map doesn't move when you scroll the page (it's a preview).
- [ ] With the pause test run: the route has a **gap** where you walked
      while paused (separate line pieces).
- [ ] **Splits** list one row per full km (pace + time) plus a last
      partial row (e.g. "0.43 km"). Paces look plausible. Runs shorter
      than 50 m show no splits.
- [ ] An indoor run with no GPS points shows "No route to show" instead
      of a broken map.

## 6. Own build: background recording --- Milestone 6b (after the first EAS build)

These can't be tested in Expo Go. Do them once the development build
from EAS is installed. Runs saved in Expo Go won't appear in this app:
it has its own storage.

- [ ] Install the development build: on the phone, open
      https://expo.dev/accounts/rethinklabs/projects/prymal/builds/81c47380-0150-4890-8334-05030df56d13
      (logged in to expo.dev) → **Install** → allow your browser to
      "install unknown apps" if Android asks. The APK is ~256 MB (normal
      for a development build). The download link expires 2026-10-31.
- [ ] On the laptop run **`npx expo start --clear`** (without `--go`),
      with the phone on the same Wi-Fi, then open **Prymal** (not Expo Go)
      and pick the dev server or scan the QR code. Android dialogs now say
      **Prymal**.
- [ ] Run screen, before Start: a **"Keep recording in other apps"** card
      appears. Tap **Allow all the time** → Android settings → choose
      "Allow all the time" → back. The card is gone and the line
      "Recording continues if you switch apps" shows.
- [ ] Start → a notification **"Prymal is recording your run"** appears.
- [ ] **Switch apps:** while walking, open Spotify/YouTube for 2+ minutes,
      come back. Distance kept increasing during that time.
- [ ] **Screen locked:** lock the phone while walking 2+ minutes, unlock.
      Distance kept increasing. The screen was allowed to turn off.
- [ ] Pause → notification goes away. Resume → it comes back. Finish → it
      goes away.
- [ ] **Swipe Prymal away** from recent apps mid-run → the notification
      disappears. Reopen → a **Recovered** run is saved.
- [ ] **Without "Allow all the time"** (set it back to "While using the
      app"): start a run → the line "Keep Prymal open: without 'Allow all
      the time'…" shows and the screen stays on.
- [ ] Phone battery saver / brand-specific "app power management": note
      whether recording survives ~10 minutes in another app.
- [ ] Run details in this build: the map shows **"Route map isn't set up
      in this build yet"** until the Google Maps key is added (expected).
      Splits still show.

## 5. Earlier leftovers (low priority)

- [ ] Android font size at maximum: Home, Activities, run screen don't
      overlap badly. (Milestone 1)
- [ ] If you can switch to 3-button navigation: tab bar and run screen
      buttons sit above the system buttons. (Milestone 1)

## Results --- send these back

For each outdoor run, from the summary/details screen:

| Test | Reference distance | Prymal distance | Duration | Avg pace | Route points | Readings ignored | GPS row mostly showed |
|---|---|---|---|---|---|---|---|
| Standing still | 0 m | | | | | | |
| Known distance | | | | | | | |
| Pause test | | | | | | | |

Anything that failed or felt wrong (screen, step, what happened):

-
