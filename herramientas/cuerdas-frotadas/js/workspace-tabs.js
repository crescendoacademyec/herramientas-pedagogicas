(() => {
  const TAB_STORAGE = 'cuerdasFrotadas_workspaceTab_v1';
  const tabs = [
    {id:'tutor', label:'Tutor', icon:'♫', nodes:['stringsTutorPanel']},
    {id:'technique', label:'Técnica', icon:'✦', nodes:['shiftPracticePanel','scalePracticePanel','technicalPatternsPanel']},
    {id:'bow', label:'Arco y ritmo', icon:'↕', nodes:['bowPracticePanel','rhythmPrecisionPanel']},
    {id:'intonation', label:'Entonación', icon:'◎', nodes:['intonationPanel','doubleStopPanel','vibratoPanel']},
    {id:'score', label:'Partituras', icon:'▤', nodes:['bottom-row']}
  ];

  function getNode(token){
    if(token === 'bottom-row') return document.querySelector('.bottom-row');
    return document.getElementById(token);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main.app-shell');
    const topRow = document.querySelector('.top-row');
    const legend = document.querySelector('.legend');
    if(!main || !topRow) return;

    // Make the core instrument area immediate: controls -> instrument info -> fingerboard/staff -> tabs.
    if(topRow.previousElementSibling !== document.getElementById('techniqueStrip')){
      const strip = document.getElementById('techniqueStrip');
      if(strip) strip.after(topRow);
    }

    const shell=document.createElement('section');
    shell.className='workspace-shell';
    shell.setAttribute('aria-label','Módulos avanzados de Cuerdas Frotadas');

    const nav=document.createElement('div');
    nav.className='workspace-tabs';
    nav.setAttribute('role','tablist');
    nav.setAttribute('aria-label','Área de trabajo');

    const panels=document.createElement('div');
    panels.className='workspace-panels';

    const available=[];
    tabs.forEach((cfg, index) => {
      const nodes=cfg.nodes.map(getNode).filter(Boolean);
      if(!nodes.length) return;
      available.push(cfg.id);
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='workspace-tab';
      btn.id=`workspace-tab-${cfg.id}`;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-controls',`workspace-panel-${cfg.id}`);
      btn.innerHTML=`<span class="tab-icon" aria-hidden="true">${cfg.icon}</span>${cfg.label}`;

      const panel=document.createElement('div');
      panel.className='workspace-panel';
      panel.id=`workspace-panel-${cfg.id}`;
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby',btn.id);
      nodes.forEach(node => panel.appendChild(node));
      panels.appendChild(panel);
      nav.appendChild(btn);

      btn.addEventListener('click',()=>activate(cfg.id,true));
      btn.addEventListener('keydown',(ev)=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)) return;
        ev.preventDefault();
        const buttons=[...nav.querySelectorAll('.workspace-tab')];
        const current=buttons.indexOf(btn);
        let next=current;
        if(ev.key==='ArrowRight') next=(current+1)%buttons.length;
        if(ev.key==='ArrowLeft') next=(current-1+buttons.length)%buttons.length;
        if(ev.key==='Home') next=0;
        if(ev.key==='End') next=buttons.length-1;
        buttons[next].focus(); buttons[next].click();
      });
    });

    shell.append(nav,panels);
    topRow.after(shell);
    if(legend) shell.after(legend);

    function activate(id, persist=false){
      document.documentElement.dataset.workspaceTab=id;
      [...nav.querySelectorAll('.workspace-tab')].forEach(btn=>{
        const active=btn.id===`workspace-tab-${id}`;
        btn.setAttribute('aria-selected',String(active));
        btn.tabIndex=active?0:-1;
      });
      [...panels.children].forEach(panel=>{ panel.hidden=panel.id!==`workspace-panel-${id}`; });
      if(persist){ try{localStorage.setItem(TAB_STORAGE,id);}catch(_){} }
      requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
    }

    let initial='tutor';
    try{ const saved=localStorage.getItem(TAB_STORAGE); if(saved && available.includes(saved)) initial=saved; }catch(_){}
    activate(initial,false);

    // Public helper: modules can request their tab if a future action needs it.
    window.CrescendoWorkspace={show:activate};
  });
})();
