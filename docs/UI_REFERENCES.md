# UI references to steal

Curated 2026-05-11 from a focused review of commitment-device, sprite-on-map, morning-check-in, navigation, and voice apps.

## Top 3 to steal immediately

1. **Pikmin Bloom — persistent flower trail + golden-hour map bake.** Pastel-desaturated map base, low-poly trees, *flower trail painted on the sidewalk behind the avatar as you walk*, permanent golden-hour lighting. This is the closest existing app to Class on Time's brief. Mapbox Standard with `lightPreset: "dusk"` gets us 70% of the way; add the trail behind the user puck for the other 30%.
2. **Cold Turkey — brutalist black lockup screen.** Full-bleed dark panel, one sentence, no dismiss button. Use this for the "you're late, $100 is being charged" moment — the *anti-escape* aesthetic Naomi explicitly asked for.
3. **Citymapper — Live Activity countdown for "leave now."** Notification + Dynamic Island countdown ("Leave in 4 min · 12 min walk"). Steal verbatim for the departure alert.

## By category

### Commitment device apps (the "money on the line" UI)
- **Beeminder** — escalating-pledge pill on every goal card ("Next derail: $30"). Drab otherwise. **Steal the pill.**
- **StickK** — wizard's stakes step: giant dollar input above one sentence. Anti-charity selector is famous (KKK / opposing team) but probably skip — too edgy for Naomi's playful vibe.
- **Forfeit (UK)** — Apple-Pay-chip-style "£20 on the line" + countdown ring. **Steal the chip + ring combo for the home card.**
- **Cold Turkey** — see #2 above.

### Cute sprite-on-map (the cartoon vibe)
- **Pikmin Bloom** — see #1.
- **Pokemon Go** — third-person rear camera at ~30° tilt, never top-down. Idle = weight-shift + occasional yawn every ~3s. **Steal the camera angle and stationary fidget loop.**
- **Monster Hunter Now** — chunkier stylized trees if Mapbox low-poly feels too thin.
- **Skip Wizards Unite** — too small avatar, too realistic map. Cautionary tale.

### Morning check-in (the daily roll call)
- **Habitica** — pixel-art reward sparkle on tap + HP bar that depletes when you skip. **Steal the HP-bar metaphor:** show *today's stake remaining* as a depleting bar, not a number.
- **Sunsama** — single-column morning modal, one decision per row, generous whitespace, cream background. **Steal the layout pattern verbatim.** Never a grid.
- **Streaks / Productive** — haptic-thunk on completion. **Steal the haptic.** Skip the hex grid.

### Walking navigation
- **Citymapper** — see #3.
- **Apple Maps** — haptic tick at each turn. **Steal that, skip the cold aesthetic.**
- **Google Maps** — steal nothing.
- **Pokemon Sleep / Pikmin Bloom walk-cards** — **steal the mascot-led CTA copy:** "Time to head out — I'll walk with you."

### Voice confirmation
- **Day One voice journal** — cleanest: big circular record button center-bottom, expanding waveform ring, auto-stop on 2s silence, transcript appears live, single "Looks good" CTA. **Steal verbatim.**
- **Khan Academy Kids** — green-check + mascot-cheer + confetti on success. **Steal the success animation for the post-commit moment.**
- **Otter** — auto-stop tuning at 1.5s silence is the right number.

## Concrete design decisions

| UI surface | Borrowed from | Specifics |
|---|---|---|
| Home map | Pikmin Bloom + Mapbox Standard | dusk preset, golden hour, low-poly trees, flower trail behind user |
| Camera angle | Pokemon Go | rear 3/4 view, ~55° pitch, zoom 17 |
| Idle avatar | Pokemon Go | weight-shift + yawn every 3s |
| "Leave now" notification | Citymapper | Live Activity + countdown |
| Morning roll-call screen | Sunsama | single column, one decision per row, big touch targets |
| Today's stake display | Habitica HP bar | depleting orange bar, not a $ number |
| Voice record | Day One | big circle, waveform, auto-stop 1.5s silence |
| Voice success | Khan Academy Kids | mascot + confetti |
| Late penalty lockup | Cold Turkey | brutalist black, one sentence, no dismiss |
| Cancellation cost chip | Forfeit | Apple Pay-style chip "$25 to cancel" |

## What we are explicitly NOT doing
- Google Maps look (boring, adult)
- Hex grid of habits (too dense)
- Anti-charity stakes (too edgy)
- Realistic map (we want cartoon)
- Top-down camera (always 3/4)
