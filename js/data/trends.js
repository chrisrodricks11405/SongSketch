// js/data/trends.js - Chord Progression Probability Matrix & Famous Cadences (Hooktheory Trends Clone)

export const CHORD_TRENDS = {
  major: {
    'I': [
      { next: 'V', prob: 42, label: 'Dominant tension (Most common)' },
      { next: 'IV', prob: 28, label: 'Subdominant expansion' },
      { next: 'vi', prob: 17, label: 'Deceptive / Relative minor' },
      { next: 'ii', prob: 8, label: 'Predominant circle of fifths' },
      { next: 'iii', prob: 5, label: 'Mediant color' }
    ],
    'IV': [
      { next: 'V', prob: 46, label: 'Standard cadence drive' },
      { next: 'I', prob: 31, label: 'Plagal cadence ("Amen")' },
      { next: 'vi', prob: 12, label: 'Ascending step' },
      { next: 'iv', prob: 6, label: 'Modal mixture (emotional)' },
      { next: 'ii', prob: 5, label: 'Step down' }
    ],
    'V': [
      { next: 'I', prob: 64, label: 'Authentic cadence (Resolution)' },
      { next: 'vi', prob: 22, label: 'Deceptive cadence (Surprise)' },
      { next: 'IV', prob: 9, label: 'Blues / Rock retrograde' },
      { next: 'V7', prob: 5, label: 'Suspension / Tension build' }
    ],
    'vi': [
      { next: 'IV', prob: 48, label: 'Pop anthem motion (vi - IV)' },
      { next: 'ii', prob: 24, label: 'Circle of fifths down' },
      { next: 'V', prob: 16, label: 'Stepwise drive to dominant' },
      { next: 'I', prob: 12, label: 'Tonic return' }
    ],
    'ii': [
      { next: 'V', prob: 78, label: 'Jazz/Classical ii-V anchor' },
      { next: 'IV', prob: 12, label: 'Subdominant exchange' },
      { next: 'vi', prob: 6, label: 'Step motion' },
      { next: 'I', prob: 4, label: 'Weak cadence' }
    ],
    'iii': [
      { next: 'vi', prob: 62, label: 'Circle of fifths (iii - vi)' },
      { next: 'IV', prob: 25, label: 'Step up' },
      { next: 'I', prob: 13, label: 'Direct resolution' }
    ],
    'vii°': [
      { next: 'I', prob: 85, label: 'Leading tone resolution' },
      { next: 'iii', prob: 15, label: 'Step resolution' }
    ]
  },
  minor: {
    'i': [
      { next: 'bVI', prob: 38, label: 'Dramatic minor drop' },
      { next: 'iv', prob: 27, label: 'Minor subdominant' },
      { next: 'bVII', prob: 21, label: 'Modal step' },
      { next: 'V', prob: 14, label: 'Harmonic minor dominant' }
    ],
    'iv': [
      { next: 'V', prob: 42, label: 'Harmonic minor drive' },
      { next: 'bVII', prob: 33, label: 'Dorian/Rock chain' },
      { next: 'i', prob: 25, label: 'Minor plagal return' }
    ],
    'V': [
      { next: 'i', prob: 82, label: 'Leading tone minor resolution' },
      { next: 'bVI', prob: 18, label: 'Deceptive minor surprise' }
    ],
    'bVI': [
      { next: 'bVII', prob: 55, label: 'Epic heroic rise (bVI - bVII)' },
      { next: 'iv', prob: 25, label: 'Third drop' },
      { next: 'i', prob: 20, label: 'Return home' }
    ],
    'bVII': [
      { next: 'i', prob: 51, label: 'Aeolian subtonic cadence' },
      { next: 'bIII', prob: 32, label: 'Relative major lift' },
      { next: 'bVI', prob: 17, label: 'Step down' }
    ]
  }
};

export const FAMOUS_CADENCES = [
  {
    name: 'The Pop 4-Chord Axis',
    formula: 'I - V - vi - IV',
    mode: 'major',
    chords: ['I', 'V', 'vi', 'IV'],
    examples: "Let It Be, Don't Stop Believin', Someone Like You, With or Without You",
    description: 'The most popular harmonic loop in modern music history. Perfectly balances tonic stability, dominant energy, minor melancholy, and subdominant warmth.'
  },
  {
    name: 'Sensitive Female Progression',
    formula: 'vi - IV - I - V',
    mode: 'major',
    chords: ['vi', 'IV', 'I', 'V'],
    examples: 'Zombie, Africa, Apologize, Complicated, Poker Face',
    description: 'Begins on the emotional relative minor and resolves upward to the major tonic, creating an earnest, anthemic mood.'
  },
  {
    name: 'The 50s Doo-Wop Progression',
    formula: 'I - vi - IV - V',
    mode: 'major',
    chords: ['I', 'vi', 'IV', 'V'],
    examples: 'Stand By Me, Earth Angel, Beautiful Girls, Every Breath You Take',
    description: 'The definitive sound of early rock and soul. Smooth circle-of-fifths voice leading with a driving turnaround.'
  },
  {
    name: 'The Andalusian Cadence',
    formula: 'i - bVII - bVI - V',
    mode: 'minor',
    chords: ['i', 'bVII', 'bVI', 'V'],
    examples: 'Hit the Road Jack, Sultans of Swing, Good Vibrations',
    description: 'Flamenco and dramatic rock progression using a descending bassline that lands on a major dominant V with immense tension.'
  },
  {
    name: 'The Royal Road (J-Pop / Anime)',
    formula: 'IV - V - iii - vi',
    mode: 'major',
    chords: ['IV', 'V', 'iii', 'vi'],
    examples: 'Suzume, Gurenge (Demon Slayer), Marunouchi Sadistic',
    description: 'Extremely popular in Japanese pop, anime, and game soundtracks. High emotional momentum that constantly avoids landing squarely on I.'
  },
  {
    name: 'The Jazz 2-5-1 Cadence',
    formula: 'ii7 - V7 - Imaj7',
    mode: 'major',
    chords: ['ii7', 'V7', 'Imaj7', 'I'],
    examples: 'Autumn Leaves, Fly Me to the Moon, Giant Steps',
    description: 'The foundational building block of jazz and neo-soul harmony, driven by circle-of-fifths root movement.'
  },
  {
    name: 'The Classic Plagal Cadence',
    formula: 'I - IV - I - V',
    mode: 'major',
    chords: ['I', 'IV', 'I', 'V'],
    examples: 'Brown Eyed Girl, Twist and Shout, Born in the USA',
    description: 'Upbeat, celebratory folk-rock progression with great rhythmic bounce.'
  },
  {
    name: 'Pachelbel Canon Sequence',
    formula: 'I - V - vi - iii - IV - I - IV - V',
    mode: 'major',
    chords: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
    examples: 'Canon in D, Memories (Maroon 5), Basket Case (Green Day)',
    description: 'Classical sequence that descends stepwise through the scale; copied by dozens of modern hit songs.'
  }
];
