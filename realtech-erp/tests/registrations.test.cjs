const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path')
const D=require('../domain.js')
const fresh=()=>D.initializeRegistrations(D.realtechScenariosSeed())
function harness(){let s=fresh();return {get s(){return s},run(a,p,u='admin'){const r=D.execute(s,D.get(s.usuarios,u),a,p);s=r.state;return r.id}}}
test('taxonomia oficial preserva seis grupos, fronteiras e migração idempotente sem mudar vínculos',()=>{
 const old=D.realtechScenariosSeed(),links=JSON.stringify([old.pedidos,old.ordens,old.lotes,old.formulas]),ids=old.produtos.map(p=>p.id)
 const s=D.initializeRegistrations(old)
 assert.deepEqual(Object.values(D.registrationGroups).map(c=>c.prefix),['01','02','03','04','05','07'])
 assert.deepEqual(s.produtos.map(p=>p.id),ids);assert.equal(JSON.stringify([s.pedidos,s.ordens,s.lotes,s.formulas]),links)
 const codes=Object.keys(D.registrationGroups).flatMap(k=>s[k].map(r=>r.codigoCadastro));assert.equal(new Set(codes).size,codes.length)
 assert.ok(codes.every(c=>/^\d{2}-[1-9]\d{3}$/.test(c)));assert.ok(s.produtos.every(p=>p.classificacaoRevisar))
 const before=JSON.stringify(s);D.initializeRegistrations(s);assert.equal(JSON.stringify(s),before)
 assert.equal(D.registrationPrefix('clientes','01-9'),'019');assert.throws(()=>D.registrationPrefix('clientes','029'));assert.throws(()=>D.registrationPrefix('fornecedores','025'));assert.throws(()=>D.registrationPrefix('clientes','019001'))
})
test('sequências independentes, edição preserva código e inativação não reutiliza',()=>{
 const h=harness(),a=h.run('saveRepresentative',{nome:'Rep A',prefixoCadastro:'032'}),b=h.run('saveRepresentative',{nome:'Rep B',prefixoCadastro:'033'}),c=h.run('saveRepresentative',{nome:'Rep C',prefixoCadastro:'032'})
 assert.equal(D.get(h.s.representantes,a).codigoCadastro,'03-2002');assert.equal(D.get(h.s.representantes,c).codigoCadastro,'03-2003');assert.equal(D.get(h.s.representantes,b).codigoCadastro,'03-3002')
 h.run('saveRepresentative',{id:a,nome:'Rep editado',ativo:false,prefixoCadastro:'032'});assert.equal(D.get(h.s.representantes,a).codigoCadastro,'03-2002')
 assert.equal(D.nextRegistrationCode(h.s,'representantes','032'),'03-2004')
 const before=JSON.stringify(h.s);assert.throws(()=>h.run('saveRepresentative',{id:a,nome:'Mudança',prefixoCadastro:'033'}),/consolidado/);assert.equal(JSON.stringify(h.s),before)
 assert.throws(()=>h.run('saveRepresentative',{nome:'Sem grupo'}),/prefixo/)
 assert.throws(()=>h.run('saveRepresentative',{nome:'Não autorizado',prefixoCadastro:'032'},'producao'),/perfil/)
 assert.ok(h.s.auditoria.some(a=>a.acao==='saveRepresentative'&&a.depois.codigoCadastro==='03-2002'))
})
test('limite 999 bloqueia sem mutação e preserva contador após serialização',()=>{
 const s=fresh();s.sequenciasCadastro['032']=999;const before=JSON.stringify(s)
 assert.throws(()=>D.execute(s,D.get(s.usuarios,'admin'),'saveRepresentative',{nome:'Excedente',prefixoCadastro:'032'}),/esgotada/);assert.equal(JSON.stringify(s),before)
 assert.throws(()=>D.nextRegistrationCode(D.validateState(JSON.parse(before)),'representantes','032'),/esgotada/)
})
test('novo ingrediente recebe código automático e nova classificação mantém alias pesquisável',()=>{
 const h=harness(),id=h.run('saveIngredient',{nome:'Ingrediente novo',codigo:'IGNORAR-999',categoriaRotulagem:'Base da fórmula',grupoPadronizacao:'01',prefixoCadastro:'044'})
 const ing=D.get(h.s.ingredientes,id);assert.match(ing.codigoCadastro,/^04-4/);assert.equal(ing.codigo,ing.codigoCadastro)
 const old=h.s.ingredientes.find(i=>i.classificacaoRevisar),previous=old.codigoCadastro
 const group=old.subgrupoCadastro==='2'?'1':'2'
 h.run('saveIngredient',{...old,prefixoCadastro:'04'+group})
 assert.ok(D.get(h.s.ingredientes,old.id).codigosAnteriores.includes(previous));assert.equal(D.get(h.s.ingredientes,old.id).classificacaoRevisar,false)
})
test('editar cliente conserva carteira, limite, histórico e IDs dos pedidos',()=>{
 const h=harness(),c=structuredClone(h.s.clientes[0]),orders=JSON.stringify(h.s.pedidos)
 h.run('saveClient',{...c,cnpj:'12345678000195',nomeFantasia:'Cliente alterado',inscricaoEstadual:'ISENTO',contato:'compras@example.com',prefixoCadastro:c.codigoCadastro.replace('-','').slice(0,3)})
 const edited=D.get(h.s.clientes,c.id)
 assert.equal(edited.nomeFantasia,'Cliente alterado');assert.equal(edited.limiteCentavos,c.limiteCentavos);assert.deepEqual(edited.historicoFinanceiro,c.historicoFinanceiro);assert.equal(edited.vendedorId,c.vendedorId);assert.equal(JSON.stringify(h.s.pedidos),orders)
})
test('cadastro novo de embalagem gera código e edição mantém identidade e recebimentos',()=>{
 const h=harness(),id=h.run('savePackaging',{nome:'Pote de teste',tipo:'pote',capacidade:1,unidadeCapacidade:'KG',custo:2,prefixoCadastro:'055'})
 const pack=structuredClone(D.get(h.s.embalagens,id));assert.match(pack.codigoCadastro,/^05-5/)
 h.run('savePackaging',{...pack,custo:3,prefixoCadastro:'055'});assert.equal(D.get(h.s.embalagens,id).codigoCadastro,pack.codigoCadastro)
})
function context(s){return vm.createContext({state:s,D,selectedId:'fornecedores',user:{perfil:'administrador'},allowed:()=>true,can:()=>true,find:D.get,clients:()=>s.clientes,esc:v=>String(v??''),btn:(t,a,id)=>t+':'+a+':'+id,notice:String,badge:String,fields:JSON.stringify,searchableList:(k,l,c)=>c,intro:(a,b,c)=>a+b+(c||''),panel:(a,b)=>a+b,table:(h,r)=>r.flat().join(' '),input:(l,n,v)=>l+':'+n+':'+v,select:(l,n,o,v)=>l+':'+n+':'+v,document:{addEventListener:()=>{}}})}
test('central e busca global usam os mesmos registros, aceitam código compacto e respeitam perfil',()=>{
 const s=fresh(),c=context(s);vm.runInContext(fs.readFileSync(path.join(__dirname,'../registrations.js'),'utf8'),c)
 assert.match(c.registrationsView(),/Central de cadastros/);assert.match(c.registrationsView(),/data-route="cadastros"/)
 const row=s.fornecedores[0];assert.equal(c.searchRegistrations(row.codigoCadastro.replace('-',''))[0].row.id,row.id)
 assert.ok(c.registrationList('fornecedores').includes(row.codigoCadastro))
 c.allowed=route=>route==='clientes';assert.equal(c.searchRegistrations(row.codigoCadastro).length,0)
})

