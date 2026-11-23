// js/app.js - Main Application Orchestrator for Songsketch (Hooktheory Clone)

import * as theory from './theory.js';
import { AudioEngine } from './audio.js';
import { THEORYTAB_SONGS } from './data/songs.js';
import { CHORD_TRENDS, FAMOUS_CADENCES } from './data/trends.js';
import { THEORY_LESSONS } from './data/lessons.js';

class SongsketchApp {
  constructor() {
    this.audio = new AudioEngine();
    
    // Default song state
    this.song = {
      title: 'My Songsketch',
      key: 0, // 0 = C
      mode: 'major',
      bpm: 100,
      bars: 4,
      loop: true,
      chords: ['I', 'V', 'vi', 'IV', 'I', 'V', 'IV', 'I'],
      melody: [
        { row: 7, step: 0, duration: 2 },
        { row: 9, step: 2, duration: 2 },
        { row: 11, step: 4, duration: 2 },
        { row: 12, step: 6, duration: 2 },
        { row: 11, step: 8, duration: 2 },
        { row: 9, step: 10, duration: 2 },
        { row: 7, step: 12, duration: 4 }
      ]
    };

    this.selectedSlot = 0;
    this.selectedInversion = 0;
    this.selectedNoteDuration = 2; // 2 sixteenths = eighth note
    this.activeTab = 'hookpad';
    this.currentLessonId = THEORY_LESSONS[0].id;
    this.trendsSelectedChord = 'I';

    // Playback engine properties
    this.isPlaying = false;
    this.playStartTime = 0;
    this.playbackTimer = null;
    this.animFrameId = null;
    this.totalSteps = 32;

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
    this.setupTrends();
    this.setupAcademy();
    this.setupCheatSheet();

    this.renderHookpad();
    this.renderPianoKeyboard();
    this.updateSuggestions();
  }

  // --- Persistence & State Loading ---
  loadFromUrlOrStorage() {
    try {
      if (window.location.hash.length > 2) {
        const hashData = decodeURIComponent(atob(window.location.hash.slice(1)));
        const parsed = JSON.parse(hashData);
        if (parsed && parsed.chords) {
          this.song = Object.assign(this.song, parsed);
          this.showToast('Song loaded from share link!');
          return;
        }
      }
      const saved = localStorage.getItem('songsketch_saved_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.chords) {
          this.song = Object.assign(this.song, parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load song state from hash/storage', e);
    }
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
        const tab = btn.dataset.tab;
        this.switchTab(tab);
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
  }

  // --- Transport Controls ---
  setupTransportListeners() {
    const keySelect = document.getElementById('key-select');
    const modeSelect = document.getElementById('mode-select');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    const barsSelect = document.getElementById('bars-select');
    const loopToggle = document.getElementById('loop-toggle');
    const playBtn = document.getElementById('play-btn');
    const drumSelect = document.getElementById('drum-select');
    const instSelect = document.getElementById('inst-select');
    const metronomeBtn = document.getElementById('metronome-btn');

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
    barsSelect.value = this.song.bars;
    loopToggle.checked = this.song.loop;

    keySelect.addEventListener('change', (e) => {
      this.song.key = parseInt(e.target.value);
      this.renderHookpad();
      this.renderPianoKeyboard();
      this.saveToStorage();
    });

    modeSelect.addEventListener('change', (e) => {
      this.song.mode = e.target.value;
      this.renderHookpad();
      this.renderChordPalette();
      this.updateSuggestions();
      this.saveToStorage();
    });

    bpmSlider.addEventListener('input', (e) => {
      this.song.bpm = parseInt(e.target.value);
      bpmDisplay.textContent = this.song.bpm;
      this.saveToStorage();
    });

    barsSelect.addEventListener('change', (e) => {
      this.changeBars(parseInt(e.target.value));
    });

    loopToggle.addEventListener('change', (e) => {
      this.song.loop = e.target.checked;
      this.saveToStorage();
    });

    playBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stopPlayback();
      } else {
        this.startPlayback();
      }
    });

    drumSelect.addEventListener('change', (e) => {
      this.audio.drumStyle = e.target.value;
    });

    instSelect.addEventListener('change', (e) => {
      this.audio.instrument = e.target.value;
    });

