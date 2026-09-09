/**
 * Mi Crescendo · Backend Google Apps Script v2
 * Configura TEACHER_KEY (mínimo 16 caracteres), ejecuta migrateWorkbook()
 * una vez y publica una nueva implementación. La migración no borra datos.
 */
const API_VERSION=2, SESSION_TTL=1800, MAX_ATTEMPTS=5, LOCK_SECONDS=900;
const SHEETS={STUDENTS:'ALUMNOS',CLASSES:'CLASES',TASKS:'TAREAS',REPERTOIRE:'REPERTORIO',GOALS:'OBJETIVOS',RESOURCES:'RECURSOS',AUDIT:'AUDITORIA'};
const HEADERS={
 ALUMNOS:['Código','PIN Hash','Nombre','Fecha nacimiento','Instrumento','Nivel','Profesor','Fecha ingreso','Estado','Correo','Teléfono','Tipo responsable','Nombre responsable','Teléfono responsable','Correo responsable','Parentesco','Contacto emergencia','Teléfono emergencia','Observaciones internas'],
 CLASES:['ID Clase','Código alumno','Fecha','Duración','Contenido trabajado','Técnica','Repertorio','Teoría','Oído','Observaciones','Próximo objetivo','Profesor'],
 TAREAS:['ID Tarea','Código alumno','Fecha asignada','Fecha límite','Categoría','Descripción','Indicaciones','Estado','Recurso','Fecha completada','Comentario profesor'],
 REPERTORIO:['ID Repertorio','Código alumno','Obra','Compositor','Inicio','Estado','Tempo actual','Tempo objetivo','Observaciones','Enlace'],
 OBJETIVOS:['Código alumno','Área','Estado','Puntuación','Observación','Fecha revisión'],
 RECURSOS:['ID Recurso','Código alumno','Título','Tipo','Descripción','URL'],
 AUDITORIA:['Fecha','Actor','Acción','Objetivo','Resultado']
};

function doGet(){return json_({ok:true,data:{service:'Mi Crescendo API',version:API_VERSION}})}
function doPost(e){
 try{
  const raw=e&&e.postData&&e.postData.contents;if(!raw||raw.length>100000)throw new Error('Solicitud no válida.');
  const b=JSON.parse(raw),action=text_(b.action,50);
  if(action==='studentLogin')return json_({ok:true,data:studentLogin_(b.code,b.pin)});
  if(action==='teacherLogin')return json_({ok:true,data:teacherLogin_(b.key)});
  // `b.key` mantiene compatibilidad con acciones del frontend anterior, pero
  // desde v2 contiene un token temporal, nunca la clave docente permanente.
  const session=requireSession_(b.token||b.key,'teacher');
  const actions={listStudents:()=>listStudents_(),getStudent:()=>bundle_(b.code,true),saveClass:()=>saveClass_(b.row),saveTask:()=>saveTask_(b.row),saveStudent:()=>saveStudent_(b.row),updateStudentStatus:()=>updateStudentStatus_(b.code,b.status),deleteStudent:()=>deleteStudent_(b.code,b.confirmCode),updateTask:()=>updateTask_(b.id,b.patch),saveResource:()=>saveResource_(b.row),deleteResource:()=>deleteResource_(b.id)};
  if(!actions[action])throw new Error('Acción no válida.');
  const data=actions[action]();audit_(session.name,action,b.code||(b.row&&b.row.studentCode)||b.id||'','OK');return json_({ok:true,data});
 }catch(err){return json_({ok:false,error:publicError_(err)})}
}

function migrateWorkbook(){
 ensurePepper_();const ss=SpreadsheetApp.getActive();
 Object.keys(HEADERS).forEach(name=>{let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);const existing=sh.getLastColumn()?sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]:[];HEADERS[name].forEach(h=>{if(existing.indexOf(h)<0){sh.getRange(1,sh.getLastColumn()+1).setValue(h);existing.push(h)}});sh.getRange(1,1,1,sh.getLastColumn()).setFontWeight('bold').setBackground('#24201d').setFontColor('#fffaf0');sh.setFrozenRows(1)});
 validation_(sheet_(SHEETS.STUDENTS),'Estado',['Activo','Pausa','Inactivo','Retirado','Finalizado']);validation_(sheet_(SHEETS.TASKS),'Estado',['Pendiente','En progreso','Completada','Revisar']);validation_(sheet_(SHEETS.REPERTOIRE),'Estado',['Lectura','Construcción','Pulido','Memorización','Interpretación','Finalizada']);
 const current=rows_(SHEETS.STUDENTS).map(r=>Number(String(r['Código']).replace(/\D/g,''))).filter(Number.isFinite);if(current.length)PropertiesService.getScriptProperties().setProperty('STUDENT_SEQUENCE',String(Math.max.apply(null,current)));
 SpreadsheetApp.getUi().alert('Migración completada sin borrar datos. Publica una nueva implementación.');
}
function setupWorkbook(){migrateWorkbook()}

