// js/audio.js - High-Precision Web Audio Acoustic Modeling Engine
// Flagship: Concert Grand Piano with dual-detuned string unisons, hammer strike transient, and soundboard resonance

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.chordsGain = null;
    this.melodyGain = null;
    this.bassGain = null;
    this.drumsGain = null;
    this.metronomeGain = null;

    this.instrument = 'grand_piano'; // grand_piano, rhodes, guitar, synth_lead, strings
    this.melodyInstrument = 'grand_piano';
    this.drumStyle = 'pop'; // pop, hiphop, ballad, none
    this.metronomeEnabled = false;

    this.isPlaying = false;
    this.playbackTimer = null;
  }

  init() {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Channel mixer gains
    this.chordsGain = this.ctx.createGain();
    this.chordsGain.gain.value = 0.78;
    this.chordsGain.connect(this.masterGain);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.value = 0.88;
    this.melodyGain.connect(this.masterGain);

    this.bassGain = this.ctx.createGain();
    this.bassGain.gain.value = 0.82;
    this.bassGain.connect(this.masterGain);

    this.drumsGain = this.ctx.createGain();
    this.drumsGain.gain.value = 0.5;
    this.drumsGain.connect(this.masterGain);

    this.metronomeGain = this.ctx.createGain();
    this.metronomeGain.gain.value = 0.4;
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

  // ==========================================
  // CONCERT GRAND PIANO SYNTHESIS
  // Physical model: Hammer strike + 3 string unisons with slight detuning + soundboard body resonance
  // ==========================================
  playGrandPianoNote(ctx, dest, midi, time, duration, velocity = 0.85) {
    const freq = this.midiToFreq(midi);

    // String unison 1: Fundamental (triangle wave for body warmth)
    const string1 = ctx.createOscillator();
    string1.type = 'triangle';
    string1.frequency.setValueAtTime(freq, time);

    // String unison 2: Slightly sharp (+1.8 cents, sine) to model authentic string chorus
    const string2 = ctx.createOscillator();
    string2.type = 'sine';
    string2.frequency.setValueAtTime(freq, time);
    string2.detune.setValueAtTime(1.8, time);

    // String unison 3: 2nd harmonic overtone (+3.2 cents)
    const string3 = ctx.createOscillator();
    string3.type = 'sine';
    string3.frequency.setValueAtTime(freq * 2, time);
    string3.detune.setValueAtTime(3.2, time);

    // Hammer impact transient: White noise burst shaped by bandpass filter
    const hammerBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.035), ctx.sampleRate);
    const hammerData = hammerBuffer.getChannelData(0);
    for (let i = 0; i < hammerData.length; i++) {
      hammerData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    }
    const hammerSource = ctx.createBufferSource();
    hammerSource.buffer = hammerBuffer;

    const hammerFilter = ctx.createBiquadFilter();
    hammerFilter.type = 'bandpass';
    hammerFilter.frequency.setValueAtTime(Math.min(freq * 3.5, 7500), time);
    hammerFilter.Q.setValueAtTime(2.0, time);

    const hammerGain = ctx.createGain();
    const hammerPeak = velocity * 0.16;
    hammerGain.gain.setValueAtTime(hammerPeak, time);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    hammerSource.connect(hammerFilter);
    hammerFilter.connect(hammerGain);
    hammerGain.connect(dest);

    // Soundboard body filter (simulates wooden spruce piano body resonance)
    const soundboardFilter = ctx.createBiquadFilter();
    soundboardFilter.type = 'lowpass';
    // Velocity scales filter brightness (harder strike = brighter soundboard excitation)
    const cutoff = Math.min(freq * (3.8 + velocity * 2.2), 12000);
    soundboardFilter.frequency.setValueAtTime(cutoff, time);
    soundboardFilter.Q.setValueAtTime(1.5, time);
    soundboardFilter.frequency.exponentialRampToValueAtTime(Math.min(freq * 1.5, 3200), time + Math.min(duration, 1.2));

    // String gain envelope (rapid attack, acoustic multi-stage decay)
    const noteGain = ctx.createGain();
    const peakGain = velocity * 0.36;
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(peakGain, time + 0.004); // 4ms percussive attack
    noteGain.gain.exponentialRampToValueAtTime(peakGain * 0.55, time + 0.14); // Initial prompt soundboard response
    noteGain.gain.exponentialRampToValueAtTime(peakGain * 0.28, time + Math.min(duration, 0.8)); // Acoustic sustain
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.12); // Damper release

    // Connect string unisons to soundboard filter
    string1.connect(soundboardFilter);
    string2.connect(soundboardFilter);
    string3.connect(soundboardFilter);
    soundboardFilter.connect(noteGain);
    noteGain.connect(dest);

    // Start audio sources
    hammerSource.start(time);
    string1.start(time);
    string2.start(time);
    string3.start(time);

    // Clean release
    const stopTime = time + duration + 0.15;
    string1.stop(stopTime);
    string2.stop(stopTime);
    string3.stop(stopTime);
    hammerSource.stop(time + 0.04);
  }

  // Alias for backward compatibility / fallback
  playPianoNote(ctx, dest, midi, time, duration, velocity = 0.85) {
    return this.playGrandPianoNote(ctx, dest, midi, time, duration, velocity);
  }

  // Unified chord tone dispatch based on active instrument selection
  playChordTone(ctx, dest, midi, time, duration, velocity = 0.82) {
    if (this.instrument === 'grand_piano' || this.instrument === 'piano') {
      this.playGrandPianoNote(ctx, dest, midi, time, duration, velocity);
    } else if (this.instrument === 'rhodes') {
      this.playRhodesNote(ctx, dest, midi, time, duration, velocity);
    } else if (this.instrument === 'guitar') {
      this.playGuitarNote(ctx, dest, midi, time, duration, velocity);
    } else if (this.instrument === 'strings') {
      this.playStringsNote(ctx, dest, midi, time, duration, velocity);
    } else {
      this.playSynthLeadNote(ctx, dest, midi, time, duration, velocity);
    }
  }

  // ==========================================
  // ELECTRIC PIANO (RHODES FM)
  // ==========================================
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
    modGain.gain.exponentialRampToValueAtTime(0.05, time + 0.4);

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

  // ==========================================
  // ACOUSTIC GUITAR
  // ==========================================
  playGuitarNote(ctx, dest, midi, time, duration, velocity = 0.8) {
    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.2, time);
    filter.Q.setValueAtTime(2.2, time);

    const peak = velocity * 0.32;
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

  // ==========================================
  // SYNTH LEAD
  // ==========================================
  playSynthLeadNote(ctx, dest, midi, time, duration, velocity = 0.85) {
    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, time);
    filter.Q.setValueAtTime(2.8, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + duration);

    const peak = velocity * 0.24;
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

  // ==========================================
  // WARM STRINGS
  // ==========================================
  playStringsNote(ctx, dest, midi, time, duration, velocity = 0.75) {
    const freq = this.midiToFreq(midi);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc1.detune.setValueAtTime(-4, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, time);
    osc2.detune.setValueAtTime(4, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1700, time);

    const peak = velocity * 0.2;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.08);
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

  // ==========================================
  // ACOUSTIC BASS
  // ==========================================
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
    filter.frequency.setValueAtTime(360, time);
    filter.frequency.exponentialRampToValueAtTime(130, time + duration * 0.7);

    const peak = velocity * 0.38;
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

  // ==========================================
  // DRUM ACCOMPANIMENT & METRONOME
  // ==========================================
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
    const bufferSize = Math.floor(ctx.sampleRate * 0.15);
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
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(85, time + 0.08);
    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  playHiHat(ctx, dest, time, closed = true) {
    const bufferSize = Math.floor(ctx.sampleRate * (closed ? 0.04 : 0.18));
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
      if (inst === 'grand_piano' || inst === 'piano') this.playGrandPianoNote(this.ctx, this.chordsGain, m, now, 0.9, 0.85);
      else if (inst === 'rhodes') this.playRhodesNote(this.ctx, this.chordsGain, m, now, 0.8, 0.75);
      else if (inst === 'guitar') this.playGuitarNote(this.ctx, this.chordsGain, m, now, 0.8, 0.75);
      else if (inst === 'strings') this.playStringsNote(this.ctx, this.chordsGain, m, now, 0.9, 0.7);
      else this.playSynthLeadNote(this.ctx, this.melodyGain, m, now, 0.6, 0.75);
    });
  }

  // --- WAV Audio File Export ---
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

      voicing.treble.forEach(m => this.playGrandPianoNote(offlineCtx, offlineCtx.destination, m, time, dur, 0.8));
      this.playBassNote(offlineCtx, offlineCtx.destination, 36 + details.bassPc, time, dur, 0.85);
    });

    // Schedule melody
    song.melody.forEach(note => {
      const pitch = theory.rowToPitch(note.row, song.key, song.mode).midi;
      const time = note.step * secondsPer16th;
      const dur = (note.duration || 1) * secondsPer16th;
      this.playGrandPianoNote(offlineCtx, offlineCtx.destination, pitch, time, dur, 0.9);
    });

    // Schedule drums if enabled
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
