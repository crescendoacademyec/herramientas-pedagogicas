import { getDuration } from "./store.js";

let audioContext;
let activeOscillators = [];
export function stopPlayback() { activeOscillators.forEach((node) => { try { node.stop(); } catch {} }); activeOscillators = []; }
export function playPitch(pitch, when = 0, seconds = .35) {
  audioContext ??= new AudioContext();
  const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
  const semitones = ({ C:0, D:2, E:4, F:5, G:7, A:9, B:11 })[pitch[0]] + (pitch.includes("#") ? 1 : 0) + (Number(pitch.slice(-1)) - 4) * 12;
  oscillator.frequency.value = 261.626 * 2 ** (semitones / 12); oscillator.type = "triangle";
  gain.gain.setValueAtTime(.0001, audioContext.currentTime + when); gain.gain.exponentialRampToValueAtTime(.12, audioContext.currentTime + when + .015); gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + when + seconds);
  oscillator.connect(gain).connect(audioContext.destination); oscillator.start(audioContext.currentTime + when); oscillator.stop(audioContext.currentTime + when + seconds + .03); activeOscillators.push(oscillator);
}
export function playScore(score, onEnd) {
  stopPlayback(); let at = 0; const secondsPerBeat = 60 / score.tempo;
  score.measures.forEach((measure) => {
    let measureTime = at;
    measure.notes.slice().sort((a, b) => a.beat - b.beat).forEach((note) => {
      const duration = getDuration(note.duration).beats * secondsPerBeat;
      if (!note.rest) playPitch(note.pitch, measureTime, duration * .9);
      measureTime += duration;
    });
    at += score.timeSignature[0] * secondsPerBeat;
  });
  window.setTimeout(onEnd, Math.max(250, at * 1000 + 100));
}