test('produto acabado novo não herda o código do produto-base e classificação não altera fórmula anterior',()=>{
 const h=harness(),source=structuredClone(h.s.produtos[0]),formula=structuredClone(D.get(h.s.formulas,source.formulaId))
 const id=h.run('createProduct',{nome:'Produto cadastro',sourceProductId:source.id,rendimento:100,itens:structuredClone(formula.itens),embalagemId:'emb-balde5',pesoLiquidoKg:5,margem:60,prefixoCadastro:'074'})
 const created=D.get(h.s.produtos,id);assert.match(created.codigoCadastro,/^07-4/);assert.notEqual(created.codigoCadastro,source.codigoCadastro);assert.equal(created.codigo,created.codigoCadastro)
 assert.deepEqual(D.get(h.s.formulas,source.formulaId),formula)
 assert.equal(new Set(h.s.produtos.map(p=>p.codigoCadastro)).size,h.s.produtos.length)
})
test('persistência rejeita código duplicado e subgrupo incompatível sem alterar estado',()=>{
 const s=fresh();s.representantes[1].codigoCadastro=s.representantes[0].codigoCadastro;s.representantes[1].subgrupoCadastro='1'
 assert.throws(()=>D.validateState(s),/duplicado/)
 const other=fresh();other.representantes[0].codigoCadastro='02-1001';assert.throws(()=>D.validateState(other),/prefixo/)
})
test('formulário existente recebe subgrupo, oculta sequência manual e mantém prefixo no salvamento',()=>{
 const s=fresh(),c=context(s);let prepared,record
 c.modal=(title,body,submit)=>{prepared=c.prepareRegistrationModal(body,submit)}
 c.commit=(action,data)=>{data.prefixoCadastro=vm.runInContext('registrySubmittingPrefix',c);const r=D.execute(s,D.get(s.usuarios,'admin'),action,data);record=D.get(r.state.representantes,r.id)}
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../registrations.js'),'utf8'),c)
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../interactions.js'),'utf8'),c)
 c.openAction('saveRepresentative','');assert.match(prepared.body,/Grupo \/ subgrupo/)
 prepared.submit({nome:'Representante via formulário',prefixoCadastro:'03-2',ativo:'true'})
 assert.equal(record.codigoCadastro,'03-2002');assert.equal(record.nome,'Representante via formulário')
})

test('sequência inicial 001 confirmada é usada em subgrupo ainda sem registros',()=>{
 const s=D.initializeRegistrations(D.emptySeed())
 assert.equal(D.nextRegistrationCode(s,'representantes','031'),'03-1001')
 const result=D.execute(s,D.get(s.usuarios,'admin'),'saveRepresentative',{nome:'Primeiro representante',prefixoCadastro:'031'})
 assert.equal(D.get(result.state.representantes,result.id).codigoCadastro,'03-1001')
})
