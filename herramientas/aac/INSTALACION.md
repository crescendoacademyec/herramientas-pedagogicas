# INSTALACIÓN EN TU REPOSITORIO

Esta carpeta ya incluye el `index.html` original que compartiste, más la corrección de biblioteca.

## Estructura esperada

```text
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── web-mode.js
│   ├── tonal-analysis.js
│   └── reharmonization.js
├── data/
│   └── library-index.json
├── library/
│   └── ... tus JSON ...
├── library2/
│   └── ... tus JSON ...
├── tools/
│   └── build-library-index.mjs
└── assets/
    └── icons/
        └── ata-icon.svg
```

## Para tus 1300+ canciones

1. Copia todas tus canciones reales dentro de `library/` y `library2/`.
2. Desde la raíz del repositorio ejecuta:

```bash
node tools/build-library-index.mjs
```

3. Verifica que aparezca algo como:

```text
✓ 1300 canciones indexadas.
✓ data/library-index.json
```

4. Haz commit/push incluyendo también `data/library-index.json`.

La app cargará ambas carpetas como una sola biblioteca.

## Importante

GitHub Pages no permite enumerar directamente los archivos de una carpeta desde JavaScript.
Por eso `library-index.json` es necesario.

Los guardados que hagas desde la app web siguen almacenándose de forma privada en IndexedDB y se mezclan con la biblioteca estática.
