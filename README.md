# Golden Sonic Studios

A self-contained browser-based Golden Sonic Studios DAW concept with:

- draggable floating studio windows
- sequencer and piano roll interactions
- Web Audio playback with kick, bass, chord, and arp voices
- animated golden studio scene and chair/piano motion states
- upload support for common and uncommon image formats via client-side conversion

## Run locally

Open `index.html` directly in a browser, or serve the folder with a tiny local HTTP server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Features

- Transport controls (play, pause, stop)
- BPM control and mixer levels
- Drum + synth sequencer with step pads
- Piano roll editor
- AI composer panel with mood/style generation
- EQ, compressor, limiter, stereo, loudness, export panels
- Upload area for artwork/reference images with conversion fallback
