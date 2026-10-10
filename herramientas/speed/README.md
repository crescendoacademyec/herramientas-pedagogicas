# Cambiador de Velocidad y Tono — Correcciones finales

Esta versión corrige el núcleo funcional de la app:

- motor granular independiente para tempo y pitch;
- reproducción con duración gobernada por tempo y altura gobernada por semitonos;
- exportación con el mismo buffer procesado;
- exportación del archivo completo o solo loop A–B;
- zoom y pan temporal reales en la forma de onda;
- presets de tempo y tono;
- atajos de teclado;
- preferencias de tempo/tono persistentes.

Nota de calidad: el motor implementado es granular OLA, adecuado para práctica/estudio. En material muy denso o con cambios extremos puede producir artefactos, como cualquier algoritmo de time-stretch en navegador.
