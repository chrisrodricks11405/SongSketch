// js/data/lessons.js - Interactive Music Theory Academy (Hooktheory I & II interactive clone)

export const THEORY_LESSONS = [
  {
    id: 'scale-degrees',
    title: 'Chapter 1: Scale Degrees & Melody',
    subtitle: 'Why relative numbers unlock music theory',
    content: `
      <p>Traditional sheet music forces you to think in absolute letter names (C, D, E, F, G, A, B). But the human ear hears <strong>relative relationships</strong>, not absolute frequencies!</p>
      <p>When you hear a melody, your brain automatically establishes a <em>home pitch</em> called the <strong>Tonic</strong> (Degree 1). Every other note in the scale has a distinct emotional flavor relative to 1:</p>
      <ul>
        <li><strong style="color:#e74c3c">1 (Tonic)</strong>: Total rest, home, arrival, resolution.</li>
        <li><strong style="color:#e67e22">2 (Supertonic)</strong>: Unsettled, floating, leans toward 1 or 3.</li>
        <li><strong style="color:#f1c40f">3 (Mediant)</strong>: Sweet, bright, defines the major feel.</li>
        <li><strong style="color:#2ecc71">4 (Subdominant)</strong>: Powerful tension, strongly wants to resolve down to 3.</li>
        <li><strong style="color:#00bcd4">5 (Dominant)</strong>: Strong, heroic, bright, anchors the key.</li>
        <li><strong style="color:#3498db">6 (Submediant)</strong>: Gentle, wistful, gateway to the relative minor.</li>
        <li><strong style="color:#9b59b6">7 (Leading Tone)</strong>: Extreme tension, magnetically pulled up to 1!</li>
      </ul>
    `,
    demoNotes: [60, 62, 64, 65, 67, 69, 71, 72],
    demoChords: ['I'],
    tip: 'Notice how note 7 feels completely unfinished until it resolves to 8 (1)!'
  },
  {
    id: 'primary-triads',
    title: 'Chapter 2: The Primary Chords (I, IV, V)',
    subtitle: 'The three pillars that support almost all Western harmony',
    content: `
      <p>If you build a 3-note chord (a triad) on each degree of the major scale, you get three major chords: <strong>I</strong>, <strong>IV</strong>, and <strong>V</strong>.</p>
      <p>These three chords contain every single note in the entire major scale between them:</p>
      <ul>
        <li><strong>I (Tonic)</strong>: Notes 1, 3, 5. The home base. Complete stability.</li>
        <li><strong>IV (Subdominant)</strong>: Notes 4, 6, 1. Moving away from home. Open and warm.</li>
        <li><strong>V (Dominant)</strong>: Notes 5, 7, 2. Peak tension! The leading tone (7) desperately wants to snap back to 1.</li>
      </ul>
      <p>Most of the greatest songs ever written (from Bob Dylan to The Beatles to AC/DC) use only these three chords!</p>
    `,
    demoChords: ['I', 'IV', 'V', 'I'],
    tip: 'Listen to how V creates maximum tension, and then releasing into I brings immense relief.'
  },
  {
    id: 'relative-minor',
    title: 'Chapter 3: Adding Emotion with Minor Chords (vi, ii, iii)',
    subtitle: 'How vi, ii, and iii transform simple pop into deep emotional music',
    content: `
      <p>While I, IV, and V are major chords, degrees 2, 3, and 6 form <strong>minor chords</strong>: <strong>ii</strong>, <strong>iii</strong>, and <strong>vi</strong>.</p>
      <p>The most important of these is <strong>vi</strong> (the relative minor). It shares two of its three notes with the I chord (1 and 3), making it a melancholy substitute for I:</p>
      <ul>
        <li><strong>vi (Submediant)</strong>: Melancholic, nostalgic, deep emotional weight.</li>
        <li><strong>ii (Supertonic)</strong>: The perfect setup chord. Leads directly into V!</li>
        <li><strong>iii (Mediant)</strong>: Dreamy, moody, rarely used as a resting chord, but great for transitions.</li>
      </ul>
    `,
    demoChords: ['I', 'V', 'vi', 'IV'],
    tip: 'Moving from V to vi instead of I is called a "Deceptive Cadence"—it surprises your ear!'
  },
  {
    id: 'inversions-bass',
    title: 'Chapter 4: Inversions & Smooth Voice Leading',
    subtitle: 'Why changing the lowest note makes chords sound sophisticated',
    content: `
      <p>A chord does not always have its root note in the bass! Putting the 3rd or 5th in the bass creates an <strong>inversion</strong>:</p>
      <ul>
        <li><strong>Root Position</strong>: Root in bass (e.g., C with C in bass). Strong, declarative.</li>
        <li><strong>1st Inversion (denoted as 6)</strong>: 3rd in bass (e.g., I6 = C with E in bass). Softer, flows easily.</li>
        <li><strong>2nd Inversion (denoted as 6/4)</strong>: 5th in bass (e.g., I6/4 = C with G in bass). Highly unstable, creates great anticipation.</li>
      </ul>
      <p>Inversions allow the bassline to step smoothly like a walking melody (e.g., C -> G/B -> Am instead of awkward octave leaps)!</p>
    `,
    demoChords: ['I', 'V', 'vi', 'IV'],
    tip: 'Check out songs like Canon in D or A Whiter Shade of Pale for gorgeous stepwise basslines.'
  },
  {
    id: 'borrowed-chords',
    title: 'Chapter 5: Borrowed Chords & Modal Mixture',
    subtitle: 'Borrowing chords from the parallel minor for heart-wrenching color',
    content: `
      <p>What if you are writing a song in C Major, but you borrow a chord from C Minor?</p>
      <p>This is called <strong>Modal Mixture</strong> (or borrowed harmony). The two most famous borrowed chords are:</p>
      <ul>
        <li><strong>iv (Minor 4th)</strong>: In C Major, play Fm instead of F! It contains the bittersweet flat-6 degree. Listen to <em>Creep</em> by Radiohead or <em>In My Life</em> by The Beatles.</li>
        <li><strong>bVI and bVII</strong>: Borrowed from Aeolian. Gives rock and epic film trailers that heroic, cinematic sound (e.g., Mario, Star Wars, Daft Punk).</li>
      </ul>
    `,
    demoChords: ['I', 'IV', 'iv', 'I'],
    tip: 'The transition from IV to iv to I is one of the most emotional moves in songwriting.'
  }
];
