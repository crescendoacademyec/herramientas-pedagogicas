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
          html: "<p>El pentagrama ofrece un sistema de referencia. La clave asigna nombres y registros a sus líneas y espacios. Las líneas adicionales extienden ese sistema cuando la altura queda fuera del pentagrama.</p>"
        },
        {
          title: "Duración: figuras y silencios",
          html: "<p>Las figuras representan duraciones relativas. A cada figura le corresponde un silencio de igual valor. La lectura musical combina continuamente información de altura y de duración.</p>"
        }
      ]
    },
    {
      id: "ritmo",
      title: "Ritmo, pulso y compás",
      subtitle: "Organizar la duración.",
      lead: "El ritmo no es solo contar figuras: es percibir pulsos, subdivisiones, acentos y patrones.",
      blocks: [
        { title:"Pulso y tempo", html:"<p>El <b>pulso</b> es una referencia periódica; el <b>tempo</b> indica la velocidad con la que esa referencia transcurre.</p>" },
        { title:"Compás y métrica", html:"<p>El compás agrupa pulsos y crea patrones de acentuación. Los compases simples y compuestos se distinguen por la manera en que se subdivide cada pulso.</p>" },
        { title:"Ritmo real", html:"<p>Puntillo, ligadura, síncopa, contratiempo y tresillos muestran que el ritmo musical puede desplazarse respecto de los acentos métricos básicos.</p>" },
        { title:"Silencios", html:"<p>Los silencios representan duraciones sin ataque sonoro. Tienen valores equivalentes a las figuras y participan activamente en la organización del ritmo.</p>" },
        { title:"Puntillo", html:"<p>El puntillo añade a una figura la mitad de su valor original. Una negra con puntillo dura 1,5 pulsos cuando la negra vale un pulso.</p>" },
        { title:"Ligadura de prolongación", html:"<p>Une dos notas de la misma altura y suma sus duraciones sin repetir el ataque de la segunda nota.</p>" },
        { title:"Síncopa y contratiempo", html:"<p>La síncopa desplaza el peso rítmico hacia una parte débil o prolonga un sonido débil sobre una parte fuerte. El contratiempo enfatiza posiciones débiles mediante ataques separados por silencios.</p>" },
        { title:"Tresillo", html:"<p>El tresillo divide en tres partes iguales un espacio que normalmente se dividiría en dos. Tres corcheas de tresillo ocupan el tiempo de dos corcheas normales.</p>" },
        { title:"Compases compuestos", html:"<p>En compases como 6/8, 9/8 y 12/8, cada pulso principal se subdivide normalmente en tres partes iguales. Por ejemplo, 6/8 suele sentirse como dos pulsos de negra con puntillo.</p>" }
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
        { title:"Melódico y armónico", html:"<p>Dos alturas sucesivas forman un intervalo melódico; simultáneas, un intervalo armónico. Esta distinción conecta directamente melodía y armonía.</p>" }
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
        { title:"Intervalo armónico", html:"<p>Cuando dos alturas suenan simultáneamente, la relación interválica ya puede estudiarse como un fenómeno armónico.</p>" },
        { title:"Tríada", html:"<p>La tríada organiza tres clases de altura relacionadas. Fundamental, tercera y quinta permiten distinguir configuraciones básicas mayores, menores, aumentadas y disminuidas.</p>" },
        { title:"De melodía a armonía", html:"<p>Una nota melódica puede funcionar como fundamental, tercera, quinta o extensión de un acorde. Comprender esta relación prepara el análisis armónico sin perder de vista la línea melódica.</p>" },
        { title:"De acorde a función", html:"<p>En una tonalidad, los acordes no son objetos aislados: pueden adquirir estabilidad, preparación o dirección. Ese es el punto donde comienza la armonía funcional.</p><p><a class='external-cta' href='https://crescendoacademyec.github.io/herramientas-pedagogicas/armonia-funcional/' target='_blank' rel='noopener'>Continuar a Armonía Funcional →</a></p>" }
      ]
    }
  ]
};