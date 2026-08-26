/* Lector de exportaciones ATA. Conserva el análisis creado en ATA sin copiarlo
   a otro formato: cada JSON se carga desde /Library bajo demanda. */
(function (global) {
  "use strict";
  var TITLES = global.ATA_LIBRARY_TITLES || [];
  /* GitHub limita carpetas muy grandes: el catálogo está repartido entre ambas rutas.
     Se prueba Library primero y Libraryextra solo si el archivo no está allí. */
  function filenames(title) {
    var file = encodeURIComponent(title + " - ATA.json");
    return ["./Library/" + file, "./Libraryextra/" + file];
  }
  function fetchAnalysis(title) {
    var paths = filenames(title);
    function tryPath(index) {
      return fetch(paths[index]).then(function (response) {
        if (response.ok) return response.json();
        if (response.status === 404 && index + 1 < paths.length) return tryPath(index + 1);
        throw new Error("HTTP " + response.status);
      });
    }
    return tryPath(0);
  }
  function esc(value) { return String(value || "").replace(/[&<>\"]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c];}); }
  function renderChart(root, document) {
    var pages=document.pages || [], measures=[]; pages.forEach(function(page){measures=measures.concat(page.measures || []);});
    if(!measures.length){root.innerHTML='<div class="ata-empty">Este archivo no contiene compases analizables.</div>';return;}
    var html='<div class="ata-chart"><h3 class="ata-title">'+esc(document.title || "Sin título")+'</h3>';
    for(var system=0;system<measures.length;system+=4){html+='<div class="ata-system">';measures.slice(system,system+4).forEach(function(measure,index){var slots=(measure.slots || []).filter(function(s){return s.chord;});html+='<article class="ata-measure"><span class="ata-measure-num">'+(system+index+1)+'</span>'+ (measure.form?'<span class="ata-section">'+esc(measure.form)+'</span>':'');slots.forEach(function(slot){html+='<div class="ata-slot"><strong class="ata-chord">'+esc(slot.chord)+'</strong>'+(slot.mode?'<span class="ata-mode">'+esc(slot.mode)+'</span>':'')+(slot.degree?'<span class="ata-degree">'+esc(slot.degree)+'</span>':'')+(slot.originScale?'<span class="ata-origin">'+esc(slot.originScale)+'</span>':'')+'</div>';});html+='</article>';});html+='</div>';}
    root.innerHTML=html+'</div>';
  }
  function mount(root) {
    root.innerHTML='<section class="ata-library"><div class="ata-tools"><input data-ata="search" type="search" placeholder="Busca entre los '+TITLES.length+' standards…"></div><div class="ata-results" data-ata="results"></div><p class="ata-load">Catálogo completo desde <code>Library</code> y <code>Libraryextra</code>: escribe una palabra y selecciona el standard. Los resultados se limitan a 60 para mantener la búsqueda ágil.</p><div class="ata-meta" data-ata="meta">Elige un standard para abrir su análisis ATA.</div><div data-ata="chart" class="ata-empty">Sin chart seleccionado.</div></section>';
    var search=root.querySelector('[data-ata="search"]'), results=root.querySelector('[data-ata="results"]'),meta=root.querySelector('[data-ata="meta"]'),chart=root.querySelector('[data-ata="chart"]');
    function load(title){if(!title)return;meta.textContent="Cargando análisis ATA…";chart.className="";fetchAnalysis(title).then(function(payload){var doc=payload.document || {};meta.textContent=(doc.timeSignature || "")+" · "+((doc.pages || []).reduce(function(total,page){return total+(page.measures || []).length;},0))+" compases analizados · modos, grados y escalas de origen incluidos.";renderChart(chart,doc);}).catch(function(error){chart.className="ata-empty";chart.textContent=location.protocol==="file:" ? "Este navegador bloquea la carga de JSON al abrir el HTML directamente. Abre el proyecto mediante un servidor local o GitHub Pages." : "No se pudo cargar “"+title+" - ATA.json” ("+error.message+"). Comprueba que las carpetas Library y Libraryextra se hayan publicado junto a la página.";meta.textContent="No se pudo cargar el análisis.";});}
    function showResults(){var query=search.value.trim().toLocaleLowerCase(), matches=TITLES.filter(function(title){return !query || title.toLocaleLowerCase().indexOf(query)>=0;});results.innerHTML="";matches.slice(0,60).forEach(function(title){var button=document.createElement("button");button.type="button";button.textContent=title;button.addEventListener("click",function(){search.value=title;load(title);});results.appendChild(button);});if(!matches.length)results.innerHTML='<div class="ata-empty">No hay coincidencias.</div>';else { var count=document.createElement("div");count.className="ata-count";count.textContent=matches.length+" resultado"+(matches.length===1?"":"s")+(matches.length>60?" · mostrando 60":"");results.prepend(count); }}
    search.addEventListener("input",showResults);search.addEventListener("keydown",function(event){if(event.key==="Enter"){var exact=TITLES.filter(function(title){return title.toLocaleLowerCase()===search.value.trim().toLocaleLowerCase();})[0];if(exact)load(exact);}});showResults();
  }
  global.AtaLibrary={mount:mount};
})(window);
