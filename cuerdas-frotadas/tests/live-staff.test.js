const assert=require('node:assert/strict');
const Staff=require('../js/live-staff.js');
const notes=[{letter:'C',acc:null,octave:4},{letter:'F',acc:'sharp',octave:5}];
for(const [clef,sign,line] of [['treble','G',2],['bass','F',4],['alto','C',3],['tenor','C',4]]){
  const xml=Staff.musicXML(notes,clef,2);
  assert.ok(xml.includes(`<sign>${sign}</sign><line>${line}</line>`));
  assert.ok(xml.includes('<fifths>2</fifths>'));
  assert.equal((xml.match(/<chord\/>/g)||[]).length,1);
  assert.ok(xml.includes('<alter>1</alter>'));
}
assert.ok(Staff.musicXML([{letter:'B',acc:'flat',octave:3}],'treble',-2).includes('<alter>-1</alter>'));
assert.ok(Staff.musicXML([],'treble',0).includes('<note print-object="no"><rest/>'));
console.log('Pentagrama: cuatro claves, acordes, alteraciones y estado vacío OK');
