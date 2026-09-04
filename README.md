# Crescendo Academy — estructura separada

Esta versión separa la portada pública de Herramientas Pedagógicas y el portal académico Mi Crescendo.

## Estructura

- `index.html`: portada pública de herramientas.
- `mi-crescendo/index.html`: portal de alumno y panel del profesor.
- `mi-crescendo/apps-script/Code.gs`: backend para Google Sheets / Apps Script.
- `mi-crescendo/apps-script/appsscript.json`: manifiesto de Apps Script.
- `mi-crescendo/crescendo-registro-template.xlsx`: plantilla de datos.

## Rutas previstas en GitHub Pages

- Herramientas: `https://crescendoacademyec.github.io/herramientas-pedagogicas/`
- Mi Crescendo: `https://crescendoacademyec.github.io/herramientas-pedagogicas/mi-crescendo/`

Los botones del header navegan entre ambas rutas. Las herramientas siguen siendo públicas y Mi Crescendo conserva el acceso por alumno/profesor.

## Demo Mi Crescendo

- Alumno: `CA-0042` / PIN `3817`
- Profesor: `crescendo`

Para producción, configura la URL del Web App de Apps Script en `mi-crescendo/index.html` siguiendo la configuración ya indicada en el proyecto de registro.
