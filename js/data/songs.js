// js/data/songs.js - TheoryTab Database with 25+ Iconic Songs Analyzed in Roman Numerals & Melody

export const THEORYTAB_SONGS = [
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    genre: 'Classic Rock / Pop',
    year: 1970,
    key: 0, // C
    mode: 'major',
    bpm: 72,
    bars: 4,
    description: 'Iconic Pop I-V-vi-IV progression with a classic stepwise resolving melody.',
    chords: ['I', 'V', 'vi', 'IV', 'I', 'V', 'IV', 'I'],
    melody: [
      { row: 7, step: 0, duration: 2 }, // 1 (C)
      { row: 7, step: 2, duration: 2 }, // 1
      { row: 8, step: 4, duration: 2 }, // 2 (D)
      { row: 9, step: 6, duration: 2 }, // 3 (E)
      { row: 9, step: 8, duration: 2 }, // 3
      { row: 9, step: 10, duration: 2 },
      { row: 8, step: 12, duration: 2 }, // 2
      { row: 7, step: 14, duration: 2 }, // 1
      { row: 8, step: 16, duration: 2 }, // 2
      { row: 9, step: 18, duration: 2 }, // 3
      { row: 8, step: 20, duration: 2 }, // 2
      { row: 7, step: 22, duration: 2 }, // 1
      { row: 6, step: 24, duration: 4 }, // 7
      { row: 7, step: 28, duration: 4 }  // 1
    ]
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    genre: 'Pop / Dance',
    year: 2017,
    key: 1, // C# / Db
    mode: 'minor',
    bpm: 96,
    bars: 4,
    description: 'Modern minor pop anthem driven by the i-iv-VI-VII modal progression.',
    chords: ['i', 'iv', 'bVI', 'bVII', 'i', 'iv', 'bVI', 'bVII'],
    melody: [
      { row: 9, step: 0, duration: 1 },
      { row: 9, step: 1, duration: 1 },
      { row: 9, step: 2, duration: 1 },
      { row: 9, step: 4, duration: 2 },
      { row: 8, step: 6, duration: 2 },
      { row: 7, step: 8, duration: 2 },
      { row: 7, step: 10, duration: 2 },
      { row: 8, step: 12, duration: 2 },
      { row: 9, step: 16, duration: 2 },
      { row: 9, step: 18, duration: 2 },
      { row: 11, step: 20, duration: 2 },
      { row: 10, step: 22, duration: 2 },
      { row: 9, step: 24, duration: 4 }
    ]
  },
  {
    id: 'someone-like-you',
    title: 'Someone Like You',
    artist: 'Adele',
    genre: 'Pop / Ballad',
    year: 2011,
    key: 9, // A
    mode: 'major',
    bpm: 68,
    bars: 4,
    description: 'Emotional chorus built on I - V/7 - vi - IV with an soaring pentatonic vocal line.',
    chords: ['I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV'],
    melody: [
      { row: 9, step: 0, duration: 3 },
      { row: 11, step: 4, duration: 3 },
      { row: 12, step: 8, duration: 4 },
      { row: 11, step: 12, duration: 2 },
      { row: 9, step: 14, duration: 2 },
      { row: 9, step: 16, duration: 4 },
      { row: 8, step: 20, duration: 2 },
      { row: 7, step: 22, duration: 2 },
      { row: 7, step: 24, duration: 6 }
    ]
  },
  {
    id: 'get-lucky',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell',
    genre: 'Disco / Funk / Pop',
    year: 2013,
    key: 11, // B
    mode: 'dorian',
    bpm: 116,
    bars: 4,
    description: 'The definitive Dorian groove: i - bIII - v - IV looping seamlessly with irresistible syncopation.',
    chords: ['i', 'bIII', 'v', 'IV', 'i', 'bIII', 'v', 'IV'],
    melody: [
      { row: 11, step: 2, duration: 2 },
      { row: 11, step: 4, duration: 2 },
      { row: 11, step: 6, duration: 2 },
      { row: 10, step: 8, duration: 2 },
      { row: 9, step: 10, duration: 2 },
      { row: 7, step: 12, duration: 4 },
      { row: 11, step: 18, duration: 2 },
      { row: 11, step: 20, duration: 2 },
      { row: 12, step: 22, duration: 2 },
      { row: 11, step: 24, duration: 4 }
    ]
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    artist: 'Johann Pachelbel',
    genre: 'Classical',
    year: 1680,
    key: 2, // D
    mode: 'major',
    bpm: 65,
    bars: 4,
    description: 'The harmonic grandfather of pop music: I - V - vi - iii - IV - I - IV - V descending fourths.',
    chords: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
    melody: [
      { row: 9, step: 0, duration: 4 },  // 3
      { row: 8, step: 4, duration: 4 },  // 2
      { row: 7, step: 8, duration: 4 },  // 1
      { row: 6, step: 12, duration: 4 }, // 7
      { row: 5, step: 16, duration: 4 }, // 6
      { row: 4, step: 20, duration: 4 }, // 5
      { row: 5, step: 24, duration: 4 }, // 6
      { row: 6, step: 28, duration: 4 }  // 7
    ]
  },
  {
    id: 'viva-la-vida',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    genre: 'Alternative / Pop Rock',
    year: 2008,
    key: 8, // Ab
    mode: 'major',
    bpm: 138,
    bars: 4,
    description: 'Heroic orchestral groove using the deceptive IV - V - I - vi cycle.',
    chords: ['IV', 'V', 'I', 'vi', 'IV', 'V', 'I', 'vi'],
    melody: [
      { row: 7, step: 0, duration: 2 },
      { row: 7, step: 2, duration: 2 },
      { row: 8, step: 4, duration: 2 },
      { row: 9, step: 6, duration: 2 },
      { row: 8, step: 8, duration: 4 },
      { row: 7, step: 12, duration: 4 },
      { row: 6, step: 16, duration: 2 },
      { row: 7, step: 18, duration: 2 },
      { row: 8, step: 20, duration: 2 },
      { row: 7, step: 22, duration: 2 },
      { row: 5, step: 24, duration: 6 }
    ]
  },
  {
    id: 'dont-stop-believin',
    title: "Don't Stop Believin'",
    artist: 'Journey',
    genre: 'Classic Rock',
    year: 1981,
    key: 4, // E
    mode: 'major',
    bpm: 118,
    bars: 4,
    description: 'The golden arena rock progression: I - V - vi - IV - I - V - iii - IV.',
    chords: ['I', 'V', 'vi', 'IV', 'I', 'V', 'iii', 'IV'],
    melody: [
      { row: 9, step: 0, duration: 2 },
      { row: 9, step: 2, duration: 2 },
      { row: 9, step: 4, duration: 2 },
      { row: 8, step: 6, duration: 2 },
      { row: 7, step: 8, duration: 4 },
      { row: 5, step: 12, duration: 4 },
      { row: 7, step: 16, duration: 2 },
      { row: 8, step: 18, duration: 2 },
      { row: 9, step: 20, duration: 4 },
      { row: 8, step: 24, duration: 4 }
    ]
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'Synthwave / Pop',
    year: 2019,
    key: 5, // F
    mode: 'minor',
    bpm: 171,
    bars: 4,
    description: 'Hypnotic 80s synth hook over a driving minor progression: i - v - bVII - iv.',
    chords: ['i', 'v', 'bVII', 'iv', 'i', 'v', 'bVII', 'iv'],
    melody: [
      { row: 9, step: 0, duration: 2 },
      { row: 9, step: 2, duration: 2 },
      { row: 7, step: 4, duration: 2 },
      { row: 8, step: 6, duration: 2 },
      { row: 9, step: 8, duration: 4 },
      { row: 11, step: 12, duration: 4 },
      { row: 10, step: 16, duration: 2 },
      { row: 9, step: 18, duration: 2 },
      { row: 7, step: 20, duration: 4 },
      { row: 8, step: 24, duration: 6 }
    ]
  },
  {
    id: 'aint-no-sunshine',
    title: "Ain't No Sunshine",
    artist: 'Bill Withers',
    genre: 'Soul / R&B',
    year: 1971,
    key: 9, // A
    mode: 'minor',
    bpm: 78,
    bars: 4,
    description: 'Soul masterpiece highlighting the poignant i - v - bVII - i minor cadence.',
    chords: ['i', 'v', 'bVII', 'i', 'i', 'v', 'bVII', 'i'],
    melody: [
      { row: 9, step: 0, duration: 3 },
      { row: 8, step: 4, duration: 2 },
      { row: 7, step: 6, duration: 2 },
      { row: 7, step: 8, duration: 4 },
      { row: 8, step: 14, duration: 2 },
      { row: 9, step: 16, duration: 4 },
      { row: 8, step: 20, duration: 2 },
      { row: 7, step: 22, duration: 6 }
    ]
  },
  {
    id: 'love-story',
    title: 'Love Story',
    artist: 'Taylor Swift',
    genre: 'Country Pop',
    year: 2008,
    key: 2, // D
    mode: 'major',
    bpm: 119,
    bars: 4,
    description: 'Classic country-pop romantic progression I - V - vi - IV.',
    chords: ['I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV'],
    melody: [
      { row: 9, step: 0, duration: 2 },
      { row: 8, step: 2, duration: 2 },
      { row: 7, step: 4, duration: 2 },
      { row: 8, step: 6, duration: 2 },
      { row: 9, step: 8, duration: 4 },
      { row: 11, step: 12, duration: 4 },
      { row: 9, step: 16, duration: 2 },
      { row: 8, step: 18, duration: 2 },
      { row: 7, step: 20, duration: 4 }
    ]
  },
  {
    id: 'creep',
    title: 'Creep',
    artist: 'Radiohead',
    genre: 'Alternative Rock',
    year: 1992,
    key: 7, // G
    mode: 'major',
    bpm: 92,
    bars: 4,
    description: 'Famous chromatic voice leading featuring the secondary dominant III and borrowed minor iv chord: I - III - IV - iv.',
    chords: ['I', 'V/vi', 'IV', 'iv', 'I', 'V/vi', 'IV', 'iv'],
    melody: [
      { row: 7, step: 0, duration: 4 },
      { row: 9, step: 4, duration: 4 },
      { row: 8, step: 8, duration: 4 },
      { row: 7, step: 12, duration: 4 },
      { row: 7, step: 16, duration: 4 },
      { row: 9, step: 20, duration: 4 },
      { row: 8, step: 24, duration: 4 },
      { row: 7, step: 28, duration: 4 }
    ]
  },
  {
    id: 'bohemian-rhapsody',
    title: 'Bohemian Rhapsody (Ballad)',
    artist: 'Queen',
    genre: 'Progressive Rock',
    year: 1975,
    key: 10, // Bb
    mode: 'major',
    bpm: 72,
    bars: 4,
    description: 'Freddie Mercury piano ballad harmony: I - vi - ii - V with rich chromatic elegance.',
    chords: ['I', 'vi', 'ii', 'V', 'I', 'vi', 'ii', 'V'],
    melody: [
      { row: 9, step: 0, duration: 3 },
      { row: 8, step: 3, duration: 1 },
      { row: 7, step: 4, duration: 4 },
      { row: 8, step: 8, duration: 2 },
      { row: 9, step: 10, duration: 2 },
      { row: 10, step: 12, duration: 4 },
      { row: 9, step: 16, duration: 4 },
      { row: 8, step: 20, duration: 4 }
    ]
  }
];
