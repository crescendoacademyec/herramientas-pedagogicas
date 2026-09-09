# Mi Crescendo: seguridad y despliegue

Esta versión usa sesiones temporales y deja de enviar la clave docente en cada operación. El cambio requiere actualizar el Apps Script antes de publicar el nuevo `index.html`.

## Actualización segura

1. Haz una copia de seguridad del Google Sheet.
2. Reemplaza el contenido del proyecto Apps Script con `apps-script/Code.gs`.
3. En **Configuración del proyecto → Propiedades del script**, define:
   - `TEACHER_KEY`: frase secreta única de al menos 16 caracteres. No debe estar en GitHub ni compartirse con alumnos.
   - `TEACHER_NAME`: nombre que aparecerá en el portal (opcional).
4. Ejecuta manualmente `migrateWorkbook()` desde el editor de Apps Script y autoriza los permisos solicitados.
5. Comprueba que aparezca la hoja `AUDITORIA` y que las hojas existentes conserven sus filas.
6. Crea una **nueva versión** de la implementación web y conserva la URL terminada en `/exec`.
7. Prueba el acceso docente y el acceso de un alumno antes de publicar el frontend.
8. Publica `mi-crescendo/index.html`.

`migrateWorkbook()` solo añade hojas, encabezados y validaciones faltantes; no limpia las hojas. No vuelvas a usar una copia antigua de `setupWorkbook()`, porque la versión anterior borraba el contenido durante la inicialización.

## Cambios de seguridad

- La clave docente se intercambia una sola vez por un token temporal de 30 minutos.
- El frontend elimina la clave del campo y no la guarda en almacenamiento local.
- La sesión se cierra después de 28 minutos de inactividad.
- Cinco accesos fallidos bloquean temporalmente nuevos intentos durante 15 minutos.
- Los PIN nuevos deben tener entre 6 y 8 dígitos. Los PIN antiguos de 4 dígitos siguen funcionando y su hash se actualiza al iniciar sesión; conviene reemplazarlos gradualmente.
- Los hashes nuevos usan una sal secreta `PIN_PEPPER`, generada dentro de las propiedades privadas del script.
- El portal del alumno ya no recibe correo, teléfono, datos del representante, contacto de emergencia ni observaciones internas.
- Las acciones docentes y los accesos se registran en `AUDITORIA`.
- Los campos tienen límites de longitud y los enlaces aceptan únicamente HTTPS.
- El frontend aplica una política CSP restrictiva compatible con la arquitectura actual.

## Operación recomendada

- Usa una clave docente larga, exclusiva para este servicio y almacenada en un gestor de contraseñas.
- Cambia inmediatamente los PIN antiguos a 6–8 dígitos cuando se implemente una función de regeneración.
- Revisa periódicamente `AUDITORIA` buscando intentos denegados repetidos.
- Limita el acceso directo al Google Sheet solo a personal autorizado.
- No escribas información médica, legal o familiar innecesaria en observaciones.
- Antes de eliminar un alumno, conserva únicamente los registros que la política de la academia obligue a mantener.

## Limitaciones conocidas

`CacheService` de Apps Script es apropiado para una academia pequeña, pero no equivale a un proveedor profesional de identidad. Si el número de profesores, alumnos o administradores crece significativamente, la siguiente mejora debería ser autenticación individual con Google y permisos por profesor.

GitHub Pages tampoco permite configurar libremente todos los encabezados HTTP. La CSP incluida ofrece una primera barrera, pero un alojamiento administrado permitiría añadir encabezados como `Permissions-Policy` y controles más completos.
