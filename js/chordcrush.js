// js/chordcrush.js - Chord Crush Ear Training Game matching Hooktheory (frame_82s.jpg)

export class ChordCrushGame {
  constructor(audioEngine, theoryEngine) {
    this.audio = audioEngine;
    this.theory = theoryEngine;

    this.level = 1;
    this.score = 350;
    this.streak = 3;
    this.key = 0; // C
    this.mode = 'major';
    this.timerSeconds = 15;
    this.timerInterval = null;

    this.currentProgression = []; // array of Roman numerals e.g. ['vi', 'IV', 'I', 'V']
    this.currentStepIndex = 1; // 0 is known, guessing 1..length-1
    this.guessedChords = []; // { numeral, correct: boolean }
    this.isRoundOver = false;
  }

  startNewRound() {
    this.isRoundOver = false;
    clearInterval(this.timerInterval);
    this.timerSeconds = 15;

    // Difficulty pools
    const pools = {
      1: ['I', 'IV', 'V', 'vi'],
      2: ['I', 'ii', 'IV', 'V', 'vi'],
      3: ['I', 'ii', 'iii', 'IV', 'V', 'vi'],
      4: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
      5: ['I', 'IV', 'V', 'vi', 'iv', 'bVI', 'bVII']
    };

    const pool = pools[this.level] || pools[1];

    // Pick famous cadence or random 4-chord progression
    const cadences = [
      ['I', 'V', 'vi', 'IV'],
      ['vi', 'IV', 'I', 'V'],
      ['I', 'IV', 'V', 'I'],
      ['I', 'vi', 'IV', 'V'],
      ['ii', 'V', 'I', 'vi'],
      ['I', 'V', 'IV', 'V']
    ];

    const pick = cadences[Math.floor(Math.random() * cadences.length)];
    this.currentProgression = [...pick];
    
    // First chord is revealed
    this.guessedChords = [{
      numeral: this.currentProgression[0],
      correct: true
    }];
    this.currentStepIndex = 1;

    return {
      progression: this.currentProgression,
      guessedChords: this.guessedChords,
      currentStepIndex: this.currentStepIndex,
      choices: this.getChoicesForStep(this.currentStepIndex)
    };
  }

  getChoicesForStep(stepIndex) {
    const correct = this.currentProgression[stepIndex];
    const pool = ['I', 'IV', 'V', 'vi', 'ii', 'iii'];
    const choices = new Set([correct]);

    while (choices.size < 4) {
      const randomPick = pool[Math.floor(Math.random() * pool.length)];
      choices.add(randomPick);
    }

    return Array.from(choices).sort();
  }

  playFullProgression() {
    this.audio.resume();
    const now = this.audio.ctx.currentTime + 0.05;
    const dur = 0.9;

    this.currentProgression.forEach((numeral, i) => {
      const details = this.theory.getChordDetails(numeral, this.key, this.mode, 0);
      const voicing = this.theory.getChordVoicing(details, 4);
      const time = now + i * dur;

      voicing.treble.forEach(p => this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, p, time, dur * 0.9, 0.75));
      this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, time, dur * 0.9, 0.85);
    });
  }

  playSingleChord(numeral) {
    this.audio.resume();
    const details = this.theory.getChordDetails(numeral, this.key, this.mode, 0);
    const voicing = this.theory.getChordVoicing(details, 4);
    const now = this.audio.ctx.currentTime + 0.05;
    const dur = 1.0;

    voicing.treble.forEach(p => this.audio.playPianoNote(this.audio.ctx, this.audio.chordsGain, p, now, dur, 0.75));
    this.audio.playBassNote(this.audio.ctx, this.audio.bassGain, 36 + details.bassPc, now, dur, 0.85);
  }

  guessCurrentStep(numeral) {
    if (this.isRoundOver) return null;

    const actual = this.currentProgression[this.currentStepIndex];
    const isCorrect = numeral === actual;

    this.playSingleChord(numeral);

    if (isCorrect) {
      this.guessedChords.push({ numeral, correct: true });
      this.score += 25 * this.level;
      this.streak += 1;

      if (this.currentStepIndex + 1 < this.currentProgression.length) {
        this.currentStepIndex += 1;
        return {
          status: 'step_correct',
          numeral,
          stepIndex: this.currentStepIndex,
          choices: this.getChoicesForStep(this.currentStepIndex),
          guessedChords: this.guessedChords,
          score: this.score,
          streak: this.streak
        };
      } else {
        this.isRoundOver = true;
        this.score += 50 * this.level;
        if (this.streak >= 5 && this.level < 5) this.level += 1;
        return {
          status: 'round_complete',
          numeral,
          guessedChords: this.guessedChords,
          score: this.score,
          streak: this.streak,
          level: this.level
        };
      }
    } else {
      this.streak = 0;
      return {
        status: 'wrong',
        numeral,
        actual,
        stepIndex: this.currentStepIndex,
        guessedChords: this.guessedChords,
        score: this.score,
        streak: this.streak
      };
    }
  }
}
