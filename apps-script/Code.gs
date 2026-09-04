/**
 * Mi Crescendo · Backend Google Apps Script
 * 1) Crea un Google Sheet vacío.
 * 2) Abre Extensiones > Apps Script y pega este archivo.
 * 3) Ejecuta setupWorkbook() una sola vez.
 * 4) En Configuración del proyecto > Propiedades del script crea TEACHER_KEY.
 * 5) Implementa como Aplicación web: Ejecutar como tú / acceso: Cualquier usuario.
 * 6) Pega la URL /exec en API_URL del index.html.
 */
const SHEETS = {
  STUDENTS:'ALUMNOS', CLASSES:'CLASES', TASKS:'TAREAS', REPERTOIRE:'REPERTORIO', GOALS:'OBJETIVOS', RESOURCES:'RECURSOS'
};
const HEADERS = {
  ALUMNOS:['Código','PIN Hash','Nombre','Instrumento','Nivel','Profesor','Fecha ingreso','Estado','Correo','Teléfono','Observaciones internas'],
  CLASES:['ID Clase','Código alumno','Fecha','Duración','Contenido trabajado','Técnica','Repertorio','Teoría','Oído','Observaciones','Próximo objetivo','Profesor'],
  TAREAS:['ID Tarea','Código alumno','Fecha asignada','Fecha límite','Categoría','Descripción','Indicaciones','Estado','Recurso','Fecha completada','Comentario profesor'],
  REPERTORIO:['ID Repertorio','Código alumno','Obra','Compositor','Inicio','Estado','Tempo actual','Tempo objetivo','Observaciones','Enlace'],
  OBJETIVOS:['Código alumno','Área','Estado','Puntuación','Observación','Fecha revisión'],
  RECURSOS:['ID Recurso','Código alumno','Título','Tipo','Descripción','URL']
};
function doGet(){return json_({ok:true,data:{service:'Mi Crescendo API',version:1}})}
function doPost(e){
  try{
    const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    const action=String(body.action||'');
    if(action==='studentLogin') return json_({ok:true,data:studentLogin_(body.code,body.pin)});
    if(action==='teacherLogin') { assertTeacher_(body.key); return json_({ok:true,data:{teacher:{name:teacherName_()}}}); }
    assertTeacher_(body.key);
    const map={listStudents:listStudents_,getStudent:()=>getStudentBundle_(body.code),saveClass:()=>saveClass_(body.row),saveTask:()=>saveTask_(body.row),saveStudent:()=>saveStudent_(body.row),updateTask:()=>updateTask_(body.id,body.patch),saveResource:()=>saveResource_(body.row),deleteResource:()=>deleteResource_(body.id)};
    if(!map[action])throw new Error('Acción no válida.');
    return json_({ok:true,data:map[action]()});
  }catch(err){return json_({ok:false,error:err.message||String(err)})}
}
function setupWorkbook(){
  const ss=SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(name=>{
    let sh=ss.getSheetByName(name); if(!sh)sh=ss.insertSheet(name);
    sh.clear(); sh.getRange(1,1,1,HEADERS[name].length).setValues([HEADERS[name]]).setFontWeight('bold').setBackground('#24201d').setFontColor('#fffaf0');
    sh.setFrozenRows(1); sh.autoResizeColumns(1,HEADERS[name].length); sh.getRange(1,1,sh.getMaxRows(),HEADERS[name].length).setVerticalAlignment('top');
  });
  const students=ss.getSheetByName(SHEETS.STUDENTS); students.getRange('H2:H').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Activo','Pausa','Inactivo'],true).build());
  const tasks=ss.getSheetByName(SHEETS.TASKS); tasks.getRange('H2:H').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pendiente','En progreso','Completada','Revisar'],true).build());
  const rep=ss.getSheetByName(SHEETS.REPERTOIRE); rep.getRange('F2:F').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Lectura','Construcción','Pulido','Memorización','Interpretación','Finalizada'],true).build());
  SpreadsheetApp.getUi().alert('Estructura creada. Configura TEACHER_KEY en Propiedades del script.');
}
function createStudentExample(){return saveStudent_({name:'Alumno Ejemplo',instrument:'Piano',level:'Principiante',teacher:teacherName_(),pin:'3817',email:''})}
function studentLogin_(code,pin){
  const clean=String(code||'').trim().toUpperCase(); if(!clean||!pin)throw new Error('Código y PIN son obligatorios.');
  const rows=rows_(SHEETS.STUDENTS); const row=rows.find(r=>String(r['Código']).toUpperCase()===clean); if(!row||!safeEq_(row['PIN Hash'],hashPin_(clean,String(pin))))throw new Error('Código o PIN incorrectos.');
  if(String(row['Estado']||'Activo')==='Inactivo')throw new Error('Este alumno no está activo.');
  return getStudentBundle_(clean);
}
function assertTeacher_(key){const expected=PropertiesService.getScriptProperties().getProperty('TEACHER_KEY');if(!expected)throw new Error('TEACHER_KEY no está configurada en Apps Script.');if(!safeEq_(hashText_(String(key||'')),hashText_(expected)))throw new Error('Clave docente incorrecta.')}
function teacherName_(){return PropertiesService.getScriptProperties().getProperty('TEACHER_NAME')||'Profesor Crescendo'}
function listStudents_(){return rows_(SHEETS.STUDENTS).map(studentPublic_).sort((a,b)=>a.name.localeCompare(b.name,'es'))}
function getStudentBundle_(code){const s=rows_(SHEETS.STUDENTS).find(r=>String(r['Código']).toUpperCase()===String(code).toUpperCase());if(!s)throw new Error('Alumno no encontrado.');return {student:studentPublic_(s),classes:rows_(SHEETS.CLASSES).filter(r=>r['Código alumno']===s['Código']).map(classObj_).sort(dateDesc_),tasks:rows_(SHEETS.TASKS).filter(r=>r['Código alumno']===s['Código']).map(taskObj_).sort(dateDesc_),repertoire:rows_(SHEETS.REPERTOIRE).filter(r=>r['Código alumno']===s['Código']).map(repObj_),goals:rows_(SHEETS.GOALS).filter(r=>r['Código alumno']===s['Código']).map(goalObj_),resources:rows_(SHEETS.RESOURCES).filter(r=>r['Código alumno']===s['Código']).map(resourceObj_)}}
function saveStudent_(r){r=r||{};if(!String(r.name||'').trim())throw new Error('El nombre es obligatorio.');const sh=sheet_(SHEETS.STUDENTS);let code=String(r.code||'').trim().toUpperCase();if(!code)code=nextStudentCode_();if(rows_(SHEETS.STUDENTS).some(x=>String(x['Código']).toUpperCase()===code))throw new Error('Ese código ya existe.');const pin=String(r.pin||randomPin_());if(!/^\d{4,8}$/.test(pin))throw new Error('El PIN debe tener 4 a 8 dígitos.');sh.appendRow([code,hashPin_(code,pin),String(r.name).trim(),r.instrument||'',r.level||'',r.teacher||teacherName_(),new Date(),r.status||'Activo',r.email||'',r.phone||'',r.notes||'']);return {...studentPublic_(rows_(SHEETS.STUDENTS).slice(-1)[0]),generatedPin:pin}}
function saveClass_(r){r=r||{};requireStudent_(r.studentCode);if(!r.worked)throw new Error('Describe lo trabajado en la clase.');const id='CL-'+Utilities.getUuid().slice(0,8).toUpperCase();sheet_(SHEETS.CLASSES).appendRow([id,r.studentCode,date_(r.date),Number(r.duration)||60,r.worked||'',r.technique||'',r.repertoire||'',r.theory||'',r.ear||'',r.notes||'',r.nextGoal||'',r.teacher||teacherName_()]);return {...r,id,date:iso_(date_(r.date))}}
function saveTask_(r){r=r||{};requireStudent_(r.studentCode);if(!r.description)throw new Error('La descripción de la tarea es obligatoria.');const id='TA-'+Utilities.getUuid().slice(0,8).toUpperCase();sheet_(SHEETS.TASKS).appendRow([id,r.studentCode,date_(r.assigned),date_(r.due),r.category||'Otro',r.description,r.detail||'',r.status||'Pendiente',r.resource||'','','']);return {...r,id}}
function saveResource_(r){r=r||{};requireStudent_(r.studentCode);if(!String(r.title||'').trim())throw new Error('El título del recurso es obligatorio.');const id='RE-'+Utilities.getUuid().slice(0,8).toUpperCase();sheet_(SHEETS.RESOURCES).appendRow([id,r.studentCode,String(r.title).trim(),r.type||'Recurso',r.description||'',r.url||'']);return {...r,id}}
function deleteResource_(id){const sh=sheet_(SHEETS.RESOURCES),vals=sh.getDataRange().getValues();if(vals.length<2)throw new Error('Recurso no encontrado.');const heads=vals[0],idx=heads.indexOf('ID Recurso');for(let i=1;i<vals.length;i++){if(String(vals[i][idx])===String(id)){sh.deleteRow(i+1);return {id}}}throw new Error('Recurso no encontrado.')}
function updateTask_(id,patch){const sh=sheet_(SHEETS.TASKS),vals=sh.getDataRange().getValues(),heads=vals[0],idx=heads.indexOf('ID Tarea');for(let i=1;i<vals.length;i++){if(String(vals[i][idx])===String(id)){Object.keys(patch||{}).forEach(k=>{const map={status:'Estado',comment:'Comentario profesor'};const c=heads.indexOf(map[k]||k);if(c>=0)sh.getRange(i+1,c+1).setValue(patch[k])});if(patch.status==='Completada'){const c=heads.indexOf('Fecha completada');sh.getRange(i+1,c+1).setValue(new Date())}return taskObj_(rowObject_(heads,sh.getRange(i+1,1,1,heads.length).getValues()[0]))}}throw new Error('Tarea no encontrada.')}
function nextStudentCode_(){const nums=rows_(SHEETS.STUDENTS).map(r=>Number(String(r['Código']).replace(/\D/g,''))).filter(Number.isFinite);return 'CA-'+String((nums.length?Math.max.apply(null,nums):0)+1).padStart(4,'0')}
function randomPin_(){return String(Math.floor(1000+Math.random()*9000))}
function requireStudent_(code){if(!rows_(SHEETS.STUDENTS).some(r=>r['Código']===code))throw new Error('Alumno no encontrado.')}
function sheet_(name){const sh=SpreadsheetApp.getActive().getSheetByName(name);if(!sh)throw new Error('Falta la hoja '+name+'. Ejecuta setupWorkbook().');return sh}
function rows_(name){const sh=sheet_(name),v=sh.getDataRange().getValues();if(v.length<2)return[];const h=v[0];return v.slice(1).filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>rowObject_(h,r))}
function rowObject_(h,r){const o={};h.forEach((x,i)=>o[x]=r[i]);return o}
function studentPublic_(r){return {code:String(r['Código']),name:String(r['Nombre']),instrument:String(r['Instrumento']||''),level:String(r['Nivel']||''),teacher:String(r['Profesor']||''),joined:iso_(r['Fecha ingreso']),status:String(r['Estado']||'Activo'),email:String(r['Correo']||''),phone:String(r['Teléfono']||'')}}
function classObj_(r){return {id:r['ID Clase'],studentCode:r['Código alumno'],date:iso_(r['Fecha']),duration:Number(r['Duración'])||0,worked:r['Contenido trabajado'],technique:r['Técnica'],repertoire:r['Repertorio'],theory:r['Teoría'],ear:r['Oído'],notes:r['Observaciones'],nextGoal:r['Próximo objetivo'],teacher:r['Profesor']}}
function taskObj_(r){return {id:r['ID Tarea'],studentCode:r['Código alumno'],assigned:iso_(r['Fecha asignada']),due:iso_(r['Fecha límite']),category:r['Categoría'],description:r['Descripción'],detail:r['Indicaciones'],status:r['Estado'],resource:r['Recurso'],completed:iso_(r['Fecha completada']),comment:r['Comentario profesor']}}
function repObj_(r){return {id:r['ID Repertorio'],studentCode:r['Código alumno'],work:r['Obra'],composer:r['Compositor'],started:iso_(r['Inicio']),stage:r['Estado'],tempo:Number(r['Tempo actual'])||0,targetTempo:Number(r['Tempo objetivo'])||0,notes:r['Observaciones'],link:r['Enlace']}}
function goalObj_(r){return {studentCode:r['Código alumno'],area:r['Área'],state:r['Estado'],score:Number(r['Puntuación'])||0,note:r['Observación'],reviewDate:iso_(r['Fecha revisión'])}}
function resourceObj_(r){return {id:r['ID Recurso'],studentCode:r['Código alumno'],title:r['Título'],type:r['Tipo'],description:r['Descripción'],url:r['URL']}}
function dateDesc_(a,b){return String(b.date||b.assigned||'').localeCompare(String(a.date||a.assigned||''))}
function date_(s){if(!s)return new Date();const p=String(s).split('-').map(Number);return p.length===3?new Date(p[0],p[1]-1,p[2]):new Date(s)}
function iso_(v){if(!v)return'';const d=v instanceof Date?v:new Date(v);return isNaN(d)?String(v):Utilities.formatDate(d,Session.getScriptTimeZone(),'yyyy-MM-dd')}
function hashPin_(code,pin){return hashText_(String(code).toUpperCase()+'|'+pin+'|crescendo-v1')}
function hashText_(s){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8))}
function safeEq_(a,b){a=String(a||'');b=String(b||'');if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
