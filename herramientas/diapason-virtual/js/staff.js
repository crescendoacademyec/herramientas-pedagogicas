    // ======================================================================
    // 2. CÓDIGO DEL PENTAGRAMA (CORREGIDO)
    // ======================================================================
    const svg = document.getElementById('staffSvg');
    const SVG_W = 2100;
    const SVG_H = 2100;

    // Estas constantes DEBEN coincidir con las de drawBaseStaff
    const STAFF_Y0 = 500;          // primera línea del pentagrama
    const STAFF_LINE_SPACING = 200; // separación entre líneas
    const STAFF_X1 = 90;
    const STAFF_X2 = 2000;

    function svgEl(tag, attrs) {
      const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function placeClef(glyph, leftX, topY, bottomY, extraScale = 1.4) {
      const probe = svgEl('text', { x: 0, y: 0, 'font-size': 200, 'font-family': 'serif' });
      probe.textContent = glyph;
      svg.appendChild(probe);
      const bbox = probe.getBBox();
      svg.removeChild(probe);
      if (!bbox.height) return;
      const targetHeight = bottomY - topY;
      let scale = (targetHeight / bbox.height) * extraScale;
      const dx = leftX - bbox.x * scale;
      const dy = topY - bbox.y * scale;
      const g = svgEl('g', { transform: `translate(${dx},${dy}) scale(${scale})` });
      const text = svgEl('text', { x: 0, y: 0, 'font-size': 200, 'font-family': 'serif', fill: '#333' });
      text.textContent = glyph;
      g.appendChild(text);
      svg.appendChild(g);
    }

    function drawBaseStaff() {
      svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 ' + SVG_W + ' ' + SVG_H);

      for (let i = 0; i < 5; i++) {
        const y = STAFF_Y0 + i * STAFF_LINE_SPACING;
        svg.appendChild(svgEl('line', {
          x1: STAFF_X1, x2: STAFF_X2,
          y1: y, y2: y,
          stroke: '#000', 'stroke-width': 7
        }));
      }

      const clefY = STAFF_Y0 - 3.2 * STAFF_LINE_SPACING;
      placeClef('𝄞', STAFF_X1 - 5, clefY - 1, clefY + 1, 1000);

      svg.appendChild(svgEl('line', { x1: STAFF_X1, x2: STAFF_X1, y1: STAFF_Y0, y2: STAFF_Y0 + 4 * STAFF_LINE_SPACING, stroke: '#000', 'stroke-width': 5 }));
      svg.appendChild(svgEl('line', { x1: STAFF_X2, x2: STAFF_X2, y1: STAFF_Y0, y2: STAFF_Y0 + 4 * STAFF_LINE_SPACING, stroke: '#000', 'stroke-width': 5 }));
    }

    const STAFF_LETTERS=['C','D','E','F','G','A','B'];
    const STAFF_NATURAL_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    function rootPrefersFlats(rootName){return /b/.test(rootName)||['F'].includes(rootName)}
    function spellPc(pc, rootName=''){
      const sharp=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
      const flat=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
      return (rootPrefersFlats(rootName)?flat:sharp)[((pc%12)+12)%12];
    }
    function staffSpelling(midi){
      const name=spellPc(midi%12,rootSel.value||''); const letter=name[0]; const acc=name.slice(1);
      return {letter,acc,label:letter,glyph:acc==='b'?'♭':acc==='#'?'♯':acc==='bb'?'♭♭':acc==='##'?'𝄪':''};
    }

    function renderStaffNotes(notes) {
      svg.querySelectorAll('.note-el').forEach(e => e.remove());
      if (!notes || notes.length === 0) return;

      const sorted = notes.slice().sort((a, b) => a.midi - b.midi);

      // Guitarra, ukelele y requinto se representan en clave de sol una octava
      // por encima de su altura sonora. El audio y el diapasón conservan altura real.
      const instrumentKey = instrumentSel.value;
      const transpose = ['guitar','ukulele','requinto'].includes(instrumentKey) ? 12 : 0;

      const letterStep={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
      function diatonicStepFromSpelling(midi,sp){
        const octave=Math.floor(midi/12)-1;
        return ((octave-4)*7)+letterStep[sp.letter]+2;
      }

      function yFromStep(step) {
        const STAFF_Y_BOTTOM = STAFF_Y0 + 4 * STAFF_LINE_SPACING;
        return STAFF_Y_BOTTOM - (step - 4) * (STAFF_LINE_SPACING / 2);
      }

      const cx = (STAFF_X1 + STAFF_X2) / 2;
      const NOTE_X_OFFSET = -100;
      let prevStep = null, shiftToggle = false;
      const LEDGER_LENGTH = 240;

      sorted.forEach((n) => {
        // Aplicar transposición para el dibujo
        const displayMidi = n.midi + transpose;
        const spelling=staffSpelling(displayMidi);
        let step = diatonicStepFromSpelling(displayMidi,spelling);

        let octaveShift = null;
        if (step <= -10) { step += 7; octaveShift = '8vb'; }
        else if (step >= 17) { step -= 7; octaveShift = '8va'; }

        const y = yFromStep(step);
        if (prevStep !== null && Math.abs(step - prevStep) <= 1) shiftToggle = !shiftToggle;
        else shiftToggle = false;
        prevStep = step;
        const x = cx + NOTE_X_OFFSET + (shiftToggle ? 250 : 0);

        // Líneas adicionales
        const ledgerLines = [];
        if (step < 4) {
          for (let l = 2; l >= step; l -= 2) ledgerLines.push(l);
        } else if (step > 12) {
          for (let l = 14; l <= step; l += 2) ledgerLines.push(l);
        }
        ledgerLines.forEach(L => {
          const ly = yFromStep(L);
          const led = svgEl('line', { class: 'note-el', x1: x - LEDGER_LENGTH, x2: x + LEDGER_LENGTH, y1: ly, y2: ly, stroke: '#000', 'stroke-width': 5 });
          svg.appendChild(led);
        });

        // Alteración fuera de la cabeza
        if (spelling.glyph) {
          const accidental = svgEl('text', { class: 'note-el', x: x - 175, y: y + 42, 'font-size': 135, fill: '#222', 'font-family': 'serif', 'text-anchor':'middle' });
          accidental.textContent = spelling.glyph;
          svg.appendChild(accidental);
        }

        // Cabeza de la nota
        const head = svgEl('ellipse', { class: 'note-el', cx: x, cy: y, rx: 110, ry: 100, fill: '#000', stroke: '#222', 'stroke-width': 1.5 });
        svg.appendChild(head);

        // Etiqueta de la nota (usar la nota transpuesta)
        const lbl = svgEl('text', { class: 'note-el', x: x, y: y + 3, 'font-size': 110, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#fff', 'font-weight': 'bold' });
        lbl.textContent = spelling.label;
        svg.appendChild(lbl);

        if (octaveShift) {
          const STAFF_Y_BOTTOM = STAFF_Y0 + 4 * STAFF_LINE_SPACING;
          let textY;
          if (octaveShift === '8va') {
            textY = STAFF_Y0 - 60;
          } else {
            textY = STAFF_Y_BOTTOM + 60;
          }
          const indicador = svgEl('text', { class: 'note-el', x: x, y: textY, 'font-size': 100, 'text-anchor': 'middle', 'font-family': 'serif', fill: '#333', 'font-weight': 'bold' });
          indicador.textContent = octaveShift;
          svg.appendChild(indicador);
        }
      });
    }
