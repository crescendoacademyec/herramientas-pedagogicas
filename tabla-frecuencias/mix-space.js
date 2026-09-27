/* Orthographic oblique projection: pan X, register Y, depth Z. */
(function(root){
'use strict';
function project(pan,register,depth){return {x:120+(pan+100)*2.55+depth*.85,y:465-register*3-depth*.95};}
function geometry(t){return {...project(t.pan,t.register,t.depth),rx:18+t.level*.12+t.width*.48,ry:10+t.level*.13};}
const api={project,geometry};if(typeof module==='object'&&module.exports)module.exports=api;else root.MixSpace=api;
})(typeof window==='undefined'?{}:window);