function teacherLogin_(key){
 rateLimit_('teacher','global',false);
 try{assertTeacherKey_(key);clearRate_('teacher','global');const name=teacherName_();audit_(name,'teacherLogin','','OK');return{teacher:{name},token:createSession_('teacher',name)}}
 catch(err){rateLimit_('teacher','global',true);audit_('desconocido','teacherLogin','','DENEGADO');throw err}
}
function studentLogin_(code,pin){
 const clean=code_(code);if(!clean||!/^\d{4,8}$/.test(String(pin||'')))throw new Error('Código o PIN incorrectos.');rateLimit_('student',clean,false);
 const row=rows_(SHEETS.STUDENTS).find(r=>code_(r['Código'])===clean);
 if(!row||!verifyPin_(clean,String(pin),row['PIN Hash'])){rateLimit_('student',clean,true);audit_('alumno','studentLogin',clean,'DENEGADO');throw new Error('Código o PIN incorrectos.')}
 if(['Inactivo','Retirado','Finalizado'].includes(String(row['Estado']||'Activo')))throw new Error('Este acceso no está activo. Contacta a tu profesor.');
 clearRate_('student',clean);migratePin_(row,clean,String(pin));audit_('alumno','studentLogin',clean,'OK');return Object.assign({token:createSession_('student',clean)},bundle_(clean,false));
}
function assertTeacherKey_(key){const expected=PropertiesService.getScriptProperties().getProperty('TEACHER_KEY');if(!expected||expected.length<16)throw new Error('Acceso docente no configurado de forma segura.');if(!safeEq_(hash_(key),hash_(expected)))throw new Error('Credenciales incorrectas.')}
function createSession_(role,name){const token=Utilities.getUuid()+Utilities.getUuid().replace(/-/g,'');CacheService.getScriptCache().put('session:'+hash_(token),JSON.stringify({role,name}),SESSION_TTL);return token}
function requireSession_(token,role){if(!token||String(token).length<50)throw new Error('Tu sesión venció. Vuelve a ingresar.');const key='session:'+hash_(token),cache=CacheService.getScriptCache(),raw=cache.get(key);if(!raw)throw new Error('Tu sesión venció. Vuelve a ingresar.');const s=JSON.parse(raw);if(s.role!==role)throw new Error('Acceso no autorizado.');cache.put(key,raw,SESSION_TTL);return s}
function rateLimit_(kind,id,failed){const cache=CacheService.getScriptCache(),key='login:'+kind+':'+hash_(id),lock=LockService.getScriptLock();lock.waitLock(5000);try{const now=Date.now(),state=JSON.parse(cache.get(key)||'{"attempts":0,"lockedUntil":0}');if(state.lockedUntil>now)throw new Error('Demasiados intentos. Espera 15 minutos.');if(failed){state.attempts++;if(state.attempts>=MAX_ATTEMPTS)state.lockedUntil=now+LOCK_SECONDS*1000;cache.put(key,JSON.stringify(state),LOCK_SECONDS)}}finally{lock.releaseLock()}}
function clearRate_(kind,id){CacheService.getScriptCache().remove('login:'+kind+':'+hash_(id))}

