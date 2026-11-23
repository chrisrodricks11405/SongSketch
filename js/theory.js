// js/theory.js - Complete Music Theory Engine for Songsketch (Hooktheory Clone)

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const FLAT_KEYS = [5, 10, 3, 8, 1, 6]; // F, Bb, Eb, Ab, Db, Gb

export const MODES = {
  major: {
    name: 'Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeNames: ['1', '2', '3', '4', '5', '6', '7']
  },
  minor: {
    name: 'Natural Minor (Aeolian)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeNames: ['1', '2', 'b3', '4', '5', 'b6', 'b7']
  },
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degreeNames: ['1', '2', 'b3', '4', '5', '6', 'b7']
  },
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degreeNames: ['1', '2', '3', '4', '5', '6', 'b7']
  },
  harmonic_minor: {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degreeNames: ['1', '2', 'b3', '4', '5', 'b6', '7']
  }
};

// Hooktheory standard scale-degree colors
export const DEGREE_COLORS = [
  '#e74c3c', // 1: Red
  '#e67e22', // 2: Orange
  '#f1c40f', // 3: Yellow
  '#2ecc71', // 4: Green
  '#00bcd4', // 5: Cyan / Teal
  '#3498db', // 6: Blue
  '#9b59b6'  // 7: Purple
];

export const CHORD_QUALITIES = {
  '':      { name: 'Major',       intervals: [0, 4, 7],      symbol: '' },
  'm':     { name: 'Minor',       intervals: [0, 3, 7],      symbol: 'm' },
  'dim':   { name: 'Diminished',  intervals: [0, 3, 6],      symbol: '°' },
  'aug':   { name: 'Augmented',   intervals: [0, 4, 8],      symbol: '+' },
  '7':     { name: 'Dominant 7th',intervals: [0, 4, 7, 10],  symbol: '7' },
  'maj7':  { name: 'Major 7th',   intervals: [0, 4, 7, 11],  symbol: 'maj7' },
  'm7':    { name: 'Minor 7th',   intervals: [0, 3, 7, 10],  symbol: 'm7' },
  'm7b5':  { name: 'Half-Dim 7th',intervals: [0, 3, 6, 10],  symbol: 'ø7' },
  'dim7':  { name: 'Diminished 7th', intervals: [0, 3, 6, 9], symbol: '°7' },
  'sus2':  { name: 'Suspended 2', intervals: [0, 2, 7],      symbol: 'sus2' },
  'sus4':  { name: 'Suspended 4', intervals: [0, 5, 7],      symbol: 'sus4' },
  'add9':  { name: 'Add 9',       intervals: [0, 4, 7, 14],  symbol: 'add9' }
};

