const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const D = require('../domain.js')
function harness(){let s=D.seed();return {get s(){return s},run(a,p){const r=D.execute(s,D.get(s.usuarios,'admin'),a,p);s=r.state;return r.id}}}
test('fornecedor exige CNPJ com formato estrito e DV, normaliza e impede duplicidade sem mutação parcial',()=>{
 const h=harness(), before=D.clone(h.s)
 for(const documento of ['', '123', '11.111.111/1111-11','12-345678/0001.95','12.345.678/0001-96','!12345678000195']) {
   assert.throws(()=>h.run('saveSupplier',{nome:'Teste',documento}),/CNPJ/)
   assert.deepEqual(h.s,before)
 }
 const id=h.run('saveSupplier',{nome:'Teste',documento:'12.345.678/0001-95',inscricaoEstadual:'ISENTO',endereco:'Rua A, 10',bairro:'Centro',cidade:'São Carlos',estado:'sp',cep:'13560-000'})
 const f=D.get(h.s.fornecedores,id)
 assert.equal(f.documento,'12345678000195');assert.equal(f.estado,'SP');assert.equal(f.cep,'13560000');assert.equal(f.inscricaoEstadual,'ISENTO');assert.equal(f.bairro,'Centro')
 assert.throws(()=>h.run('saveSupplier',{nome:'Duplicado',cnpj:'12345678000195'}),/já cadastrado/)
 assert.throws(()=>h.run('saveSupplier',{id,nome:'Teste',estado:'XX'}),/Estado/)
 assert.throws(()=>h.run('saveSupplier',{id,nome:'Teste',cep:'123'}),/CEP/)
 h.run('saveSupplier',{id,nome:'Editado'});assert.equal(D.get(h.s.fornecedores,id).cidade,'São Carlos')
 assert.equal(D.formatCnpj(f.documento),'12.345.678/0001-95')
})
test('CNPJ alfanumérico usa DV oficial e preserva letras na identidade',()=>{
 assert.equal(D.validCnpj('12.ABC.345/01DE-35'),true)
 assert.equal(D.validCnpj('12.ABC.345/01DE-36'),false)
 const h=harness(),id=h.run('saveSupplier',{nome:'Exemplo sintético',documento:'12.abc.345/01de-35'})
 assert.equal(D.get(h.s.fornecedores,id).documento,'12ABC34501DE35')
 assert.throws(()=>h.run('saveSupplier',{nome:'Repetido',documento:'12ABC34501DE35'}),/já cadastrado/)
})
test('compra e custo são comparáveis na mesma unidade e conservados por lote',()=>{
 const h=harness(),entry={fornecedorId:'s1',codigo:'PRECO-L',ingredienteId:'i1',quantidade:10,unidade:'L',pesoLiquidoKg:8,valorUnitario:10,icmsPercentual:18,icmsCreditado:true,ipiPercentual:5,ipiCreditado:false,fabricacao:D.today(),validade:D.day(60)}
 const id=h.run('receiveLot',entry),lot=D.get(h.s.lotes,id),before=D.clone(lot),p=D.receiptPrices(lot)
 assert.equal(p.compraCentavos,1250);assert.equal(p.custoCentavos,1025);assert.equal(p.unidade,'kg')
 const packId=h.run('receivePackagingLot',{...entry,embalagemId:'emb-balde5',codigo:'PRECO-UN',quantidade:20,valorUnitario:5})
 assert.deepEqual(D.receiptPrices(D.get(h.s.lotes,packId)),{compraCentavos:500,custoCentavos:410,unidade:'UN'})
 h.run('receiveLot',{...entry,codigo:'PRECO-KG',unidade:'KG',valorUnitario:20})
 assert.deepEqual(D.get(h.s.lotes,id),before)
 assert.equal(D.receiptPrices({tipo:'ingrediente',custoCentavos:100}).compraCentavos,null)
})
test('lookup por código preenche nome/apresentação sem usar valores livres do recebimento',()=>{
 const state=D.seed(),control={value:'emb-balde5'},name={},presentation={}
 const source=fs.readFileSync(path.join(__dirname,'../interactions.js'),'utf8')
 const c=vm.createContext({state,document:{querySelector:q=>q.includes('embalagemNome')?name:q.includes('embalagemApresentacao')?presentation:control}})
 vm.runInContext(source.slice(source.indexOf('function syncReceiptPackaging('),source.indexOf('function openOrderForm(')),c)
 c.syncReceiptPackaging();assert.equal(control.required,true);assert.equal(name.value,state.embalagens[0].nome);assert.match(presentation.value,/5 KG/)
 control.value='';c.syncReceiptPackaging();assert.equal(name.value,'');assert.equal(presentation.value,'')
})
test('telas apresentam preço de compra e custo separados por lote e no saldo',()=>{
 const h=harness();h.run('receivePackagingLot',{embalagemId:'emb-balde5',fornecedorId:'s1',codigo:'VIEW',quantidade:10,valorUnitario:5,icmsPercentual:18,icmsCreditado:true,fabricacao:D.today(),validade:D.day(60)})
 const c=vm.createContext({state:h.s,D,esc:String,qty:String,money:n=>(n/100).toFixed(2),find:D.get,fmtDate:String,fmtTime:String,badge:String,actionButton:()=>'',intro:()=>'',notice:()=>'',panel:(t,b)=>t+b,table:(cols,rows)=>cols.join('|')+JSON.stringify(rows)})
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../views.js'),'utf8'),c)
 const html=c.packagingStockView();assert.match(html,/Preço de compra R\$ \/ UN/);assert.match(html,/Custo R\$ \/ UN/);assert.match(html,/5.00/);assert.match(html,/4.10/);assert.match(html,/legado/)
})
test('formulários integram código da embalagem e campos estruturados do fornecedor',()=>{
 const state=D.seed();let html=''
 const c=vm.createContext({state,D,find:D.get,esc:String,can:()=>true,
   input:(l,n,v,t,a)=>`<label>${l}<input name="${n}" value="${v}" ${a||''}></label>`,
   select:(l,n,opts)=>`<label>${l}<select name="${n}">${opts.map(([id,t])=>`<option value="${id}">${t}</option>`).join('')}</select></label>`,
   textarea:(l,n)=>`<textarea name="${n}"></textarea>`,modal:(t,b)=>html=b,
   document:{querySelector:()=>null,addEventListener:()=>{}}})
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../interactions.js'),'utf8'),c)
 c.openAction('receivePackagingLot');assert.match(html,/Código cadastrado da embalagem/);assert.match(html,/Nomenclatura cadastrada/);assert.match(html,/Apresentação cadastrada/);assert.match(html,/>EMB-001<\/option>/)
 c.openAction('saveSupplier');for(const name of ['documento','inscricaoEstadual','endereco','bairro','cidade','estado','cep'])assert.ok(html.includes(`name="${name}"`))
 assert.match(html,/name="documento"[^>]*required/)
})
