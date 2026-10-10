# Afinaciones

Las listas de `tunings.mjs` están en orden físico 6→1 o 4→1, no necesariamente por frecuencia (ukelele reentrante). Se convierten al orden gráfico de las clavijas antes de usarlas tanto en modo manual como automático. Las frecuencias se calculan con temperamento igual, A4 = 440 Hz; la calibración del afinador se aplica posteriormente.

## Referencias

- Guitarra Drop C: [Fender](https://www.fender.com/articles/setup/drop-c-tuning).
- Drop D: [Fender](https://www.fender.com/articles/setup/drop-d-tuning-on-guitar).
- DADGAD: [Fender Play](https://www.fender.com/play/guitar/collections/alternate-tuning/courses/acoustic-guitar-skill-alternate-tunings-dadgad?course-number=21).
- Open C: [Fender](https://www.fender.com/articles/setup/open-c-tuning).
- Ukelele high/low G y barítono: [Fender](https://www.fender.com/articles/setup/how-to-tune-a-ukulele).
- Violín AEAE, GDGD y ADAE: [Johnson String Instrument](https://www.johnsonstring.com/resources/articles/stringed-instruments/cross-tuning-fiddle/).
- Cello Suite 5, C2 G2 D3 G3: [Christopher Costanza, notas del intérprete](https://costanzacello.com/bach-cello-suites-complete-commentary).
- Requinto A2 D3 G3 C4 E4 A4: [Premier Guitar](https://www.premierguitar.com/pro-advice/acoustic-soundboard/a-brief-history-of-requinto-romantico).

Neon (C2 A2 D3 G3 B3 E4) y EADEBE (E2 A2 D3 E3 B3 E4) se incorporan por petición del usuario. Drop G del requinto se identifica expresamente como adaptación de Drop D, no como afinación tradicional documentada. Los presets de transposición conservan los intervalos del estándar; los de drop bajan además la cuerda grave un tono respecto al estándar correspondiente.

La selección se guarda por instrumento. El modo vocal continúa siendo cromático. Las indicaciones de cuerdas específicas acompañan los presets low G, barítono y BEAD.

Validación automatizada: `node --test afinador/tunings.test.mjs`.
