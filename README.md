# Crescendo Academy — Portal híbrido

Este proyecto combina la portada pública de Herramientas Pedagógicas con **Mi Crescendo** en una sola página.

## Flujo
- Las 15 herramientas se pueden abrir sin iniciar sesión.
- La sección **Mi Crescendo** aparece en la misma portada.
- Alumno: código + PIN.
- Profesor: clave docente.
- Tras iniciar sesión, el dashboard académico se muestra dentro de la misma página.

## Demo
- Alumno: `CA-0042` / PIN `3817`
- Profesor: `crescendo`

## Conectar Google Sheets
1. Importa `crescendo-registro-template.xlsx` en Google Sheets.
2. Crea un proyecto de Apps Script asociado a la hoja.
3. Copia `apps-script/Code.gs`.
4. Configura la clave docente en las propiedades del script según las instrucciones del proyecto de registro.
5. Despliega como Web App.
6. En `index.html`, busca `const API_URL = '';` y pega la URL `/exec`.

## Publicación
Este `index.html` está diseñado para reemplazar el index actual de `herramientas-pedagogicas`. Los enlaces relativos de las herramientas (`piano-virtual/`, `ear-training/`, etc.) se conservan.
