// js/app.js - Main Application Orchestrator for Songsketch (Hooktheory Clone)

import * as theory from './theory.js';
import { AudioEngine } from './audio.js';
import { THEORYTAB_SONGS } from './data/songs.js';
import { CHORD_TRENDS, FAMOUS_CADENCES } from './data/trends.js';
import { THEORY_LESSONS } from './data/lessons.js';
import { ChordCrushGame } from './chordcrush.js';
import { LeadSheetRenderer } from './leadsheet.js';

class SongsketchApp {
  constructor() {
    this.audio = new AudioEngine();
    this.crushGame = new ChordCrushGame(this.audio, theory);
    this.leadSheet = new LeadSheetRenderer(theory);
    
    // Song model (measures & beats)
    this.song = {
      title: 'My Songsketch',
      key: 0, // 0 = C
      mode: 'major',
      bpm: 100,
      bars: 4,
      loop: true,
      timeSignature: '4/4',
      // Chords: array of objects { numeral, duration (in beats), inversion, quality }
      chords: [
        { numeral: 'I', duration: 4, inversion: 0 },
        { numeral: 'V', duration: 4, inversion: 0 },
        { numeral: 'vi', duration: 4, inversion: 0 },
        { numeral: 'IV', duration: 4, inversion: 0 }
      ],
      // Melody: array of objects { row (0..14), step (in 16ths), duration (in 16ths) }
      melody: [
        { row: 7, step: 0, duration: 4 },
        { row: 9, step: 4, duration: 4 },
        { row: 11, step: 8, duration: 4 },
        { row: 12, step: 12, duration: 4 },
        { row: 11, step: 16, duration: 4 },
        { row: 9, step: 20, duration: 4 },
        { row: 7, step: 24, duration: 8 }
      ]
    };

    this.paletteMode = 'chords'; // 'chords' or 'notes'
    this.selectedChordIndex = 0;
    this.selectedDurationBeats = 4; // 4 beats (Whole note), 2, 1, 0.5, 0.25
    this.selectedInversion = 0;
    this.selectedQuality = '';
    this.activeTab = 'hookpad';
    this.currentLessonId = THEORY_LESSONS[0].id;

    // TheoryTab Graph state
    this.graphPath = ['I'];

    // Playback state
    this.isPlaying = false;
    this.playStartTime = 0;
    this.playbackTimer = null;
    this.animFrameId = null;
    this.stepsPerMeasure = 16;
    this.totalSteps = 64;

    this.init();
  }

  async init() {
    this.loadFromUrlOrStorage();
    this.setupTheme();
    this.setupNavigation();
    this.setupTransportListeners();
    this.setupHookpadControls();
    this.setupKeyboardShortcuts();
    this.setupModalsAndExport();
    this.setupTheoryTab();
    this.setupChordCrush();
    this.setupTrends();
    this.setupAcademy();
    this.setupCheatSheet();

    this.renderHookpad();
    this.renderPianoKeyboard();
    this.updateMagicPalette();
  }

