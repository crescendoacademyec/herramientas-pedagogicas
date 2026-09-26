const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const script=fs.readFileSync(require('node:path').join(__dirname,'../ear.js'),'utf8');
for(const mode of ['blocked','null'])test(`ear training initializes with ${mode} storage`,()=>{
 const localStorage={getItem(){if(mode==='blocked')throw Error('blocked');return 'null';},setItem(){throw Error('blocked');}};
 assert.doesNotThrow(()=>vm.runInNewContext(script,{localStorage,document:{addEventListener(){}},window:{addEventListener(){}}}));
});