// Comprehensive chord dictionary mapped by mode
export const CHORD_DEFINITIONS = {
  major: {
    // Diatonic
    'I':     { offset: 0,  quality: '',     degree: 1, type: 'diatonic' },
    'ii':    { offset: 2,  quality: 'm',    degree: 2, type: 'diatonic' },
    'iii':   { offset: 4,  quality: 'm',    degree: 3, type: 'diatonic' },
    'IV':    { offset: 5,  quality: '',     degree: 4, type: 'diatonic' },
    'V':     { offset: 7,  quality: '',     degree: 5, type: 'diatonic' },
    'vi':    { offset: 9,  quality: 'm',    degree: 6, type: 'diatonic' },
    'vii°':  { offset: 11, quality: 'dim',  degree: 7, type: 'diatonic' },
    // 7ths
    'Imaj7': { offset: 0,  quality: 'maj7', degree: 1, type: 'seventh' },
    'ii7':   { offset: 2,  quality: 'm7',   degree: 2, type: 'seventh' },
    'iii7':  { offset: 4,  quality: 'm7',   degree: 3, type: 'seventh' },
    'IVmaj7':{ offset: 5,  quality: 'maj7', degree: 4, type: 'seventh' },
    'V7':    { offset: 7,  quality: '7',    degree: 5, type: 'seventh' },
    'vi7':   { offset: 9,  quality: 'm7',   degree: 6, type: 'seventh' },
    'viiø7': { offset: 11, quality: 'm7b5', degree: 7, type: 'seventh' },
    // Secondary dominants
    'V/ii':  { offset: 9,  quality: '',     degree: 6, type: 'secondary', label: 'V/ii (A in C)' },
    'V/IV':  { offset: 0,  quality: '7',    degree: 1, type: 'secondary', label: 'V/IV (C7 in C)' },
    'V/V':   { offset: 2,  quality: '',     degree: 2, type: 'secondary', label: 'V/V (D in C)' },
    'V/vi':  { offset: 4,  quality: '',     degree: 3, type: 'secondary', label: 'V/vi (E in C)' },
    // Modal mixture / borrowed chords
    'iv':    { offset: 5,  quality: 'm',    degree: 4, type: 'borrowed', label: 'iv (Minor 4th)' },
    'bVI':   { offset: 8,  quality: '',     degree: 6, type: 'borrowed', label: 'bVI (Flat 6)' },
    'bVII':  { offset: 10, quality: '',     degree: 7, type: 'borrowed', label: 'bVII (Subtonic)' },
    'bIII':  { offset: 3,  quality: '',     degree: 3, type: 'borrowed', label: 'bIII (Flat 3)' },
    // Suspended
    'Isus4': { offset: 0,  quality: 'sus4', degree: 1, type: 'suspension' },
    'Vsus4': { offset: 7,  quality: 'sus4', degree: 5, type: 'suspension' }
  },
  minor: {
    // Diatonic
    'i':     { offset: 0,  quality: 'm',    degree: 1, type: 'diatonic' },
    'ii°':   { offset: 2,  quality: 'dim',  degree: 2, type: 'diatonic' },
    'bIII':  { offset: 3,  quality: '',     degree: 3, type: 'diatonic' },
    'iv':    { offset: 5,  quality: 'm',    degree: 4, type: 'diatonic' },
    'v':     { offset: 7,  quality: 'm',    degree: 5, type: 'diatonic' },
    'V':     { offset: 7,  quality: '',     degree: 5, type: 'harmonic', label: 'V (Major Dominant)' },
    'bVI':   { offset: 8,  quality: '',     degree: 6, type: 'diatonic' },
    'bVII':  { offset: 10, quality: '',     degree: 7, type: 'diatonic' },
    // 7ths
    'i7':    { offset: 0,  quality: 'm7',   degree: 1, type: 'seventh' },
    'iiø7':  { offset: 2,  quality: 'm7b5', degree: 2, type: 'seventh' },
    'bIIImaj7':{ offset: 3, quality: 'maj7', degree: 3, type: 'seventh' },
    'iv7':   { offset: 5,  quality: 'm7',   degree: 4, type: 'seventh' },
    'V7':    { offset: 7,  quality: '7',    degree: 5, type: 'harmonic', label: 'V7 (Dom 7th)' },
    'bVImaj7':{ offset: 8, quality: 'maj7', degree: 6, type: 'seventh' },
    'bVII7': { offset: 10, quality: '7',    degree: 7, type: 'seventh' },
    // Extensions / Borrowed
    'IV':    { offset: 5,  quality: '',     degree: 4, type: 'borrowed', label: 'IV (Dorian)' },
    'I':     { offset: 0,  quality: '',     degree: 1, type: 'borrowed', label: 'I (Picardy 3rd)' },
    'vii°':  { offset: 11, quality: 'dim',  degree: 7, type: 'harmonic', label: 'vii° (Leading Tone)' }
  }
};

/**
 * Returns the note name given pitch class and preferred flat/sharp notation
 */
export function getNoteName(pitchClass, preferFlats = false) {
  const pc = ((pitchClass % 12) + 12) % 12;
  return preferFlats ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES_SHARP[pc];
}

/**
 * Calculates complete chord details given a roman numeral and key/mode
 */
