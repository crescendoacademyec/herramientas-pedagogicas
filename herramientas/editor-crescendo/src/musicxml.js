import { getDuration } from "./store.js";

const escapeXml = (value = "") => String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
const noteType = { whole: "whole", half: "half", quarter: "quarter", eighth: "eighth", sixteenth: "16th" };
const fromType = { whole: "whole", half: "half", quarter: "quarter", eighth: "eighth", "16th": "sixteenth" };

export function toMusicXml(score) {
  const [beats, beatType] = score.timeSignature;
  const measures = score.measures.map((measure, index) => {
    const attributes = index === 0 ? `<attributes><divisions>4</divisions><key><fifths>${keyToFifths(score.keySignature)}</fifths></key><time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time><clef><sign>${score.clef === "bass" ? "F" : "G"}</sign><line>${score.clef === "bass" ? 4 : 2}</line></clef></attributes><sound tempo="${score.tempo}"/>` : "";
    const notes = measure.notes.map((note) => note.rest ? `<note><rest/><duration>${getDuration(note.duration).beats * 4}</duration><type>${noteType[note.duration]}</type></note>` : `<note><pitch><step>${note.pitch[0]}</step>${note.pitch.includes("#") ? "<alter>1</alter>" : ""}<octave>${note.pitch.slice(-1)}</octave></pitch><duration>${getDuration(note.duration).beats * 4}</duration><type>${noteType[note.duration]}</type>${note.articulation ? `<notations><articulations><${note.articulation}/></articulations></notations>` : ""}</note>`).join("");
    const text = measure.textItems.map((item) => `<direction placement="above"><direction-type><words>${escapeXml(item.text)}</words></direction-type></direction>`).join("");
    const chords = measure.chordSymbols.map((item) => `<harmony><root><root-step>${escapeXml(item.text[0] || "C")}</root-step></root><kind text="${escapeXml(item.text.slice(1))}">other</kind></harmony>`).join("");
    return `<measure number="${measure.number}">${attributes}${text}${chords}${notes}</measure>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?><score-partwise version="3.1"><work><work-title>${escapeXml(score.title)}</work-title></work><identification><creator type="composer">${escapeXml(score.composer)}</creator></identification><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1">${measures}</part></score-partwise>`;
}

export function fromMusicXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("El archivo MusicXML no es válido.");
  const part = xml.querySelector("part");
  if (!part) throw new Error("No se encontró una parte musical en el archivo.");
  const attributes = part.querySelector("attributes");
  const title = xml.querySelector("work-title")?.textContent?.trim() || "Partitura importada";
  const tempo = Number(part.querySelector("sound[tempo]")?.getAttribute("tempo")) || 96;
  const timeSignature = [Number(attributes?.querySelector("time > beats")?.textContent) || 4, Number(attributes?.querySelector("time > beat-type")?.textContent) || 4];
  const clef = attributes?.querySelector("clef > sign")?.textContent === "F" ? "bass" : "treble";
  const keySignature = fifthsToKey(Number(attributes?.querySelector("key > fifths")?.textContent) || 0);
  const measures = Array.from(part.querySelectorAll(":scope > measure")).map((node, index) => {
    let cursor = 0;
    const notes = Array.from(node.querySelectorAll(":scope > note")).map((note) => {
      const durationValue = Number(note.querySelector("duration")?.textContent) || 4;
      const duration = fromType[note.querySelector("type")?.textContent] || (durationValue >= 16 ? "whole" : durationValue >= 8 ? "half" : durationValue >= 4 ? "quarter" : "eighth");
      const rest = Boolean(note.querySelector("rest"));
      const pitch = rest ? "B4" : `${note.querySelector("step")?.textContent || "C"}${note.querySelector("alter")?.textContent === "1" ? "#" : ""}${note.querySelector("octave")?.textContent || "4"}`;
      const result = { id: crypto.randomUUID(), pitch, duration, beat: cursor, rest, articulation: note.querySelector("articulations > *")?.tagName.toLowerCase() || "" };
      cursor += durationValue / 4;
      return result;
    });
    return { id: crypto.randomUUID(), number: index + 1, notes, textItems: Array.from(node.querySelectorAll("direction-type words")).map((word) => ({ id: crypto.randomUUID(), text: word.textContent })), chordSymbols: [], repeatStart: false, repeatEnd: false };
  });
  return { id: crypto.randomUUID(), title, description: "Importado desde MusicXML", tempo, timeSignature, keySignature, clef, composer: "", scenes: [], measures: measures.length ? measures : [] };
}

function keyToFifths(key) { return ({ C:0, G:1, D:2, A:3, E:4, B:5, "F#":6, "C#":7, F:-1, Bb:-2, Eb:-3, Ab:-4, Db:-5, Gb:-6, Cb:-7 })[key] ?? 0; }
function fifthsToKey(value) { return ({ 0:"C", 1:"G", 2:"D", 3:"A", 4:"E", 5:"B", 6:"F#", 7:"C#", "-1":"F", "-2":"Bb", "-3":"Eb", "-4":"Ab", "-5":"Db", "-6":"Gb", "-7":"Cb" })[value] ?? "C"; }
