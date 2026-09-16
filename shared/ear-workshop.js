document.addEventListener('DOMContentLoaded',()=>{
  const app=document.getElementById('app');
  const section=document.createElement('section');
  app.after(section);
  window.CrescendoLab.attach(section,'ear');
});
