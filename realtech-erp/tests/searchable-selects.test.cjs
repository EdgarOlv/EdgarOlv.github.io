const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path')
function load(extras={}){const c=vm.createContext({...extras});vm.runInContext(fs.readFileSync(path.join(__dirname,'../searchable-selects.js'),'utf8'),c);return c}
const data={clientes:[{id:'c1',codigoCadastro:'01-1005',nomeFantasia:'São Carlos',codigo:'CLI-OLD',codigosAnteriores:['01-7002']}],produtos:[{id:'p1',codigoCadastro:'07-4001',nome:'RealMix Apresuntado'}]}
const options=[{value:'c1',textContent:'São Carlos',disabled:false},{value:'p1',textContent:'RealMix Apresuntado',disabled:true}]
test('combobox pesquisa nomes, códigos compactos/com espaços, referência antiga e alias sem trocar IDs',()=>{
 const c=load(),choices=c.searchableChoices({options,disabled:false},data)
 assert.equal(choices[0].value,'c1');assert.equal(choices[0].label,'01-1005 · São Carlos')
 for(const term of ['011005','01-1005','01 1 0 0 5','sao carlos','CLI-OLD','017002'])assert.equal(c.matchChoices(choices,term)[0].value,'c1')
 assert.equal(c.matchChoices(choices,'inexistente').length,0)
 assert.equal(c.matchChoices(choices,'')[1].disabled,true)
})
test('seleção confirma ID e change; opção bloqueada ou controle desabilitado não dispara alteração',()=>{
 const c=load(),select={value:'original',disabled:false};let count=0
 assert.equal(c.commitSearchableChoice(select,{value:'c1',disabled:false},()=>count++),true);assert.equal(select.value,'c1');assert.equal(count,1)
 assert.equal(c.commitSearchableChoice(select,{value:'p1',disabled:true},()=>count++),false);assert.equal(select.value,'c1')
 select.disabled=true;assert.equal(c.commitSearchableChoice(select,{value:'outro',disabled:false},()=>count++),false);assert.equal(count,1)
})
class Element {
 constructor(tag='span'){this.nodeName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.disabled=false;this.required=false;this.value='';this.hidden=false;this.classList={add:()=>{}}}
 setAttribute(k,v){this.attributes[k]=v}removeAttribute(k){delete this.attributes[k]}
 append(...children){this.children.push(...children)}replaceChildren(){this.children=[]}
 addEventListener(k,fn){(this.listeners[k]||=[]).push(fn)}
 emit(k,props={}){for(const fn of this.listeners[k]||[])fn({preventDefault(){},...props})}
 querySelectorAll(){return this.children.filter(c=>c.attributes.role==='option')}
 after(el){this.enhanced=el}closest(){return {firstChild:{textContent:'Cliente'}}}
 focus(){} select(){} scrollIntoView(){}setCustomValidity(v){this.validationMessage=v}
 dispatchEvent(){this.emit('change')}
}
function widget(){
 const select=new Element('select');Object.assign(select,{name:'clienteId',options:[...options.map(o=>({...o})),{value:'c2',textContent:'Outro cliente',disabled:false}],value:'c1',required:true})
 const c=load({state:data,document:{createElement:tag=>new Element(tag)},Event:class{}})
 c.enhanceSearchableSelect(select)
 return {c,select,input:select.enhanced.children[0],list:select.enhanced.children[1]}
}
test('teclado encontra registro e confirma; texto livre não substitui ID, Escape restaura seleção',()=>{
 const {select,input,list}=widget();input.emit('focus');assert.equal(input.attributes['aria-expanded'],'true')
 input.value='011005';input.emit('input');assert.equal(list.querySelectorAll().length,1);assert.ok(input.validationMessage)
 input.emit('keydown',{key:'ArrowDown'});assert.ok(input.attributes['aria-activedescendant'])
 input.emit('keydown',{key:'Enter'});assert.equal(select.value,'c1');assert.equal(input.validationMessage,'');assert.equal(list.hidden,true)
 input.value='não cadastrado';input.emit('input');assert.equal(select.value,'c1');assert.match(input.validationMessage,/Selecione/)
 input.emit('blur');assert.match(input.validationMessage,/Selecione/);assert.equal(input.value,'não cadastrado');input.emit('focus');assert.equal(input.value,'não cadastrado')
 input.emit('keydown',{key:'Escape'});assert.equal(input.value,'01-1005 · São Carlos');assert.equal(input.validationMessage,'')
})
test('opções indisponíveis não aparecem e sincronização acompanha listas dinâmicas sem duplicar controles',()=>{
 const {c,select,input,list}=widget();input.emit('focus');assert.equal(list.querySelectorAll().length,2)
 input.emit('keydown',{key:'ArrowUp'});input.emit('keydown',{key:'Enter'});assert.equal(select.value,'c2')
 const wrapper=select.enhanced;c.enhanceSearchableSelect(select);assert.equal(select.enhanced,wrapper)
 select.options=[{value:'c2',textContent:'Cliente atualizado',disabled:false}]
 c.syncSearchableSelects({querySelectorAll:()=>[select]});assert.equal(input.value,'Cliente atualizado')
 select.disabled=true;c.syncSearchableSelects({querySelectorAll:()=>[select]});assert.equal(input.disabled,true);assert.equal(list.hidden,true)
})
