// js/leadsheet.js - Interactive Sheet Music (Lead Sheet) & Guitar Tab View (Hooktheory Feature)

export class LeadSheetRenderer {
  constructor(theoryEngine) {
    this.theory = theoryEngine;

    // Standard guitar open chord shapes: [E, A, D, G, B, e] (-1 for mute, 0 for open)
    this.guitarShapes = {
      'C':   { frets: [-1, 3, 2, 0, 1, 0], fingers: ['x', '3', '2', '0', '1', '0'] },
      'G':   { frets: [3, 2, 0, 0, 0, 3], fingers: ['3', '2', '0', '0', '0', '4'] },
      'Am':  { frets: [-1, 0, 2, 2, 1, 0], fingers: ['x', '0', '2', '3', '1', '0'] },
      'F':   { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '4', '2', '1', '1'], barre: 1 },
      'Dm':  { frets: [-1, -1, 0, 2, 3, 1], fingers: ['x', 'x', '0', '2', '3', '1'] },
      'Em':  { frets: [0, 2, 2, 0, 0, 0], fingers: ['0', '2', '3', '0', '0', '0'] },
      'D':   { frets: [-1, -1, 0, 2, 3, 2], fingers: ['x', 'x', '0', '1', '3', '2'] },
      'A':   { frets: [-1, 0, 2, 2, 2, 0], fingers: ['x', '0', '1', '2', '3', '0'] },
      'E':   { frets: [0, 2, 2, 1, 0, 0], fingers: ['0', '2', '3', '1', '0', '0'] },
      'Bdim':{ frets: [-1, 2, 3, 4, 3, -1], fingers: ['x', '1', '2', '4', '3', 'x'] }
    };
  }

  renderLeadSheet(container, song) {
    const isFlatKey = this.theory.FLAT_KEYS.includes(song.key);
    const keyName = this.theory.getNoteName(song.key, isFlatKey);
    const totalBars = song.bars;
    const stepsPerBar = 8; // 8 16ths per half bar or 8 per bar

    let html = `
      <div class="leadsheet-document">
        <div class="leadsheet-header">
          <h2 class="leadsheet-title">${song.title || 'Untitled Composition'}</h2>
          <div class="leadsheet-meta">
            <span><strong>Key:</strong> ${keyName} ${song.mode}</span> | 
            <span><strong>Tempo:</strong> ${song.bpm} BPM</span> | 
            <span><strong>Time:</strong> 4/4</span>
          </div>
        </div>

        <div class="leadsheet-staff-container">
    `;

    // Render measures
    for (let b = 0; b < totalBars; b++) {
      const chordIndex = b * 2;
      const c1 = song.chords[chordIndex];
      const c2 = song.chords[chordIndex + 1];

      const c1Details = c1 ? this.theory.getChordDetails(typeof c1 === 'string' ? c1 : c1.numeral, song.key, song.mode, c1.inversion || 0) : null;
      const c2Details = c2 ? this.theory.getChordDetails(typeof c2 === 'string' ? c2 : c2.numeral, song.key, song.mode, c2.inversion || 0) : null;

      // Filter notes in this bar
      const barStartStep = b * stepsPerBar;
      const barEndStep = barStartStep + stepsPerBar;
      const notesInBar = song.melody.filter(n => n.step >= barStartStep && n.step < barEndStep);

      html += `
        <div class="measure-block">
          <div class="measure-number">Bar ${b + 1}</div>
          <div class="measure-chords-row">
            <span class="sheet-chord" style="color: ${c1Details ? c1Details.color : 'inherit'}">
              ${c1Details ? `${c1Details.fullChordName} <small>(${c1Details.fullDisplay})</small>` : '–'}
            </span>
            <span class="sheet-chord" style="color: ${c2Details ? c2Details.color : 'inherit'}">
              ${c2Details ? `${c2Details.fullChordName} <small>(${c2Details.fullDisplay})</small>` : ''}
            </span>
          </div>

          <!-- Stave lines representation -->
          <div class="stave-representation">
            <div class="stave-line"></div>
            <div class="stave-line"></div>
            <div class="stave-line"></div>
            <div class="stave-line"></div>
            <div class="stave-line"></div>

            <!-- Melody Note Heads -->
            <div class="stave-notes-layer">
              ${notesInBar.map(n => {
                const pitch = this.theory.rowToPitch(n.row, song.key, song.mode);
                const relStep = n.step - barStartStep;
                const leftPct = (relStep / stepsPerBar) * 90 + 5;
                // Vertical position on staff (0..14 mapped to 80%..10%)
                const topPct = 85 - (n.row * 5.2);
                return `
                  <div class="sheet-note-head" 
                       style="left: ${leftPct}%; top: ${topPct}%; background-color: ${pitch.color}"
                       title="${pitch.noteName} (Degree ${pitch.degreeLabel})">
                    <span class="note-stem"></span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  renderGuitarTabs(container, song) {
    // Collect unique chords
    const uniqueNumerals = [...new Set(song.chords.filter(Boolean).map(c => typeof c === 'string' ? c : c.numeral))];
    
    let html = `
      <div class="guitar-tab-view">
        <h3 style="margin-bottom: 8px;">Guitar Chord Charts for Song</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
          Standard guitar voicings for each chord in the progression.
        </p>
        <div class="guitar-charts-grid">
    `;

    uniqueNumerals.forEach(numeral => {
      const details = this.theory.getChordDetails(numeral, song.key, song.mode, 0);
      const chordName = details.chordName;
      const shape = this.guitarShapes[chordName] || this.guitarShapes['C'];

      html += `
        <div class="guitar-chart-card">
          <div class="chart-header" style="color: ${details.color}">
            <strong>${details.fullChordName}</strong>
            <span class="chart-numeral">(${numeral})</span>
          </div>

          <div class="fretboard-box">
            <div class="nut-line"></div>
            <div class="fret-wire" style="top: 25%"></div>
            <div class="fret-wire" style="top: 50%"></div>
            <div class="fret-wire" style="top: 75%"></div>
            <div class="fret-wire" style="top: 100%"></div>

            <!-- 6 vertical strings -->
            <div class="guitar-string" style="left: 10%"></div>
            <div class="guitar-string" style="left: 26%"></div>
            <div class="guitar-string" style="left: 42%"></div>
            <div class="guitar-string" style="left: 58%"></div>
            <div class="guitar-string" style="left: 74%"></div>
            <div class="guitar-string" style="left: 90%"></div>

            <!-- Finger Dots -->
            ${shape.frets.map((fret, stringIdx) => {
              if (fret <= 0) return '';
              const leftPct = 10 + stringIdx * 16;
              const topPct = (fret - 0.5) * 25;
              return `<div class="fret-dot" style="left: ${leftPct}%; top: ${topPct}%; background-color: ${details.color}"></div>`;
            }).join('')}
          </div>

          <div class="finger-labels">
            ${shape.fingers.map(f => `<span>${f}</span>`).join('')}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}
