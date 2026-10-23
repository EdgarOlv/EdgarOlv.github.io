const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path')
const D=require('../domain.js')
const s=D.realtechScenariosSeed()
test('v26 mantém catálogo, estados e integridade de todas as jornadas',()=>{
 assert.equal(s.produtos.length,13);assert.equal(s.ingredientes.length,24);assert.equal(s.pedidos.length,13)
 assert.ok(s.produtos.some(p=>p.nome.startsWith('RealMix')));assert.ok(s.produtos.some(p=>p.nome.startsWith('RealMax')))
 assert.ok(new Set(s.pedidos.map(o=>D.stage(s,o))).size>=11)
 for(const p of s.produtos){const f=D.get(s.formulas,p.formulaId);assert.equal(f.itens.reduce((a,i)=>a+i.quantidade,0),f.rendimento);for(const i of f.itens)D.get(s.ingredientes,i.ingredienteId)}
 for(const l of s.lotes){assert.ok(l.saldo>=0);if(l.tipo==='produto'){D.get(s.produtos,l.produtoId);const op=D.get(s.ordens,l.opId);D.get(s.pedidos,op.pedidoId)}}
 const blocked=s.pedidos.find(o=>D.stage(s,o)==='Bloqueado na qualidade')
 assert.ok(D.billingIssues(s,blocked).length);assert.throws(()=>D.execute(s,D.get(s.usuarios,'admin'),'bill',{id:blocked.id,referencia:'TEST'}))
 assert.equal(D.validateState(D.clone(s)).pedidos.length,13)
 for(const r of s.recebiveis)D.get(s.pedidos,r.pedidoId)
})
test('lote legado abre ficha do produto e preserva restrição de acesso',()=>{
 let opened
 const user={perfil:'qualidade'}
 const c=vm.createContext({state:s,D,user,can:()=>user.perfil==='qualidade',find:D.get,openProductSheet:id=>opened=id,document:{addEventListener:()=>{}}})
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../interactions.js'),'utf8'),c)
 const lot=s.lotes.find(l=>l.tipo==='produto')
 c.openAction('technicalSheet',lot.id);assert.equal(opened,lot.produtoId)
 user.perfil='vendedor';assert.throws(()=>c.openAction('technicalSheet',lot.id),/restrita/)
})
test('Qualidade prioriza lotes e ficha usa produto; catálogo recolhível contém revisão e prévia',()=>{
 const c=vm.createContext({state:s,D,user:{perfil:'administrador'},can:()=>true,find:D.get,esc:String,qty:String,unitLabel:()=> 'kg',badge:String,
 intro:(a,b)=>a+b,panel:(a,b)=>a+b,input:()=>'',select:()=>'',table:(h,r)=>r.flat().join(' '),btn:(t,a,id)=>t+':'+a+':'+id,actionButton:(t,a,id)=>t+':'+a+':'+id})
 for(const name of ['technical-sheets.js','views.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+name),'utf8'),c)
 const html=c.qualityView();assert.ok(html.indexOf('Lotes produzidos')<html.indexOf('Fichas técnicas dos produtos'))
 const lot=s.lotes.find(l=>l.tipo==='produto');assert.ok(html.includes('Ficha do produto:productSheet:'+lot.produtoId))
 assert.match(html,/<details class="quality-sheets">/);assert.match(html,/Visualizar ficha técnica/);assert.match(html,/data-quality-status="pendente"/)
})