export function getChordDetails(numeral, keyIndex = 0, mode = 'major', inversion = 0) {
  const dict = CHORD_DEFINITIONS[mode] || CHORD_DEFINITIONS.major;
  const def = dict[numeral] || CHORD_DEFINITIONS.major[numeral] || { offset: 0, quality: '', degree: 1 };
  
  const rootPc = (keyIndex + def.offset) % 12;
  const qual = CHORD_QUALITIES[def.quality] || CHORD_QUALITIES[''];
  const intervals = qual.intervals;
  
  const isFlatKey = FLAT_KEYS.includes(keyIndex) || (mode === 'minor' && [2, 7, 0].includes(keyIndex));
  const rootName = getNoteName(rootPc, isFlatKey);
  const chordName = rootName + qual.symbol;
  
  // Calculate notes
  const notes = intervals.map(iv => (rootPc + iv) % 12);
  
  // Handle inversion (0 = Root, 1 = 1st inv (6), 2 = 2nd inv (6/4), 3 = 3rd inv (4/2))
  const invIndex = Math.min(inversion, notes.length - 1);
  const bassPc = notes[invIndex];
  const bassName = getNoteName(bassPc, isFlatKey);
  
  // Inversion label for Roman numeral
  let invSymbol = '';
  if (inversion === 1) invSymbol = def.quality.includes('7') ? '6/5' : '6';
  else if (inversion === 2) invSymbol = def.quality.includes('7') ? '4/3' : '6/4';
  else if (inversion === 3) invSymbol = '4/2';

  const fullDisplay = invSymbol ? `${numeral}${invSymbol}` : numeral;
  const fullChordName = (inversion > 0 && bassPc !== rootPc) ? `${chordName}/${bassName}` : chordName;

  return {
    numeral,
    fullDisplay,
    rootPc,
    bassPc,
    rootName,
    bassName,
    chordName,
    fullChordName,
    intervals,
    notes,
    quality: def.quality,
    degree: def.degree,
    type: def.type || 'diatonic',
    inversion: invIndex,
    color: DEGREE_COLORS[(def.degree - 1) % 7]
  };
}

/**
 * Gets voiced MIDI note numbers for audio playback of a chord
 */
export function getChordVoicing(chordDetails, baseOctave = 3) {
  const rootMidi = baseOctave * 12 + chordDetails.rootPc;
  const bassMidi = (baseOctave - 1) * 12 + chordDetails.bassPc;
  
  // Voicing: Bass note down in octave 2, then triad/seventh notes in octave 3/4
  const chordNotes = chordDetails.intervals.map((iv, idx) => {
    let note = rootMidi + iv;
    // If inverted, ensure the bass note is properly aligned
    return note;
  });

  return {
    bass: [bassMidi],
    treble: chordNotes,
    all: [bassMidi, ...chordNotes]
  };
}

/**
 * Maps a grid row index (0..14) to a MIDI pitch and scale degree info
 */
export function rowToPitch(row, keyIndex = 0, mode = 'major') {
  const scale = MODES[mode] ? MODES[mode].intervals : MODES.major.intervals;
  const degreeIndex = row % 7;
  const octaveOffset = Math.floor(row / 7);
  
  // Base octave starts at C4 (MIDI 60)
  const baseMidi = 60 + keyIndex;
  const midi = baseMidi + scale[degreeIndex] + (octaveOffset * 12) - (keyIndex > 6 ? 12 : 0);
  const pc = midi % 12;
  const isFlatKey = FLAT_KEYS.includes(keyIndex);

  return {
    midi,
    degree: degreeIndex + 1,
    degreeLabel: (degreeIndex + 1).toString(),
    noteName: getNoteName(pc, isFlatKey),
    octave: Math.floor(midi / 12) - 1,
    color: DEGREE_COLORS[degreeIndex]
  };
}

/**
 * Generate standard Multi-Track MIDI File (Type 1)
 */
