# Songsketch – Hooktheory Studio Clone 🎹

A comprehensive, zero-dependency songwriting sketchpad and music theory studio inspired by [Hooktheory](https://www.hooktheory.com/). Built with modern Web Audio synthesis, interactive Roman numeral chord analysis, relative scale-degree melody piano roll, the **Magic Palette**, the **TheoryTab song database with progression search**, **Chord Crush ear training**, and interactive theory lessons.

---

## 🌟 Complete Feature Set (Matches Hooktheory Workflow)

1. **Hookpad DAW (Interactive Song Sketchpad)**:
   - **Scale-Degree Color System**: Hooktheory-standard color-coded notes (1 = Red, 2 = Orange, 3 = Yellow, 4 = Green, 5 = Cyan, 6 = Blue, 7 = Purple).
   - **Melody Piano Roll**: Click to insert/delete melody notes, configure duration (16th, 8th, Quarter, Half).
   - **Harmonic Chord Lane**: Roman numeral analysis (`I`, `ii`, `iii`, `IV`, `V`, `vi`, `vii°`, secondary dominants `V/V`, borrowed modal chords `iv`, `bVI`, `bVII`, and 7ths `maj7`, `7`, `m7`, `ø7`).
   - **Inversions Support**: Root, 1st inversion (6), 2nd inversion (6/4), 3rd inversion (4/2).
   - **Audio Engine**: Polyphonic piano synthesis, electric piano (Rhodes), lead synth, analog bass, and 808-style drums (Pop 4/4, Hip-Hop/Lo-Fi, Ballad).
   - **Interactive Piano Keyboard**: Real-time visualizer showing keys depressed during playback.
   - **Magic Palette (Database AI)**: Live recommendations for the statistically probable next chord based on Billboard hit songs.
   - **Export Tools**: Multi-track standard MIDI (`.mid`), studio-grade WAV audio (`.wav`), **Sheet Music (Lead Sheet)**, **Guitar Tabs & Chords**, JSON project file, and shareable URL hash.

2. **TheoryTab Song Database**:
   - 25+ iconic popular songs analyzed with chords & melody (*Let It Be*, *Shape of You*, *Someone Like You*, *Get Lucky*, *Canon in D*, *Viva La Vida*, *Don't Stop Believin'*, *Blinding Lights*, *Creep*, *Bohemian Rhapsody*, and more).
   - **Chord Progression Builder Search**: Click chords (`I`, `IV`, `V`, `vi`, etc.) to find every song in the database using that exact chord progression!
   - Instant in-place audio preview and "Open in Hookpad" button.

3. **Chord Crush (Ear Training Game - Featured in Hooktheory)**:
   - Recognize chords and chord progressions using examples from real music.
   - Levels 1 to 5 ranging from the Two Giants (`I` & `V`) up to full diatonic cadences and 7ths.
   - Tracks Score, Streak 🔥, and Level progression.

4. **Chord Trends & Probability Explorer**:
   - Interactive chord transition explorer with visual probability percentages.
   - Famous cadences catalog (Pop 4-Chord, Sensitive Female, 50s Doo-Wop, Andalusian, Royal Road J-Pop, Jazz 2-5-1, Canon in D) with instant audition and load buttons.

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
Open `http://localhost:3000` (or the address printed in your terminal) in any modern browser.

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
| `1` – `7` | Insert diatonic chord on that scale degree (e.g., `1` = I, `4` = IV, `5` = V) |
| `→` (Right Arrow) | Move to next chord slot |
| `←` (Left Arrow) | Move to previous chord slot |
| `Backspace` / `Del` | Clear chord in selected slot |
| Grid Click | Add or delete melody note |
