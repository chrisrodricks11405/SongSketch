// js/audio.js - High-Fidelity Web Audio API Sound Engine (Piano, Rhodes, Guitar, Synth, Strings, Drums)

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.chordsGain = null;
    this.melodyGain = null;
    this.bassGain = null;
    this.drumsGain = null;
    this.metronomeGain = null;

    this.instrument = 'piano'; // piano, rhodes, guitar, synth, strings
    this.melodyInstrument = 'synth'; // synth, piano, flute
    this.drumStyle = 'pop'; // pop, hiphop, ballad, none
    this.metronomeEnabled = false;

    this.isPlaying = false;
    this.schedulerTimer = null;
  }

  init() {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Channel mixer gains
    this.chordsGain = this.ctx.createGain();
    this.chordsGain.gain.value = 0.75;
    this.chordsGain.connect(this.masterGain);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.value = 0.85;
    this.melodyGain.connect(this.masterGain);

    this.bassGain = this.ctx.createGain();
    this.bassGain.gain.value = 0.8;
    this.bassGain.connect(this.masterGain);

    this.drumsGain = this.ctx.createGain();
    this.drumsGain.gain.value = 0.55;
    this.drumsGain.connect(this.masterGain);

    this.metronomeGain = this.ctx.createGain();
    this.metronomeGain.gain.value = 0.45;
    this.metronomeGain.connect(this.masterGain);

    return this.ctx;
  }

  async resume() {
    this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // --- Instrument Synthesis Voices ---

  playPianoNote(ctx, dest, midi, time, duration, velocity = 0.8) {
    const freq = this.midiToFreq(midi);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);
    osc2.detune.setValueAtTime(2.5, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 5.0, 10000), time);
    filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 1.8, 4000), time + duration);

    const peak = velocity * 0.32;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(peak * 0.45, time + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.15);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.16);
    osc2.stop(time + duration + 0.16);
  }

  playRhodesNote(ctx, dest, midi, time, duration, velocity = 0.8) {
    const freq = this.midiToFreq(midi);
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const gain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, time);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * 3.5, time);
    modGain.gain.setValueAtTime(freq * 1.5, time);
    modGain.gain.exponentialRampToValueAtTime(0.1, time + 0.4);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    const peak = velocity * 0.28;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);

    carrier.connect(gain);
    gain.connect(dest);

    carrier.start(time);
    modulator.start(time);
    carrier.stop(time + duration + 0.12);
    modulator.stop(time + duration + 0.12);
  }

  playGuitarNote(ctx, dest, midi, time, duration, velocity = 0.8) {
    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.2, time);
    filter.Q.setValueAtTime(2.5, time);

    const peak = velocity * 0.35;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(peak * 0.3, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  playSynthLeadNote(ctx, dest, midi, time, duration, velocity = 0.85) {
    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, time);
    filter.Q.setValueAtTime(3.0, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + duration);

    const peak = velocity * 0.25;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.008);
    gain.gain.setValueAtTime(peak * 0.75, time + duration * 0.85);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.08);
  }

  playStringsNote(ctx, dest, midi, time, duration, velocity = 0.75) {
    const freq = this.midiToFreq(midi);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc1.detune.setValueAtTime(-5, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, time);
    osc2.detune.setValueAtTime(5, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);

    const peak = velocity * 0.2;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.08); // slow attack
    gain.gain.setValueAtTime(peak * 0.85, time + duration * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.25);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.28);
    osc2.stop(time + duration + 0.28);
  }

  playBassNote(ctx, dest, midi, time, duration, velocity = 0.85) {
    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq / 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + duration * 0.7);

    const peak = velocity * 0.4;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.05);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + duration + 0.07);
    subOsc.stop(time + duration + 0.07);
  }

  // --- Drum Synthesizers ---

  playKick(ctx, dest, time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.24);
  }

  playSnare(ctx, dest, time) {
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(900, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.08);
    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  playHiHat(ctx, dest, time, closed = true) {
    const bufferSize = ctx.sampleRate * (closed ? 0.04 : 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(closed ? 0.22 : 0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (closed ? 0.035 : 0.16));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
  }

  playMetronomeClick(ctx, dest, time, isDownbeat = false) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, time);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.04);
  }

  // --- Audition Preview ---
  previewNotes(midiNotes, type = null) {
    this.resume();
    const inst = type || this.instrument;
    const now = this.ctx.currentTime;
    midiNotes.forEach(m => {
      if (inst === 'piano') this.playPianoNote(this.ctx, this.chordsGain, m, now, 0.8, 0.75);
      else if (inst === 'rhodes') this.playRhodesNote(this.ctx, this.chordsGain, m, now, 0.8, 0.75);
      else if (inst === 'guitar') this.playGuitarNote(this.ctx, this.chordsGain, m, now, 0.8, 0.75);
      else if (inst === 'strings') this.playStringsNote(this.ctx, this.chordsGain, m, now, 0.9, 0.7);
      else this.playSynthLeadNote(this.ctx, this.melodyGain, m, now, 0.6, 0.75);
    });
  }

  // --- Export WAV Audio ---
  async exportWavBlob(song, theory) {
    const secondsPer16th = 60 / song.bpm / 4;
    const totalSteps = song.bars * 16;
    const totalDuration = totalSteps * secondsPer16th + 1.2;

    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration), sampleRate);

    // Schedule chords and bass
    song.chords.forEach((chordData, i) => {
      if (!chordData) return;
      const numeral = typeof chordData === 'string' ? chordData : chordData.numeral;
      const inv = chordData.inversion || 0;
      const details = theory.getChordDetails(numeral, song.key, song.mode, inv);
      const voicing = theory.getChordVoicing(details, 4);
      
      const startStep = chordData.startStep !== undefined ? chordData.startStep : (i * 4);
      const durSteps = chordData.duration || 4;
      const time = startStep * secondsPer16th;
      const dur = durSteps * secondsPer16th;

      voicing.treble.forEach(m => this.playPianoNote(offlineCtx, offlineCtx.destination, m, time, dur, 0.75));
      this.playBassNote(offlineCtx, offlineCtx.destination, 36 + details.bassPc, time, dur, 0.85);
    });

    // Schedule melody
    song.melody.forEach(note => {
      const pitch = theory.rowToPitch(note.row, song.key, song.mode).midi;
      const time = note.step * secondsPer16th;
      const dur = (note.duration || 1) * secondsPer16th;
      this.playSynthLeadNote(offlineCtx, offlineCtx.destination, pitch, time, dur, 0.85);
    });

    // Schedule drum beat if enabled
    if (this.drumStyle !== 'none') {
      for (let s = 0; s < totalSteps; s++) {
        const time = s * secondsPer16th;
        const beatInMeasure = s % 16;
        if (beatInMeasure === 0 || beatInMeasure === 8) {
          this.playKick(offlineCtx, offlineCtx.destination, time);
        }
        if (beatInMeasure === 4 || beatInMeasure === 12) {
          this.playSnare(offlineCtx, offlineCtx.destination, time);
        }
        if (s % 2 === 0) {
          this.playHiHat(offlineCtx, offlineCtx.destination, time, true);
        }
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.audioBufferToWav(renderedBuffer);
  }

  audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    const left = buffer.getChannelData(0);
    const right = numChannels > 1 ? buffer.getChannelData(1) : left;

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      let sampleL = Math.max(-1, Math.min(1, left[i]));
      view.setInt16(offset, sampleL < 0 ? sampleL * 0x8000 : sampleL * 0x7FFF, true);
      offset += 2;

      if (numChannels > 1) {
        let sampleR = Math.max(-1, Math.min(1, right[i]));
        view.setInt16(offset, sampleR < 0 ? sampleR * 0x8000 : sampleR * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
}
