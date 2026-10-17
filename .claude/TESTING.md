# Prymal --- Device Test Plan (full build)

> One ordered session covering **everything built so far** (Milestones
> 1--8, route map, splits, Profile, background recording, reliability).
> Planned for the morning of 2026-10-18 on the **preview build** (#3),
> a standalone APK: no laptop or dev server needed, which is what you
> want for running outdoors. Everything here passes automated checks
> (90 unit tests incl. real-SQLite storage tests, typecheck, Android
> bundle, expo-doctor) but most of it has **never run on the phone**.
>
> Tick boxes as you go. Fill in "Results" at the end and send it back.
> Rough time: indoors ~30 min, outdoors ~30--45 min.

## A. Install the build

- [ ] On the phone, open the build link (added here when the build is
      ready) while logged in to expo.dev → **Install** → allow your
      browser to "install unknown apps" if Android asks.
- [ ] It has the same package as the development build, so it should
      install **as an update and keep your saved runs**. If Android says
      "App not installed", uninstall the development build first (that
      deletes its runs) and install again.
- [ ] Open **Prymal**. No red/error screen. Home loads.
- [ ] Note your **phone model and Android version** for the Results.

Not needed any more: Expo Go and the laptop dev server. (Runs saved in
Expo Go stay inside Expo Go.)

## B. Indoors

### B1. Permissions --- Milestones 3 & 6b

To retest from scratch: Settings → Apps → Prymal → Permissions →
Location → "Don't allow" (or "Ask every time").

- [ ] Start a run → Prymal's explainer appears **before** Android's
      dialog. Allow location → choose "While using the app".
- [ ] Deny once → explainer stays. Deny again → "Location is blocked for
      Prymal" + **Open settings**. Allow there, come back → the screen
      updates by itself.
- [ ] Phone location off (quick settings) → "Your phone's location is
      off" → **Turn on location** shows Android's dialog → accept → ready.
- [ ] With "While using the app": the **"Keep recording in other apps"**
      card shows before Start → **Allow all the time** → Android settings
      → choose "Allow all the time" → back → the card is gone and
      "Recording continues if you switch apps" shows.

### B2. Start without GPS and very short runs --- Milestone 8 (new)

Indoors, GPS often has no fix, which is perfect for these.

- [ ] Open the run screen while it still says "Searching for GPS…" → tap
      **Start** → dialog **"No GPS signal yet"**. **Wait** keeps you on
      Ready; **Start anyway** starts the timer.
- [ ] While recording without a fix, the GPS row says "Searching for GPS…
      distance starts when it's found" (highlighted).
- [ ] Finish within **1 minute** (distance under 100 m) → dialog **"Very
      short run"** with Keep going / Discard / Save.
      - **Keep going** → still recording.
      - **Discard** → back on Home, **no run saved**. Fully close and
        reopen Prymal → still **no "Recovered" run** for it.
      - Do another short one and choose **Save** → it's saved.
- [ ] A run of **over 1 minute** (even at 0 m) → the normal "Finish run?"
      dialog.

### B3. Saving runs --- Milestone 5

- [ ] After a saved run, the summary shows "Saving…" then **"Saved to
      Activities"**. **View run** opens the details.
- [ ] Home: **Total runs** and Recent activity include it (newest first);
      with 4+ runs a **See all** link opens Activities.
- [ ] Activities lists runs with date, distance, duration, pace.
- [ ] Swipe Prymal away and reopen → runs are still there.

### B4. Crash recovery --- Milestone 5

- [ ] Start a run, record **~40 s**, swipe Prymal away (don't Finish).
      The notification disappears. Reopen → Home shows a **Recovered**
      run of roughly 15--40 s, with the "Saved automatically after Prymal
      closed" note in details.
- [ ] Start, **Pause** after ~20 s, swipe away, reopen → Recovered run of
      ~20 s.
- [ ] Start, then leave via **X → Discard** (and once via Android back →
      Discard). Close and reopen → **no** recovered run.
- [ ] Open the run screen but don't Start, close, reopen → no new run.

### B5. Run details and delete --- Milestone 6

- [ ] Details: back arrow and Android back both return.
- [ ] **Delete run** → Cancel keeps it; Delete removes it and Total runs
      drops.
- [ ] Indoor runs with no GPS points: map area says "No route to show";
      no splits section.

### B6. Profile --- added 2026-10-15, updated for Milestone 8

- [ ] Stats: Runs, Total distance, Total time, Longest run, Fastest pace
      (1 km+; `--:--` until you have a 1 km run). They match your runs.
- [ ] "Your data" card reads correctly (stored on this phone, location
      only during runs, maps load Google map images).
- [ ] **"If recording stops in other apps"** card → **Open Prymal
      settings** opens Android's app settings for Prymal.
- [ ] **Delete all runs** → the confirmation names the count → Cancel
      keeps everything. (Do the real "Delete all" only at the very end, if
      at all.)
- [ ] Version shows "Prymal 1.0.0".

### B7. Small screens and large text --- Milestone 8 + Milestone 1 leftover

- [ ] Settings → Display → Font size **max** (and Display size max if
      available). Run screen: everything is reachable by **scrolling**,
      nothing is cut off, Start/Pause/Finish buttons are visible. The
      background card and finished summary scroll too.
- [ ] Home, Activities, Profile, details still readable. Set sizes back.

## C. Outdoors (one walk or run, ~30--45 min)

Grant "Allow all the time" first (B1). Keep a known-distance route in
mind (400 m track lap, or a route measured in Google Maps). If you can,
also record with another running app to compare.

### C1. GPS basics --- Milestone 4

- [ ] Wait for **"GPS good ±N m"** before Start (no "No GPS signal yet"
      dialog this time).
- [ ] **Standing still** ~1 min after Start: distance stays at or very
      near `0.00`, pace `--:--`.
- [ ] **Known distance:** note Prymal's distance vs the reference.
- [ ] Avg pace appears after ~100 m and looks plausible.
- [ ] **Pause test:** Pause, walk ~100 m, Resume → that 100 m isn't added.

### C2. Background recording --- Milestone 6b

- [ ] While recording, the notification **"Prymal is recording your
      run"** is visible.
- [ ] **Switch apps:** use Spotify/YouTube for **2+ minutes** while
      moving, come back → distance kept increasing.
- [ ] **Screen locked:** lock the phone for **2+ minutes** while moving,
      unlock → distance kept increasing. The screen was allowed to turn
      off by itself (it isn't kept on in this mode).
- [ ] Pause → notification goes away. Resume → it comes back. Finish → it
      goes away.

### C3. GPS lost and location off --- Milestone 8 (new)

- [ ] Walk under cover / into a building / underpass for **~20 s** while
      recording → GPS row: **"GPS signal lost. Distance resumes when it's
      back."** Back outside → returns to "GPS good".
- [ ] Turn **phone location off** in quick settings for ~20 s while
      recording → the GPS row warns (signal lost or GPS unavailable).
      Turn it on → it recovers and the run continues. Note what you saw.

### C4. Map and splits --- after the run

- [ ] Run details show a **dark map** with your route as a lime line, a
      white-ringed start dot and a lime finish dot; the whole route fits.
      (This build includes the Google Maps key. If it says "Route map
      isn't set up in this build yet", note it.)
- [ ] The pause-test section shows as a **gap** in the line.
- [ ] Scrolling the page doesn't move the map.
- [ ] **Splits:** one row per full km plus the last partial row; paces
      look plausible.

### C5. Optional extra checks

- [ ] **Permission downgrade mid-run:** during a run, set Location to
      "While using the app" in settings and come back → the note changes
      to "Keep Prymal open: without 'Allow all the time'…" and the screen
      stays on. (Android may instead restart Prymal; then a Recovered run
      appears. Note which happened.)
- [ ] **Battery saver on:** record ~10 min while in another app → did
      recording survive?
- [ ] If you ever see **"Background recording couldn't start"**, note
      when (it means the fallback kicked in).

## D. Low priority

- [ ] If you can switch to 3-button navigation: tab bar and run-screen
      buttons sit above the system buttons.

## Results --- send these back

Phone model / Android version:

| Test | Reference distance | Prymal distance | Duration | Avg pace | Route points | Readings ignored | GPS row mostly showed |
|---|---|---|---|---|---|---|---|
| Standing still (C1) | 0 m | | | | | | |
| Known distance (C1) | | | | | | | |
| Pause test (C1) | | | | | | | |
| Switch apps 2+ min (C2) | | | | | | | |
| Screen locked 2+ min (C2) | | | | | | | |
| GPS lost (C3) | | | | | | | |

Anything that failed or felt wrong (section, step, what happened):

-