function listStudents_(){return rows_(SHEETS.STUDENTS).map(r=>student_(r,true)).sort((a,b)=>a.name.localeCompare(b.name,'es'))}
function bundle_(code,teacher){const clean=code_(code),s=findStudent_(clean),by=r=>code_(r['Código alumno'])===clean;return{student:student_(s,teacher),classes:rows_(SHEETS.CLASSES).filter(by).map(r=>classObj_(r,teacher)).sort(dateDesc_),tasks:rows_(SHEETS.TASKS).filter(by).map(taskObj_).sort(dateDesc_),repertoire:rows_(SHEETS.REPERTOIRE).filter(by).map(repObj_),goals:rows_(SHEETS.GOALS).filter(by).map(goalObj_),resources:rows_(SHEETS.RESOURCES).filter(by).map(resourceObj_)}}
function student_(r,teacher){const birth=iso_(r['Fecha nacimiento']),base={code:String(r['Código']),name:String(r['Nombre']),birthDate:birth,age:age_(birth),instrument:String(r['Instrumento']||''),level:String(r['Nivel']||''),teacher:String(r['Profesor']||''),joined:iso_(r['Fecha ingreso']),status:String(r['Estado']||'Activo')};return teacher?Object.assign(base,{email:String(r['Correo']||''),phone:String(r['Teléfono']||''),guardianType:String(r['Tipo responsable']||''),guardianName:String(r['Nombre responsable']||''),guardianPhone:String(r['Teléfono responsable']||''),guardianEmail:String(r['Correo responsable']||''),guardianRelation:String(r['Parentesco']||''),emergencyName:String(r['Contacto emergencia']||''),emergencyPhone:String(r['Teléfono emergencia']||''),internalNotes:String(r['Observaciones internas']||'')}):base}

function saveStudent_(r){
 r=r||{};const name=text_(r.name,120);if(!name)throw new Error('El nombre es obligatorio.');const code=code_(r.code)||nextCode_();if(!/^CA-\d{4,8}$/.test(code))throw new Error('Código no válido.');if(rows_(SHEETS.STUDENTS).some(x=>code_(x['Código'])===code))throw new Error('Ese código ya existe.');const pin=String(r.pin||randomPin_());if(!/^\d{6,8}$/.test(pin))throw new Error('El PIN debe tener entre 6 y 8 dígitos.');const birth=cleanDate_(r.birthDate),age=age_(birth);if(!birth||age<3||age>100)throw new Error('Revisa la fecha de nacimiento.');if(age<18&&(!text_(r.guardianName,120)||!text_(r.guardianPhone,40)))throw new Error('Los menores requieren nombre y teléfono del responsable.');
 append_(SHEETS.STUDENTS,{'Código':code,'PIN Hash':pinHash_(code,pin),'Nombre':name,'Fecha nacimiento':birth,'Instrumento':text_(r.instrument,160),'Nivel':text_(r.level,60),'Profesor':teacherName_(),'Fecha ingreso':date_(r.joined),'Estado':allowed_(r.status,['Activo','Pausa','Inactivo','Retirado','Finalizado'],'Activo'),'Correo':text_(r.email,160),'Teléfono':text_(r.phone,40),'Tipo responsable':text_(r.guardianType,50),'Nombre responsable':text_(r.guardianName,120),'Teléfono responsable':text_(r.guardianPhone,40),'Correo responsable':text_(r.guardianEmail,160),'Parentesco':text_(r.guardianRelation,80),'Contacto emergencia':text_(r.emergencyName,120),'Teléfono emergencia':text_(r.emergencyPhone,40),'Observaciones internas':text_(r.notes,2000)});return Object.assign(student_(findStudent_(code),true),{generatedPin:pin})
}
function saveClass_(r){r=r||{};const code=requireStudent_(r.studentCode);if(!text_(r.worked,2000))throw new Error('Describe lo trabajado.');const id='CL-'+Utilities.getUuid().slice(0,8).toUpperCase();append_(SHEETS.CLASSES,{'ID Clase':id,'Código alumno':code,'Fecha':date_(r.date),'Duración':number_(r.duration,1,300,60),'Contenido trabajado':text_(r.worked,2000),'Técnica':text_(r.technique,1000),'Repertorio':text_(r.repertoire,1000),'Teoría':text_(r.theory,1000),'Oído':text_(r.ear,1000),'Observaciones':text_(r.notes,2000),'Próximo objetivo':text_(r.nextGoal,1000),'Profesor':teacherName_()});return{id,date:iso_(date_(r.date))}}
function saveTask_(r){r=r||{};const code=requireStudent_(r.studentCode),desc=text_(r.description,500);if(!desc)throw new Error('La tarea es obligatoria.');const id='TA-'+Utilities.getUuid().slice(0,8).toUpperCase();append_(SHEETS.TASKS,{'ID Tarea':id,'Código alumno':code,'Fecha asignada':date_(r.assigned),'Fecha límite':date_(r.due),'Categoría':text_(r.category,80),'Descripción':desc,'Indicaciones':text_(r.detail,2000),'Estado':'Pendiente','Recurso':url_(r.resource,true)});return{id}}
function saveResource_(r){r=r||{};const code=requireStudent_(r.studentCode),title=text_(r.title,200);if(!title)throw new Error('El título es obligatorio.');const id='RE-'+Utilities.getUuid().slice(0,8).toUpperCase();append_(SHEETS.RESOURCES,{'ID Recurso':id,'Código alumno':code,'Título':title,'Tipo':text_(r.type,80),'Descripción':text_(r.description,1000),'URL':url_(r.url,true)});return{id}}
function updateStudentStatus_(code,status){const next=allowed_(status,['Activo','Pausa','Inactivo','Retirado','Finalizado'],'');if(!next)throw new Error('Estado no válido.');update_(SHEETS.STUDENTS,'Código',code_(code),{'Estado':next});return{code:code_(code),status:next}}
function deleteStudent_(code,confirm){const clean=code_(code);if(!clean||code_(confirm)!==clean)throw new Error('La confirmación no coincide.');Object.keys(SHEETS).filter(k=>k!=='AUDIT').forEach(k=>deleteStudentRows_(SHEETS[k],clean));return{code:clean}}
function deleteResource_(id){deleteBy_(SHEETS.RESOURCES,'ID Recurso',text_(id,80));return{id}}
function updateTask_(id,patch){patch=patch||{};const c={};if('status'in patch)c['Estado']=allowed_(patch.status,['Pendiente','En progreso','Completada','Revisar'],'Pendiente');if('comment'in patch)c['Comentario profesor']=text_(patch.comment,1000);if(c['Estado']==='Completada')c['Fecha completada']=new Date();update_(SHEETS.TASKS,'ID Tarea',text_(id,80),c);return taskObj_(rows_(SHEETS.TASKS).find(r=>String(r['ID Tarea'])===String(id)))}

