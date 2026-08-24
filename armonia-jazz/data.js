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
      q("En Do mayor, ¿cuál es el acorde ii?", ["Em7", "Dm7", "Am7", "Fmaj7"], 1)
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
        `
      },
      {
        title: "2.2 El ii-V-i menor",
        html: `
          <p>El equivalente menor del ii-V-I es <b>iim7b5 — V7(b9) — im7</b>. En Do menor:
          <b>Dm7b5 — G7(b9) — Cm7</b>.</p>
          <p>El V7 suele llevar la tensión <b>b9</b> (y a veces b13) porque provienen de la escala menor
          armónica, dándole un color más oscuro y tenso que el ii-V-I mayor.</p>
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
          <p>El blues es la forma más influyente del jazz. La estructura básica en Do es:</p>
          <p><code>C7 | F7 | C7 | C7 | F7 | F7 | C7 | C7 | G7 | F7 | C7 | G7</code></p>
          <p>Variantes comunes: <b>blues con ii-V</b> en el compás 9-10 (Dm7-G7), <b>blues menor</b>
          (Cm7-Fm7-Cm7...) y <b>blues con sustitución tritonal</b> en el turnaround final.</p>
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
      q("Un acorde °7 puede analizarse funcionalmente como...", ["Un ii-V completo", "Un V7(b9) sin fundamental", "Un acorde tónico", "Un sus4"], 1)
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
            <li><b>Escala disminuida (semitono-tono)</b> — sobre V7 con 9, #11, 13 (no alteradas).</li>
            <li><b>Escala disminuida (tono-semitono)</b> — sobre acordes disminuidos (°7).</li>
            <li><b>Escala de tonos enteros</b> — sobre V7(#5) o V7(#11), sin tercera menor disponible.</li>
            <li><b>Escala alterada (superlocria)</b> — sobre V7alt, contiene todas las tensiones alteradas
            (b9, #9, #11, b13).</li>
          </ul>
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
        `
      },
      {
        title: "3.9 Ciclo de Coltrane y sustituciones por terceras mayores",
        html: `
          <p>John Coltrane popularizó (en temas como "Giant Steps") un sistema de reharmonización que divide
          la octava en <b>tres tonalidades equidistantes por 3ª mayor</b> (el "ciclo de Coltrane" o "sistema
          de tres tonos"), en vez del ciclo de quintas tradicional.</p>
          <p>Ejemplo: en vez de resolver directo V7-I, se inserta una cadena de dominantes que descienden por
          terceras mayores hacia la tónica: <b>B7 — Emaj7 — G7 — Cmaj7 — Eb7 — Abmaj7</b> — cada dominante
          resuelve a una tónica a distancia de 3ª mayor de la anterior.</p>
          <p>Esta técnica se usa hoy como recurso de reharmonización avanzada sobre ii-V-I tradicionales,
          sustituyendo el V7 único por una cadena de dos dominantes por terceras mayores.</p>
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
      q("¿Qué instrumento asume normalmente la fundamental cuando se usan voicings rootless?", ["El piano", "El contrabajo", "La guitarra", "Ninguno, se omite siempre"], 1)
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
        title: "4.1 Armonía cuartal y cuintal",
        html: `
          <p>En lugar de construir acordes apilando terceras, la <b>armonía cuartal</b> los construye
          apilando <b>cuartas justas</b> (o cuartas aumentadas para evitar sonoridades demasiado abiertas).
          Es el sonido característico de pianistas como McCoy Tyner y de gran parte del jazz modal.</p>
          <p>Ejemplo de voicing cuartal sobre Dm7: <b>D — G — C — F</b> (cuartas ascendentes desde la
          fundamental). Estos voicings funcionan bien sobre progresiones modales de acordes por color
          (Dm7 dórico, por ejemplo) más que sobre progresiones funcionales rápidas.</p>
        `
      },
      {
        title: "4.2 Estructuras superiores y polichords",
        html: `
          <p>Una <b>estructura superior (upper structure)</b> es una tríada tocada sobre las tensiones de
          un acorde, generalmente un dominante. Se cifra como fracción: <b>G7(9,#11,13)</b> puede tocarse
          como <b>D/G7</b> (tríada de D sobre G7), aportando 9, #11 y 13 de forma clara y "pianística".</p>
          <p>Un <b>polichord</b> lleva la idea más lejos: dos tríadas (o acordes) independientes tocados
          simultáneamente, sin relación funcional explícita entre ellas — un recurso típico de la armonía
          contemporánea y del jazz de fusión.</p>
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
      q("¿En qué consiste la armonía negativa?", ["Usar solo acordes menores", "Reflejar cada acorde respecto a un eje tonal para generar su acorde espejo", "Eliminar todas las tensiones", "Tocar sin fundamental"], 1)
    ]
  }
];

// Helper para construir preguntas de forma compacta: q(pregunta, [opciones], indiceCorrecta)
function q(prompt, options, correctIndex) {
  return { prompt, options, correctIndex };
}
