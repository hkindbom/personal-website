---
title: "The Lissajous Sweep"
date: 2026-03-15
excerpt: "Why a 3:7 sweep pattern works well for camera movement validation."
demo: "lissajous"
---

Before I trusted my tracker to point the camera at real aircraft, I had an obvious problem. Debugging the tracker and debugging the gimbal at the same time was a bad idea. The arc-second unit conversion, the tilt-before-pan byte order, or the clamping logic could all be wrong, and if I tested everything at once I would not know which layer had failed.

So I wrote a test that made the camera do something visually obvious. I wanted a sweep I could watch and reason about without needing a target in frame, with full-range coverage, smooth movement, and a pattern distinctive enough that wrong behaviour would stand out immediately.

<section class="demo-card" id="demo-lissajous-sweep">
<h3>3:7 Lissajous sweep</h3>
<canvas class="demo-canvas" style="height:280px"></canvas>
</section>

That pattern is a [Lissajous figure](https://en.wikipedia.org/wiki/Lissajous_curve), with two axes driven by independent sine waves at different frequencies.

## What the Sweep Is Doing

For the camera, pan follows one sine wave and tilt follows another. Both start at zero phase. If the periods were the same, the camera would trace the same diagonal forever, which is useless for coverage testing. With different periods, the two waves drift in and out of phase and the path slowly fills in.

```python
pan  = PAN_ARC  * math.sin(2 * math.pi * t / PAN_PERIOD)
tilt = tilt0 + TILT_ARC * math.sin(2 * math.pi * t / TILT_PERIOD)
```

`PAN_PERIOD` is 30 seconds. `TILT_PERIOD` is 70 seconds. The ratio 30/70 = 3/7, so the pattern does repeat eventually, but only after a relatively long cycle. In practice that gives broad coverage before the path closes and starts retracing.

If you chose a simpler ratio like 1:2 or 2:3, you would get a closed figure much sooner and the camera would spend more of its time redrawing it. Those patterns close sooner, which makes them worse for coverage testing. A 3:7 ratio keeps the sweep useful for longer.

## The Terminal Display

While it runs, I wanted to see what the camera was actually doing without switching to the video feed. So the script draws a little ASCII grid in the terminal, updated in place.

<div class="terminal-demo" id="demo-terminal">
<div class="terminal-demo-title">Live terminal display (same coordinate mapping as the script)</div>
<div class="terminal-screen" style="min-height:18.9em"></div>
</div>

The `●` is the current camera position. The grid has axis lines through zero so you can see where centre is. Each frame, it moves the cursor up by the grid height and overwrites the previous frame in place, so there is no scrolling.

```python
up = len(lines)
print(f"\033[{up}A" + "\n".join(lines), flush=True)
```

`\033[{up}A` is an ANSI escape sequence that moves the cursor up by `up` lines. Then the script prints the new frame on top. Simple animation without `curses`.

The grid is 50 columns wide and 9 rows tall. I picked those numbers to fit comfortably in a standard terminal without taking over the screen. Each column is about 6.8 degrees of pan, and each row about 4.4 degrees of tilt, enough resolution to confirm that the gimbal is moving in the right direction and reaching the right extremes.

## The Timing Loop

At 5 Hz, each iteration has a 200 ms budget. The USB round-trip to send a pan/tilt command takes about 20 ms. I want to sleep for whatever is left rather than sleeping a fixed 200 ms and letting the USB overhead accumulate.

```python
interval = 1.0 / UPDATE_HZ
t0 = time.monotonic()

while not stopped:
    t = time.monotonic() - t0
    pan  = PAN_ARC  * math.sin(2 * math.pi * t / PAN_PERIOD)
    tilt = tilt0 + TILT_ARC * math.sin(2 * math.pi * t / TILT_PERIOD)

    cam.set_pan_tilt_degrees(pan, tilt)
    draw(pan, tilt, ...)

    elapsed = time.monotonic() - t0 - t
    remaining = interval - elapsed
    if remaining > 0:
        time.sleep(remaining)
```

`t` is measured at the top of the loop before the USB call. `elapsed` is how long the loop body actually took. `remaining` is the budget minus what was spent. If a USB call takes longer than usual, which happens occasionally when the kernel UVC driver reclaims the device mid-cycle, the next iteration starts immediately rather than falling behind.

This also means the position computation uses a consistent `t` relative to `t0`, not a timestamp taken after the USB call. The sine waves stay phase-coherent regardless of jitter in the command round-trip.

## Ctrl+C Handling

Because the sweep covers the full gimbal range, stopping it abruptly leaves the camera pointing somewhere arbitrary. I wanted Ctrl+C to return the camera to wherever it started.

```python
def stop_and_restore() -> None:
    nonlocal stopped
    stopped = True
    cam.set_pan_tilt_degrees(pan0, tilt0)
    time.sleep(3)

signal.signal(signal.SIGINT, handle_sigint)
```

`pan0` and `tilt0` are read from the camera at startup with `get_pan_tilt_degrees()`. On Ctrl+C, the script sends the camera back to that position and waits 3 seconds for the gimbal to physically get there before printing the final confirmed position and exiting.

The `time.sleep(3)` is a guess. The gimbal takes roughly 2-3 seconds to traverse its full range at default speed. Waiting 3 seconds is usually enough. An alternative would be to poll `get_pan_tilt_degrees()` until it is close enough to the target, but the sleep is simpler and has worked every time I have used it.

## What I Learned From It

The sweep caught two bugs before I started on the tracker proper.

First, pan and tilt were swapped in the SET payload. Sending `pan=30, tilt=10` was physically producing tilt=30, pan=10. This is the tilt-before-pan byte order documented in my [reverse engineering post](/posts/reverse-engineering-the-insta360-link). I had read it correctly from the USB captures but put it back together wrong. Watching the ASCII grid move sideways when I expected up/down made it obvious immediately.

Second, the degree-to-arc-second conversion had a sign error on tilt. Positive tilt should move the camera up; I had it going down. Again, immediately obvious on the grid, not at all obvious from reading the code.

Neither of these would have been easy to catch by pointing at a specific aircraft, because either one could have looked like a coordinate geometry mistake higher up the stack. The sweep worked because it isolated the gimbal control layer from the rest of the tracker and reduced the problem to something simple enough to see.