function verifyPin_(code,pin,stored){stored=String(stored||'');return stored.startsWith('v2$')?safeEq_(stored,pinHash_(code,pin)):safeEq_(stored,hash_(code+'|'+pin+'|crescendo-v1'))}
function migratePin_(row,code,pin){if(!String(row['PIN Hash']||'').startsWith('v2$'))update_(SHEETS.STUDENTS,'Código',code,{'PIN Hash':pinHash_(code,pin)})}
function pinHash_(code,pin){return'v2$'+hash_(code_(code)+'|'+pin+'|'+ensurePepper_())}
function ensurePepper_(){const p=PropertiesService.getScriptProperties();let v=p.getProperty('PIN_PEPPER');if(!v){v=Utilities.getUuid()+Utilities.getUuid();p.setProperty('PIN_PEPPER',v)}return v}

function sheet_(name){const sh=SpreadsheetApp.getActive().getSheetByName(name);if(!sh)throw new Error('Falta la hoja '+name+'. Ejecuta migrateWorkbook().');return sh}
function rows_(name){const v=sheet_(name).getDataRange().getValues();if(v.length<2)return[];return v.slice(1).filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>object_(v[0],r))}
function object_(h,r){const o={};h.forEach((x,i)=>o[x]=r[i]);return o}
function append_(name,obj){const sh=sheet_(name),h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];sh.appendRow(h.map(x=>Object.prototype.hasOwnProperty.call(obj,x)?safeCell_(obj[x]):''))}
function update_(name,key,value,changes){const sh=sheet_(name),v=sh.getDataRange().getValues(),h=v[0],idx=h.indexOf(key);for(let i=1;i<v.length;i++)if(String(v[i][idx])===String(value)){Object.keys(changes).forEach(k=>{const c=h.indexOf(k);if(c>=0)sh.getRange(i+1,c+1).setValue(safeCell_(changes[k]))});return}throw new Error('Registro no encontrado.')}
function deleteBy_(name,key,value){const sh=sheet_(name),v=sh.getDataRange().getValues(),idx=v[0].indexOf(key);for(let i=v.length-1;i>=1;i--)if(String(v[i][idx])===String(value)){sh.deleteRow(i+1);return}throw new Error('Registro no encontrado.')}
function deleteStudentRows_(name,code){const sh=sheet_(name),v=sh.getDataRange().getValues(),idx=v[0].indexOf(name===SHEETS.STUDENTS?'Código':'Código alumno');if(idx<0)return;for(let i=v.length-1;i>=1;i--)if(code_(v[i][idx])===code)sh.deleteRow(i+1)}
function validation_(sh,header,values){const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],col=h.indexOf(header)+1;if(col)sh.getRange(2,col,Math.max(1,sh.getMaxRows()-1),1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(values,true).build())}
function findStudent_(code){const r=rows_(SHEETS.STUDENTS).find(x=>code_(x['Código'])===code_(code));if(!r)throw new Error('Alumno no encontrado.');return r}
function requireStudent_(code){return code_(findStudent_(code)['Código'])}
function nextCode_(){const p=PropertiesService.getScriptProperties(),nums=rows_(SHEETS.STUDENTS).map(r=>Number(String(r['Código']).replace(/\D/g,''))).filter(Number.isFinite);const n=Math.max(Number(p.getProperty('STUDENT_SEQUENCE')||0),nums.length?Math.max.apply(null,nums):0)+1;p.setProperty('STUDENT_SEQUENCE',String(n));return'CA-'+String(n).padStart(4,'0')}
function randomPin_(){return String(Math.floor(100000+Math.random()*900000))}