  // --- Persistence & State Loading ---
  loadFromUrlOrStorage() {
    try {
      if (window.location.hash.length > 2) {
        const hashData = decodeURIComponent(atob(window.location.hash.slice(1)));
        const parsed = JSON.parse(hashData);
        if (parsed && parsed.chords) {
          this.normalizeImportedSong(parsed);
          this.showToast('Song loaded from share link!');
          return;
        }
      }
      const saved = localStorage.getItem('songsketch_saved_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.chords) {
          this.normalizeImportedSong(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load song state', e);
    }
  }

  normalizeImportedSong(data) {
    this.song.title = data.title || 'Untitled';
    this.song.key = data.key !== undefined ? data.key : 0;
    this.song.mode = data.mode || 'major';
    this.song.bpm = data.bpm || 100;
    this.song.bars = data.bars || 4;
    this.song.loop = data.loop !== undefined ? data.loop : true;

    // Ensure chords have duration
    if (Array.isArray(data.chords)) {
      this.song.chords = data.chords.map(c => {
        if (typeof c === 'string') return { numeral: c, duration: 4, inversion: 0 };
        return {
          numeral: c.numeral || 'I',
          duration: c.duration || 4,
          inversion: c.inversion || 0,
          quality: c.quality || ''
        };
      });
    }

    this.song.melody = Array.isArray(data.melody) ? data.melody : [];
  }

  saveToStorage() {
    try {
      localStorage.setItem('songsketch_saved_project', JSON.stringify(this.song));
    } catch (e) {}
  }

  // --- Theme Toggle ---
  setupTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('songsketch_theme') || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('songsketch_theme', next);
      this.updateThemeIcon(next);
    });
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // --- Tab Navigation ---
  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tabId}`);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === 'chordcrush') {
      this.crushGame.playFullProgression();
    }
  }

  // --- Transport Controls ---
  setupTransportListeners() {
    const keySelect = document.getElementById('key-select');
    const modeSelect = document.getElementById('mode-select');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    const playBtn = document.getElementById('play-btn');
    const loopBtn = document.getElementById('loop-toggle-btn');
    const metronomeBtn = document.getElementById('metronome-btn');
    const meterBtn = document.getElementById('meter-btn');
    const instSelect = document.getElementById('inst-select');
    const drumSelect = document.getElementById('drum-select');
    const presetSelect = document.getElementById('progression-preset-select');

    // Populate Key options
    keySelect.innerHTML = theory.NOTE_NAMES_SHARP.map((note, idx) => {
      const flatName = theory.NOTE_NAMES_FLAT[idx];
      const label = note === flatName ? note : `${note} / ${flatName}`;
      return `<option value="${idx}">${label}</option>`;
    }).join('');

    keySelect.value = this.song.key;
    modeSelect.value = this.song.mode;
    bpmSlider.value = this.song.bpm;
    bpmDisplay.textContent = this.song.bpm;

    keySelect.addEventListener('change', (e) => {
      this.song.key = parseInt(e.target.value);
      this.renderHookpad();
      this.renderPianoKeyboard();
      this.saveToStorage();
    });

    modeSelect.addEventListener('change', (e) => {
      this.song.mode = e.target.value;
      this.renderHookpad();
      this.updateMagicPalette();
      this.saveToStorage();
    });

    bpmSlider.addEventListener('input', (e) => {
      this.song.bpm = parseInt(e.target.value);
      bpmDisplay.textContent = this.song.bpm;
      this.saveToStorage();
    });

    loopBtn.addEventListener('click', () => {
      this.song.loop = !this.song.loop;
      loopBtn.classList.toggle('active', this.song.loop);
      this.saveToStorage();
    });

    metronomeBtn.addEventListener('click', () => {
      this.audio.metronomeEnabled = !this.audio.metronomeEnabled;
      metronomeBtn.classList.toggle('active', this.audio.metronomeEnabled);
    });

    meterBtn.addEventListener('click', () => {
      this.song.timeSignature = this.song.timeSignature === '4/4' ? '3/4' : '4/4';
      document.getElementById('meter-val').textContent = this.song.timeSignature;
      this.stepsPerMeasure = this.song.timeSignature === '4/4' ? 16 : 12;
      this.renderHookpad();
    });

    playBtn.addEventListener('click', () => {
      if (this.isPlaying) this.stopPlayback();
      else this.startPlayback();
    });

    instSelect.addEventListener('change', (e) => {
      this.audio.instrument = e.target.value;
    });

    drumSelect.addEventListener('change', (e) => {
      this.audio.drumStyle = e.target.value;
    });

    presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;
      const cadence = FAMOUS_CADENCES.find(c => c.name === val);
      if (cadence) {
        this.loadProgression(cadence.chords);
      }
      presetSelect.value = '';
    });
  }

  loadProgression(chordsArray) {
    this.stopPlayback();
    this.song.chords = chordsArray.map(c => ({
      numeral: c,
      duration: 4, // 1 bar each
      inversion: 0
    }));
    this.song.bars = chordsArray.length;
    this.selectedChordIndex = 0;
    this.renderHookpad();
    this.saveToStorage();
    this.showToast('Progression loaded!');
  }

  // --- Audio Playback Engine ---
  async startPlayback() {
    await this.audio.resume();
    this.isPlaying = true;
    const playBtn = document.getElementById('play-btn');
    playBtn.textContent = '⏹';
    playBtn.classList.add('playing');

    const playhead = document.getElementById('hookpad-playhead');
    playhead.style.display = 'block';

    this.stepsPerMeasure = this.song.timeSignature === '4/4' ? 16 : 12;
    this.totalSteps = this.song.bars * this.stepsPerMeasure;
    this.playStartTime = this.audio.ctx.currentTime + 0.05;

    this.schedulePlaybackLoop(this.playStartTime);
    this.animatePlayhead();
  }

  stopPlayback() {
    this.isPlaying = false;
    clearTimeout(this.playbackTimer);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.textContent = '▶';
      playBtn.classList.remove('playing');
    }

    const playhead = document.getElementById('hookpad-playhead');
    if (playhead) playhead.style.display = 'none';

    document.querySelectorAll('.hook-chord-block').forEach(el => el.classList.remove('playing'));
    document.querySelectorAll('.white-key, .black-key').forEach(el => el.classList.remove('active'));
  }

  schedulePlaybackLoop(startTime) {
    if (!this.isPlaying) return;
    const stepSec = 60 / this.song.bpm / 4; // sixteenth note seconds
    const loopDuration = this.totalSteps * stepSec;

    // Schedule Chords and Bass
    let chordStartStep = 0;
    this.song.chords.forEach((chordData, i) => {
      if (!chordData) return;
      const numeral = chordData.numeral;
      const inv = chordData.inversion || 0;
      const details = theory.getChordDetails(numeral, this.song.key, this.song.mode, inv);
      const voicing = theory.getChordVoicing(details, 4);

      const durSteps = chordData.duration * 4; // 1 beat = 4 sixteenths
      const chordTime = startTime + chordStartStep * stepSec;
      const durSec = durSteps * stepSec;

      voicing.treble.forEach(p => {
        if (this.audio.instrument === 'piano') this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, p, chordTime, durSec, 0.75);
        else if (this.audio.instrument === 'rhodes') this.audio.playRhodesNote(this.audio.ctx, this.audio.chordsGain, p, chordTime, durSec, 0.75);
        else if (this.audio.instrument === 'guitar') this.audio.playGuitarNote(this.audio.ctx, this.audio.chordsGain, p, chordTime, durSec, 0.75);
        else if (this.audio.instrument === 'strings') this.audio.playStringsNote(this.audio.ctx, this.audio.chordsGain, p, chordTime, durSec, 0.7);
        else this.audio.playSynthLeadNote(this.audio.ctx, this.audio.chordsGain, p, chordTime, durSec, 0.65);
      });

      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, chordTime, durSec, 0.85);
      chordStartStep += durSteps;
    });

    // Schedule Melody
    this.song.melody.forEach(note => {
      const pitch = theory.rowToPitch(note.row, this.song.key, this.song.mode).midi;
      const noteTime = startTime + note.step * stepSec;
      const durSec = (note.duration || 4) * stepSec;
      this.audio.playSynthLeadNote(this.audio.ctx, this.audio.melodyGain, pitch, noteTime, durSec, 0.85);
    });

    // Schedule Drums & Metronome
    for (let s = 0; s < this.totalSteps; s++) {
      const beatTime = startTime + s * stepSec;
      const beatInMeasure = s % this.stepsPerMeasure;

      if (this.audio.metronomeEnabled && s % 4 === 0) {
        this.audio.playMetronomeClick(this.audio.ctx, this.audio.metronomeGain, beatTime, beatInMeasure === 0);
      }

      if (this.audio.drumStyle !== 'none') {
        if (beatInMeasure === 0 || beatInMeasure === 8) {
          this.audio.playKick(this.audio.ctx, this.audio.drumsGain, beatTime);
        }
        if (beatInMeasure === 4 || beatInMeasure === 12) {
          this.audio.playSnare(this.audio.ctx, this.audio.drumsGain, beatTime);
        }
        if (s % 2 === 0) {
          this.audio.playHiHat(this.audio.ctx, this.audio.drumsGain, beatTime, true);
        }
      }
    }

    const nextLoopTime = startTime + loopDuration;
    const msUntilNext = Math.max(0, (nextLoopTime - this.audio.ctx.currentTime - 0.15) * 1000);

    this.playbackTimer = setTimeout(() => {
      if (this.song.loop) {
        this.schedulePlaybackLoop(nextLoopTime);
      } else {
        this.stopPlayback();
      }
    }, msUntilNext);
  }

  animatePlayhead() {
    if (!this.isPlaying) return;
    const stepSec = 60 / this.song.bpm / 4;
    const elapsed = this.audio.ctx.currentTime - this.playStartTime;

    if (elapsed >= 0) {
      const currentStep = (elapsed / stepSec) % this.totalSteps;
      const cellWidth = 11; // 1 step = 11px (1 bar of 16 steps = 176px)
      const labelOffset = 64; // width of headers
      const pxPosition = labelOffset + currentStep * cellWidth;

      const playhead = document.getElementById('hookpad-playhead');
      if (playhead) playhead.style.left = `${pxPosition}px`;

      // Highlight active chord block
      let accumSteps = 0;
      document.querySelectorAll('.hook-chord-block').forEach((block, idx) => {
        const chord = this.song.chords[idx];
        const durSteps = chord ? chord.duration * 4 : 16;
        const isCurrent = currentStep >= accumSteps && currentStep < accumSteps + durSteps;
        block.classList.toggle('playing', isCurrent);
        accumSteps += durSteps;
      });

      // Animate piano keys for active notes
      const activeStepFloor = Math.floor(currentStep);
      const activeNotes = this.song.melody.filter(n => activeStepFloor >= n.step && activeStepFloor < n.step + (n.duration || 4));
      
      document.querySelectorAll('.white-key, .black-key').forEach(el => el.classList.remove('active'));
      activeNotes.forEach(n => {
        const pitch = theory.rowToPitch(n.row, this.song.key, this.song.mode).midi;
        const keyEl = document.querySelector(`[data-midi="${pitch}"]`);
        if (keyEl) keyEl.classList.add('active');
      });
    }

    this.animFrameId = requestAnimationFrame(() => this.animatePlayhead());
  }

  // --- Hookpad Controls & Palette ---
  setupHookpadControls() {
    // Mode Switch: Chords vs Notes
    const tabChords = document.getElementById('tab-mode-chords');
    const tabNotes = document.getElementById('tab-mode-notes');

    tabChords.addEventListener('click', () => {
      this.paletteMode = 'chords';
      tabChords.classList.add('active');
      tabNotes.classList.remove('active');
      document.getElementById('inspector-heading').textContent = 'Chord Properties';
      this.renderPaletteStrip();
    });

    tabNotes.addEventListener('click', () => {
      this.paletteMode = 'notes';
      tabNotes.classList.add('active');
      tabChords.classList.remove('active');
      document.getElementById('inspector-heading').textContent = 'Note Properties';
      this.renderPaletteStrip();
    });

    // Duration Bar Buttons (4, 2, 1, 1/2, 1/4 beats)
    document.querySelectorAll('.duration-bar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.duration-bar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDurationBeats = parseFloat(btn.dataset.beats);
      });
    });

    // Inversion Pills
    document.querySelectorAll('.inversion-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.inversion-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedInversion = parseInt(pill.dataset.inversion);
        if (this.song.chords[this.selectedChordIndex]) {
          this.song.chords[this.selectedChordIndex].inversion = this.selectedInversion;
          this.renderChordLane();
          this.saveToStorage();
        }
      });
    });

    // Quality Pills (Triad, 7, maj7, m7, sus4, add9)
    document.querySelectorAll('[data-quality]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-quality]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedQuality = pill.dataset.quality;
      });
    });

    // Delete Item
    document.getElementById('btn-delete-item').addEventListener('click', () => {
      if (this.paletteMode === 'chords') {
        if (this.song.chords.length > 1) {
          this.song.chords.splice(this.selectedChordIndex, 1);
          this.selectedChordIndex = Math.max(0, this.selectedChordIndex - 1);
          this.renderChordLane();
          this.updateMagicPalette();
          this.saveToStorage();
        }
      }
    });

    // Clear All
    document.getElementById('btn-clear-all').addEventListener('click', () => {
      this.song.chords = [{ numeral: 'I', duration: 4, inversion: 0 }];
      this.song.melody = [];
      this.selectedChordIndex = 0;
      this.renderHookpad();
      this.saveToStorage();
      this.showToast('Workspace cleared');
    });

    // Melody Grid Click Handler
    const rollGrid = document.getElementById('melody-lane-grid');
    rollGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('.melody-grid-cell');
      if (!cell) return;
      const row = parseInt(cell.dataset.row);
      const step = parseInt(cell.dataset.step);

      // Check if note exists
      const existingIdx = this.song.melody.findIndex(n => n.row === row && step >= n.step && step < n.step + (n.duration || 4));
      if (existingIdx >= 0) {
        this.song.melody.splice(existingIdx, 1);
      } else {
        const durSteps = Math.max(1, Math.round(this.selectedDurationBeats * 4));
        this.song.melody.push({ row, step, duration: durSteps });
        const pitch = theory.rowToPitch(row, this.song.key, this.song.mode).midi;
        this.audio.previewNotes([pitch], 'synth');
      }

      this.renderMelodyNotes();
      this.saveToStorage();
    });
  }

  renderHookpad() {
    this.renderMeasureRuler();
    this.renderMelodyRoll();
    this.renderChordLane();
    this.renderPaletteStrip();
    this.updateMagicPalette();
  }

  renderMeasureRuler() {
    const ruler = document.getElementById('measure-ruler');
    let html = '';
    for (let b = 0; b < this.song.bars; b++) {
      html += `<div class="ruler-measure-cell">Measure ${b + 1}</div>`;
    }
    ruler.innerHTML = html;
  }

  renderMelodyRoll() {
    const headers = document.getElementById('melody-row-headers');
    const grid = document.getElementById('melody-lane-grid');
    const NUM_ROWS = 15;
    this.stepsPerMeasure = this.song.timeSignature === '4/4' ? 16 : 12;
    this.totalSteps = this.song.bars * this.stepsPerMeasure;

    let headersHtml = '';
    let gridHtml = '';

    for (let r = NUM_ROWS - 1; r >= 0; r--) {
      const pitchInfo = theory.rowToPitch(r, this.song.key, this.song.mode);
      const laneTint = `color-mix(in srgb, ${pitchInfo.color} 10%, transparent)`;

      headersHtml += `
        <div class="row-header-badge-cell" data-row="${r}" style="border-left: 4px solid ${pitchInfo.color}">
          <span style="color: ${pitchInfo.color}">${pitchInfo.degreeLabel}</span>
          <span style="color: var(--text-muted); font-size: 0.65rem;">${pitchInfo.noteName}${pitchInfo.octave}</span>
        </div>
      `;

      gridHtml += `<div class="melody-grid-row" data-row="${r}" style="--lane-tint: ${laneTint}">`;
      for (let s = 0; s < this.totalSteps; s++) {
        const isBar = s % this.stepsPerMeasure === this.stepsPerMeasure - 1;
        const isBeat = s % 4 === 3;
        gridHtml += `
          <div class="melody-grid-cell ${isBar ? 'bar-boundary' : ''} ${isBeat ? 'beat-boundary' : ''}"
               data-row="${r}" data-step="${s}">
          </div>
        `;
      }
      gridHtml += `</div>`;
    }

    headers.innerHTML = headersHtml;
    grid.innerHTML = gridHtml;

    this.renderMelodyNotes();
  }

  renderMelodyNotes() {
    document.querySelectorAll('.placed-melody-note').forEach(n => n.remove());
    const grid = document.getElementById('melody-lane-grid');

    this.song.melody.forEach(n => {
      const cell = grid.querySelector(`.melody-grid-cell[data-row="${n.row}"][data-step="${n.step}"]`);
      if (!cell) return;
      const pitchInfo = theory.rowToPitch(n.row, this.song.key, this.song.mode);
      const dur = n.duration || 4;
      const widthPx = dur * 11 - 2;

      const el = document.createElement('div');
      el.className = 'placed-melody-note';
      el.style.width = `${widthPx}px`;
      el.style.setProperty('--note-col', pitchInfo.color);
      el.textContent = pitchInfo.degreeLabel;
      cell.appendChild(el);
    });
  }

  renderChordLane() {
    const container = document.getElementById('chord-blocks-container');
    container.innerHTML = this.song.chords.map((chord, idx) => {
      const details = theory.getChordDetails(chord.numeral, this.song.key, this.song.mode, chord.inversion || 0);
      const widthPx = (chord.duration / 4) * 176 - 2;
      const isSelected = idx === this.selectedChordIndex;

      return `
        <div class="hook-chord-block ${isSelected ? 'selected' : ''}" 
             data-index="${idx}" 
             style="width: ${widthPx}px; --chord-col: ${details.color}">
          <span class="block-numeral" style="color: ${details.color}">${details.fullDisplay}</span>
          <span class="block-name">${details.fullChordName}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.hook-chord-block').forEach(b => {
      b.addEventListener('click', () => {
        this.selectedChordIndex = parseInt(b.dataset.index);
        this.renderChordLane();
        this.updateMagicPalette();
      });
    });
  }

  renderPaletteStrip() {
    const strip = document.getElementById('diatonic-strip');
    const isChords = this.paletteMode === 'chords';

    if (isChords) {
      const chordsList = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
      strip.innerHTML = chordsList.map(num => {
        const details = theory.getChordDetails(num, this.song.key, this.song.mode, 0);
        return `
          <button class="hook-chord-btn" data-num="${num}" style="--degree-color: ${details.color}">
            <span class="numeral" style="color: ${details.color}">${num}</span>
            <span class="chord-name">${details.chordName}</span>
          </button>
        `;
      }).join('') + `
        <button class="hook-chord-btn" data-num="rest" style="--degree-color: #64748b">
          <span class="numeral" style="color: #64748b">Rest</span>
          <span class="chord-name">–</span>
        </button>
      `;

      strip.querySelectorAll('.hook-chord-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const num = btn.dataset.num;
          if (num === 'rest') return;
          this.insertChord(num);
        });
      });
    } else {
      // Notes Mode (1 to 7 staircase)
      const degrees = [1, 2, 3, 4, 5, 6, 7];
      strip.innerHTML = degrees.map(deg => {
        const pitchInfo = theory.rowToPitch(deg - 1, this.song.key, this.song.mode);
        return `
          <button class="hook-chord-btn" data-degree="${deg}" style="--degree-color: ${pitchInfo.color}">
            <span class="numeral" style="color: ${pitchInfo.color}">${deg}</span>
            <span class="chord-name">${pitchInfo.noteName}</span>
          </button>
        `;
      }).join('');

      strip.querySelectorAll('.hook-chord-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const deg = parseInt(btn.dataset.degree);
          this.insertMelodyNote(deg - 1);
        });
      });
    }
  }

  insertChord(numeral) {
    const duration = this.selectedDurationBeats;
    const inv = this.selectedInversion;

    // Replace or insert at selected index
    this.song.chords[this.selectedChordIndex] = {
      numeral,
      duration,
      inversion: inv
    };

    // Audition sound
    const details = theory.getChordDetails(numeral, this.song.key, this.song.mode, inv);
    this.audio.previewNotes(theory.getChordVoicing(details, 4).all);

    // Advance selection
    if (this.selectedChordIndex + 1 < this.song.chords.length) {
      this.selectedChordIndex += 1;
    } else {
      // Add new chord block
      this.song.chords.push({ numeral: 'I', duration: 4, inversion: 0 });
      this.selectedChordIndex = this.song.chords.length - 1;
      this.song.bars = Math.max(this.song.bars, this.song.chords.length);
      this.renderMeasureRuler();
    }

    this.renderChordLane();
    this.updateMagicPalette();
    this.saveToStorage();
  }

  insertMelodyNote(rowDegree) {
    // Determine step from last note or start of selected chord
    let step = 0;
    if (this.song.melody.length > 0) {
      const last = this.song.melody[this.song.melody.length - 1];
      step = (last.step + (last.duration || 4)) % this.totalSteps;
    }
    const durSteps = Math.max(1, Math.round(this.selectedDurationBeats * 4));

    this.song.melody.push({
      row: rowDegree + 7, // default in octave 5
      step,
      duration: durSteps
    });

    const pitch = theory.rowToPitch(rowDegree + 7, this.song.key, this.song.mode).midi;
    this.audio.previewNotes([pitch], 'synth');

    this.renderMelodyNotes();
    this.saveToStorage();
  }

  updateMagicPalette() {
    const scrollBox = document.getElementById('magic-suggestions-scroll');
    if (!scrollBox) return;

    const currentChord = this.song.chords[this.selectedChordIndex] || this.song.chords[0];
    const numeral = currentChord ? currentChord.numeral : 'I';

    const modeTrends = CHORD_TRENDS[this.song.mode] || CHORD_TRENDS.major;
    const suggestions = modeTrends[numeral] || modeTrends['I'] || [];

    scrollBox.innerHTML = suggestions.map(s => {
      const details = theory.getChordDetails(s.next, this.song.key, this.song.mode, 0);
      return `
        <button class="magic-chip-btn" data-num="${s.next}" style="--chip-color: ${details.color}">
          <span class="chip-numeral" style="color: ${details.color}">${s.next}</span>
          <span class="chip-prob">${s.prob}%</span>
        </button>
      `;
    }).join('');

    scrollBox.querySelectorAll('.magic-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.insertChord(btn.dataset.num);
      });
    });
  }

  // --- Keyboard Shortcuts (1-7, Space, Arrows) ---
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.isPlaying) this.stopPlayback();
        else this.startPlayback();
      } else if (e.key >= '1' && e.key <= '7') {
        const num = parseInt(e.key);
        if (this.paletteMode === 'chords') {
          const diatonic = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
          if (diatonic[num - 1]) this.insertChord(diatonic[num - 1]);
        } else {
          this.insertMelodyNote(num - 1);
        }
      } else if (e.code === 'ArrowRight') {
        this.selectedChordIndex = Math.min(this.selectedChordIndex + 1, this.song.chords.length - 1);
        this.renderChordLane();
        this.updateMagicPalette();
      } else if (e.code === 'ArrowLeft') {
        this.selectedChordIndex = Math.max(this.selectedChordIndex - 1, 0);
        this.renderChordLane();
        this.updateMagicPalette();
      } else if (e.code === 'Backspace' || e.code === 'Delete') {
        if (this.song.chords.length > 1) {
          this.song.chords.splice(this.selectedChordIndex, 1);
          this.selectedChordIndex = Math.max(0, this.selectedChordIndex - 1);
          this.renderChordLane();
          this.updateMagicPalette();
          this.saveToStorage();
        }
      }
    });
  }

  // --- Piano Keyboard Visualizer ---
  renderPianoKeyboard() {
    const wrapper = document.getElementById('keyboard-keys-wrapper');
    if (!wrapper) return;

    const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
    const blackNotes = [
      { pc: 1, leftOffset: 5.5 },
      { pc: 3, leftOffset: 12.5 },
      { pc: 6, leftOffset: 26.5 },
      { pc: 8, leftOffset: 33.5 },
      { pc: 10, leftOffset: 40.5 },
      { pc: 13, leftOffset: 55.5 },
      { pc: 15, leftOffset: 62.5 },
      { pc: 18, leftOffset: 76.5 },
      { pc: 20, leftOffset: 83.5 },
      { pc: 22, leftOffset: 90.5 }
    ];

    let whiteHtml = '';
    for (let oct = 3; oct <= 4; oct++) {
      whiteNotes.forEach(pc => {
        const midi = oct * 12 + pc + 12;
        const noteName = theory.getNoteName(pc, false);
        whiteHtml += `
          <div class="white-key" data-midi="${midi}">
            <span>${noteName}${oct}</span>
          </div>
        `;
      });
    }

    let blackHtml = '';
    blackNotes.forEach(bn => {
      const midi = 48 + bn.pc;
      blackHtml += `<div class="black-key" data-midi="${midi}" style="left: ${bn.leftOffset}%"></div>`;
    });

    wrapper.innerHTML = whiteHtml + blackHtml;

    wrapper.querySelectorAll('.white-key, .black-key').forEach(key => {
      key.addEventListener('mousedown', () => {
        const midi = parseInt(key.dataset.midi);
        this.audio.previewNotes([midi], 'piano');
      });
    });
  }

  // --- Modals, Export & Share ---
  setupModalsAndExport() {
    document.getElementById('share-btn').addEventListener('click', async () => {
      const dataStr = btoa(encodeURIComponent(JSON.stringify(this.song)));
      const url = `${window.location.origin}${window.location.pathname}#${dataStr}`;
      try {
        await navigator.clipboard.writeText(url);
        this.showToast('Share link copied to clipboard!');
      } catch (err) {
        prompt('Copy this shareable link:', url);
      }
    });

    document.getElementById('midi-export-btn').addEventListener('click', () => {
      const blob = theory.generateMidiFile(this.song);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.song.title.toLowerCase().replace(/\s+/g, '-')}.mid`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('MIDI file downloaded!');
    });

    document.getElementById('wav-export-btn').addEventListener('click', async () => {
      this.showToast('Rendering studio audio WAV...');
      try {
        const wavBlob = await this.audio.exportWavBlob(this.song, theory);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.song.title.toLowerCase().replace(/\s+/g, '-')}.wav`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('WAV audio downloaded!');
      } catch (err) {
        console.error(err);
        this.showToast('WAV render error. Please try again.');
      }
    });

    document.getElementById('save-project-btn').addEventListener('click', () => {
      const jsonStr = JSON.stringify(this.song, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.song.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Project saved!');
    });

    const fileInput = document.getElementById('project-file-input');
    document.getElementById('open-project-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && parsed.chords) {
            this.normalizeImportedSong(parsed);
            this.renderHookpad();
            this.saveToStorage();
            this.showToast('Project opened!');
          }
        } catch (err) {
          alert('Invalid project format.');
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    });

    // Lead Sheet & Guitar Tabs
    const leadsheetModal = document.getElementById('leadsheet-modal');
    const leadsheetContainer = document.getElementById('leadsheet-content-container');
    const btnLeadSheet = document.getElementById('leadsheet-btn');
    const btnShowSheetMusic = document.getElementById('btn-show-sheet-music');
    const btnShowGuitarTabs = document.getElementById('btn-show-guitar-tabs');
    const btnCloseLeadSheet = document.getElementById('leadsheet-modal-close-btn');

    btnLeadSheet.addEventListener('click', () => {
      leadsheetModal.classList.add('open');
      btnShowSheetMusic.classList.add('btn-primary');
      btnShowGuitarTabs.classList.remove('btn-primary');
      this.leadSheet.renderLeadSheet(leadsheetContainer, this.song);
    });

    btnShowSheetMusic.addEventListener('click', () => {
      btnShowSheetMusic.classList.add('btn-primary');
      btnShowGuitarTabs.classList.remove('btn-primary');
      this.leadSheet.renderLeadSheet(leadsheetContainer, this.song);
    });

    btnShowGuitarTabs.addEventListener('click', () => {
      btnShowGuitarTabs.classList.add('btn-primary');
      btnShowSheetMusic.classList.remove('btn-primary');
      this.leadSheet.renderGuitarTabs(leadsheetContainer, this.song);
    });

    btnCloseLeadSheet.addEventListener('click', () => leadsheetModal.classList.remove('open'));
    leadsheetModal.addEventListener('click', (e) => {
      if (e.target === leadsheetModal) leadsheetModal.classList.remove('open');
    });

    // Shortcuts Modal
    const modal = document.getElementById('shortcuts-modal');
    document.getElementById('shortcuts-btn').addEventListener('click', () => modal.classList.add('open'));
    document.getElementById('modal-close-btn').addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // --- TheoryTab Explorer & Graph Setup (frame_37s.jpg) ---
  setupTheoryTab() {
    const grid = document.getElementById('theorytab-songs-grid');
    const searchInput = document.getElementById('theorytab-search');
    const genrePills = document.querySelectorAll('.genre-pill');
    const graphViewport = document.getElementById('graph-viewport');
    const graphStrip = document.getElementById('graph-sequence-strip');
    const resetGraphBtn = document.getElementById('btn-reset-graph');

    let currentGenre = 'All';

    const renderGraph = () => {
      const currentChord = this.graphPath[this.graphPath.length - 1];
      const details = theory.getChordDetails(currentChord, 0, 'major', 0);
      const modeTrends = CHORD_TRENDS.major[currentChord] || CHORD_TRENDS.major['I'] || [];

      // Render Center Node
      let graphHtml = `
        <div class="graph-center-node" style="--center-col: ${details.color}">
          <span style="color: ${details.color}">${currentChord}</span>
          <span style="font-size: 0.65rem; color: #64748b;">Current</span>
        </div>
      `;

      // Branch nodes placed in circular orbit around center
      const angleStep = (2 * Math.PI) / modeTrends.length;
      const radius = 110;

      modeTrends.forEach((t, i) => {
        const branchDetails = theory.getChordDetails(t.next, 0, 'major', 0);
        const angle = i * angleStep - Math.PI / 2;
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));

        graphHtml += `
          <div class="graph-branch-node" 
               data-chord="${t.next}" 
               style="transform: translate(${x}px, ${y}px); --branch-col: ${branchDetails.color}">
            <span style="color: ${branchDetails.color}">${t.next}</span>
            <span class="branch-prob-tag">${t.prob}%</span>
          </div>
        `;
      });

      graphViewport.innerHTML = graphHtml;

      // Update sequence strip
      graphStrip.innerHTML = `
        <span style="font-size: 0.78rem; color: var(--text-muted);">Active Path:</span>
        ${this.graphPath.map(c => `<span class="seq-chip">${c}</span>`).join(' ➔ ')}
      `;

      // Branch node click
      graphViewport.querySelectorAll('.graph-branch-node').forEach(node => {
        node.addEventListener('click', () => {
          this.graphPath.push(node.dataset.chord);
          renderGraph();
          renderSongs();
        });
      });
    };

    resetGraphBtn.addEventListener('click', () => {
      this.graphPath = ['I'];
      renderGraph();
      renderSongs();
    });

    const renderSongs = () => {
      const query = (searchInput.value || '').toLowerCase().trim();
      const filtered = THEORYTAB_SONGS.filter(song => {
        const matchesQuery = song.title.toLowerCase().includes(query) ||
                             song.artist.toLowerCase().includes(query) ||
                             song.chords.join(' ').toLowerCase().includes(query);
        const matchesGenre = currentGenre === 'All' || song.genre.includes(currentGenre);

        // Check if song matches graph path
        let matchesPath = true;
        if (this.graphPath.length > 1) {
          const songStr = song.chords.join(',');
          const pathStr = this.graphPath.join(',');
          matchesPath = songStr.includes(pathStr);
        }

        return matchesQuery && matchesGenre && matchesPath;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No songs found for this progression path. Try clicking another chord or reset the tree!</div>`;
        return;
      }

      grid.innerHTML = filtered.map(song => {
        const keyName = theory.getNoteName(song.key, theory.FLAT_KEYS.includes(song.key));
        return `
          <div class="song-card">
            <div>
              <div class="song-meta-top">
                <div>
                  <h4 class="song-title">${song.title}</h4>
                  <span class="song-artist">${song.artist} (${song.year})</span>
                </div>
              </div>

              <div class="song-badges">
                <span class="badge badge-key">${keyName} ${song.mode}</span>
                <span class="badge">${song.bpm} BPM</span>
                <span class="badge">${song.genre}</span>
              </div>

              <div class="song-progression-chips">
                ${song.chords.map(c => `<span class="prog-chip">${c}</span>`).join('')}
              </div>

              <p class="song-desc">${song.description}</p>
            </div>

            <div class="song-actions">
              <button class="btn btn-preview-song" data-id="${song.id}">🎧 Listen</button>
              <button class="btn btn-primary btn-load-song" data-id="${song.id}">Open in Hookpad</button>
            </div>
          </div>
        `;
      }).join('');

      grid.querySelectorAll('.btn-preview-song').forEach(btn => {
        btn.addEventListener('click', () => {
          const song = THEORYTAB_SONGS.find(s => s.id === btn.dataset.id);
          if (song) this.previewTheoryTabSong(song);
        });
      });

      grid.querySelectorAll('.btn-load-song').forEach(btn => {
        btn.addEventListener('click', () => {
          const song = THEORYTAB_SONGS.find(s => s.id === btn.dataset.id);
          if (song) this.loadSongIntoHookpad(song);
        });
      });
    };

    searchInput.addEventListener('input', renderSongs);

    genrePills.forEach(pill => {
      pill.addEventListener('click', () => {
        genrePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentGenre = pill.dataset.genre;
        renderSongs();
      });
    });

    renderGraph();
    renderSongs();
  }

  loadSongIntoHookpad(tabSong) {
    this.stopPlayback();
    this.song.title = tabSong.title;
    this.song.key = tabSong.key;
    this.song.mode = tabSong.mode;
    this.song.bpm = tabSong.bpm;
    this.song.bars = tabSong.bars;
    this.song.chords = tabSong.chords.map(c => ({
      numeral: c,
      duration: 4,
      inversion: 0
    }));
    this.song.melody = JSON.parse(JSON.stringify(tabSong.melody));

    document.getElementById('key-select').value = this.song.key;
    document.getElementById('mode-select').value = this.song.mode;
    document.getElementById('bpm-slider').value = this.song.bpm;
    document.getElementById('bpm-display').textContent = this.song.bpm;
    document.getElementById('song-title-display').textContent = this.song.title;

    this.renderHookpad();
    this.renderPianoKeyboard();
    this.saveToStorage();
    this.switchTab('hookpad');
    this.showToast(`Loaded "${tabSong.title}" into Hookpad!`);
  }

  previewTheoryTabSong(song) {
    this.audio.resume();
    const stepSec = 60 / song.bpm / 4;
    const now = this.audio.ctx.currentTime + 0.05;

    song.chords.forEach((chordNumeral, i) => {
      const details = theory.getChordDetails(chordNumeral, song.key, song.mode, 0);
      const voicing = theory.getChordVoicing(details, 4);
      const time = now + i * 4 * stepSec;
      const dur = 3.6 * stepSec;

      voicing.treble.forEach(m => this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, m, time, dur, 0.75));
      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, time, dur, 0.85);
    });

    this.showToast(`Playing preview for ${song.title}...`);
  }

  // --- Chord Crush Game UI (frame_82s.jpg) ---
  setupChordCrush() {
    const scoreVal = document.getElementById('crush-score-val');
    const timerVal = document.getElementById('crush-timer-val');
    const timelineTrack = document.getElementById('crush-timeline-track');
    const choicesDeck = document.getElementById('crush-choices-deck');
    const listenBtn = document.getElementById('btn-crush-listen');
    const feedbackToast = document.getElementById('crush-feedback-toast');

    const showToastMsg = (msg, isSuccess = true) => {
      feedbackToast.style.display = 'block';
      feedbackToast.style.color = isSuccess ? '#10b981' : '#ef4444';
      feedbackToast.textContent = msg;
      setTimeout(() => { feedbackToast.style.display = 'none'; }, 1800);
    };

    const renderRound = () => {
      scoreVal.textContent = this.crushGame.score;

      // Render Timeline Track with completed blocks + target block
      let trackHtml = '';
      const totalLen = this.crushGame.currentProgression.length;

      for (let i = 0; i < totalLen; i++) {
        const isGuessed = i < this.crushGame.guessedChords.length;
        const isTarget = i === this.crushGame.currentStepIndex;

        if (isGuessed) {
          const num = this.crushGame.guessedChords[i].numeral;
          const details = theory.getChordDetails(num, 0, 'major', 0);
          trackHtml += `
            <div class="crush-track-block revealed" style="--chord-col: ${details.color}">
              <div class="crush-check-pill">✓</div>
              <span class="numeral" style="color: ${details.color}">${num}</span>
              <span class="chord-name">${details.chordName}</span>
            </div>
          `;
        } else if (isTarget) {
          trackHtml += `
            <div class="crush-track-block target">
              <div class="crush-target-indicator"></div>
              <span class="numeral" style="color: #64748b;">?</span>
              <span class="chord-name">Guess</span>
            </div>
          `;
        } else {
          trackHtml += `
            <div class="crush-track-block" style="background:#f1f5f9;">
              <span class="numeral" style="color: #cbd5e1;">–</span>
            </div>
          `;
        }
      }

      timelineTrack.innerHTML = trackHtml;

      // Render 4 Choice Cards
      const choices = this.crushGame.getChoicesForStep(this.crushGame.currentStepIndex);
      choicesDeck.innerHTML = choices.map(ch => {
        const details = theory.getChordDetails(ch, 0, 'major', 0);
        return `
          <div class="crush-choice-card" data-chord="${ch}" style="--card-col: ${details.color}">
            <span class="choice-numeral" style="color: ${details.color}">${ch}</span>
            <span class="choice-name">${details.chordName}</span>
          </div>
        `;
      }).join('');

      choicesDeck.querySelectorAll('.crush-choice-card').forEach(card => {
        card.addEventListener('click', () => {
          const ch = card.dataset.chord;
          const res = this.crushGame.guessCurrentStep(ch);
          if (!res) return;

          scoreVal.textContent = res.score;

          if (res.status === 'step_correct') {
            showToastMsg(`✓ Correct! That was ${ch}!`, true);
            renderRound();
          } else if (res.status === 'round_complete') {
            showToastMsg(`🎉 Progression Solved! +50 Bonus!`, true);
            setTimeout(() => {
              this.crushGame.startNewRound();
              renderRound();
              this.crushGame.playFullProgression();
            }, 1600);
          } else {
            showToastMsg(`❌ Not ${ch}! Listen again...`, false);
          }
        });
      });
    };

    listenBtn.addEventListener('click', () => {
      this.crushGame.playFullProgression();
    });

    this.crushGame.startNewRound();
    renderRound();
  }

  // --- Trends Tab Setup ---
  setupTrends() {
    const chordSelect = document.getElementById('trends-current-chord');
    const barsContainer = document.getElementById('trends-prob-bars');
    const cadencesGrid = document.getElementById('famous-cadences-grid');

    const updateTrendsBars = () => {
      const chord = chordSelect.value;
      const mode = this.song.mode;
      const trends = (CHORD_TRENDS[mode] || CHORD_TRENDS.major)[chord] || [];

      barsContainer.innerHTML = trends.map(t => {
        const details = theory.getChordDetails(t.next, this.song.key, this.song.mode, 0);
        return `
          <div class="prob-bar-row">
            <div class="prob-bar-info">
              <span><strong style="color: ${details.color}">${t.next}</strong> - ${t.label}</span>
              <span>${t.prob}%</span>
            </div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill" style="width: ${t.prob}%; background: ${details.color}"></div>
            </div>
          </div>
        `;
      }).join('');
    };

    chordSelect.addEventListener('change', updateTrendsBars);
    updateTrendsBars();

    cadencesGrid.innerHTML = FAMOUS_CADENCES.map(cadence => `
      <div class="cadence-card">
        <div>
          <h4>${cadence.name}</h4>
          <div class="cadence-formula">${cadence.formula}</div>
          <div class="cadence-examples"><strong>Hits:</strong> ${cadence.examples}</div>
          <p class="song-desc">${cadence.description}</p>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn btn-audition-cadence" data-chords="${cadence.chords.join(',')}">▶ Audition</button>
          <button class="btn btn-primary btn-use-cadence" data-chords="${cadence.chords.join(',')}">Use in Song</button>
        </div>
      </div>
    `).join('');

    cadencesGrid.querySelectorAll('.btn-audition-cadence').forEach(btn => {
      btn.addEventListener('click', () => {
        const chords = btn.dataset.chords.split(',');
        this.previewChordsSequence(chords);
      });
    });

    cadencesGrid.querySelectorAll('.btn-use-cadence').forEach(btn => {
      btn.addEventListener('click', () => {
        const chords = btn.dataset.chords.split(',');
        this.loadProgression(chords);
        this.switchTab('hookpad');
      });
    });
  }

  previewChordsSequence(chords) {
    this.audio.resume();
    const now = this.audio.ctx.currentTime + 0.05;
    const dur = 0.8;

    chords.forEach((chordNumeral, i) => {
      const details = theory.getChordDetails(chordNumeral, this.song.key, this.song.mode, 0);
      const voicing = theory.getChordVoicing(details, 4);
      const time = now + i * dur;

      voicing.treble.forEach(m => this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, m, time, dur * 0.9, 0.75));
      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, time, dur * 0.9, 0.85);
    });
  }

  // --- Theory Academy Setup ---
  setupAcademy() {
    const navList = document.getElementById('lesson-nav-list');
    const contentCard = document.getElementById('lesson-content-card');

    navList.innerHTML = THEORY_LESSONS.map((l, idx) => `
      <li class="lesson-nav-item ${idx === 0 ? 'active' : ''}">
        <button data-id="${l.id}">${l.title}</button>
      </li>
    `).join('');

    const renderLesson = (id) => {
      const lesson = THEORY_LESSONS.find(l => l.id === id);
      if (!lesson) return;

      contentCard.innerHTML = `
        <h2>${lesson.title}</h2>
        <div class="subtitle">${lesson.subtitle}</div>
        <div class="lesson-body">${lesson.content}</div>
        <div class="lesson-tip-box">💡 <strong>Pro Tip:</strong> ${lesson.tip}</div>
        <div class="lesson-action-row">
          <button class="btn btn-primary" id="btn-play-lesson-demo">▶ Listen to Lesson Example</button>
        </div>
      `;

      document.getElementById('btn-play-lesson-demo').addEventListener('click', () => {
        if (lesson.demoChords) this.previewChordsSequence(lesson.demoChords);
        else if (lesson.demoNotes) this.audio.previewNotes(lesson.demoNotes, 'synth');
      });
    };

    navList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        navList.querySelectorAll('.lesson-nav-item').forEach(li => li.classList.remove('active'));
        btn.closest('.lesson-nav-item').classList.add('active');
        renderLesson(btn.dataset.id);
      });
    });

    renderLesson(THEORY_LESSONS[0].id);
  }

  // --- Cheat Sheet Setup ---
  setupCheatSheet() {
    const tbody = document.getElementById('cheat-sheet-tbody');
    if (!tbody) return;

    let rowsHtml = '';
    for (let k = 0; k < 12; k++) {
      const isFlat = theory.FLAT_KEYS.includes(k);
      const rootName = theory.getNoteName(k, isFlat);

      const chords = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'].map(num => {
        return theory.getChordDetails(num, k, 'major', 0).fullChordName;
      });

      rowsHtml += `
        <tr>
          <td><strong>${rootName} Major</strong></td>
          <td>${chords[0]}</td>
          <td>${chords[1]}</td>
          <td>${chords[2]}</td>
          <td>${chords[3]}</td>
          <td>${chords[4]}</td>
          <td>${chords[5]}</td>
          <td>${chords[6]}</td>
        </tr>
      `;
    }

    tbody.innerHTML = rowsHtml;
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.songsketchApp = new SongsketchApp();
});
