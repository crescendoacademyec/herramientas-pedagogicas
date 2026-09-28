// String order in presets: 6→1 or 4→1; ukulele retains its re-entrant order.
const preset = (id, label, notes, hint = '') => ({id, label, notes: notes.split(' '), hint});
export const TUNINGS = {
  guitarra: [
    preset('standard', 'Estándar', 'E2 A2 D3 G3 B3 E4'),
    preset('eadebe', 'EADEBE', 'E2 A2 D3 E3 B3 E4'),
    preset('neon', 'Neon · John Mayer', 'C2 A2 D3 G3 B3 E4'),
    preset('drop-d', 'Drop D', 'D2 A2 D3 G3 B3 E4'),
    preset('drop-c', 'Drop C', 'C2 G2 C3 F3 A3 D4'),
    preset('drop-db', 'Drop C♯ / D♭', 'C#2 G#2 C#3 F#3 A#3 D#4'),
    preset('eb', 'Medio tono abajo', 'D#2 G#2 C#3 F#3 A#3 D#4'),
    preset('d', 'Un tono abajo', 'D2 G2 C3 F3 A3 D4'),
    preset('dadgad', 'DADGAD', 'D2 A2 D3 G3 A3 D4'),
    preset('double-drop-d', 'Double Drop D', 'D2 A2 D3 G3 B3 D4'),
    preset('open-g', 'Open G', 'D2 G2 D3 G3 B3 D4'),
    preset('open-d', 'Open D', 'D2 A2 D3 F#3 A3 D4'),
    preset('open-c', 'Open C', 'C2 G2 C3 G3 C4 E4'),
  ],
  ukelele: [
    preset('standard', 'Estándar · high G', 'G4 C4 E4 A4'),
    preset('low-g', 'Low G', 'G3 C4 E4 A4', 'Utiliza una cuarta cuerda específica para low G.'),
    preset('baritone', 'Barítono', 'D3 G3 B3 E4', 'Para ukelele barítono con sus cuerdas correspondientes.'),
    preset('d', 'Afinación en D', 'A4 D4 F#4 B4', 'Comprueba que tu juego de cuerdas admite afinación en D.'),
  ],
  requinto: [
    preset('standard', 'Estándar', 'A2 D3 G3 C4 E4 A4'),
    preset('drop-g', 'Drop G · sexta un tono abajo', 'G2 D3 G3 C4 E4 A4', 'Adaptación de Drop D al requinto afinado en A.'),
    preset('g', 'Un tono abajo', 'G2 C3 F3 A#3 D4 G4'),
  ],
  violin: [
    preset('standard', 'Estándar', 'G3 D4 A4 E5'),
    preset('cross-g', 'Cross G', 'G3 D4 G4 D5'),
    preset('cross-a', 'Cross A', 'A3 E4 A4 E5', 'Scordatura de fiddle: sube las dos cuerdas graves un tono; usa cuerdas compatibles.'),
    preset('dad-ae', 'D · ADAE', 'A3 D4 A4 E5', 'Scordatura de fiddle: la cuerda G sube un tono.'),
  ],
  cello: [
    preset('standard', 'Estándar', 'C2 G2 D3 A3'),
    preset('bach-5', 'Bach · Suite n.º 5', 'C2 G2 D3 G3', 'La primera cuerda baja de A3 a G3.'),
  ],
  bajo: [
    preset('standard', 'Estándar · 4 cuerdas', 'E1 A1 D2 G2'),
    preset('drop-d', 'Drop D', 'D1 A1 D2 G2'),
    preset('drop-c', 'Drop C', 'C1 G1 C2 F2'),
    preset('eb', 'Medio tono abajo', 'D#1 G#1 C#2 F#2'),
    preset('d', 'Un tono abajo', 'D1 G1 C2 F2'),
    preset('bead', 'BEAD · registro grave', 'B0 E1 A1 D2', 'Requiere cuerdas y ajuste adecuados para BEAD en un bajo de cuatro cuerdas.'),
  ],
};
const PEG_ORDER = {guitarra:[2,1,0,3,4,5], requinto:[2,1,0,3,4,5], ukelele:[1,0,2,3], violin:[1,0,2,3], cello:[1,0,2,3], bajo:[3,2,1,0]};
export function noteTarget(value){
  const match = /^([A-G])(#?)([0-8])$/.exec(value);
  if(!match) throw new Error(`Nota inválida: ${value}`);
  const note = match[1] + match[2], oct = Number(match[3]);
  const midi = 12 * (oct + 1) + {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]] + (match[2] ? 1 : 0);
  return {note, oct, freq:440 * 2 ** ((midi - 69) / 12)};
}
export function getTuning(instrument, id){
  const presets = TUNINGS[instrument];
  return presets?.find(p => p.id === id) || presets?.[0] || null;
}
export function tuningTargets(instrument, id){
  const tuning = getTuning(instrument, id);
  return tuning ? PEG_ORDER[instrument].map(i => noteTarget(tuning.notes[i])) : [];
}
