const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')
const D = require('../domain.js')
function setup() {
 let s = D.seed()
 return {get s(){return s}, run(action,payload,user='qualidade') {const r=D.execute(s,D.get(s.usuarios,user),action,payload);s=r.state;return r.id},
 draft(){return {...D.productSheetDraft(s,'p1'),motivo:'Revisão demonstrativa'}}}
}
test('faixas livres e ocultação persistem sem alterar fórmula nem confiar em percentual interno recebido',()=>{
 const h=setup(),before=JSON.stringify(h.s.formulas),draft=h.draft()
 draft.tipo='aberta';draft.composicao[0].percentualExibicao='79,7% - 90%';draft.composicao[0].percentualInterno=999;draft.composicao[1].percentualExibicao=''
 const id=h.run('saveProductSheet',draft),f=D.get(h.s.fichasTecnicas,id)
 assert.equal(f.composicao[0].percentualExibicao,'79,7% - 90%');assert.notEqual(f.composicao[0].percentualInterno,999)
 assert.equal(f.composicao[1].percentualExibicao,'');assert.equal(JSON.stringify(h.s.formulas),before)
 assert.deepEqual(D.validateState(JSON.parse(JSON.stringify(h.s))).fichasTecnicas,h.s.fichasTecnicas)
 assert.throws(()=>h.run('saveProductSheet',draft,'vendedor'),/perfil/)
})
test('revisões aprovadas são imutáveis e substituição conserva conteúdo e auditoria',()=>{
 const h=setup(),id=h.run('saveProductSheet',h.draft())
 h.run('approveProductSheet',{id});const old=structuredClone(D.get(h.s.fichasTecnicas,id))
 assert.throws(()=>h.run('saveProductSheet',{...old,id}),/rascunhos/)
 const next=h.run('saveProductSheet',{...old,id:undefined,sourceId:id,motivo:'Nova revisão'})
 assert.equal(D.get(h.s.fichasTecnicas,next).revisao,2);assert.equal(D.get(h.s.fichasTecnicas,next).aprovadoEm,undefined)
 h.run('approveProductSheet',{id:next});assert.equal(D.get(h.s.fichasTecnicas,id).status,'substituida')
 assert.deepEqual(D.get(h.s.fichasTecnicas,id).composicao,old.composicao)
 assert.ok(h.s.auditoria.some(a=>a.acao==='approveProductSheet'))
})
test('mudança do P&D sinaliza revisão sem sobrescrever ajustes e bloqueia aprovação desatualizada',()=>{
 const h=setup(),id=h.run('saveProductSheet',h.draft()),sheet=D.get(h.s.fichasTecnicas,id)
 const before=structuredClone(sheet);D.get(h.s.formulas,sheet.formulaId).versao++
 assert.equal(D.productSheetStale(h.s,sheet),true);assert.deepEqual(sheet,before)
 assert.throws(()=>h.run('approveProductSheet',{id}),/fórmula mudou/)
 const fresh=D.productSheetDraft(h.s,'p1');assert.equal(D.productSheetStale(h.s,fresh),false)
})
test('prévia usa apenas declaração pública e escapa conteúdo editado',()=>{
 const h=setup(),draft=h.draft();draft.composicao[0].nome='<script>nome</script>';draft.composicao[0].percentualExibicao='FAIXA';draft.composicao[1].percentualExibicao=''
 const id=h.run('saveProductSheet',draft),f=D.get(h.s.fichasTecnicas,id)
 const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
 const c=vm.createContext({esc,fields:rows=>rows.map(r=>r.join(':')).join('\n'),btn:()=>''})
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../technical-sheets.js'),'utf8'),c)
 const html=c.productSheetPreview(f)
 assert.match(html,/FAIXA/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>|percentualInterno|formulaSnapshot/)
 assert.doesNotMatch(html,new RegExp(f.composicao[1].nome+' \\(\\)'))
})
test('editor abre sem revisão, salva a declaração e reabre histórico com ações da revisão salva',()=>{
 const h=setup();let form,html,payload
 const esc=v=>String(v??'')
 const c=vm.createContext({state:h.s,D,find:D.get,esc,can:()=>true,
   input:(l,n,v)=>`<input name="${n}" value="${v}">`,textarea:(l,n,v)=>`<textarea name="${n}">${v}</textarea>`,
   select:()=>'',notice:t=>t,table:()=>'',btn:(l,a,id)=>`${a}:${id}`,
   modal:(t,b,fn)=>{html=b;form=fn},commit:(a,p)=>{payload=p;h.run(a,p);c.state=h.s}})
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../technical-sheets.js'),'utf8'),c)
 c.openProductSheet('p1');assert.match(html,/percentual0/)
 const data={tipo:'aberta',motivo:'Teste UI'}
 h.draft().composicao.forEach((r,i)=>{data['nome'+i]=r.nome;data['percentual'+i]='faixa '+i})
 form(data);assert.equal(payload.composicao[0].percentualExibicao,'faixa 0')
 c.openProductSheet('p1');assert.match(html,/approveProductSheet:/);assert.match(html,/faixa 0/)
 c.openProductSheet('p1','__new__');assert.doesNotMatch(html,/approveProductSheet:/)
})
