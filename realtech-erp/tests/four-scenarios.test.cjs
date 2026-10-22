const test=require('node:test')
const assert=require('node:assert/strict')
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path')
const D=require('../domain.js')
test('quatro cenários têm estados distintos, duas OPs e guia completo com links',()=>{
 const s=D.meetingScenariosSeed()
 assert.equal(s.pedidos.length,4);assert.equal(s.ordens.length,2)
 assert.equal(new Set(s.pedidos.map(o=>D.stage(s,o))).size,4)
 assert.ok(s.lotes.some(l=>l.tipo==='produto'&&l.status==='pendente'))
 const c=vm.createContext({state:s,D,user:s.usuarios[0],orders:()=>s.pedidos,find:D.get,esc:String,link:(t,r,id)=>`${r}:${id}`,btn:t=>t,intro:(a,b)=>a+b,panel:(a,b)=>a+b,table:(h,r)=>JSON.stringify([h,r]),notice:String})
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../views.js'),'utf8'),c)
 const html=c.guideView()
 for(const id of s.demonstracao.cenarios) assert.ok(html.includes('pedidos:'+id))
 for(const term of ['Financeiro','apontamento','inspeção','faturamento','recebimento','Amostras','etiquetas']) assert.ok(html.includes(term))
})
for (const factory of [D.meetingScenariosSeed,D.expandedMeetingSeed]) test('todos os cenários podem ser concluídos: '+factory.name,()=>{
 let s=factory()
 const run=(a,p)=>{const r=D.execute(s,D.get(s.usuarios,'admin'),a,p);s=r.state;return r.id}
 const ids=[...s.demonstracao.cenarios]
 for(const id of ids){
   let o=D.get(s.pedidos,id)
   if(o.status==='rascunho') run('submitOrder',{id})
   o=D.get(s.pedidos,id)
   if(o.status==='aguardandoAprovacao'){
     run('analyze',{id,decisao:'liberado',justificativa:'Teste completo'})
     run('approveOrder',{id});run('createOps',{id})
   }
   let op=s.ordens.find(x=>x.pedidoId===id)
   if(!op.documentoOp) run('issueSheet',{id:op.id})
   op=D.get(s.ordens,op.id)
   if(op.status==='aguardando')run('startOp',{id:op.id})
   op=D.get(s.ordens,op.id)
   if(op.status==='emProducao'){
     const q=op.quantidadePrevista-op.quantidadeProduzida
     run('reportProduction',{id:op.id,quantidade:q,perdasKg:0,sobrasKg:0,validade:D.day(180),consumos:D.suggestConsumption(s,op,q*op.pesoKg)})
   }
   for(const lot of s.lotes.filter(l=>l.pedidoId===id&&l.status==='pendente'))run('inspect',{id:lot.id,decisao:'aprovado'})
   o=D.get(s.pedidos,id)
   if(!o.faturamento)run('bill',{id,referencia:'FAT-'+id})
   o=D.get(s.pedidos,id)
   if(!o.despacho)run('dispatch',{id,transportadora:'Exemplo',rastreamento:'TEST-'+id,comprovante:'ROM-'+id,valor:0,tomadorFrete:'destinatario',dataSaida:D.today(),prazo:D.day(3)})
   run('confirmDelivery',{id,dataEntrega:D.today(),recebidoPor:'Recebedor fictício'})
   for(const r of s.recebiveis.filter(r=>r.pedidoId===id&&r.status==='aberto'))run('registerReceipt',{id:r.id,recebidoEm:D.today(),referencia:'REC-'+r.id})
 }
 assert.equal(s.ordens.length,4);assert.ok(s.ordens.every(o=>o.status==='concluida'))
 assert.ok(s.recebiveis.every(r=>r.status==='pago'));assert.ok(s.lotes.every(l=>l.saldo>=0))
 assert.equal(s.lotes.filter(l=>l.tipo==='ingrediente').reduce((v,l)=>v+l.saldo,0),factory === D.expandedMeetingSeed ? 660 : 20)
 assert.equal(s.lotes.find(l=>l.tipo==='embalagem').saldo,4)
})
