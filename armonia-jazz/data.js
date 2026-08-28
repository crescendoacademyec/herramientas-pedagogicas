/* Armonía Jazz — Crescendo Academy
   Contenido teórico y cuestionarios para los 4 niveles.
   Todo el contenido de este archivo es original, redactado para Crescendo Academy. */

const LEVELS = [
  // ============================================================
  // NIVEL 1 — FUNDAMENTOS
  // ============================================================
  {
    id: 1,
    slug: "n1",
    name: "Fundamentos",
    subtitle: "Cifrado jazz, campo armónico mayor, ii-V-I y voicings básicos.",
    topics: [
      {
        title: "1.1 Cifrado de acordes jazz",
        html: `
          <p>El jazz usa un sistema de cifrado que describe la <b>fundamental</b> y la <b>calidad</b> del acorde
          (tríada + séptima, y a veces tensiones). Los símbolos básicos que debes reconocer de memoria:</p>
          <ul>
            <li><b>Maj7 / 7M / Δ</b> — tétrada mayor con séptima mayor (ej. Cmaj7 = C-E-G-B)</li>
            <li><b>m7 / -7</b> — tétrada menor con séptima menor (ej. Dm7 = D-F-A-C)</li>
            <li><b>7</b> — tétrada mayor con séptima menor, "dominante" (ej. G7 = G-B-D-F)</li>
            <li><b>m7b5 / ø</b> — tríada disminuida con séptima menor, "semidisminuido" (ej. Bm7b5 = B-D-F-A)</li>
            <li><b>dim7 / °7</b> — tríada disminuida con séptima disminuida (ej. B°7 = B-D-F-Ab)</li>
            <li><b>sus4</b> — se reemplaza la 3ª por la 4ª justa (ej. G7sus4 = G-C-D-F)</li>
            <li><b>6 / m6</b> — tríada con sexta añadida en vez de séptima (ej. C6 = C-E-G-A)</li>
          </ul>
          <p>En jazz casi nunca se toca solo la tríada: la séptima es la nota que define el "color" funcional
          del acorde, por eso se cifra siempre que sea posible.</p>
        `
      },
      {
        title: "1.1b Laboratorio de acordes, escalas y arpegios",
        html: `
          <p>Estudia <b>una idea a la vez</b>: elige la familia, la tónica y una posición. El mismo contenido se
          puede leer en diapasón, teclado y lista de notas; las posiciones son una herramienta de estudio, no un
          mapa saturado de todas las posibilidades a la vez.</p>
          <div id="instrumentLabMount"></div>
        `
      },
      {
        title: "1.2 Campo armónico mayor con tétradas",
        html: `
          <p>Al armonizar cada grado de la escala mayor con cuatro sonidos (tétradas diatónicas), obtenemos
          siempre el mismo patrón de calidades, sin importar la tonalidad:</p>
          <table class="jz-table">
            <tr><th>Grado</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th><th>vii</th></tr>
            <tr><th>Calidad</th><td>Maj7</td><td>m7</td><td>m7</td><td>Maj7</td><td>7</td><td>m7</td><td>m7b5</td></tr>
          </table>
          <p>Ejemplo en Do mayor: <b>Cmaj7 — Dm7 — Em7 — Fmaj7 — G7 — Am7 — Bm7b5</b>.</p>
          <p>Memoriza este patrón (Maj7, m7, m7, Maj7, 7, m7, m7b5) y podrás construir el campo armónico
          de cualquier tonalidad mayor sin pensarlo dos veces.</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Cmaj7 (I)","formula":[0,4,7,11],"rootPc":0},
            {"symbol":"Dm7 (ii)","formula":[2,5,9,0],"rootPc":2},
            {"symbol":"Em7 (iii)","formula":[4,7,11,2],"rootPc":4},
            {"symbol":"Fmaj7 (IV)","formula":[5,9,0,4],"rootPc":5},
            {"symbol":"G7 (V)","formula":[7,11,2,5],"rootPc":7},
            {"symbol":"Am7 (vi)","formula":[9,0,4,7],"rootPc":9},
            {"symbol":"Bm7b5 (vii)","formula":[11,2,5,9],"rootPc":11}
          ]'></div>
        `
      },
      {
        title: "1.3 El ii-V-I mayor",
        html: `
          <p>La progresión <b>ii-V-I</b> es la célula más importante del jazz. En Do mayor es
          <b>Dm7 — G7 — Cmaj7</b>. Funciona porque:</p>
          <ul>
            <li>El <b>ii</b> (subdominante) prepara el movimiento hacia el V.</li>
            <li>El <b>V</b> (dominante) crea tensión: su 3ª y 7ª forman un tritono que "quiere" resolver.</li>
            <li>El <b>I</b> (tónica) resuelve la tensión y da reposo.</li>
          </ul>
          <p>El movimiento de fundamentales es por <b>5ta descendente</b> (ii→V es 5ta abajo, V→I es 5ta abajo),
          el movimiento más fuerte que existe en la armonía tonal.</p>
          <p>Practica cantando y tocando el ii-V-I en varias tonalidades hasta que lo reconozcas de oído
          instantáneamente — es la base de prácticamente todo el repertorio estándar de jazz.</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Dm7 (ii)","formula":[2,5,9,0],"rootPc":2},
            {"symbol":"G7 (V)","formula":[7,11,2,5],"rootPc":7},
            {"symbol":"Cmaj7 (I)","formula":[0,4,7,11],"rootPc":0}
          ]'></div>
        `
      },
      {
        title: "1.4 Extensiones diatónicas básicas",
        html: `
          <p>Las <b>tensiones</b> (9, 11 y 13) son extensiones de la tétrada que agregan color sin cambiar
          su función. En el campo armónico mayor, las tensiones diatónicas disponibles son:</p>
          <table class="jz-table">
            <tr><th>Acorde</th><th>9</th><th>11</th><th>13</th></tr>
            <tr><td>Imaj7</td><td>9</td><td>(evitar, choca con 3ª)</td><td>13</td></tr>
            <tr><td>iim7</td><td>9</td><td>11</td><td>13</td></tr>
            <tr><td>V7</td><td>9</td><td>(evitar)</td><td>13</td></tr>
          </table>
          <p>La <b>nota evitada</b> (avoid note) es una tensión que forma una 2ª menor con una nota del acorde
          (normalmente con la 3ª). No está prohibida, pero se usa con cuidado, casi siempre como nota de paso.</p>
          <p>Al contrario de las notas evitadas, existen notas que se pueden <b>omitir</b> sin que el acorde
          pierda su color ni su función. Generalmente se omiten: la <b>fundamental</b> (si hay bajista tocándola),
          la <b>5ª justa</b> (no aporta color, solo estabilidad) y a veces la <b>7ª mayor</b> en voicings muy
          cargados de tensiones. Omitir no es lo mismo que evitar: quitar una nota "omit" no cambia la función
          del acorde, simplemente la dejas fuera porque no es imprescindible para que se reconozca.</p>
        `
      },
      {
        title: "1.5 Voicings shell: guide tones",
        html: `
          <p>Un <b>shell voicing</b> reduce el acorde a sus dos notas más importantes: la <b>3ª</b> y la <b>7ª</b>
          (las "guide tones" o notas guía). Estas dos notas son las que definen si el acorde es mayor, menor
          o dominante, y son las que más suavemente se conducen de un acorde al siguiente.</p>
          <p>Ejemplo en un ii-V-I en Do mayor:</p>
          <ul>
            <li>Dm7 → 3ª=F, 7ª=C</li>
            <li>G7 → 3ª=B, 7ª=F</li>
            <li>Cmaj7 → 3ª=E, 7ª=B</li>
          </ul>
          <p>Fíjate cómo la 7ª de un acorde se convierte en la 3ª del siguiente (F→F, B→B): esto se llama
          <b>conducción de voces (voice leading)</b> y es la razón por la que el ii-V-I suena tan natural.</p>
          <p>Los shells según la calidad del acorde (fundamental + 3ª + 7ª, mostrados aquí en Do):</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Maj7 shell","formula":[0,4,11],"rootPc":0},
            {"symbol":"m7 / m7b5 shell (igual, sin la 5ª)","formula":[0,3,10],"rootPc":0},
            {"symbol":"7 shell","formula":[0,4,10],"rootPc":0}
          ]'></div>
        `
      },
      {
        title: "1.6 Inversiones y bajo (slash chords)",
        html: `
          <p>Cuando la nota más grave de un acorde no es la fundamental, se usa la notación de <b>acorde con bajo</b>
          (slash chord): <b>C7/E</b> significa un acorde de C7 con E en el bajo (primera inversión).</p>
          <p>En tétradas hay tres inversiones posibles según qué nota esté en el bajo: 3ª, 5ª o 7ª.
          El bajo con la 7ª es común en dominantes (ej. <b>G7/F</b>) porque suaviza la resolución hacia el acorde
          siguiente.</p>
        `
      },
      {
        title: "1.7 Relación básica acorde-escala",
        html: `
          <p>Antes de estudiar los modos a fondo (Nivel 2), conviene entender la idea más simple: sobre cada
          acorde diatónico se puede improvisar usando <b>la escala mayor de la tonalidad</b>, empezando
          conceptualmente desde la fundamental de ese acorde. Esto ya te da el "modo" correcto sin necesidad
          de memorizar nombres todavía.</p>
          <ul>
            <li><b>Imaj7</b> → escala mayor de la tonalidad (ej. C mayor sobre Cmaj7 en Do mayor).</li>
            <li><b>iim7</b> → las mismas 7 notas de la escala mayor, tocadas con centro en el ii (esto ya
            es, sin nombrarlo aún, el modo dórico).</li>
            <li><b>V7</b> → las mismas 7 notas con centro en el V (esto ya es el modo mixolidio).</li>
          </ul>
          <p>La idea clave para principiantes: <b>una sola escala mayor "sirve" para tocar sobre varios
          acordes distintos del mismo campo armónico</b>, solo cambia la nota que sientes como centro. Este
          es el punto de partida antes de estudiar cada modo como una entidad propia con su propia
          personalidad sonora.</p>
        `
      },
      {
        title: "1.8 Lectura de lead sheets y el Real Book",
        html: `
          <p>Un <b>lead sheet</b> (hoja guía) es la forma estándar de anotar un tema de jazz: solo lleva la
          <b>melodía</b> escrita y los <b>símbolos de acorde</b> encima del pentagrama, sin especificar
          voicings, ritmo de acompañamiento ni arreglo — cada músico decide cómo tocar su parte a partir de
          esa información mínima. El <b>Real Book</b> es la colección de lead sheets de standards de jazz
          más usada en el mundo, y es la referencia que encontrarás en la mayoría de jam sessions.</p>
          <p><b>Cómo leer un chart de Real Book:</b></p>
          <ul>
            <li>El <b>título, compositor y tonalidad</b> van arriba; el <b>estilo/tempo</b> suele indicarse
            entre paréntesis (ej. "Medium swing", "Ballad", "Bossa").</li>
            <li>Los <b>símbolos de acorde</b> se leen de izquierda a derecha, alineados sobre el compás/pulso
            exacto donde cambian — un acorde es válido desde que aparece hasta el siguiente símbolo.</li>
            <li><b>Barras de repetición</b> ( <code>||: :||</code> ) repiten una sección; los <b>finales 1 y
            2</b> indican qué compás tocar la primera vez y cuál la segunda.</li>
            <li><b>D.C. al Fine</b> (Da Capo) = volver al inicio y terminar en "Fine"; <b>D.S. al Coda</b>
            (Dal Segno) = volver al signo <code>%</code> y saltar directo a la <b>Coda</b> (<code>⊕</code>)
            cuando aparece la indicación.</li>
            <li>Las <b>letras de ensayo</b> (A, B, C...) marcan secciones de la forma (ej. sección A, puente/bridge).</li>
          </ul>
          <p><b>Cómo se toca un "head":</b> en la práctica estándar de jazz, la melodía (el "head") se toca
          completa al inicio y al final del tema; en el medio, cada instrumentista improvisa solos siguiendo
          únicamente la <b>progresión de acordes</b> del chart, repitiendo la forma tantas veces como se
          acuerde en el momento ("¿cuántos choruses tocamos?").</p>
          <p><b>Nota práctica:</b> los primeros Real Books de los años 70 se copiaban a mano y circulaban de
          forma no autorizada, con errores frecuentes de acordes y melodías. Hoy existen ediciones legales y
          revisadas (Hal Leonard); aun así, siempre vale la pena contrastar un chart con una grabación de
          referencia del tema antes de tocarlo.</p>
          <p><b>Variantes de notación entre distintos Real Books:</b> no todos los editores cifran igual.
          Vas a encontrar todas estas formas para exactamente el mismo acorde, y debes reconocerlas todas:</p>
          <ul>
            <li>Menor: <b>m7</b>, <b>-7</b> o <b>min7</b> (todas significan lo mismo)</li>
            <li>Mayor con 7ª mayor: <b>maj7</b>, <b>Δ</b> (triángulo) o <b>M7</b></li>
            <li>Semidisminuido: <b>m7b5</b>, <b>ø</b> (o <b>ø7</b>), o a veces escrito como fracción "-7(b5)"</li>
            <li>Disminuido: <b>°7</b>, <b>dim7</b> o simplemente <b>dim</b></li>
            <li>Alteraciones: algunos libros usan paréntesis "C7(#9)", otros las ponen pegadas "C7#9" — ambas formas son válidas</li>
          </ul>
        `
      },
      {
        title: "1.9 Funciones armónicas: tónico, subdominante y dominante",
        html: `
          <p>Todo acorde diatónico (y muchos prestados) cumple, en el fondo, uno de solo <b>tres roles</b>
          dentro de una tonalidad. Pensar en funciones en vez de en acordes sueltos te permite entender
          <i>por qué</i> funciona una progresión, y te da libertad para sustituir un acorde por otro de la
          misma función sin romper el sentido armónico.</p>
          <table class="jz-table">
            <tr><th>Tónico (reposo)</th><th>Subdominante (preparación)</th><th>Dominante (tensión)</th></tr>
            <tr><td>Imaj7</td><td>IVmaj7</td><td>V7</td></tr>
            <tr><td>iiim7</td><td>ivm7 (prestado)</td><td>viim7b5</td></tr>
            <tr><td>vim7</td><td>iim7</td><td></td></tr>
            <tr><td>bIIImaj7 (prestado)</td><td>bVImaj7 (prestado)</td><td></td></tr>
            <tr><td></td><td>bVII7 (prestado)</td><td></td></tr>
          </table>
          <p>La lógica básica de casi cualquier progresión tonal es: <b>tónico → subdominante → dominante →
          tónico</b> (reposo, preparación, tensión, resolución). El ii-V-I que ya conoces es, en el fondo,
          exactamente ese ciclo comprimido en tres acordes.</p>
        `
      },
      {
        title: "1.10 Repertorio recomendado del Real Book — Nivel 1",
        html: `
          <p>Para empezar a leer y tocar standards, elige temas con forma clara y armonía mayormente diatónica.
          Este orden va de lo más simple a lo un poco más retador dentro del nivel:</p>
          <ol class="repertoire-list">
            <li><b>C Jam Blues</b> — blues de dos acordes, ideal para tu primera lectura de chart.</li>
            <li><b>Now's the Time</b> — blues clásico de bebop, forma de 12 compases sin sorpresas.</li>
            <li><b>Straight No Chaser</b> — blues con un giro cromático simple, buena introducción al color bebop.</li>
            <li><b>Blue Monk</b> — blues con acentos rítmicos característicos, forma muy predecible.</li>
            <li><b>Tune Up</b> — encadenamiento de ii-V-I clarísimo, el mejor tema para practicar el Nivel 1 completo.</li>
            <li><b>Autumn Leaves</b> — combina ii-V-I mayor y menor en una sola forma; virtualmente obligatorio.</li>
            <li><b>Blue Bossa</b> — ii-V-i menor simple sobre ritmo de bossa, sin complicaciones armónicas.</li>
            <li><b>Satin Doll</b> — ritmo armónico lento (los acordes duran más), fácil de seguir mientras lees.</li>
            <li><b>Take the A Train</b> — forma AABA simple con acordes mayormente diatónicos.</li>
            <li><b>Summertime</b> — armonía modal/menor simple, excelente para tocar de oído además de leer.</li>
          </ol>
          <p class="small-note">Resto del repertorio de tu lista que también encaja en este nivel (blues y
          standards simples, armonía mayormente diatónica):</p>
          <p class="repertoire-extra">Bessie's Blues · Blue 7 · Blues by Five · Cedars Blues · Killer Joe ·
          Moanin' · Sandu · Sister Sadie · Tenor Madness · Tough Talk · Turnaround · Sonnymoon for Two ·
          Things Ain't What They Used to Be · Watermelon Man · Doxy · Freddie the Freeloader · Sugar ·
          Bags' Groove · All of Me · Blue Skies · Bye Bye Blackbird · Cheek to Cheek · In a Mellow Tone ·
          It Don't Mean a Thing · Our Love Is Here to Stay · I've Got the World on a String · Ceora ·
          Corcovado · Girl from Ipanema · One Note Samba · St. Thomas</p>
        `
      }
    ],
    quiz: [
      q("¿Qué notas forman un Dm7?", ["D-F-A-C", "D-F#-A-C", "D-F-A-C#", "D-F-Ab-C"], 0),
      q("¿Cuál es la calidad del grado V en el campo armónico mayor?", ["Maj7", "m7", "7", "m7b5"], 2),
      q("¿Cuál es la calidad del grado vii en el campo armónico mayor?", ["m7", "m7b5", "dim7", "Maj7"], 1),
      q("En un ii-V-I en Fa mayor, ¿cuál es el acorde V?", ["Bb7", "C7", "G7", "F7"], 1),
      q("¿Cuál es el movimiento de fundamentales típico de un ii-V-I?", ["2ª ascendente", "5ª descendente", "3ª descendente", "4ª ascendente"], 1),
      q("¿Qué dos notas forman el 'shell voicing' de un acorde?", ["Fundamental y 5ª", "3ª y 7ª", "9ª y 13ª", "Fundamental y 7ª"], 1),
      q("¿Qué significa el cifrado C7/E?", ["C7 con la 9ª añadida", "C7 con E en el bajo", "C7 sostenido", "Un acorde de E7"], 1),
      q("¿Cuál es la tensión que se debe usar con cuidado en un acorde maj7 (I)?", ["9", "13", "11", "6"], 2),
      q("¿Qué significa 'm7b5'?", ["Tríada mayor con 7ª menor", "Tríada disminuida con 7ª menor", "Tríada menor con 7ª mayor", "Tríada aumentada con 7ª menor"], 1),
      q("En un sus4, ¿qué nota reemplaza a la 3ª?", ["2ª mayor", "4ª justa", "6ª mayor", "b7"], 1),
      q("¿Cuál es la fórmula de un acorde 6 (sexta)?", ["1-3-5-6", "1-3-5-7", "1-3-5-b7", "1-b3-5-6"], 0),
      q("En Do mayor, ¿cuál es el acorde ii?", ["Em7", "Dm7", "Am7", "Fmaj7"], 1),
      q("Sobre un iim7, usando la escala mayor de la tonalidad con centro en el ii, ¿qué modo estás tocando (sin nombrarlo aún)?", ["Mixolidio", "Dórico", "Lidio", "Locrio"], 1),
      q("¿Qué es un 'lead sheet'?", ["Una partitura orquestal completa", "Melodía y símbolos de acorde, sin arreglo fijo", "Solo los acordes sin melodía", "Una tablatura de guitarra"], 1),
      q("¿Qué indica 'D.S. al Coda'?", ["Repetir desde el inicio y terminar en Fine", "Volver al signo % y saltar a la Coda cuando se indique", "Tocar solo la introducción", "Cambiar de tonalidad"], 1),
      q("En la práctica estándar de jazz, ¿cuándo se toca la melodía ('head') de un tema?", ["Solo una vez, al inicio", "Solo durante los solos", "Al inicio y al final, con improvisación en medio", "Nunca, solo se improvisa"], 2),
      q("¿Qué función armónica cumple el grado V7?", ["Tónico", "Subdominante", "Dominante", "Ninguna"], 2),
      q("¿Cuál de estos acordes cumple función de tónico?", ["IVmaj7", "iiim7", "V7", "iim7"], 1)
    ]
  },

  // ============================================================
  // NIVEL 2 — INTERMEDIO
  // ============================================================
  {
    id: 2,
    slug: "n2",
    name: "Intermedio",
    subtitle: "Campo armónico menor, dominantes secundarios, sustitución tritonal y modos.",
    topics: [
      {
        title: "2.1 Campo armónico menor",
        html: `
          <p>La escala menor tiene tres formas (natural, armónica y melódica), y cada una genera un campo
          armónico distinto. En la práctica del jazz se combinan las tres según la función de cada acorde:</p>
          <ul>
            <li><b>im7</b> y <b>ivm7</b> suelen tomarse de la menor natural o dórica.</li>
            <li><b>V7</b> se toma de la menor armónica (necesita la sensible, 7º grado elevado).</li>
            <li><b>iim7b5</b> aparece tanto en natural como en armónica.</li>
          </ul>
          <p>Campo armónico "hibrido" típico en jazz menor (Do menor): <b>Cm(maj7) — Dm7b5 — Ebmaj7#5 — Fm7
          — G7 — Abmaj7 — B°7</b>.</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Cm(maj7) (i)","formula":[0,3,7,11],"rootPc":0},
            {"symbol":"Dm7b5 (ii)","formula":[2,5,8,0],"rootPc":2},
            {"symbol":"Ebmaj7#5 (bIII)","formula":[3,7,11,2],"rootPc":3},
            {"symbol":"Fm7 (iv)","formula":[5,8,0,3],"rootPc":5},
            {"symbol":"G7 (V)","formula":[7,11,2,5],"rootPc":7},
            {"symbol":"Abmaj7 (bVI)","formula":[8,0,3,7],"rootPc":8},
            {"symbol":"B°7 (vii)","formula":[11,2,5,8],"rootPc":11}
          ]'></div>
        `
      },
      {
        title: "2.2 El ii-V-i menor",
        html: `
          <p>El equivalente menor del ii-V-I es <b>iim7b5 — V7(b9) — im7</b>. En Do menor:
          <b>Dm7b5 — G7(b9) — Cm7</b>.</p>
          <p>El V7 suele llevar la tensión <b>b9</b> (y a veces b13) porque provienen de la escala menor
          armónica, dándole un color más oscuro y tenso que el ii-V-I mayor.</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Dm7b5 (ii)","formula":[2,5,8,0],"rootPc":2},
            {"symbol":"G7(b9) (V)","formula":[7,11,2,5,8],"rootPc":7},
            {"symbol":"Cm7 (i)","formula":[0,3,7,10],"rootPc":0}
          ]'></div>
        `
      },
      {
        title: "2.3 Dominantes secundarios",
        html: `
          <p>Un <b>dominante secundario</b> es un acorde de 7ª de dominante que no pertenece al campo armónico
          de la tonalidad, pero que funciona como "V7 de" otro grado diatónico. Se nombra <b>V7/x</b>
          ("cinco de x").</p>
          <p>Ejemplo en Do mayor: el acorde <b>A7</b> es <b>V7/ii</b> (dominante secundario de Dm7), porque
          A7 resuelve naturalmente a Dm7 igual que G7 resuelve a Cmaj7.</p>
          <p>Los dominantes secundarios son la forma más común de introducir cromatismo y color sin salir
          realmente de la tonalidad.</p>
          <p><b>Tensiones mayores vs. menores:</b> qué tensión le pones a un dominante secundario depende de
          la calidad del acorde diatónico al que resuelve. Los que resuelven a un acorde <b>mayor</b>
          (V7/IV, V7/V) usan tensiones "mayores" naturales: <b>9 y 13</b>. Los que resuelven a un acorde
          <b>menor</b> (V7/ii, V7/iii, V7/vi) usan tensiones "menores": <b>9 y b13</b>, porque esas tensiones
          deben ser diatónicas al acorde de destino, no al dominante en sí.</p>
        `
      },
      {
        title: "2.4 Sustitución tritonal",
        html: `
          <p>Todo acorde de 7ª de dominante puede sustituirse por otro dominante cuya fundamental está a
          distancia de <b>tritono</b> (3 tonos). Esto funciona porque ambos comparten la 3ª y la 7ª
          (invertidas entre sí).</p>
          <p>Ejemplo: <b>G7</b> puede sustituirse por <b>Db7</b> (subV7). Ambos comparten las notas B y F
          (3ª/7ª de G7 = 7ª/3ª de Db7).</p>
          <p>La sustitución tritonal crea un movimiento cromático descendente hacia la tónica
          (Db7 → C es movimiento de semitono), muy característico del sonido bebop.</p>
          <p><b>Casos especiales:</b> el subV7/iii y el subV7/vi funcionan mejor en <b>tiempo débil</b> y
          precedidos por su propio dominante secundario diatónico (por ejemplo, antes de Eb7 como subV7/vi,
          conviene pasar primero por su V7 diatónico correspondiente) — sin esa preparación, suenan menos
          convincentes que los demás subV7.</p>
          <p><b>El "relativo II":</b> cualquier subV7 puede antecederse con su propio <b>ii-7</b>, igual que
          harías con un V7 normal. Por ejemplo, en vez de tocar solo <b>Db7 — Cmaj7</b>, puedes tocar
          <b>Ab-7 — Db7 — Cmaj7</b> (Ab-7 es el ii-7 relativo de Db7), logrando una preparación más suave
          y un color extra antes de resolver.</p>
        `
      },
      {
        title: "2.5 Modos y relación acorde-escala",
        html: `
          <p>Cada grado de la escala mayor genera un <b>modo</b>, y cada modo tiene una "personalidad" sonora
          distinta según dónde estén sus semitonos:</p>
          <table class="jz-table">
            <tr><th>Grado</th><th>Modo</th><th>Uso típico sobre</th></tr>
            <tr><td>I</td><td>Jónico</td><td>Imaj7</td></tr>
            <tr><td>ii</td><td>Dórico</td><td>iim7 (menor con 6ª mayor)</td></tr>
            <tr><td>iii</td><td>Frigio</td><td>iiim7 (con b9 y b13)</td></tr>
            <tr><td>IV</td><td>Lidio</td><td>IVmaj7 (con #11)</td></tr>
            <tr><td>V</td><td>Mixolidio</td><td>V7</td></tr>
            <tr><td>vi</td><td>Eólico</td><td>vim7</td></tr>
            <tr><td>vii</td><td>Locrio</td><td>viim7b5</td></tr>
          </table>
          <p>Improvisar "modalmente" significa usar el modo correspondiente a cada acorde en vez de pensar
          solo en la escala mayor de origen.</p>
        `
      },
      {
        title: "2.6 El blues de 12 compases",
        html: `
          <p>El blues es una forma de <b>12 compases</b>. Cambia la tonalidad, compara variantes y alterna entre
          cifrado real y grados: así aprendes la estructura, no solo una tonalidad.</p>
          <div id="bluesFormMount"></div>
        `
      },
      {
        title: "2.7 ii-V encadenados y ciclo de quintas",
        html: `
          <p>Muchos standards encadenan varios ii-V seguidos, cada uno resolviendo (o no) antes de saltar al
          siguiente ii-V de otra tonalidad, siguiendo el <b>ciclo de quintas</b>.</p>
          <p>Ejemplo: <b>Dm7-G7 | Cmaj7-Cmaj7 | Am7-D7 | Gmaj7-Gmaj7</b> — dos ii-V-I distintos encadenados
          por el ciclo de quintas (Do mayor → Sol mayor).</p>
        `
      },
      {
        title: "2.8 Campo armónico completo: menor armónica y menor melódica",
        html: `
          <p>Además de la menor natural, la <b>menor armónica</b> y la <b>menor melódica</b> generan su propio
          campo armónico completo de siete tétradas. Conocerlos completos (no solo el V7 que se toma prestado)
          te permite reconocer y usar cualquiera de sus siete acordes.</p>
          <p><b>Campo armónico de Do menor armónica:</b><br>
          <code>Cm(maj7) — Dm7b5 — Ebmaj7(#5) — Fm7 — G7 — Abmaj7 — B°7</code></p>
          <p><b>Campo armónico de Do menor melódica (ascendente):</b><br>
          <code>Cm(maj7) — Dm7 — Ebmaj7(#5) — F7 — G7 — Am7b5 — Bm7b5</code></p>
          <p>Fíjate que la menor melódica genera <b>dos</b> acordes m7b5 (grados vi y vii), y que su IV grado
          es un dominante (F7) — esta es la base del modo lidio dominante que viste en el Nivel 4.</p>
          <p>Los 7 modos de la <b>menor armónica</b> también tienen nombre propio (útil para elegir la escala
          correcta sobre cada uno de sus acordes):</p>
          <table class="jz-table">
            <tr><th>Grado</th><th>Modo</th><th>Uso típico sobre</th></tr>
            <tr><td>I</td><td>Menor armónica (Eólico #7)</td><td>im(maj7)</td></tr>
            <tr><td>II</td><td>Locrio #6</td><td>iim7b5</td></tr>
            <tr><td>III</td><td>Jónico #5</td><td>bIIImaj7(#5)</td></tr>
            <tr><td>IV</td><td>Dórico #4 (dórico ucraniano)</td><td>ivm7</td></tr>
            <tr><td>V</td><td>Frigio dominante (frigio ♮3)</td><td>V7(b9)</td></tr>
            <tr><td>VI</td><td>Lidio #2</td><td>bVImaj7</td></tr>
            <tr><td>VII</td><td>Superlocria bb7 (alterada disminuida)</td><td>vii°7</td></tr>
          </table>
        `
      },
      {
        title: "2.9 Acordes disminuidos de paso y de función común",
        html: `
          <p>El acorde disminuido (°7) tiene dos usos armónicos muy frecuentes en jazz:</p>
          <ul>
            <li><b>Disminuido de paso (passing diminished)</b> — conecta cromáticamente dos acordes diatónicos
            separados por un tono, ocupando el espacio entre ellos. Ejemplo: <b>Cmaj7 — C#°7 — Dm7</b>
            (el C#°7 conecta I y ii por movimiento cromático ascendente).</li>
            <li><b>Disminuido de función común (common-tone diminished)</b> — comparte varias notas con el
            acorde que decora, actuando casi como una versión "coloreada" del mismo. Ejemplo: un °7 construido
            medio tono arriba de la fundamental de un acorde mayor frecuentemente funciona como su V7b9
            sin fundamental.</li>
          </ul>
          <p>Todo acorde °7 puede analizarse, de hecho, como un <b>V7(b9) sin fundamental</b>: por eso los
          cuatro acordes disminuidos existentes (C°7, C#°7, D°7, D#°7) son en realidad solo <b>tres</b> sonoridades
          distintas que se repiten cada menor tercera.</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Cmaj7 (I)","formula":[0,4,7,11],"rootPc":0},
            {"symbol":"C#°7 (paso cromático)","formula":[1,4,7,10],"rootPc":1},
            {"symbol":"Dm7 (ii)","formula":[2,5,9,0],"rootPc":2}
          ]'></div>
        `
      },
      {
        title: "2.10 Tipos de cadencia: auténtica, plagal, semicadencia y deceptiva",
        html: `
          <p>Una <b>cadencia</b> es el punto de llegada armónico de una frase. Ya conoces la más fuerte
          (V7 → I, "cadencia auténtica"); estas son las otras tres que también debes reconocer:</p>
          <ul>
            <li><b>Cadencia plagal (IV → I)</b> — el "amén" de los himnos, más suave que la auténtica porque
            no usa la tensión del tritono del V7. En jazz aparece como color de cierre alternativo, a veces
            como IVm7 → Imaj7 (con el intercambio modal del Nivel 3).</li>
            <li><b>Semicadencia (termina en V)</b> — la frase se detiene sobre el dominante en vez de resolver,
            dejando la sensación de "pregunta" a medio contestar. Muy común al final de la sección A en una
            forma AABA, antes de repetir o pasar al bridge.</li>
            <li><b>Cadencia deceptiva (V7 → vi u otro)</b> — como viste abajo, retrasa la resolución real.</li>
          </ul>
          <p>Una <b>resolución deceptiva</b> (o cadencia rota) ocurre cuando un V7 no resuelve al
          I esperado, sino a otro acorde que da continuidad sin llegar al reposo total — un recurso clásico
          para alargar una frase o sorprender al oído justo antes del final.</p>
          <p>En Do mayor, el V7 (G7) puede resolver "engañosamente" a cualquiera de estos acordes en vez de
          Cmaj7:</p>
          <ul>
            <li><b>vi (Am7)</b> — la resolución deceptiva más clásica y usada.</li>
            <li><b>iii (Em7)</b></li>
            <li><b>#ivm7b5 (F#m7b5)</b></li>
            <li><b>bIImaj7 (Dbmaj7)</b>, <b>bIIImaj7 (Ebmaj7)</b> y <b>bVImaj7 (Abmaj7)</b> — acordes
            prestados del intercambio modal.</li>
          </ul>
          <p>Ejemplo: <b>Cmaj7 — ... — G7 — Am7</b> (en vez de G7 — Cmaj7) retrasa el reposo final y le da
          más recorrido a la frase antes de resolver de verdad.</p>
        `
      },
      {
        title: "2.11 Repertorio recomendado del Real Book — Nivel 2",
        html: `
          <p>En este nivel busca temas con dominantes secundarios, ii-V encadenados y ii-V-i menor:</p>
          <ol class="repertoire-list">
            <li><b>All The Things You Are</b> — el standard de referencia obligada para dominantes secundarios
            y modulación por relativos.</li>
            <li><b>Just Friends</b> — ii-V encadenados con un giro de reharmonización al final del bridge.</li>
            <li><b>There Will Never Be Another You</b> — ciclo de quintas muy claro, ideal para practicar el Nivel 2.</li>
            <li><b>Green Dolphin Street</b> — combina secciones diatónicas con modulaciones directas simples.</li>
            <li><b>Stella By Starlight</b> — mucho ii-V-i menor y mayor alternados.</li>
            <li><b>Days of Wine and Roses</b> — ciclo de dominantes secundarios descendente muy melódico.</li>
            <li><b>Equinox</b> — blues menor, buen puente hacia el ii-V-i menor del Nivel 2.</li>
            <li><b>Mr. PC</b> — otro blues menor clásico, forma simple con armonía menor.</li>
            <li><b>Solar</b> — cadena de ii-V descendente por semitonos, muy formativo.</li>
            <li><b>My Funny Valentine</b> — balada con ii-V-i menor muy expuesto en la melodía.</li>
            <li><b>Have You Met Miss Jones</b> — el bridge modula por terceras mayores, un anticipo del ciclo de Coltrane del Nivel 3.</li>
          </ol>
          <p class="small-note">Resto del repertorio de tu lista que también encaja en este nivel (dominantes
          secundarios, ii-V encadenados, blues menor, bossa con algo más de color):</p>
          <p class="repertoire-extra">Au Privave · Billie's Bounce · Well You Needn't · Relaxin' at Camarillo ·
          Blues for Alice ·
          A Foggy Day · Afternoon in Paris · All of You · April in Paris · Beautiful Love · But Not for Me ·
          Dancing on the Ceiling · Devil May Care · I Love You · I Remember You · I Thought About You ·
          In Walked Bud · Lullaby of Birdland · My Romance · Softly as in a Morning Sunrise · Take Five ·
          The Way You Look Tonight · There Is No Greater Love · They Can't Take That Away From Me ·
          Time After Time · When the Lights Are Low · You and the Night and the Music · Cry Me a River ·
          Desafinado · Gentle Rain · Meditation · Speak Low · Triste · Israel · Stolen Moments · Very Early ·
          A Child Is Born · All Blues · My Favorite Things · Some Day My Prince Will Come · Could It Be You ·
          Misty · My Foolish Heart · When Sunny Gets Blue · Teach Me Tonight · That Old Feeling · Red Cross</p>
        `
      }
    ],
    quiz: [
      q("¿Cuál es el ii-V-i en Do menor?", ["Dm7-G7-Cm7", "Dm7b5-G7(b9)-Cm7", "Dm7-G7b9-Cmaj7", "Ebm7-Ab7-Cm7"], 1),
      q("¿Qué es un dominante secundario?", ["Un dominante diatónico", "Un V7 que resuelve a un grado que no es la tónica", "Un acorde disminuido", "Un acorde con sus4"], 1),
      q("En Do mayor, ¿qué acorde es V7/ii?", ["D7", "A7", "E7", "B7"], 1),
      q("¿A qué distancia está la sustitución tritonal de un dominante?", ["3ª mayor", "5ª justa", "Tritono (3 tonos)", "2ª menor"], 2),
      q("¿Cuál es el subV7 de G7?", ["Db7", "F#7", "Ab7", "C7"], 0),
      q("¿Qué modo corresponde al grado IV de la escala mayor?", ["Mixolidio", "Dórico", "Lidio", "Frigio"], 2),
      q("¿Qué modo se usa típicamente sobre un V7?", ["Lidio", "Mixolidio", "Locrio", "Eólico"], 1),
      q("¿Cuántos compases tiene un blues estándar?", ["8", "16", "12", "32"], 2),
      q("¿En qué compás del blues aparece típicamente el ii-V hacia la tónica?", ["1-2", "5-6", "9-10", "11-12"], 2),
      q("¿Qué escala genera la sensible necesaria para el V7 en modo menor?", ["Menor natural", "Menor armónica", "Menor pentatónica", "Dórica"], 1),
      q("¿Qué dos notas comparten G7 y su sustituto tritonal Db7?", ["Fundamental y 5ª", "3ª y 7ª (invertidas)", "9ª y 13ª", "Ninguna"], 1),
      q("El ciclo de quintas mueve las fundamentales por...", ["2ª mayor ascendente", "5ª descendente", "4ª descendente", "3ª menor"], 1),
      q("En el campo armónico de la menor melódica, ¿qué calidad tiene el grado IV?", ["Maj7", "m7", "7 (dominante)", "m7b5"], 2),
      q("¿Cuántos acordes m7b5 distintos aparecen en el campo armónico de la menor melódica?", ["Ninguno", "Uno", "Dos", "Tres"], 2),
      q("Un acorde °7 puede analizarse funcionalmente como...", ["Un ii-V completo", "Un V7(b9) sin fundamental", "Un acorde tónico", "Un sus4"], 1),
      q("¿Cuál es la resolución deceptiva más clásica de un V7 en mayor?", ["Al ii", "Al vi", "Al IV", "Al iii"], 1),
      q("Un dominante secundario que resuelve a un acorde menor (V7/ii, V7/iii, V7/vi) usa como tensiones...", ["9 y 13 naturales", "9 y b13", "Solo b9", "Ninguna tensión"], 1)
    ]
  },

  // ============================================================
  // NIVEL 3 — AVANZADO
  // ============================================================
  {
    id: 3,
    slug: "n3",
    name: "Avanzado",
    subtitle: "Intercambio modal, reharmonización, turnarounds y análisis de standards.",
    topics: [
      {
        title: "3.1 Intercambio modal",
        html: `
          <p>El <b>intercambio modal</b> (modal interchange / borrowed chords) consiste en usar acordes del
          modo paralelo (mismo tónica, distinta escala) dentro de una progresión. El caso más común es
          tomar prestados acordes del modo menor dentro de una pieza en mayor.</p>
          <p>Ejemplo en Do mayor: <b>Fm7</b> (iv menor prestado), <b>Ab maj7</b> (bVI), <b>Bb7</b> (bVII),
          <b>Db maj7</b> (bII, también llamado sustituto napolitano).</p>
          <p>Estos acordes generan color "oscuro" dentro de una tonalidad mayor sin necesidad de modular.</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Fm7 (iv prestado)","formula":[5,8,0,3],"rootPc":5},
            {"symbol":"Abmaj7 (bVI)","formula":[8,0,3,7],"rootPc":8},
            {"symbol":"Bb7 (bVII)","formula":[10,2,5,8],"rootPc":10},
            {"symbol":"Dbmaj7 (bII)","formula":[1,5,8,0],"rootPc":1}
          ]'></div>
        `
      },
      {
        title: "3.2 Dominantes sustitutos extendidos",
        html: `
          <p>Además del subV7 básico, existen dominantes alterados con tensiones específicas para reforzar
          su función:</p>
          <ul>
            <li><b>V7alt</b> — dominante con b9, #9, #11 y b13 (todas las tensiones alteradas)</li>
            <li><b>subV7</b> con extensiones — el sustituto tritonal también puede llevar 9, #11, 13</li>
            <li><b>V7sus(b9)</b> — dominante suspendido con novena menor, típico en jazz modal</li>
          </ul>
          <p>Estas variantes se escogen según el color deseado y la melodía que debe acomodar el acorde.</p>
        `
      },
      {
        title: "3.3 Técnicas básicas de reharmonización",
        html: `
          <p>Reharmonizar significa cambiar los acordes de una melodía sin alterar la melodía misma.
          Técnicas fundamentales:</p>
          <ul>
            <li><b>Sustitución diatónica</b> — reemplazar un acorde por otro del mismo campo armónico que
            comparta notas (ej. Cmaj7 por Am7, relativo menor).</li>
            <li><b>Sustitución por dominante secundario</b> — anteceder cualquier acorde diatónico con su
            propio V7.</li>
            <li><b>Sustitución tritonal</b> — reemplazar dominantes por su subV7.</li>
            <li><b>Reharmonización cromática</b> — insertar acordes de paso cromáticos entre dos acordes
            diatónicos.</li>
            <li><b>ii-V contiguos (de aproximación)</b> — insertar un ii-V completo extra, a distancia de
            tritono, semitono o tono del ii-V real, justo antes de él, como adorno cromático. Ejemplo: antes
            de <b>Dm7 — G7</b> en Do mayor, se puede insertar <b>Ebm7 — Ab7</b> (medio tono arriba) como
            aproximación descendente: <b>Ebm7 — Ab7 — Dm7 — G7 — Cmaj7</b>.</li>
          </ul>
        `
      },
      {
        title: "3.4 Turnarounds",
        html: `
          <p>Un <b>turnaround</b> es una progresión corta (normalmente 2 compases) que "regresa" hacia la
          tónica, usada al final de una frase o sección. El más clásico es <b>I-VI-ii-V</b>:</p>
          <p>En Do mayor: <b>Cmaj7 — A7 — Dm7 — G7</b> (el A7 es un dominante secundario de ii).</p>
          <p>Variantes: <b>I-bIII-ii-V</b> (con sustitución tritonal del VI), <b>iii-VI-ii-V</b>,
          y turnarounds cromáticos usados en bebop (ej. Cmaj7 - Eb7 - Dm7 - Db7).</p>
          <div id="turnaroundFormMount"></div>
        `
      },
      {
        title: "3.5 Forma AABA y rhythm changes",
        html: `
          <p>Muchos standards siguen la forma <b>AABA</b> de 32 compases (8+8+8+8). Un caso paradigmático
          es "I Got Rhythm" de Gershwin, cuya progresión (conocida como <b>rhythm changes</b>) es la base de
          decenas de temas de bebop.</p>
          <p>La sección A usa el turnaround I-VI-ii-V repetido; la sección B (bridge) suele armonizarse con
          una cadena de dominantes secundarios recorriendo el ciclo de quintas (III7-VI7-II7-V7).</p>
        `
      },
      {
        title: "3.6 Escalas simétricas sobre dominantes alterados",
        html: `
          <p>Sobre dominantes con tensiones alteradas se usan escalas <b>simétricas</b> (que se repiten por
          intervalos regulares):</p>
          <ul>
            <li><b>Escala disminuida (semitono-tono)</b> — se asocia típicamente con dominantes que tienen
            la <b>b9 como tensión característica</b> (de ahí que también aporte #9, 3ª, #11 y 13 natural,
            todas notas del acorde disminuido subyacente). No se debe reservar solo para "tensiones no
            alteradas": la b9 y la #9 sí son alteraciones — su uso más común es sobre V7(b9).</li>
            <li><b>Escala disminuida (tono-semitono)</b> — sobre acordes disminuidos (°7).</li>
            <li><b>Escala de tonos enteros</b> — sobre V7(#5) o V7(#11), sin tercera menor disponible.</li>
            <li><b>Escala alterada (superlocria)</b> — sobre V7alt, contiene todas las tensiones alteradas
            (b9, #9, #11, b13).</li>
          </ul>
          <p><b>Construcción práctica de un V7alt:</b> la forma más simple y confiable de armar (o recordar)
          un V7alt es esta regla: <b>V7alt = escala menor melódica construida un semitono arriba de la
          fundamental del dominante</b>. Ejemplo sobre <b>G7alt</b>: usa las notas de <b>Ab menor melódica</b>
          (Ab-Bb-B-Db-Eb-F-G) — automáticamente obtienes la 3ª (B), la 7ª (F) y las cuatro tensiones alteradas
          (b9=Ab, #9=Bb, #11=Db, b13=Eb) sin tener que calcular cada tensión por separado.</p>
          <div class="progression-mount" data-progression='[{"symbol":"G7alt (= Ab menor melódica)","formula":[7,8,10,11,1,3,5],"rootPc":7}]'></div>
        `
      },
      {
        title: "3.6b La escala y los acordes octatónicos",
        html: `
          <div id="octatonicMount"></div>
        `
      },
      {
        title: "3.7 Voicings sin fundamental (rootless) — sistema A/B",
        html: `
          <p>En piano y guitarra de acompañamiento (comping), el bajo casi siempre lo cubre otro instrumento
          (contrabajo), así que se omite la fundamental del acorde y se tocan solo 3ª, 5ª/tensión, 7ª y una
          tensión más. Bill Evans popularizó un sistema de dos voicings intercambiables para cada acorde:</p>
          <ul>
            <li><b>Voicing A</b> — desde la 3ª: 3-5-7-9</li>
            <li><b>Voicing B</b> — desde la 7ª: 7-9-3-13(o 5)</li>
          </ul>
          <p>En un ii-V-I, el voicing A del ii se convierte casi directamente en el voicing B del V (y viceversa),
          logrando una conducción de voces mínima y muy suave — la base del comping moderno de trío y cuarteto.</p>
          <p>Ejemplo sobre G7, donde la diferencia de color entre A y B se nota claramente (5ª vs. 13ª):</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"G7 — Voicing A (3-5-7-9)","formula":[11,2,5,9],"rootPc":7},
            {"symbol":"G7 — Voicing B (7-9-3-13)","formula":[5,9,11,4],"rootPc":7}
          ]'></div>
        `
      },
      {
        title: "3.8 Clichés de línea (line clichés)",
        html: `
          <p>Un <b>cliché de línea</b> es un movimiento cromático (ascendente o descendente) de una sola voz
          interna mientras el resto del acorde permanece estático o casi estático — un recurso melódico dentro
          de la armonía, muy usado en baladas y turnarounds.</p>
          <p>Ejemplo clásico descendente sobre Cmaj7: <b>Cmaj7 — Cmaj7(#5) — C6 — Cmaj7(#5)</b>, donde la voz
          superior baja cromáticamente G-G#-A-G# mientras las demás notas se mantienen. Ejemplo ascendente
          sobre Cm: <b>Cm — Cm(maj7) — Cm7 — Cm6</b> (7ª que sube desde 5ª hasta 6ª).</p>
          <div class="progression-mount" data-progression='[
            {"symbol":"Cm","formula":[0,3,7],"rootPc":0},
            {"symbol":"Cm(maj7)","formula":[0,3,7,11],"rootPc":0},
            {"symbol":"Cm7","formula":[0,3,7,10],"rootPc":0},
            {"symbol":"Cm6","formula":[0,3,7,9],"rootPc":0}
          ]'></div>
        `
      },
      {
        title: "3.9 Ciclo de Coltrane y sustituciones por terceras mayores",
        html: `
          <p>John Coltrane popularizó (en temas como "Giant Steps") un sistema de reharmonización que divide
          la octava en <b>tres tonalidades equidistantes por 3ª mayor</b> (el "ciclo de Coltrane" o "sistema
          de tres tonos"), en vez del ciclo de quintas tradicional.</p>
          <p>En la práctica, cada uno de los tres centros tonales se prepara con su propio <b>ii-V</b> (no
          solo con un dominante suelto). El análisis real de "Giant Steps" sobre un ii-V-I tradicional
          quedaría así: <b>Dm7 — Eb7 | Abmaj7 — B7 | Emaj7 — G7 | Cmaj7</b> — cada tónica (Ab, E, C) llega
          precedida por su dominante, y las tres tónicas están a 3ª mayor de distancia entre sí.</p>
          <p>Esta técnica se usa hoy como recurso de reharmonización avanzada sobre ii-V-I tradicionales,
          sustituyendo el V7 único por una cadena de dos dominantes (o dos ii-V) por terceras mayores.</p>
        `
      },
      {
        title: "3.10 Constant structure (CSCP)",
        html: `
          <p>El <b>constant structure</b> (o "movimiento estructural constante") consiste en encadenar varios
          acordes de <b>la misma calidad</b> (todos maj7, o todos m7) moviéndose por un intervalo simétrico,
          sin lógica de tensión-resolución — el interés está en el color y el movimiento paralelo, no en la
          función.</p>
          <p>Ejemplo con tétradas maj7 por terceras mayores (dividiendo la octava en 4 partes iguales):<br>
          <code>Cmaj7 — Ebmaj7 — Gbmaj7 — Amaj7</code></p>
          <p>Ejemplo con pares de ii-V menores moviéndose por terceras menores:<br>
          <code>Cm7 Dm7 | Fm7 Gm7 | Bbm7 Cm7 | Ebm7 Fm7</code></p>
          <p>Es un recurso más de color contemporáneo (Nivel 4) que de función tonal tradicional — encaja
          bien junto al ciclo de Coltrane como otra forma de organizar movimiento simétrico.</p>
        `
      },
      {
        title: "3.11 Modulación: directa y por acorde pivote",
        html: `
          <p>Modular es cambiar de tonalidad dentro de una pieza. Hay dos formas principales de hacerlo:</p>
          <ul>
            <li><b>Modulación directa</b> — el cambio de centro tonal es inmediato, sin preparación: el
            siguiente ii-V ya pertenece a la nueva tonalidad. Ejemplo: <b>Cmaj7 | Dm7 G7 | Bbmaj7</b>
            (el Dm7-G7 resuelve directo a Bb, no a Do).</li>
            <li><b>Modulación por acorde pivote</b> — se usa un acorde de transición (normalmente un dominante
            secundario de la tonalidad de origen que también funciona como preparación de la nueva) para
            suavizar el cambio. Ejemplo: <b>Cmaj7 | Dm7 G7 | Cmaj7 | Em7 A7 | Dmaj7</b> — el Em7-A7 funciona
            como iii-VI en Do, pero también como ii-V hacia Re, preparando la nueva tonalidad antes de
            llegar a ella.</li>
          </ul>
        `
      },
      {
        title: "3.12 Repertorio recomendado del Real Book — Nivel 3",
        html: `
          <p>En este nivel busca bebop, rhythm changes, temas modales y baladas con reharmonización densa:</p>
          <ol class="repertoire-list">
            <li><b>Oleo</b> — rhythm changes, la forma de referencia para este vocabulario.</li>
            <li><b>Anthropology</b> — otro clásico de rhythm changes, cabeza bebop muy densa rítmicamente.</li>
            <li><b>Donna Lee</b> — línea bebop virtuosa sobre una progresión de standard clásico.</li>
            <li><b>Confirmation</b> — mucho ii-V encadenado y dominantes secundarios a gran velocidad.</li>
            <li><b>Scrapple from the Apple</b> — combina rhythm changes con un bridge distinto.</li>
            <li><b>Ornithology</b> y <b>Yardbird Suite</b> — bebop clásico de Charlie Parker, buena pareja de práctica.</li>
            <li><b>So What</b> — armonía modal estática (Dórico), tu primer tema totalmente modal.</li>
            <li><b>Impressions</b> — misma estructura armónica que "So What", ideal para comparar.</li>
            <li><b>Maiden Voyage</b> — armonía modal con voicings cuartales.</li>
            <li><b>Footprints</b> — blues menor con giro modal, mezcla ambos mundos del Nivel 3.</li>
            <li><b>Stablemates</b> — reharmonización avanzada con muchos ii-V encadenados.</li>
            <li><b>Body And Soul</b> — balada con sustitución tritonal y modulaciones constantes.</li>
            <li><b>Round Midnight</b> — balada de armonía muy densa, buen cierre de nivel.</li>
          </ol>
          <p class="small-note">Resto del repertorio de tu lista que también encaja en este nivel (bebop,
          reharmonización avanzada, bossa/waltz con más color, baladas complejas):</p>
          <p class="repertoire-extra">A Night in Tunisia · Alone Together · Along Came Betty · High Fly ·
          Jordu · Ana Maria ·
          How High the Moon · Night and Day · Pent-Up House · Peri's Scope · This I Dig of You · Whisper Not ·
          You Go to My Head · How Insensitive · Recordame · Wave · Blue Trane · Alice in Wonderland ·
          Waltz for Debby · Four · My One and Only Love · Black Nile · Bolivia · Invitation · Aregin ·
          Boplicity · Cherokee · Cotton Tail · Groovin' High · Joy Spring · Lady Bird · Moose the Mooche ·
          Move · Ow · Passport · Seven Steps to Heaven · Tricotism · Perhaps · Serpent's Tooth · Tiny Capers ·
          Wail · Angel Eyes · Blue in Green · Peace · Soul Eyes · Yesterdays · Darn That Dream · Isotope</p>
        `
      }
    ],
    quiz: [
      q("¿Qué es el intercambio modal?", ["Cambiar de tonalidad", "Usar acordes del modo paralelo", "Tocar sin acordes", "Modular por semitono"], 1),
      q("En Do mayor, ¿qué acorde representa el 'iv menor prestado'?", ["Fm7", "Dm7", "Fmaj7", "F7"], 0),
      q("¿Qué tensiones contiene un V7alt?", ["9, 11, 13", "b9, #9, #11, b13", "9, #11, 13", "Ninguna"], 1),
      q("¿Cuál es el turnaround clásico I-VI-ii-V en Do mayor?", ["Cmaj7-A7-Dm7-G7", "Cmaj7-Dm7-G7-Cmaj7", "Cmaj7-Fmaj7-G7-Cmaj7", "Am7-Dm7-G7-Cmaj7"], 0),
      q("¿Cuántos compases tiene la forma AABA estándar?", ["16", "24", "32", "12"], 2),
      q("¿Qué progresión caracteriza el 'bridge' de rhythm changes?", ["ii-V-I repetido", "Cadena de dominantes secundarios por ciclo de quintas", "Blues de 12 compases", "Turnaround cromático"], 1),
      q("¿Qué escala se usa típicamente sobre un acorde disminuido (°7)?", ["Disminuida tono-semitono", "Disminuida semitono-tono", "Alterada", "Tonos enteros"], 0),
      q("¿Qué escala contiene todas las tensiones alteradas de un V7alt?", ["Mixolidia", "Alterada (superlocria)", "Dórica", "Lidia"], 1),
      q("La sustitución diatónica de Cmaj7 por su relativo menor sería...", ["Em7", "Am7", "Dm7", "Fmaj7"], 1),
      q("¿Qué técnica de reharmonización usa acordes de paso fuera de la tonalidad?", ["Sustitución diatónica", "Reharmonización cromática", "Intercambio modal", "Sustitución por dominante secundario"], 1),
      q("¿Sobre qué tipo de dominante se usa la escala de tonos enteros?", ["V7 con 9 y 13 naturales", "V7(#5) o V7(#11)", "V7sus4", "V7 con b9"], 1),
      q("En un turnaround bebop cromático, ¿qué función cumple el acorde intermedio (ej. Eb7 entre Cmaj7 y Dm7)?", ["Dominante secundario diatónico", "Acorde de paso cromático", "Sustituto diatónico", "Acorde prestado"], 1),
      q("¿Qué notas incluye un voicing rootless tipo 'A' (desde la 3ª)?", ["1-3-5-7", "3-5-7-9", "7-9-3-13", "1-5-9-13"], 1),
      q("¿Qué caracteriza a un cliché de línea?", ["Un cambio total de tonalidad", "Movimiento cromático de una sola voz mientras el resto es estático", "Una escala simétrica", "Un acorde disminuido de paso"], 1),
      q("¿Por qué intervalo se dividen las tonalidades en el ciclo de Coltrane?", ["5ª justa", "4ª justa", "3ª mayor", "2ª menor"], 2),
      q("¿Qué instrumento asume normalmente la fundamental cuando se usan voicings rootless?", ["El piano", "El contrabajo", "La guitarra", "Ninguno, se omite siempre"], 1),
      q("¿Qué caracteriza a una modulación directa?", ["Se usa un acorde pivote para prepararla", "El cambio de tonalidad es inmediato, sin preparación", "Nunca cambia de tonalidad realmente", "Solo ocurre en baladas"], 1),
      q("En el 'constant structure', los acordes se encadenan...", ["Por función tensión-resolución", "Todos de la misma calidad, movidos por un intervalo simétrico", "Solo con dominantes secundarios", "Siempre en ciclo de quintas"], 1)
    ]
  },

  // ============================================================
  // NIVEL 4 — CONTEMPORÁNEA Y COMPOSICIÓN
  // ============================================================
  {
    id: 4,
    slug: "n4",
    name: "Contemporánea y Composición",
    subtitle: "Armonía cuartal, estructuras superiores, armonía no funcional y composición.",
    topics: [
      {
        title: "4.1 Armonía cuartal y quintal",
        html: `
          <p>En lugar de construir acordes apilando terceras, la <b>armonía cuartal</b> los construye
          apilando <b>cuartas justas</b> (o cuartas aumentadas para evitar sonoridades demasiado abiertas).
          Es el sonido característico de pianistas como McCoy Tyner y de gran parte del jazz modal.</p>
          <p>Ejemplo de voicing cuartal sobre Dm7: <b>D — G — C — F</b> (cuartas ascendentes desde la
          fundamental). Estos voicings funcionan bien sobre progresiones modales de acordes por color
          (Dm7 dórico, por ejemplo) más que sobre progresiones funcionales rápidas.</p>
          <div class="progression-mount" data-progression='[{"symbol":"Voicing cuartal sobre Dm7 (D-G-C-F)","formula":[2,7,0,5],"rootPc":2}]'></div>
        `
      },
      {
        title: "4.2 Estructuras superiores y polichords",
        html: `
          <p>Una <b>estructura superior (upper structure)</b> es una tríada tocada sobre las tensiones de
          un acorde, generalmente un dominante. Se cifra como fracción: <b>G7(9,#11,13)</b> puede tocarse
          como <b>D/G7</b> (tríada de D sobre G7), aportando 9, #11 y 13 de forma clara y "pianística".</p>
          <p>Berklee sistematiza <b>13 estructuras superiores posibles</b> sobre un dominante, según en qué
          grado y con qué calidad de tríada se construyan. Aquí las 13, desarrolladas en detalle sobre C7,
          con el acorde completo resultante en piano:</p>
          <div id="upperStructMount"></div>
          <p>Un <b>polichord</b> lleva la idea más lejos: dos tríadas (o acordes) independientes tocados
          simultáneamente, sin relación funcional explícita entre ellas — a diferencia de la estructura
          superior (que sí tiene una función armónica clara dentro del dominante), el polichord se elige por
          el choque de color entre ambas tríadas, un recurso típico de la armonía contemporánea y del jazz
          de fusión. Ejemplo: <b>F#/C</b> (tríada de F# sobre tríada de C) — un tritono completo de choque
          entre ambas fundamentales.</p>
        `
      },
      {
        title: "4.3 Armonía no funcional y pandiatonicismo",
        html: `
          <p>La <b>armonía no funcional</b> se aleja de la lógica tensión-resolución del ii-V-I: los acordes
          se encadenan por color, por movimiento de voces suave, o por relación de escala compartida, sin que
          uno "resuelva" necesariamente en el siguiente.</p>
          <p>El <b>pandiatonicismo</b> usa exclusivamente las notas de una escala diatónica (sin alterar),
          combinadas libremente sin las reglas de conducción tradicionales — común en la música de Bill
          Evans, Wayne Shorter y en la escritura orquestal de Gil Evans.</p>
        `
      },
      {
        title: "4.4 Escalas modales contemporáneas",
        html: `
          <p>Más allá de los 7 modos de la escala mayor, la armonía contemporánea usa modos derivados de
          otras escalas madre:</p>
          <ul>
            <li><b>Lidio aumentado</b> (3er modo de la menor melódica) — sobre acordes maj7(#5)</li>
            <li><b>Lidio dominante</b> (4º modo de la menor melódica) — sobre V7(#11)</li>
            <li><b>Locrio ##2 / Locrio natural 9</b> (6º modo de la menor melódica) — sobre m7b5 en contexto menor</li>
            <li><b>Alterada / Superlocria</b> (7º modo de la menor melódica) — sobre V7alt</li>
          </ul>
          <p>Comprender que todos estos modos provienen de <b>una sola escala madre</b> (la menor melódica)
          transportada, simplifica enormemente su estudio y aplicación.</p>
        `
      },
      {
        title: "4.5 Fundamentos de composición jazz",
        html: `
          <p>Componer un tema de jazz implica decisiones de <b>forma</b> (AABA, blues, forma libre),
          <b>motivo</b> (una idea melódica corta que se desarrolla) y <b>contrafactual</b> (una melodía
          nueva escrita sobre la progresión de armónica de un standard existente, técnica muy usada en el
          bebop: "Anthropology" es un contrafactual de "I Got Rhythm").</p>
          <p>El <b>desarrollo motívico</b> — repetición, secuencia, inversión, aumentación/disminución
          rítmica de un motivo — es lo que le da coherencia a una composición o a un solo improvisado.</p>
        `
      },
      {
        title: "4.6 Drop voicings para piano y guitarra (drop 2, drop 3, drop 2&4, drop 2&3)",
        html: `
          <p>Los <b>drop voicings</b> parten siempre de la <b>posición cerrada (close voicing)</b> — las 4 notas
          del acorde apiladas dentro de una octava — y "sueltan" (drop) una o más voces una octava hacia abajo
          para abrir el sonido y hacerlo tocable en el instrumento. Se numeran contando las voces desde arriba:</p>
          <ul>
            <li><b>Close position</b> — las 4 notas juntas. Poco práctico en guitarra (dedos muy juntos);
            en piano es la base teórica de la que parten todos los drops.</li>
            <li><b>Drop 2</b> — se baja la <b>segunda voz</b> desde arriba una octava. Es el voicing más
            idiomático tanto en piano (mano izquierda o ambas manos) como en <b>guitarra</b>, porque el
            resultado cae naturalmente sobre las cuerdas 6-4 o 5-2 sin estiramientos imposibles. Es el drop
            más usado en comping de guitarra jazz.</li>
            <li><b>Drop 3</b> — se baja la <b>tercera voz</b> desde arriba una octava. Genera un salto más
            amplio entre la voz grave y el resto; en piano suena bien a dos manos, en guitarra es menos
            idiomático (requiere más apertura de mano) pero se usa para texturas específicas.</li>
            <li><b>Drop 2 &amp; 4</b> — se bajan la 2ª y la 4ª voz (la más grave) una octava. En piano crea una
            distribución muy equilibrada a dos manos; en guitarra es prácticamente imposible de tocar en
            un acorde de 4 notas en una sola posición, por lo que se reserva para arreglos a dos guitarras
            o piano.</li>
            <li><b>Drop 2 &amp; 3</b> — se bajan la 2ª y 3ª voz una octava. Menos común, produce una sonoridad
            más "cerrada por arriba, abierta por abajo"; útil en arreglos de sección de metales.</li>
          </ul>
          <p><b>Aplicación práctica:</b></p>
          <ul>
            <li><b>Guitarra</b> — el drop 2 es, por lejos, el voicing de comping más usado: encaja en los
            "4 sets de cuerdas" estándar (6-5-4-3, 5-4-3-2, 4-3-2-1) permitiendo tocar cualquier acorde en
            cualquier inversión de forma cómoda y desplazable por el mástil.</li>
            <li><b>Piano</b> — el drop 2 y el drop 2&4 son la base del "voicing a 4 voces" para mano izquierda
            o para acordes a dos manos; se combinan con las tensiones (9, #11, 13) sustituyendo la fundamental
            o la 5ª, tal como viste en los voicings rootless del Nivel 3.</li>
          </ul>
          <p><b>Formas reales en el diapasón:</b> aquí tienes el drop 2 (raíz en el bajo) de los 8 tipos de
          tétrada más comunes, calculado con raíz en Do y organizado por 6ª y 5ª cuerda — exactamente como
          pediste, para que veas la forma concreta en vez de solo leerla:</p>
          <div id="dropVoicingMount"></div>
        `
      },
      {
        title: "4.7 Armonía modal compositiva (acordes estáticos, color por escala)",
        html: `
          <p>En el jazz modal (Miles Davis, "So What"; John Coltrane, "Impressions") la armonía no avanza por
          función tensión-resolución, sino que permanece <b>estática</b> sobre un solo acorde/escala durante
          varios compases o secciones enteras, y el interés musical pasa de la progresión de acordes al
          <b>color modal</b> y a la textura.</p>
          <p>Ejemplo: "So What" usa solo dos acordes (Dm7 dórico y Ebm7 dórico) a lo largo de toda la forma
          AABA — el compositor elige el <b>modo</b> como material armónico completo, no como sustituto de una
          escala mayor.</p>
          <p>Recursos típicos: voicings cuartales (Nivel 4.1), pedales de bajo (siguiente tema) y cambios de
          color por desplazamiento del mismo voicing a otra fundamental sin cambiar de función.</p>
          <p>El famoso voicing de "So What" (Bill Evans): cuartas apiladas desde un tono por debajo de la
          fundamental, con una 3ª mayor arriba del todo — sobre Dm7 son las notas E-A-D-G-B:</p>
          <div class="progression-mount" data-progression='[{"symbol":"Voicing \"So What\" sobre Dm7","formula":[4,9,2,7,11],"rootPc":2}]'></div>
        `
      },
      {
        title: "4.8 Pedal de bajo y pedal armónico",
        html: `
          <p>Un <b>pedal</b> es una nota (generalmente en el bajo) que se sostiene o repite mientras la
          armonía por encima cambia. Es un recurso tanto de <b>forma</b> (genera tensión y expectativa antes
          de una resolución) como de <b>reharmonización</b> (permite tocar varios acordes distintos sobre una
          misma raíz).</p>
          <ul>
            <li><b>Pedal de tónica</b> — sostiene la tónica mientras se mueven acordes por encima; muy usado
            en introducciones y finales.</li>
            <li><b>Pedal de dominante</b> — sostiene la 5ª del tono, generando tensión prolongada antes de
            resolver a la tónica; común antes del último "A" en formas AABA.</li>
            <li><b>Pedal armónico</b> — no es literalmente una nota sostenida, sino un acorde o color que se
            repite como ancla mientras otros elementos (melodía, tensiones) se mueven encima.</li>
          </ul>
        `
      },
      {
        title: "4.9 Armonía negativa",
        html: `
          <p>La <b>armonía negativa</b> es una técnica de reharmonización (popularizada recientemente por
          músicos como Jacob Collier, aunque con raíces teóricas en Ernst Levy) que "refleja" cada acorde de
          una progresión respecto a un eje tonal (normalmente entre la tónica y la dominante), generando su
          acorde espejo.</p>
          <p>El efecto práctico: un acorde mayor tiende a reflejarse como su relativo menor "espejado" y un
          V7 tiende a convertirse en un acorde de subdominante menor con función equivalente — una manera
          sistemática de generar reharmonizaciones coherentes en vez de improvisarlas por prueba y error.</p>
          <p>Es una herramienta más de <b>color y variación</b>, no una regla obligatoria: se usa cuando el
          resultado suena musicalmente convincente, igual que cualquier otra técnica de reharmonización.</p>
        `
      },
      {
        title: "4.10 Acordes de función especial",
        html: `
          <p>En el blues y en muchos standards, ciertos acordes dominantes <b>no funcionan como dominantes
          secundarios literales</b> — su función real depende del contexto estilístico, no solo del intervalo
          hacia su resolución. Estos son los casos más comunes:</p>
          <table class="jz-table">
            <tr><th>Acorde</th><th>Función dominante "literal"</th><th>Función especial real</th><th>Escala típica</th><th>Resuelve a</th></tr>
            <tr><td>I7</td><td>V7/IV</td><td>Tónica-blues</td><td>Blues, lidio b7</td><td>(no resuelve, es color)</td></tr>
            <tr><td>IV7</td><td>subV7/iii</td><td>Subdominante-blues</td><td>Blues, lidio b7</td><td>(no resuelve, es color)</td></tr>
            <tr><td>bVII7</td><td>subV7/vi</td><td>Subdominante menor</td><td>Lidio b7</td><td>I</td></tr>
            <tr><td>bVI7</td><td>subV7/V</td><td>Subdominante menor alterada</td><td>Lidio b7</td><td>I</td></tr>
            <tr><td>II7</td><td>V7/V</td><td>Subdominante mayor alterada</td><td>Lidio b7</td><td>ii-7</td></tr>
            <tr><td>VII7</td><td>V7/iii</td><td>Cadencial</td><td>Frigio ♮3 (dominante)</td><td>I</td></tr>
          </table>
          <p>La idea clave: en un blues, el <b>I7</b> y el <b>IV7</b> no "resuelven" hacia ningún lado — son
          simplemente el color dominante característico del propio blues, funcionando como tónica y
          subdominante a la vez. Reconocer esta diferencia evita forzar una lógica de ii-V-I donde en realidad
          el estilo pide otra cosa.</p>
          <p><b>La "backdoor progression":</b> el movimiento <b>bVII7 → Imaj7</b> (Bb7 → Cmaj7 en Do) es tan
          común que tiene su propio nombre en inglés — "progresión de puerta trasera" — porque llega a la
          tónica "por atrás" en vez de por el V7 habitual. Se explica como <b>ivm7 — bVII7 — Imaj7</b>
          (Fm7 — Bb7 — Cmaj7), tomando prestado el ivm7 y su propio V7 (bVII7) del intercambio modal. Vas a
          escuchar este término constantemente en jam sessions en inglés, así que conviene reconocerlo por
          su nombre aunque el concepto ya lo tenías cubierto.</p>
        `
      },
      {
        title: "4.11 Acordes compuestos: sobre bajo, inversión, híbrido y acorde sobre acorde",
        html: `
          <p>La notación de "acorde con bajo" (slash chord) puede significar cosas muy distintas según el
          caso. Distinguir estas cuatro categorías te ayuda a leer e interpretar correctamente cualquier
          cifrado compuesto:</p>
          <ul>
            <li><b>Acorde sobre bajo (reinterpretación)</b> — el bajo hace que el oído reanalice todo el
            acorde como algo distinto. Ejemplo: <b>Fmaj7/G</b> suena, y se reescucha, como <b>G7sus4(9,13)</b>
            — el oído toma a G como la verdadera fundamental.</li>
            <li><b>Inversión real</b> — el bajo es una nota que ya pertenece al acorde escrito, solo que no es
            la fundamental. Ejemplo: <b>D7/F#</b> son literalmente las mismas notas que <b>F#m7b5(b13)</b> —
            depende de qué fundamental "elijas escuchar".</li>
            <li><b>Híbrido</b> — el bajo no encaja limpiamente ni como inversión ni como estructura superior
            clara; genera una sonoridad ambigua a propósito. Ejemplo: <b>C/D</b> (tríada de Do sobre bajo de
            Re) — ni es un acorde de D con función clara, ni una inversión de C.</li>
            <li><b>Acorde sobre acorde</b> — una tríada completa sobre una tétrada completa (no solo sobre un
            bajo), la misma idea que ya viste como estructura superior en el Nivel 4.2. Ejemplo:
            <b>D/Cmaj7 = Cmaj7(9,#11,13)</b>.</li>
          </ul>
        `
      },
      {
        title: "4.12 Conducción de voces básica para arreglo",
        html: `
          <p>Cuando escribes para varias voces (piano a 4 voces, dos guitarras, sección de metales), unas
          reglas simples de <b>conducción de voces</b> heredadas de la armonía clásica siguen aplicando y
          evitan que tus voicings suenen "sucios" al moverse de un acorde a otro:</p>
          <ul>
            <li><b>Evita quintas y octavas paralelas</b> entre las mismas dos voces — dos voces que se mueven
            en paralelo a distancia de 5ª o de 8ª pierden independencia y "vacían" el sonido (por eso el drop 2
            y el drop 3 reparten las voces de forma que esto casi nunca ocurra naturalmente).</li>
            <li><b>Prioriza el movimiento contrario u oblicuo</b> entre la voz más grave y la más aguda: si el
            bajo baja, que la melodía suba (o se quede quieta) siempre que puedas.</li>
            <li><b>Resuelve las notas sensibles</b> (7º grado, y las tensiones alteradas como b9 o #11) por
            grado conjunto en la dirección hacia la que "tiran" — normalmente la sensible sube y la 7ª de un
            dominante baja.</li>
            <li><b>Mueve el mínimo posible</b> entre acorde y acorde: si una nota es común a los dos acordes,
            mantenla en la misma voz en vez de saltar a otra — es la misma lógica de guide tones del Nivel 1,
            aplicada ahora a 4 voces completas en vez de solo 2.</li>
          </ul>
          <p>Estas reglas no son una camisa de fuerza — en jazz se rompen constantemente por color (los
          voicings cuartales del 4.1, por ejemplo, mueven varias voces en paralelo a propósito) — pero
          conocerlas te permite romperlas <i>a propósito</i> en vez de por accidente.</p>
        `
      },
      {
        title: "4.13 Repertorio recomendado del Real Book — Nivel 4",
        html: `
          <p>Para este nivel, temas con ciclo de Coltrane, armonía modal no funcional avanzada y vocabulario
          de Wayne Shorter/McCoy Tyner:</p>
          <ol class="repertoire-list">
            <li><b>Giant Steps</b> — el examen final del ciclo de Coltrane, tal cual lo estudiaste en el Nivel 3.</li>
            <li><b>Count Down</b> — reharmonización de Coltrane sobre "Tune Up", excelente comparación directa.</li>
            <li><b>Speak No Evil</b> — armonía modal/no funcional de Wayne Shorter, forma poco convencional.</li>
            <li><b>Witch Hunt</b> — otro Wayne Shorter con armonía ambigua y estática por secciones.</li>
            <li><b>Nardis</b> — armonía modal en menor, terreno común entre Miles Davis y Bill Evans.</li>
            <li><b>Nefertiti</b> — forma y armonía estática, la melodía y el acompañamiento casi se invierten en importancia.</li>
            <li><b>Half Nelson</b> — reharmonización densa sobre una progresión de standard clásico.</li>
            <li><b>Little Sunflower</b> — armonía modal/cuartal, ideal para aplicar los voicings del 4.1.</li>
            <li><b>Lazy Bird</b> — Coltrane con ii-V muy denso, buen cierre de todo el programa.</li>
            <li><b>Ju Ju</b> — armonía modal avanzada, forma poco cuadrada.</li>
          </ol>
          <p class="small-note">Resto del repertorio de tu lista que también encaja en este nivel (armonía
          simétrica, no funcional o de reharmonización extrema):</p>
          <p class="repertoire-extra">Con Alma · Windows · A Call for All Demons · Dolphin Dance ·
          Fee Fi Fo Fum · Wild Flower · Yes or No · Good Bye Pork Pie Hat · You Must Believe in Spring ·
          Infant Eyes</p>
        `
      }
    ],
    quiz: [
      q("¿Cómo se construyen los voicings de armonía cuartal?", ["Apilando terceras", "Apilando cuartas", "Apilando quintas", "Apilando segundas"], 1),
      q("¿Qué pianista es asociado clásicamente con el sonido cuartal?", ["Bill Evans", "McCoy Tyner", "Oscar Peterson", "Art Tatum"], 1),
      q("Sobre G7, ¿qué tríada como estructura superior aporta 9, #11 y 13?", ["Tríada de D", "Tríada de A", "Tríada de C", "Tríada de F"], 0),
      q("¿Qué caracteriza a la armonía no funcional?", ["Uso estricto de ii-V-I", "Encadenar acordes sin lógica de tensión-resolución tradicional", "Solo usar tríadas mayores", "Solo modular por semitono"], 1),
      q("El pandiatonicismo usa...", ["Solo notas alteradas", "Notas de una escala diatónica sin alterar, libremente combinadas", "Solo acordes disminuidos", "Cromatismo total"], 1),
      q("¿De qué escala madre provienen el lidio dominante y la alterada?", ["Mayor", "Menor armónica", "Menor melódica", "Menor natural"], 2),
      q("¿Sobre qué tipo de acorde se usa el modo lidio dominante?", ["maj7", "m7", "V7(#11)", "m7b5"], 2),
      q("¿Qué es un contrafactual en composición jazz?", ["Una melodía nueva sobre la armonía de un tema existente", "Una progresión sin melodía", "Un tema sin forma definida", "Una escala simétrica"], 0),
      q("¿En qué consiste un voicing 'drop 2'?", ["Bajar la nota más grave una octava", "Bajar la segunda voz desde arriba una octava", "Subir todas las voces una octava", "Eliminar la 5ª del acorde"], 1),
      q("¿Por qué el drop 2 es el voicing más idiomático en guitarra?", ["Porque usa solo dos notas", "Porque encaja naturalmente en los sets de 4 cuerdas del mástil", "Porque no requiere tensiones", "Porque siempre incluye la fundamental en el bajo"], 1),
      q("¿Qué voicing resulta de bajar la 2ª y la 4ª voz (la más grave) una octava?", ["Drop 3", "Drop 2&4", "Close voicing", "Drop 2&3"], 1),
      q("¿Qué es un polichord?", ["Un acorde con muchas tensiones", "Dos acordes/tríadas independientes tocados simultáneamente", "Un acorde cuartal", "Una escala simétrica"], 1),
      q("El desarrollo motívico incluye técnicas como...", ["Solo transposición literal", "Repetición, secuencia, inversión y variación rítmica", "Solo cambios de tonalidad", "Solo cambios de compás"], 1),
      q("¿Qué modo se usa típicamente sobre un maj7(#5)?", ["Lidio aumentado", "Mixolidio", "Dórico", "Locrio"], 0),
      q("En el jazz modal (ej. 'So What'), la armonía...", ["Cambia rápidamente por ii-V-I", "Permanece estática sobre un modo durante varios compases", "Usa solo acordes disminuidos", "Nunca usa voicings cuartales"], 1),
      q("¿Qué es un pedal de dominante?", ["Sostener la tónica todo el tema", "Sostener la 5ª del tono generando tensión antes de resolver", "Un acorde cuartal", "Una escala simétrica"], 1),
      q("¿En qué consiste la armonía negativa?", ["Usar solo acordes menores", "Reflejar cada acorde respecto a un eje tonal para generar su acorde espejo", "Eliminar todas las tensiones", "Tocar sin fundamental"], 1),
      q("En un blues, el acorde I7 funciona típicamente como...", ["V7/IV literal que debe resolver", "Color tónico-blues que no resuelve como dominante secundario", "Un acorde de intercambio modal", "Una estructura superior"], 1),
      q("¿Qué distingue a un 'híbrido' de una inversión real en un slash chord?", ["El híbrido siempre tiene bajo en la fundamental", "En el híbrido el bajo no encaja como nota propia del acorde superior", "Son exactamente lo mismo", "El híbrido no se puede cifrar con barra"], 1)
    ]
  }
];

// Helper para construir preguntas de forma compacta: q(pregunta, [opciones], indiceCorrecta)
function q(prompt, options, correctIndex, explanation) {
  return { prompt, options, correctIndex, explanation };
}
