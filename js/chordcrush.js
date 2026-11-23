// js/chordcrush.js - Chord Crush Interactive Ear Training Game (Featured in Hooktheory)

export class ChordCrushGame {
  constructor(audioEngine, theoryEngine) {
    this.audio = audioEngine;
    this.theory = theoryEngine;

    this.level = 1;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.key = 0; // C
    this.mode = 'major';

    this.currentQuestion = null;
    this.userAnswers = [];
    this.hasAnswered = false;

    // Difficulty levels
    this.levelConfigs = {
      1: { name: 'Level 1: The Two Giants', chords: ['I', 'V'], length: 2, desc: 'Learn to distinguish between the Tonic (I) and Dominant (V)' },
      2: { name: 'Level 2: The Primary Triads', chords: ['I', 'IV', 'V'], length: 4, desc: 'Master the three fundamental major chords: I, IV, and V' },
      3: { name: 'Level 3: The Pop Four', chords: ['I', 'IV', 'V', 'vi'], length: 4, desc: 'Recognize the ubiquitous Pop Axis chords including relative minor (vi)' },
      4: { name: 'Level 4: All Diatonic', chords: ['I', 'ii', 'iii', 'IV', 'V', 'vi'], length: 4, desc: 'Identify all major and minor triads in the key' },
      5: { name: 'Level 5: Master Cadences', chords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°', 'V7'], length: 4, desc: 'Full diatonic set with dominant 7th tension' }
    };
  }

  startNewRound() {
    this.hasAnswered = false;
    this.userAnswers = [];
    const config = this.levelConfigs[this.level] || this.levelConfigs[1];

    // Pick random sequence of chords
    const progression = [];
    progression.push('I'); // Always start on home tonic for ear reference
    for (let i = 1; i < config.length; i++) {
      const pool = config.chords;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      progression.push(pick);
    }

    this.currentQuestion = {
      progression,
      key: this.key,
      mode: this.mode
    };

    return this.currentQuestion;
  }

  playCurrentQuestion() {
    if (!this.currentQuestion) return;
    this.audio.resume();
    const chords = this.currentQuestion.progression;
    const now = this.audio.ctx.currentTime + 0.05;
    const stepDur = 0.85;

    chords.forEach((numeral, idx) => {
      const details = this.theory.getChordDetails(numeral, this.key, this.mode, 0);
      const voicing = this.theory.getChordVoicing(details, 3);
      const time = now + idx * stepDur;

      voicing.treble.forEach(pitch => {
        this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, pitch, time, stepDur * 0.9, 0.75);
      });
      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, time, stepDur * 0.9, 0.85);
    });
  }

  submitGuess(chordArray) {
    if (!this.currentQuestion || this.hasAnswered) return null;
    this.hasAnswered = true;

    const actual = this.currentQuestion.progression;
    let isCorrect = true;
    if (chordArray.length !== actual.length) {
      isCorrect = false;
    } else {
      for (let i = 0; i < actual.length; i++) {
        if (chordArray[i] !== actual[i]) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      this.score += 100 * this.level;
      this.streak += 1;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;

      // Level up every 3 consecutive correct streaks
      if (this.streak % 3 === 0 && this.level < 5) {
        this.level += 1;
      }
    } else {
      this.streak = 0;
    }

    return {
      isCorrect,
      actual,
      guess: chordArray,
      score: this.score,
      streak: this.streak,
      level: this.level
    };
  }
}