function classObj_(r,teacher){const value={id:r['ID Clase'],studentCode:r['Código alumno'],date:iso_(r['Fecha']),duration:Number(r['Duración'])||0,worked:r['Contenido trabajado'],technique:r['Técnica'],repertoire:r['Repertorio'],theory:r['Teoría'],ear:r['Oído'],nextGoal:r['Próximo objetivo'],teacher:r['Profesor']};if(teacher)value.notes=r['Observaciones'];return value}
function taskObj_(r){return{id:r['ID Tarea'],studentCode:r['Código alumno'],assigned:iso_(r['Fecha asignada']),due:iso_(r['Fecha límite']),category:r['Categoría'],description:r['Descripción'],detail:r['Indicaciones'],status:r['Estado'],resource:url_(r['Recurso']),completed:iso_(r['Fecha completada']),comment:r['Comentario profesor']}}
function repObj_(r){return{id:r['ID Repertorio'],studentCode:r['Código alumno'],work:r['Obra'],composer:r['Compositor'],started:iso_(r['Inicio']),stage:r['Estado'],tempo:Number(r['Tempo actual'])||0,targetTempo:Number(r['Tempo objetivo'])||0,notes:r['Observaciones'],link:url_(r['Enlace'])}}
function goalObj_(r){return{studentCode:r['Código alumno'],area:r['Área'],state:r['Estado'],score:number_(r['Puntuación'],0,100,0),note:r['Observación'],reviewDate:iso_(r['Fecha revisión'])}}
function resourceObj_(r){return{id:r['ID Recurso'],studentCode:r['Código alumno'],title:r['Título'],type:r['Tipo'],description:r['Descripción'],url:url_(r['URL'])}}
function dateDesc_(a,b){return String(b.date||b.assigned||'').localeCompare(String(a.date||a.assigned||''))}
function date_(s){if(!s)return new Date();const p=String(s).split('-').map(Number);return p.length===3?new Date(p[0],p[1]-1,p[2]):new Date(s)}
function cleanDate_(s){const d=date_(s);return isNaN(d)?'':iso_(d)}
function iso_(v){if(!v)return'';const d=v instanceof Date?v:new Date(v);return isNaN(d)?'':Utilities.formatDate(d,Session.getScriptTimeZone(),'yyyy-MM-dd')}
function age_(s){if(!s)return null;const d=new Date(s+'T00:00:00'),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return a}
function code_(v){return String(v||'').trim().toUpperCase().slice(0,20)}
function text_(v,max){return String(v==null?'':v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim().slice(0,max||1000)}
function url_(v,strict){const s=text_(v,1000);if(!s)return'';if(!/^https:\/\//i.test(s)){if(strict)throw new Error('Los enlaces deben comenzar con https://');return''}return s}
function safeCell_(v){return typeof v==='string'&&/^[=+\-@]/.test(v)?"'"+v:v}
function allowed_(v,list,fallback){return list.includes(String(v||''))?String(v):fallback}
function number_(v,min,max,fallback){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback}
function teacherName_(){return PropertiesService.getScriptProperties().getProperty('TEACHER_NAME')||'Profesor Crescendo'}
function hash_(s){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s||''),Utilities.Charset.UTF_8))}
function safeEq_(a,b){a=String(a||'');b=String(b||'');if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function publicError_(e){const s=String(e&&e.message||'Error del servidor.');return s.length>180?'No se pudo completar la operación.':s}
function audit_(actor,action,target,result){try{append_(SHEETS.AUDIT,{'Fecha':new Date(),'Actor':text_(actor,120),'Acción':text_(action,80),'Objetivo':text_(target,80),'Resultado':text_(result,40)})}catch(ignore){}}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
