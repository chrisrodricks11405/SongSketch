# Songsketch – Hooktheory Studio Clone 🎹

A comprehensive, zero-dependency songwriting sketchpad and music theory studio inspired by [Hooktheory](https://www.hooktheory.com/) and based directly on the official Hooktheory workflow. Built with Web Audio synthesis, interactive Roman numeral chord analysis, relative scale-degree melody piano roll, the **Magic Palette**, the **TheoryTab interactive progression tree & song library**, the **Chord Crush ear-training game**, and interactive theory books.

---

## 🌟 Complete Feature Set (Matches Hooktheory Workflow)

1. **Hookpad DAW (Interactive Song Sketchpad)**:
   - **Scale-Degree Color System**: Hooktheory signature colors (1 = Red, 2 = Orange, 3 = Yellow, 4 = Green, 5 = Cyan, 6 = Blue, 7 = Purple).
   - **Piano Roll Grid with Rainbow Lane Stripes**: Subtle scale-degree tinting across all lanes matching the Hookpad interface.
   - **Duration Bar Picker**: Whole (4), Half (2), Quarter (1), Eighth (1/2), Sixteenth (1/4).
   - **Modes Switch**: Switch seamlessly between **Chords in Key** mode and **Notes in Key** (1–7 staircase).
   - **Magic Palette (Database AI)**: Real-time next-chord recommendations with statistical probability percentages from billboard hit songs.
   - **Harmonic Chord Lane**: Roman numeral analysis (`I`, `ii`, `iii`, `IV`, `V`, `vi`, `vii°`, secondary dominants `V/V`, borrowed modal chords `iv`, `bVI`, `bVII`, and 7ths).
   - **Chord Properties Inspector**: Root, 1st inversion (6), 2nd inversion (6/4), 3rd inversion (4/2), 7th, maj7, m7, sus4, add9.
   - **Audio Engine**: Polyphonic acoustic piano, electric piano (Rhodes), acoustic guitar, synth lead, strings, analog bass, and procedural drums (Pop 4/4, Hip-Hop/Lo-Fi, Ballad) + metronome.
   - **Interactive Piano Keyboard**: Real-time visualizer showing keys illuminated in scale-degree colors during playback.
   - **Exports**: Multi-track standard MIDI (`.mid`), studio-grade WAV audio (`.wav`), **Sheet Music (Lead Sheet)**, **Guitar Tabs & Chords**, JSON project file, and shareable URL hash.

2. **TheoryTab Song Database & Progression Tree**:
   - **Interactive Radial Graph**: Central chord node branching to probable next chords with percentage probabilities (matches Hooktheory TheoryTab Explorer).
   - 25+ iconic popular songs analyzed with chords & melody (*Let It Be*, *Shape of You*, *Someone Like You*, *Get Lucky*, *Canon in D*, *Viva La Vida*, *Don't Stop Believin'*, *Blinding Lights*, *Creep*, *Bohemian Rhapsody*, and more).
   - Search by artist, title, or click the progression tree to filter songs matching that exact sequence.
   - Instant in-place audio preview and "Open in Hookpad" button.

3. **Chord Crush (Ear Training Game)**:
   - Step-by-step progression ear-training directly modeled on Chord Crush.
   - Pastel canvas with top score, streak progress curve, timer, and center timeline track.
   - Guess the mystery chord (`?`) at the marker from 4 scale-degree colored choice cards.
   - Immediate audio and visual feedback with level progression.

4. **Chord Trends & Famous Cadences**:
   - Interactive chord transition explorer with probability bars.
   - Famous cadences catalog (Pop 4-Chord, Sensitive Female, 50s Doo-Wop, Andalusian, Royal Road, Jazz 2-5-1, Canon in D) with instant audition and load buttons.

5. **Theory Academy (Hooktheory I & II)**:
   - Bite-sized interactive lessons covering scale degrees, primary triads, minor emotion, inversions, voice leading, and modal mixture with playable sound examples.

6. **Diatonic Cheat Sheet**:
   - Roman numeral reference matrix for all 12 major keys.

---

## 🚀 How to Run for Personal Use (Local)

Run any local web server in this directory:
```bash
# Using Node.js npx:
npx serve .

# Or using Python:
python -m http.server 3000
```
Open `http://localhost:3000` in any modern browser (Chrome, Edge, Safari, Firefox).

---

## 🌐 How to Deploy on Vercel

### Method A: Using GitHub (Instant)
1. Push this folder to your GitHub repo (`https://github.com/chrisrodricks11405/SongSketch`).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New" > "Project"**, import your repo, and click **Deploy**.

### Method B: Using Vercel CLI
```bash
npx vercel
npx vercel --prod
```

---

## 👥 How to Share It With Others

1. **Share Your Vercel Link**: Send your live URL to anyone.
2. **Share Specific Songs**: Click the **"🔗 Share"** button to copy a link with your song compressed in the URL hash.
3. **Share the ZIP File**: Send `songsketch-hooktheory-clone.zip` for full offline use.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Stop playback |
| `1` – `7` | Insert chord or melody note on that scale degree (e.g., `1` = I, `4` = IV, `5` = V) |
| `→` (Right Arrow) | Move selection to next slot |
| `←` (Left Arrow) | Move selection to previous slot |
| `Backspace` / `Del` | Delete selected chord or note |
| Grid Click | Add or delete melody note |