export function generateMidiFile(song) {
  const PPQ = 480; // Ticks per quarter note
  const ticksPer16th = PPQ / 4;
  const mpq = Math.round(60000000 / song.bpm); // Microseconds per quarter note

  const tracks = [];

  // Track 0: Tempo and Time Signature
  const metaTrack = [
    0x00, 0xFF, 0x51, 0x03, (mpq >> 16) & 0xFF, (mpq >> 8) & 0xFF, mpq & 0xFF, // Tempo
    0x00, 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08, // 4/4 Time signature
    0x00, 0xFF, 0x2F, 0x00 // End of track
  ];
  tracks.push(metaTrack);

  // Helper for Variable Length Quantity (VLQ)
  function writeVLQ(value) {
    const bytes = [];
    let buffer = value & 0x7F;
    while ((value >>= 7) > 0) {
      buffer <<= 8;
      buffer |= 0x80;
      buffer += (value & 0x7F);
    }
    while (true) {
      bytes.push(buffer & 0xFF);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
    return bytes;
  }

  // Track 1: Chords (Channel 0)
  const chordEvents = [];
  song.chords.forEach((chordData, i) => {
    if (!chordData) return;
    const numeral = typeof chordData === 'string' ? chordData : chordData.numeral;
    const inv = chordData.inversion || 0;
    const details = getChordDetails(numeral, song.key, song.mode, inv);
    const voicing = getChordVoicing(details, 3);
    
    // Each chord slot is 4 steps (half note in 8-step measure) or customized
    const startTick = i * 4 * ticksPer16th;
    const duration = 4 * ticksPer16th - 10;
    const endTick = startTick + duration;

    voicing.treble.forEach(pitch => {
      chordEvents.push({ tick: startTick, type: 0x90, note: pitch, velocity: 80 });
      chordEvents.push({ tick: endTick,   type: 0x80, note: pitch, velocity: 0 });
    });
  });

  // Track 2: Melody (Channel 1)
  const melodyEvents = [];
  song.melody.forEach(note => {
    const pitch = rowToPitch(note.row, song.key, song.mode).midi;
    const startTick = note.step * ticksPer16th;
    const duration = (note.duration || 1) * ticksPer16th - 6;
    const endTick = startTick + duration;

    melodyEvents.push({ tick: startTick, type: 0x91, note: pitch, velocity: 95 });
    melodyEvents.push({ tick: endTick,   type: 0x81, note: pitch, velocity: 0 });
  });

  // Track 3: Bassline (Channel 2)
  const bassEvents = [];
  song.chords.forEach((chordData, i) => {
    if (!chordData) return;
    const numeral = typeof chordData === 'string' ? chordData : chordData.numeral;
    const inv = chordData.inversion || 0;
    const details = getChordDetails(numeral, song.key, song.mode, inv);
    const bassPitch = 36 + details.bassPc; // Low bass register
    
    const startTick = i * 4 * ticksPer16th;
    const duration = 4 * ticksPer16th - 12;
    const endTick = startTick + duration;

    bassEvents.push({ tick: startTick, type: 0x92, note: bassPitch, velocity: 88 });
    bassEvents.push({ tick: endTick,   type: 0x82, note: bassPitch, velocity: 0 });
  });

  // Build tracks from event lists
  [chordEvents, melodyEvents, bassEvents].forEach(evList => {
    evList.sort((a, b) => a.tick - b.tick);
    const bytes = [];
    let lastTick = 0;

    evList.forEach(ev => {
      const delta = ev.tick - lastTick;
      bytes.push(...writeVLQ(delta));
      bytes.push(ev.type, ev.note, ev.velocity);
      lastTick = ev.tick;
    });

    // End of track marker
    bytes.push(...writeVLQ(0), 0xFF, 0x2F, 0x00);
    tracks.push(bytes);
  });

  // Assemble full Standard MIDI File format 1
  const numTracks = tracks.length;
  const header = [
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length (6)
    0x00, 0x01,             // Format 1
    (numTracks >> 8) & 0xFF, numTracks & 0xFF,
    (PPQ >> 8) & 0xFF, PPQ & 0xFF
  ];

  let totalBytes = [...header];
  tracks.forEach(trackData => {
    const len = trackData.length;
    totalBytes.push(
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      (len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF,
      ...trackData
    );
  });

  return new Blob([new Uint8Array(totalBytes)], { type: 'audio/midi' });
}