    metronomeBtn.addEventListener('click', () => {
      this.audio.metronomeEnabled = !this.audio.metronomeEnabled;
      metronomeBtn.classList.toggle('active', this.audio.metronomeEnabled);
      metronomeBtn.style.color = this.audio.metronomeEnabled ? 'var(--primary)' : '';
    });
  }

  changeBars(newBars) {
    this.stopPlayback();
    this.song.bars = newBars;
    const requiredSlots = newBars * 2;
    const newChords = Array(requiredSlots).fill(null);
    for (let i = 0; i < Math.min(this.song.chords.length, requiredSlots); i++) {
      newChords[i] = this.song.chords[i];
    }
    this.song.chords = newChords;
    this.song.melody = this.song.melody.filter(n => n.step < newBars * 8);
    this.selectedSlot = Math.min(this.selectedSlot, requiredSlots - 1);
    this.renderHookpad();
    this.saveToStorage();
  }

  // --- Playback Engine ---
  async startPlayback() {
    await this.audio.resume();
    this.isPlaying = true;
    const playBtn = document.getElementById('play-btn');
    playBtn.textContent = '⏹ Stop';
    playBtn.classList.add('playing');

    const playhead = document.getElementById('playhead-cursor');
    playhead.style.display = 'block';

    this.totalSteps = this.song.bars * 8;
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
      playBtn.textContent = '▶ Play';
      playBtn.classList.remove('playing');
    }

    const playhead = document.getElementById('playhead-cursor');
    if (playhead) playhead.style.display = 'none';

    document.querySelectorAll('.chord-slot').forEach(el => el.classList.remove('active-playback'));
    document.querySelectorAll('.white-key, .black-key').forEach(el => el.classList.remove('active'));
  }

  schedulePlaybackLoop(startTime) {
    if (!this.isPlaying) return;
    const stepSec = 60 / this.song.bpm / 4;
    const loopDuration = this.totalSteps * stepSec;

    // Schedule chords and bass
    this.song.chords.forEach((chordData, i) => {
      if (!chordData) return;
      const numeral = typeof chordData === 'string' ? chordData : chordData.numeral;
      const inv = chordData.inversion || 0;
      const details = theory.getChordDetails(numeral, this.song.key, this.song.mode, inv);
      const voicing = theory.getChordVoicing(details, 3);
      const chordTime = startTime + i * 4 * stepSec;
      const dur = 4 * stepSec;

      voicing.treble.forEach(m => {
        if (this.audio.instrument === 'piano') this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, m, chordTime, dur, 0.7);
        else if (this.audio.instrument === 'rhodes') this.audio.playRhodesNote(this.audio.ctx, this.audio.chordsGain, m, chordTime, dur, 0.7);
        else this.audio.playSynthLeadNote(this.audio.ctx, this.audio.chordsGain, m, chordTime, dur, 0.6);
      });

      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, chordTime, dur, 0.85);
    });

    // Schedule melody
    this.song.melody.forEach(note => {
      const pitch = theory.rowToPitch(note.row, this.song.key, this.song.mode).midi;
      const noteTime = startTime + note.step * stepSec;
      const dur = (note.duration || 1) * stepSec;
      this.audio.playSynthLeadNote(this.audio.ctx, this.audio.melodyGain, pitch, noteTime, dur, 0.85);
    });

    // Schedule rhythm & metronome
    for (let s = 0; s < this.totalSteps; s++) {
      const beatTime = startTime + s * stepSec;
      const beatInBar = s % 8; // 8 16ths per half bar

      if (this.audio.metronomeEnabled && s % 2 === 0) {
        this.audio.playMetronomeClick(this.audio.ctx, this.audio.masterGain, beatTime, s % 8 === 0);
      }

      if (this.audio.drumStyle !== 'none') {
        if (beatInBar === 0 || beatInBar === 4) {
          this.audio.playKick(this.audio.ctx, this.audio.drumsGain, beatTime);
        }
        if (beatInBar === 4) {
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
      const cellWidth = 22; // width of cell in px
      const labelOffset = 72; // width of header in px
      const pxPosition = labelOffset + currentStep * cellWidth;

      const playhead = document.getElementById('playhead-cursor');
      if (playhead) playhead.style.left = `${pxPosition}px`;

      // Highlight active chord slot
      const activeSlotIndex = Math.floor(currentStep / 4);
      document.querySelectorAll('.chord-slot').forEach((el, idx) => {
        el.classList.toggle('active-playback', idx === activeSlotIndex);
      });

      // Animate piano keys for active notes
      const activeStepFloor = Math.floor(currentStep);
      const activeNotes = this.song.melody.filter(n => activeStepFloor >= n.step && activeStepFloor < n.step + (n.duration || 1));
      
      document.querySelectorAll('.white-key, .black-key').forEach(el => el.classList.remove('active'));
      activeNotes.forEach(n => {
        const pitch = theory.rowToPitch(n.row, this.song.key, this.song.mode).midi;
        const keyEl = document.querySelector(`[data-midi="${pitch}"]`);
        if (keyEl) keyEl.classList.add('active');
      });
    }

    this.animFrameId = requestAnimationFrame(() => this.animatePlayhead());
  }

  // --- Hookpad UI Setup & Rendering ---
  setupHookpadControls() {
    const chordContainer = document.getElementById('chord-slots-container');
    const rollGrid = document.getElementById('piano-roll-grid');

    // Slot click handler
    chordContainer.addEventListener('click', (e) => {
      const slot = e.target.closest('.chord-slot');
      if (slot) {
        this.selectedSlot = parseInt(slot.dataset.index);
        this.updateChordSlotSelection();
        this.updateSuggestions();
      }
    });

    // Piano roll cell click handler
    rollGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('.roll-cell');
      if (!cell) return;
      const row = parseInt(cell.dataset.row);
      const step = parseInt(cell.dataset.step);

      // Check if note already exists at this row/step
      const existingIdx = this.song.melody.findIndex(n => n.row === row && step >= n.step && step < n.step + (n.duration || 1));
      if (existingIdx >= 0) {
        this.song.melody.splice(existingIdx, 1);
      } else {
        // Add new note
        this.song.melody.push({
          row,
          step,
          duration: this.selectedNoteDuration
        });
        // Audition note sound
        const pitch = theory.rowToPitch(row, this.song.key, this.song.mode).midi;
        this.audio.previewNotes([pitch], 'synth');
      }

      this.renderMelodyNotes();
      this.saveToStorage();
    });

    // Inversion pill buttons
    document.querySelectorAll('.inversion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.inversion-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedInversion = parseInt(btn.dataset.inversion);
        
        // Update currently selected chord's inversion if present
        const currentChord = this.song.chords[this.selectedSlot];
        if (currentChord) {
          const numeral = typeof currentChord === 'string' ? currentChord : currentChord.numeral;
          this.setChordAtSlot(numeral, this.selectedInversion, false);
        }
      });
    });

    // Note duration pill buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedNoteDuration = parseInt(btn.dataset.duration);
      });
    });

    // Palette tab switching (Diatonic, 7ths, Secondary, Borrowed)
    document.querySelectorAll('.palette-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.palette-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderChordPalette(btn.dataset.category);
      });
    });

    // Clear and Preset progression dropdowns
    const presetSelect = document.getElementById('progression-preset-select');
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
    const numSlots = this.song.bars * 2;
    this.song.chords = Array(numSlots).fill(null);
    for (let i = 0; i < numSlots; i++) {
      this.song.chords[i] = chordsArray[i % chordsArray.length];
    }
    this.renderHookpad();
    this.saveToStorage();
    this.showToast('Progression loaded!');
  }

  renderHookpad() {
    this.renderChordSlots();
    this.renderPianoRoll();
    this.renderChordPalette('diatonic');
  }

  renderChordSlots() {
    const container = document.getElementById('chord-slots-container');
    const totalSlots = this.song.bars * 2;
    
    // Ensure array length matches
    if (this.song.chords.length !== totalSlots) {
      this.song.chords = Array.from({ length: totalSlots }, (_, i) => this.song.chords[i] || null);
    }

    container.innerHTML = this.song.chords.map((chordData, i) => {
      const isSelected = i === this.selectedSlot;
      if (!chordData) {
        return `
          <div class="chord-slot empty ${isSelected ? 'selected' : ''}" data-index="${i}">
            <span class="numeral">+</span>
            <span class="chord-name">empty</span>
          </div>
        `;
      }

      const numeral = typeof chordData === 'string' ? chordData : chordData.numeral;
      const inv = chordData.inversion || 0;
      const details = theory.getChordDetails(numeral, this.song.key, this.song.mode, inv);

      return `
        <div class="chord-slot ${isSelected ? 'selected' : ''}" data-index="${i}" style="border-top-color: ${details.color}">
          <span class="numeral" style="color: ${details.color}">${details.fullDisplay}</span>
          <span class="chord-name">${details.fullChordName}</span>
        </div>
      `;
    }).join('');
  }

  updateChordSlotSelection() {
    document.querySelectorAll('.chord-slot').forEach((slot, idx) => {
      slot.classList.toggle('selected', idx === this.selectedSlot);
    });
  }

  renderPianoRoll() {
    const labelsContainer = document.getElementById('piano-roll-labels');
    const gridContainer = document.getElementById('piano-roll-grid');
    const totalSteps = this.song.bars * 8;
    const NUM_ROWS = 15; // 2+ octaves

    // 1. Render Row Labels (Scale degrees & note names)
    let labelsHtml = '';
    for (let r = NUM_ROWS - 1; r >= 0; r--) {
      const pitchInfo = theory.rowToPitch(r, this.song.key, this.song.mode);
      const isTonic = (r % 7) === 0;
      labelsHtml += `
        <div class="degree-label-cell" data-row="${r}">
          <span class="degree-badge" style="background-color: ${pitchInfo.color}">${pitchInfo.degreeLabel}</span>
          <span class="roll-note-name">${pitchInfo.noteName}${pitchInfo.octave}</span>
        </div>
      `;
    }
    labelsContainer.innerHTML = labelsHtml;

    // 2. Render Grid Cells
    let gridHtml = '';
    for (let r = NUM_ROWS - 1; r >= 0; r--) {
      const isTonic = (r % 7) === 0;
      gridHtml += `<div class="roll-row" data-row="${r}">`;
      for (let s = 0; s < totalSteps; s++) {
        const isBar = s % 8 === 7;
        const isHalfBeat = s % 2 === 1;
        gridHtml += `
          <div class="roll-cell ${isBar ? 'beat-bar' : ''} ${isHalfBeat ? 'half-beat' : ''} ${isTonic ? 'tonic-row' : ''}" 
               data-row="${r}" data-step="${s}">
          </div>
        `;
      }
      gridHtml += `</div>`;
    }
    gridContainer.innerHTML = gridHtml;

    // 3. Render Melody Notes on top
    this.renderMelodyNotes();
  }

  renderMelodyNotes() {
    // Remove previous notes
    document.querySelectorAll('.roll-note').forEach(n => n.remove());

    const gridContainer = document.getElementById('piano-roll-grid');
    this.song.melody.forEach(note => {
      const cell = gridContainer.querySelector(`.roll-cell[data-row="${note.row}"][data-step="${note.step}"]`);
      if (!cell) return;

      const pitchInfo = theory.rowToPitch(note.row, this.song.key, this.song.mode);
      const dur = note.duration || 1;
      const widthPx = dur * 22 - 2;

      const noteEl = document.createElement('div');
      noteEl.className = 'roll-note';
      noteEl.style.width = `${widthPx}px`;
      noteEl.style.backgroundColor = pitchInfo.color;
      noteEl.textContent = pitchInfo.degreeLabel;
      cell.appendChild(noteEl);
    });
  }

  renderChordPalette(category = 'diatonic') {
    const container = document.getElementById('palette-buttons-grid');
    const dict = theory.CHORD_DEFINITIONS[this.song.mode] || theory.CHORD_DEFINITIONS.major;

    const chordsList = Object.keys(dict).filter(numeral => {
      const def = dict[numeral];
      if (category === 'diatonic') return def.type === 'diatonic';
      if (category === 'seventh') return def.type === 'seventh';
      if (category === 'secondary') return def.type === 'secondary';
      if (category === 'borrowed') return def.type === 'borrowed' || def.type === 'harmonic' || def.type === 'suspension';
      return true;
    });

    container.innerHTML = chordsList.map(numeral => {
      const details = theory.getChordDetails(numeral, this.song.key, this.song.mode, this.selectedInversion);
      return `
        <button class="palette-chord-btn" data-numeral="${numeral}" style="border-bottom-color: ${details.color}">
          <span class="numeral" style="color: ${details.color}">${numeral}</span>
          <span class="label">${details.chordName}</span>
        </button>
      `;
    }).join('');

    // Palette button click
    container.querySelectorAll('.palette-chord-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const numeral = btn.dataset.numeral;
        this.setChordAtSlot(numeral, this.selectedInversion, true);
      });
    });
  }

  setChordAtSlot(numeral, inversion = 0, advanceSlot = true) {
    this.song.chords[this.selectedSlot] = {
      numeral,
      inversion
    };

    // Audition sound
    const details = theory.getChordDetails(numeral, this.song.key, this.song.mode, inversion);
    const voicing = theory.getChordVoicing(details, 3);
    this.audio.previewNotes(voicing.all, this.audio.instrument);

    if (advanceSlot) {
      this.selectedSlot = (this.selectedSlot + 1) % (this.song.bars * 2);
    }

    this.renderChordSlots();
    this.updateSuggestions();
    this.saveToStorage();
  }

  updateSuggestions() {
    const listEl = document.getElementById('suggestions-list');
    if (!listEl) return;

    // Get previous chord relative to current slot
    const prevIndex = (this.selectedSlot - 1 + this.song.chords.length) % this.song.chords.length;
    const prevChord = this.song.chords[prevIndex];
    const prevNumeral = prevChord ? (typeof prevChord === 'string' ? prevChord : prevChord.numeral) : 'I';

    const modeTrends = CHORD_TRENDS[this.song.mode] || CHORD_TRENDS.major;
    const suggestions = modeTrends[prevNumeral] || modeTrends['I'] || [];

    if (suggestions.length === 0) {
      listEl.innerHTML = `<div class="suggestion-desc">Select a slot to see chord progression trends.</div>`;
      return;
    }

    listEl.innerHTML = suggestions.slice(0, 4).map(s => {
      const details = theory.getChordDetails(s.next, this.song.key, this.song.mode, 0);
      return `
        <div class="suggestion-item" data-numeral="${s.next}">
          <div class="suggestion-left">
            <span class="suggestion-badge" style="color: ${details.color}">${s.next}</span>
            <span class="suggestion-desc">${s.label}</span>
          </div>
          <span class="suggestion-prob">${s.prob}%</span>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        this.setChordAtSlot(item.dataset.numeral, 0, true);
      });
    });
  }

  // --- Piano Keyboard Visualizer ---
  renderPianoKeyboard() {
    const wrapper = document.getElementById('keyboard-keys-wrapper');
    if (!wrapper) return;

    // Render 2 octaves from C3 (MIDI 48) to B4 (MIDI 71)
    const whiteNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
    const blackNotes = [
      { pc: 1, leftOffset: 5.5 },  // C#
      { pc: 3, leftOffset: 12.5 }, // D#
      { pc: 6, leftOffset: 26.5 }, // F#
      { pc: 8, leftOffset: 33.5 }, // G#
      { pc: 10, leftOffset: 40.5 },// A#
      { pc: 13, leftOffset: 55.5 },// C#5
      { pc: 15, leftOffset: 62.5 },// D#5
      { pc: 18, leftOffset: 76.5 },// F#5
      { pc: 20, leftOffset: 83.5 },// G#5
      { pc: 22, leftOffset: 90.5 } // A#5
    ];

    let whiteHtml = '';
    for (let oct = 3; oct <= 4; oct++) {
      whiteNotes.forEach(pc => {
        const midi = oct * 12 + pc + 12; // C3 = 48, C4 = 60
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
      const noteName = theory.getNoteName(bn.pc % 12, false);
      blackHtml += `
        <div class="black-key" data-midi="${midi}" style="left: ${bn.leftOffset}%"></div>
      `;
    });

    wrapper.innerHTML = whiteHtml + blackHtml;

    // Click keys to play
    wrapper.querySelectorAll('.white-key, .black-key').forEach(key => {
      key.addEventListener('mousedown', () => {
        const midi = parseInt(key.dataset.midi);
        this.audio.previewNotes([midi], 'piano');
      });
    });
  }

  // --- Keyboard Shortcuts ---
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in text input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.isPlaying) this.stopPlayback();
        else this.startPlayback();
      } else if (e.key >= '1' && e.key <= '7') {
        // Quick insert diatonic chord on scale degree 1..7
        const degIndex = parseInt(e.key) - 1;
        const diatonicDegrees = theory.MODES[this.song.mode] ? theory.MODES[this.song.mode].degreeNames : theory.MODES.major.degreeNames;
        const diatonicKeys = Object.keys(theory.CHORD_DEFINITIONS[this.song.mode] || theory.CHORD_DEFINITIONS.major)
          .filter(k => (theory.CHORD_DEFINITIONS[this.song.mode] || theory.CHORD_DEFINITIONS.major)[k].type === 'diatonic');
        
        if (diatonicKeys[degIndex]) {
          this.setChordAtSlot(diatonicKeys[degIndex], this.selectedInversion, true);
        }
      } else if (e.code === 'ArrowRight') {
        this.selectedSlot = Math.min(this.selectedSlot + 1, this.song.chords.length - 1);
        this.updateChordSlotSelection();
        this.updateSuggestions();
      } else if (e.code === 'ArrowLeft') {
        this.selectedSlot = Math.max(this.selectedSlot - 1, 0);
        this.updateChordSlotSelection();
        this.updateSuggestions();
      } else if (e.code === 'Backspace' || e.code === 'Delete') {
        this.song.chords[this.selectedSlot] = null;
        this.renderChordSlots();
        this.saveToStorage();
      }
    });
  }

  // --- Modals, Export & Share ---
  setupModalsAndExport() {
    // Share Link
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

    // Download MIDI
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

    // Download Audio WAV
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

    // Project JSON Save
    document.getElementById('save-project-btn').addEventListener('click', () => {
      const jsonStr = JSON.stringify(this.song, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.song.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Project file saved!');
    });

    // Project JSON Load
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
            this.song = Object.assign(this.song, parsed);
            this.renderHookpad();
            this.saveToStorage();
            this.showToast('Project opened successfully!');
          }
        } catch (err) {
          alert('Invalid project file format.');
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
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

  // --- TheoryTab Explorer Setup ---
  setupTheoryTab() {
    const grid = document.getElementById('theorytab-songs-grid');
    const searchInput = document.getElementById('theorytab-search');
    const genrePills = document.querySelectorAll('.genre-pill');

    let currentGenre = 'All';

    const renderSongs = () => {
      const query = (searchInput.value || '').toLowerCase().trim();
      const filtered = THEORYTAB_SONGS.filter(song => {
        const matchesQuery = song.title.toLowerCase().includes(query) ||
                             song.artist.toLowerCase().includes(query) ||
                             song.chords.join(' ').toLowerCase().includes(query);
        const matchesGenre = currentGenre === 'All' || song.genre.includes(currentGenre);
        return matchesQuery && matchesGenre;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No songs found matching your search.</div>`;
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

      // Preview Song Button
      grid.querySelectorAll('.btn-preview-song').forEach(btn => {
        btn.addEventListener('click', () => {
          const song = THEORYTAB_SONGS.find(s => s.id === btn.dataset.id);
          if (song) {
            this.previewTheoryTabSong(song);
          }
        });
      });

      // Load Song Button
      grid.querySelectorAll('.btn-load-song').forEach(btn => {
        btn.addEventListener('click', () => {
          const song = THEORYTAB_SONGS.find(s => s.id === btn.dataset.id);
          if (song) {
            this.loadSongIntoHookpad(song);
          }
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

    renderSongs();
  }

  loadSongIntoHookpad(tabSong) {
    this.stopPlayback();
    this.song = {
      title: tabSong.title,
      key: tabSong.key,
      mode: tabSong.mode,
      bpm: tabSong.bpm,
      bars: tabSong.bars,
      loop: true,
      chords: [...tabSong.chords],
      melody: JSON.parse(JSON.stringify(tabSong.melody))
    };

    // Update transport selectors
    document.getElementById('key-select').value = this.song.key;
    document.getElementById('mode-select').value = this.song.mode;
    document.getElementById('bpm-slider').value = this.song.bpm;
    document.getElementById('bpm-display').textContent = this.song.bpm;
    document.getElementById('bars-select').value = this.song.bars;

    this.renderHookpad();
    this.renderPianoKeyboard();
    this.saveToStorage();
    this.switchTab('hookpad');
    this.showToast(`Loaded "${tabSong.title}" into Hookpad!`);
  }

  previewTheoryTabSong(song) {
    // Quick preview of the chords progression
    this.audio.resume();
    const stepSec = 60 / song.bpm / 4;
    const now = this.audio.ctx.currentTime + 0.05;

    song.chords.forEach((chordNumeral, i) => {
      const details = theory.getChordDetails(chordNumeral, song.key, song.mode, 0);
      const voicing = theory.getChordVoicing(details, 3);
      const time = now + i * 4 * stepSec;
      const dur = 3.6 * stepSec;

      voicing.treble.forEach(m => this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, m, time, dur, 0.7));
      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, time, dur, 0.8);
    });

    this.showToast(`Playing preview for ${song.title}...`);
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

      if (trends.length === 0) {
        barsContainer.innerHTML = `<p style="color:var(--text-muted)">No statistics available for ${chord}.</p>`;
        return;
      }

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

    // Render Famous Cadences
    cadencesGrid.innerHTML = FAMOUS_CADENCES.map(cadence => {
      return `
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
      `;
    }).join('');

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
      const voicing = theory.getChordVoicing(details, 3);
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
