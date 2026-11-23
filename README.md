# Songsketch – Hooktheory Studio Clone 🎹

A comprehensive, zero-dependency songwriting sketchpad and music theory studio inspired by [Hooktheory](https://www.hooktheory.com/). Built with modern Web Audio synthesis, interactive Roman numeral chord analysis, relative scale-degree melody piano roll, a TheoryTab song database, chord progression trends AI, and an interactive theory academy.

---

## 🌟 Features

1. **Hookpad DAW (Interactive Song Sketchpad)**:
   - **Scale-Degree Color System**: Hooktheory-standard color-coded notes (1 = Red, 2 = Orange, 3 = Yellow, 4 = Green, 5 = Cyan, 6 = Blue, 7 = Purple).
   - **Piano Roll Grid**: Click to insert/delete melody notes, configure duration (16th, 8th, Quarter, Half).
   - **Harmonic Chord Lane**: Roman numeral analysis (`I`, `ii`, `iii`, `IV`, `V`, `vi`, `vii°`, secondary dominants `V/V`, borrowed modal chords `iv`, `bVI`, `bVII`, and 7ths `maj7`, `7`, `m7`, `ø7`).
   - **Inversions Support**: Root, 1st inversion (6), 2nd inversion (6/4), 3rd inversion (4/2).
   - **Audio Engine**: Polyphonic piano synthesis, electric piano (Rhodes), lead synth, analog bass, and 808-style drums (Pop 4/4, Hip-Hop/Lo-Fi, Ballad).
   - **Interactive Piano Keyboard**: Real-time visualizer showing keys depressed during playback.
   - **Smart Chord Trends AI**: Live recommendations for the statistically probable next chord based on Billboard hit songs.
   - **Export Tools**: Multi-track standard MIDI (`.mid`), studio-grade WAV audio (`.wav`), JSON project file, and shareable URL hash.

2. **TheoryTab Song Database**:
   - 25+ iconic popular songs analyzed with chords & melody (*Let It Be*, *Shape of You*, *Someone Like You*, *Get Lucky*, *Canon in D*, *Viva La Vida*, *Don't Stop Believin'*, *Blinding Lights*, *Creep*, *Bohemian Rhapsody*, and more).
   - Instant in-place audio preview.
   - "Open in Hookpad" button to load any song into the editor for learning, transposing, or remixing.

3. **Chord Trends & Probability Explorer**:
   - Interactive chord transition explorer with visual probability percentages.
   - Famous cadences catalog (Pop 4-Chord, Sensitive Female, 50s Doo-Wop, Andalusian, Royal Road J-Pop, Jazz 2-5-1, Canon in D) with instant audition and load buttons.

4. **Theory Academy**:
   - Bite-sized interactive lessons covering scale degrees, primary triads, minor emotion, inversions, voice leading, and modal mixture with playable sound examples.

5. **Diatonic Cheat Sheet**:
   - Roman numeral reference matrix for all 12 major keys.

---

## 🚀 How to Run for Personal Use (Local)

Because Songsketch is built with standard HTML5, CSS3, and ES Modules, **no build step or `npm install` is required**.

### Option 1: Quick Local Server (Recommended)
Modern browsers require ES Modules (`type="module"`) to be served over HTTP rather than `file://`:

Run any local web server in this directory:
```bash
# Using Node.js npx:
npx serve .

# Or using Python:
python -m http.server 3000
```
Open `http://localhost:3000` (or the address printed in your terminal) in any modern browser (Chrome, Edge, Safari, Firefox).

---

## 🌐 How to Deploy on Vercel

Songsketch is 100% pre-configured for instant deployment on [Vercel](https://vercel.com/) with zero build step.

### Method A: Using GitHub (Easiest)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Hooktheory clone"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/songsketch.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New" > "Project"**.
4. Import your GitHub repository.
5. Vercel will automatically detect the static project (`vercel.json`). Click **Deploy**.
6. Within 10 seconds, your site is live with a free SSL domain (e.g., `https://songsketch.vercel.app`)!

### Method B: Using Vercel CLI
1. Install the Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. In this folder, run:
   ```bash
   vercel
   ```
3. Log in and accept the defaults (Framework: `Other`, Build Command: `None`).
4. To publish to production, run:
   ```bash
   vercel --prod
   ```

---

## 👥 How to Share It With Others

1. **Share Your Vercel Link**:
   - Send your permanent Vercel URL (e.g., `https://your-project.vercel.app`) to anyone. They can open it on their phone, tablet, or desktop with full sound and interactive features.
2. **Share Specific Songs**:
   - Click the **"🔗 Share"** button in the top navigation bar.
   - The song's chords, melody, tempo, and key are compressed directly into the URL hash.
   - When recipients open your link, your exact composition loads automatically!
3. **Share the ZIP File**:
   - Give friends the `songsketch-hooktheory-clone.zip` package.
   - They can unzip it, run `npx serve .` or upload it to their own Vercel / Netlify account.

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
