window.TLM_DATA = {
  levels: [
    {
      id: "musica",
      title: "¿Qué es la música?",
      subtitle: "Sonido, silencio y elementos musicales.",
      lead: "Antes de aprender símbolos, conviene comprender qué estamos organizando y qué escuchamos.",
      blocks: [
        {
          title: "Una definición útil para comenzar",
          html: "<p>La música puede entenderse como una organización intencional de sonidos y silencios en el tiempo. No todas las músicas se construyen del mismo modo ni persiguen la misma finalidad, por eso esta definición sirve como punto de partida y no como frontera absoluta.</p>"
        },
        {
          title: "Propiedades del sonido",
          html: "<ul><li><b>Altura:</b> permite percibir un sonido como más grave o más agudo.</li><li><b>Duración:</b> indica cuánto tiempo permanece un evento sonoro.</li><li><b>Intensidad:</b> se relaciona con la energía o nivel sonoro percibido.</li><li><b>Timbre:</b> ayuda a distinguir fuentes sonoras aunque produzcan alturas y niveles similares.</li></ul>"
        },
        {
          title: "Tres grandes ejes para empezar",
          html: "<p><b>Ritmo</b> organiza el tiempo; <b>melodía</b> organiza alturas sucesivas; <b>armonía</b> estudia relaciones entre alturas simultáneas y su movimiento. Para describir música con más precisión también necesitamos textura, forma, dinámica y timbre.</p>"
        },
        {
          title: "Escuchar antes de nombrar",
          html: "<div class='lesson-example'>Pregunta guía: si mantienes las mismas notas pero cambias sus duraciones, ¿sigue siendo exactamente la misma idea musical? ¿Y si mantienes el ritmo pero cambias todas las alturas?</div>"
        }
      ]
    },
    {
      id: "lectura",
      title: "Cómo se representa la música",
      subtitle: "Eje vertical: altura · eje horizontal: tiempo.",
      lead: "La notación permite convertir relaciones sonoras y temporales en información visual.",
      blocks: [
        {
          title: "Vertical y horizontal",
          html: "<div class='orientation-demo'><div class='orientation-card'><b>VERTICAL · ALTURA</b><p>La posición de una nota en el pentagrama informa sobre su altura relativa.</p></div><div class='orientation-card'><b>HORIZONTAL · TIEMPO</b><p>La sucesión de figuras, silencios, compases y barras organiza la duración y el avance temporal.</p></div></div>"
        },
        {
          title: "Pentagrama, claves y notas",
          html: "<p>El pentagrama ofrece un sistema de referencia. La clave asigna nombres y registros a sus líneas y espacios. Las líneas adicionales extienden ese sistema cuando la altura queda fuera del pentagrama.</p><div class='reference-grid'><div class='symbol-guide'><b class='music-glyph'>&#xE050;</b><span>Clave de sol</span><small>Registro medio y agudo</small></div><div class='symbol-guide'><b class='music-glyph'>&#xE062;</b><span>Clave de fa en cuarta</span><small>Registro medio y grave</small></div><div class='symbol-guide'><b class='music-glyph'>&#xE05C;</b><span>Clave de do</span><small>Usada en registros específicos</small></div><div class='symbol-guide'><b class='notation-text'>{</b><span>Gran pentagrama</span><small>Une sol y fa; Do4 conecta ambos</small></div></div>"
        },
        {
          title: "Duración: figuras y silencios",
          html: "<p>Las figuras representan duraciones relativas. A cada figura le corresponde un silencio de igual valor. La lectura musical combina continuamente información de altura y de duración.</p>"
        },
        {
          title: "Tabla completa de figuras y silencios",
          html: `<div class="reference-panel"><p>El valor exacto depende del compás. Esta tabla muestra la proporción tomando la redonda como unidad.</p><div class="table-scroll"><table class="music-reference-table"><thead><tr><th>Figura</th><th>Nota</th><th>Silencio</th><th>Relación</th></tr></thead><tbody><tr><td>Redonda</td><td class="music-glyph">&#xECA2;</td><td class="music-glyph rest-glyph-cell">&#xE4E3;</td><td>1 unidad</td></tr><tr><td>Blanca</td><td class="music-glyph">&#xECA3;</td><td class="music-glyph rest-glyph-cell">&#xE4E4;</td><td>1/2</td></tr><tr><td>Negra</td><td class="music-glyph">&#xECA5;</td><td class="music-glyph rest-glyph-cell">&#xE4E5;</td><td>1/4</td></tr><tr><td>Corchea</td><td class="music-glyph">&#xECA7;</td><td class="music-glyph rest-glyph-cell">&#xE4E6;</td><td>1/8</td></tr><tr><td>Semicorchea</td><td class="music-glyph">&#xECA9;</td><td class="music-glyph rest-glyph-cell">&#xE4E7;</td><td>1/16</td></tr><tr><td>Fusa</td><td class="music-glyph">&#xECAB;</td><td class="music-glyph rest-glyph-cell">&#xE4E8;</td><td>1/32</td></tr><tr><td>Semifusa</td><td class="music-glyph">&#xECAD;</td><td class="music-glyph rest-glyph-cell">&#xE4E9;</td><td>1/64</td></tr></tbody></table></div><p class="reference-note-copy">Cada silencio dura lo mismo que la figura situada en su fila. Las barras agrupan corcheas y figuras menores para hacer visible la subdivisión del pulso.</p></div>`
        },
        {
          title: "Alteraciones y escritura básica",
          html: `<div class="reference-grid five"><div class="symbol-guide"><b class="music-glyph">&#xE262;</b><span>Sostenido</span><small>Sube un semitono</small></div><div class="symbol-guide"><b class="music-glyph">&#xE260;</b><span>Bemol</span><small>Baja un semitono</small></div><div class="symbol-guide"><b class="music-glyph">&#xE261;</b><span>Becuadro</span><small>Anula la alteración</small></div><div class="symbol-guide"><b class="music-glyph">&#xE263;</b><span>Doble sostenido</span><small>Sube un tono</small></div><div class="symbol-guide"><b class="music-glyph">&#xE264;</b><span>Doble bemol</span><small>Baja un tono</small></div></div><div class="lesson-example"><b>Regla de lectura:</b> una alteración accidental afecta esa misma nota y octava hasta el final del compás, salvo que aparezca otra alteración. La armadura, en cambio, se aplica durante toda la sección.</div>`
        },
        {
          title: "Convenciones de escritura",
          html: `<div class="reference-grid"><div class="symbol-guide"><b class="notation-text">&#x2191; &#x2669;</b><span>Plica hacia arriba</span><small>A la derecha de la cabeza; habitual bajo la línea central</small></div><div class="symbol-guide"><b class="notation-text">&#x2669; &#x2193;</b><span>Plica hacia abajo</span><small>A la izquierda; habitual sobre la línea central</small></div><div class="symbol-guide"><b class="notation-text">&#x266B;</b><span>Barras de unión</span><small>Agrupan por pulso y hacen visible la métrica</small></div><div class="symbol-guide"><b class="notation-text">&#x2014; &#x25CF; &#x2014;</b><span>Línea adicional</span><small>Debe sobrepasar claramente la cabeza</small></div></div>`
        },
        {
          title: "Barras, repeticiones y navegación",
          html: `<div class="reference-grid"><div class="symbol-guide"><b class="notation-text">|</b><span>Barra de compás</span><small>Separa compases</small></div><div class="symbol-guide"><b class="notation-text">||</b><span>Doble barra</span><small>Separa secciones</small></div><div class="symbol-guide"><b class="notation-text">||:</b><span>Inicio de repetición</span><small>Comienza el fragmento</small></div><div class="symbol-guide"><b class="notation-text">:||</b><span>Fin de repetición</span><small>Vuelve al inicio indicado</small></div><div class="symbol-guide"><b class="notation-text">1. / 2.</b><span>Casillas</span><small>Finales alternativos</small></div><div class="symbol-guide"><b class="notation-text">D.C.</b><span>Da Capo</span><small>Vuelve al comienzo</small></div><div class="symbol-guide"><b class="notation-text">D.S.</b><span>Dal Segno</span><small>Vuelve al signo</small></div><div class="symbol-guide"><b class="notation-text">Fine / Coda</b><span>Destino</span><small>Final o sección de salida</small></div></div>`
        }
      ]
    },
    {
      id: "ritmo",
      title: "Ritmo, pulso y compás",
      subtitle: "Organizar la duración.",
      lead: "El ritmo no es solo contar figuras: es percibir pulsos, subdivisiones, acentos y patrones.",
      blocks: [
        { title:"Pulso, tempo, metrónomo y BPM", html:"<p>El <b>pulso</b> es una referencia periódica; el <b>tempo</b> indica su velocidad. El <b>metrónomo</b> produce pulsos regulares para estudiar esa velocidad y se ajusta en <b>BPM</b> (pulsos por minuto). Por ejemplo, negra = 60 significa una negra por segundo.</p><div class='lesson-example'><b>Cómo practicar:</b> escucha primero el metrónomo, marca el pulso con la mano o el pie y después toca. El BPM mide velocidad; no reemplaza la musicalidad ni obliga a acentuar todos los pulsos igual.</div>" },
        { title:"Referencia aproximada de tempo", html:`<div class="reference-panel"><div class="table-scroll"><table class="music-reference-table tempo-table"><thead><tr><th>Indicación</th><th>BPM orientativos</th><th>Carácter general</th></tr></thead><tbody><tr><td>Largo</td><td>40-60</td><td>Muy amplio</td></tr><tr><td>Adagio</td><td>66-76</td><td>Lento y reposado</td></tr><tr><td>Andante</td><td>76-108</td><td>Movimiento moderado</td></tr><tr><td>Moderato</td><td>108-120</td><td>Moderado</td></tr><tr><td>Allegro</td><td>120-168</td><td>Rápido y animado</td></tr><tr><td>Presto</td><td>168-200</td><td>Muy rápido</td></tr></tbody></table></div><p class="reference-note-copy">Los rangos son orientativos y pueden solaparse. La época, el género, el fraseo y la indicación del compositor tienen prioridad.</p></div>` },
        { title:"Cómo se lee un compás", html:`<div class="meter-anatomy"><div class="time-signature-large"><span>4</span><span>4</span></div><div><p><b>Numerador:</b> indica cuántas unidades métricas se agrupan.</p><p><b>Denominador:</b> indica la figura de referencia: 2 = blanca, 4 = negra, 8 = corchea.</p></div></div><p>El compás agrupa pulsos y crea patrones de acentuación. En los compases simples cada pulso se subdivide normalmente en dos; en los compuestos, en tres.</p>` },
        { title:"Tipos de compás y acentuación", html:`<div class="table-scroll"><table class="music-reference-table"><thead><tr><th>Compás</th><th>Familia</th><th>Pulsos percibidos</th><th>Subdivisión</th><th>Acentos habituales</th></tr></thead><tbody><tr><td>2/4</td><td>Simple binario</td><td>2 negras</td><td>2 por pulso</td><td><b>F</b> - d</td></tr><tr><td>3/4</td><td>Simple ternario</td><td>3 negras</td><td>2 por pulso</td><td><b>F</b> - d - d</td></tr><tr><td>4/4</td><td>Simple cuaternario</td><td>4 negras</td><td>2 por pulso</td><td><b>F</b> - d - sf - d</td></tr><tr><td>6/8</td><td>Compuesto binario</td><td>2 negras con puntillo</td><td>3 por pulso</td><td><b>F</b> - d</td></tr><tr><td>9/8</td><td>Compuesto ternario</td><td>3 negras con puntillo</td><td>3 por pulso</td><td><b>F</b> - d - d</td></tr><tr><td>12/8</td><td>Compuesto cuaternario</td><td>4 negras con puntillo</td><td>3 por pulso</td><td><b>F</b> - d - sf - d</td></tr></tbody></table></div><p class="reference-note-copy">F = fuerte, sf = semifuerte, d = débil. Son jerarquías métricas de referencia, no acentos obligatorios en cada interpretación.</p>` },
        { title:"Ritmo real", html:"<p>Puntillo, ligadura, síncopa, contratiempo y tresillos muestran que el ritmo musical puede desplazarse respecto de los acentos métricos básicos.</p>" },
        { title:"Silencios", html:"<p>Los silencios representan duraciones sin ataque sonoro. Tienen valores equivalentes a las figuras y participan activamente en la organización del ritmo.</p>" },
        { title:"Puntillo", html:"<p>El puntillo añade a una figura la mitad de su valor original. Una negra con puntillo dura 1,5 pulsos cuando la negra vale un pulso.</p>" },
        { title:"Ligadura de prolongación", html:"<p>Une dos notas de la misma altura y suma sus duraciones sin repetir el ataque de la segunda nota.</p>" },
        { title:"Síncopa y contratiempo", html:"<p>La síncopa desplaza el peso rítmico hacia una parte débil o prolonga un sonido débil sobre una parte fuerte. El contratiempo enfatiza posiciones débiles mediante ataques separados por silencios.</p>" },
        { title:"Tresillo", html:"<p>El tresillo divide en tres partes iguales un espacio que normalmente se dividiría en dos. Tres corcheas de tresillo ocupan el tiempo de dos corcheas normales.</p>" },
        { title:"Compases compuestos", html:"<p>En compases como 6/8, 9/8 y 12/8, cada pulso principal se subdivide normalmente en tres partes iguales. Por ejemplo, 6/8 suele sentirse como dos pulsos de negra con puntillo.</p>" }
        ,{ title:"Otros signos temporales esenciales", html:`<div class="reference-grid"><div class="symbol-guide"><b class="music-glyph">&#xE4C0;</b><span>Calderón</span><small>Suspende temporalmente el pulso</small></div><div class="symbol-guide"><b class="notation-text">Anacrusa</b><span>Compás incompleto</span><small>Notas antes del primer pulso fuerte</small></div><div class="symbol-guide"><b class="notation-text">R·4</b><span>Silencio de varios compases</span><small>El número indica cuántos</small></div><div class="symbol-guide"><b class="notation-text">&#x2669;.</b><span>Puntillo</span><small>Suma la mitad del valor</small></div><div class="symbol-guide"><b class="notation-text">&#x2669;..</b><span>Doble puntillo</span><small>Suma la mitad y la cuarta parte</small></div><div class="symbol-guide"><b class="notation-text">3</b><span>Tresillo</span><small>Tres en el tiempo habitual de dos</small></div><div class="symbol-guide"><b class="notation-text">&#x2669; &#x2322; &#x2669;</b><span>Ligadura de prolongación</span><small>Suma duraciones sin un nuevo ataque</small></div><div class="symbol-guide"><b class="notation-text">silencio + &#x2669;</b><span>Contratiempo</span><small>Ataque débil precedido por silencio</small></div></div>` }
      ]
    },
    {
      id: "intervalos",
      title: "Altura e intervalos",
      subtitle: "Medir relaciones entre sonidos.",
      lead: "Un intervalo no es una lista para memorizar: es la forma básica de describir la distancia y relación entre alturas.",
      blocks: [
        { title:"Tono y semitono", html:"<p>En el sistema temperado occidental, el semitono es la unidad cromática habitual. Dos semitonos forman un tono.</p>" },
        { title:"Número y cualidad", html:"<p>El número describe cuántos nombres de nota abarca el intervalo; la cualidad distingue variantes como mayor, menor, justa, aumentada o disminuida.</p>" },
        { title:"Melódico y armónico", html:"<p>Dos alturas sucesivas forman un intervalo melódico; simultáneas, un intervalo armónico. Esta distinción conecta directamente melodía y armonía.</p>" },
        { title:"Clasificación e inversión", html:`<div class="table-scroll"><table class="music-reference-table"><thead><tr><th>Familia</th><th>Intervalos básicos</th><th>Al invertir</th></tr></thead><tbody><tr><td>Justos</td><td>1, 4, 5 y 8</td><td>Justo permanece justo</td></tr><tr><td>Mayores / menores</td><td>2, 3, 6 y 7</td><td>Mayor se convierte en menor</td></tr><tr><td>Aumentados / disminuidos</td><td>Cualquier número</td><td>Aumentado se convierte en disminuido</td></tr></tbody></table></div><div class="interval-inversion-strip"><span>1 &#x2194; 8</span><span>2 &#x2194; 7</span><span>3 &#x2194; 6</span><span>4 &#x2194; 5</span></div><p class="reference-note-copy">Un intervalo simple no supera la octava; uno compuesto sí. Para invertirlo, una nota cambia de octava y los números resultantes suman 9.</p>` },
        { title:"Enarmonía", html:"<p>Dos notas son <b>enarmónicas</b> cuando suenan a la misma altura en el sistema temperado pero se escriben con nombres distintos, como Do sostenido y Re bemol. La escritura correcta depende de la escala, la dirección melódica y la función tonal.</p><div class='enharmonic-examples'><span>C&#x266F; = D&#x266D;</span><span>F&#x266F; = G&#x266D;</span><span>B = C&#x266D;</span></div>" }
      ]
    },
    {
      id: "escalas",
      title: "Escalas",
      subtitle: "Organizar familias de alturas.",
      lead: "Una escala organiza un conjunto de alturas mediante un patrón de distancias.",
      blocks: [
        { title:"De intervalos a escalas", html:"<p>Cuando encadenamos relaciones interválicas con un patrón estable podemos construir escalas. Por eso los intervalos son un prerrequisito real de la escala.</p>" },
        { title:"Mayor y menor", html:"<p>Las escalas mayor y menor son referencias fundamentales de la música tonal occidental. Sus grados adquieren funciones y tendencias distintas.</p>" },
        { title:"Diatónico y cromático", html:"<p>Una nota diatónica pertenece al material de la escala considerada; una nota cromática introduce una altura externa o alterada respecto de ese marco.</p>" }
      ]
    },
    {
      id: "tonalidad",
      title: "Tonalidad",
      subtitle: "Centro, grados y jerarquía.",
      lead: "Tener una escala no basta: la tonalidad explica por qué unas notas se sienten más estables y otras generan dirección.",
      blocks: [
        { title:"La tónica", html:"<p>La tonalidad organiza relaciones alrededor de un centro llamado <b>tónica</b>. Los grados no tienen todos el mismo peso funcional.</p>" },
        { title:"Armadura", html:"<p>La armadura resume alteraciones propias de una tonalidad en la notación y evita repetirlas continuamente.</p>" },
        { title:"Círculo de quintas", html:"<p>El círculo de quintas muestra relaciones entre tonalidades y permite entender progresivamente el orden de sostenidos y bemoles.</p>" }
      ]
    },
    {
      id: "expresion-forma",
      title: "Expresión, textura y forma",
      subtitle: "Cómo cambia la música más allá de las notas.",
      lead: "La misma melodía puede sentirse completamente distinta si cambian su dinámica, articulación, timbre, textura, tempo o forma.",
      blocks: [
        {
          title: "Dinámica",
          html: "<p>La dinámica describe niveles y cambios de intensidad musical. Indicaciones como <b>p</b>, <b>mf</b> o <b>f</b> orientan la energía sonora, mientras <b>crescendo</b> y <b>diminuendo</b> describen cambios graduales.</p>"
        },
        {
          title: "Articulación",
          html: "<p>La articulación describe cómo comienza, se sostiene y termina cada nota. Legato, staccato y acento pueden transformar una misma sucesión de alturas sin cambiar sus notas.</p>"
        },
        {
          title: "Guía visual de dinámica y articulación",
          html: `<div class="expression-reference"><div><h4>Dinámica</h4><div class="dynamic-scale"><span>pp<small>muy suave</small></span><span>p<small>suave</small></span><span>mp<small>medio suave</small></span><span>mf<small>medio fuerte</small></span><span>f<small>fuerte</small></span><span>ff<small>muy fuerte</small></span></div><div class="hairpin-guide"><span>&lt; crescendo</span><span>&gt; diminuendo</span></div></div><div><h4>Articulación</h4><div class="reference-grid"><div class="symbol-guide"><b class="notation-text">&#x2022;</b><span>Staccato</span><small>Corto y separado</small></div><div class="symbol-guide"><b class="notation-text">&#x2014;</b><span>Tenuto</span><small>Sostiene el valor</small></div><div class="symbol-guide"><b class="notation-text">&gt;</b><span>Acento</span><small>Ataque destacado</small></div><div class="symbol-guide"><b class="notation-text">&#x2322;</b><span>Legato</span><small>Notas conectadas</small></div></div></div></div>`
        },
        {
          title: "Tempo y carácter",
          html: "<p>El tempo determina la velocidad del pulso. Cambiarlo modifica la percepción de energía, peso y movimiento, aunque el patrón rítmico escrito permanezca igual.</p>"
        },
        {
          title: "Timbre",
          html: "<p>El timbre permite diferenciar fuentes sonoras. Dos instrumentos pueden tocar la misma nota con igual duración e intensidad y aun así sonar claramente distintos.</p>"
        },
        {
          title: "Textura",
          html: "<p>La textura describe cómo se relacionan las capas musicales. Una línea sola produce textura monofónica; una melodía con acompañamiento puede ser homofónica; varias líneas independientes pueden formar una textura polifónica.</p>"
        },
        {
          title: "Forma",
          html: "<p>La forma organiza secciones a mayor escala. Modelos como A–B, A–B–A o A–A–B–A ayudan a reconocer repetición, contraste y retorno.</p>"
        },
        {
          title: "La interpretación también construye significado",
          html: "<p>Leer correctamente las notas y el ritmo es solo una parte de la interpretación. Dinámica, articulación, tempo, timbre y fraseo convierten la información escrita en una realización musical concreta.</p>"
        }
      ]
    },
    {
      id: "puente-armonia",
      title: "Puente hacia la armonía",
      subtitle: "De escala a acorde y función.",
      lead: "Este nivel cierra Teoría y Lectura Musical y prepara el ingreso a Armonía Funcional.",
      blocks: [
        { title:"Motivo y frase", html:"<p>Un motivo es una idea musical breve y reconocible. Una frase organiza uno o varios motivos en una unidad con dirección y sentido temporal.</p>" },
        { title:"Contorno melódico", html:"<p>Una melodía puede ascender, descender, repetirse o alternar direcciones. El contorno resume la forma general de ese movimiento.</p>" },
        { title:"Grados conjuntos y saltos", html:"<p>El movimiento por grados conjuntos avanza entre notas vecinas de una escala; un salto recorre una distancia mayor. La combinación de ambos produce variedad y dirección.</p>" },
        { title:"Repetición y secuencia", html:"<p>La repetición conserva una idea; la secuencia repite un patrón trasladándolo a otra altura. Ambas técnicas ayudan a construir continuidad y memoria.</p>" },
        { title:"Notas estructurales y notas de paso", html:"<p>Algunas notas sostienen puntos importantes de la frase, mientras otras conectan esos puntos mediante movimiento melódico. Una nota de paso enlaza dos notas estructurales por movimiento conjunto.</p>" },
        { title:"Notas melódicas secundarias", html:`<div class="reference-grid"><div class="symbol-guide"><b class="melodic-arrow">&#x2197; &#x2197;</b><span>Nota de paso</span><small>Conecta dos notas distintas por grado conjunto</small></div><div class="symbol-guide"><b class="melodic-arrow">&#x2197; &#x2198;</b><span>Bordadura</span><small>Sale de una nota y regresa a ella</small></div><div class="symbol-guide"><b class="melodic-arrow">&#x21A5; &#x2197;</b><span>Aproximación no preparada</span><small>Llega por grado conjunto después de salto o silencio</small></div><div class="symbol-guide"><b class="melodic-arrow">&#x2192;|</b><span>Anticipación rítmica</span><small>Adelanta una nota importante antes del tiempo esperado</small></div></div><p class="reference-note-copy">Estas notas tienen una función principalmente horizontal: ayudan a conducir la melodía hacia puntos estructurales. Trinos y otros ornamentos embellecen una nota sin cambiar por sí solos la estructura de la frase.</p>` },
        { title:"Frase, equilibrio y dirección", html:"<p>Una <b>frase cuadrada</b> suele organizarse en grupos regulares de 4 u 8 compases, con una idea antecedente y una respuesta. No es una obligación: las frases también pueden ser irregulares. Los saltos amplios generan dirección y con frecuencia se equilibran mediante movimiento conjunto en sentido contrario.</p><div class='phrase-shape'><span>A · pregunta</span><b>&#x2192;</b><span>A&#x2032; · respuesta</span><small>4 + 4 compases como modelo frecuente</small></div>" },
        { title:"Intervalo armónico", html:"<p>Cuando dos alturas suenan simultáneamente, la relación interválica ya puede estudiarse como un fenómeno armónico.</p>" },
        { title:"Tríada", html:"<p>La tríada organiza tres clases de altura relacionadas. Fundamental, tercera y quinta permiten distinguir configuraciones básicas mayores, menores, aumentadas y disminuidas.</p>" },
        { title:"De melodía a armonía", html:"<p>Una nota melódica puede funcionar como fundamental, tercera, quinta o extensión de un acorde. Comprender esta relación prepara el análisis armónico sin perder de vista la línea melódica.</p>" },
        { title:"De acorde a función", html:"<p>En una tonalidad, los acordes no son objetos aislados: pueden adquirir estabilidad, preparación o dirección. Ese es el punto donde comienza la armonía funcional.</p><p><a class='external-cta' href='https://crescendoacademyec.github.io/herramientas-pedagogicas/armonia-funcional/' target='_blank' rel='noopener'>Continuar a Armonía Funcional →</a></p>" }
      ]
    }
  ]
};
