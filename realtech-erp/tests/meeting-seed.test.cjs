const test=require('node:test')
const assert=require('node:assert/strict')
const D=require('../domain.js')
test('apresentação enxuta contém um único fluxo completo e cadastros relacionados',()=>{
 const s=D.meetingSeed(),o=s.pedidos[0],op=s.ordens[0]
 assert.equal(s.pedidos.length,1);assert.equal(s.ordens.length,1)
 assert.equal(s.produtos.length,1);assert.equal(s.clientes.length,1);assert.equal(s.fornecedores.length,2);assert.equal(s.embalagens.length,1);assert.equal(s.formulas.length,1)
 assert.equal(op.pedidoId,o.id);assert.equal(op.status,'concluida')
 assert.equal(D.orderTotal(o),110000);assert.equal(o.itens[0].quantidade,100);assert.equal(o.itens[0].unidade,'KG');assert.equal(D.packageCount(o.itens[0]),20);assert.equal(D.volumeCount(o.itens[0]),2)
 assert.equal(s.recebiveis.reduce((v,r)=>v+r.valorCentavos,0),110000)
 assert.deepEqual(s.recebiveis.map(r=>[r.valorCentavos,r.status]),[[55000,'pago'],[55000,'aberto']])
 assert.ok(o.despacho);assert.equal(o.despacho.valorCentavos,12000)
 assert.equal(s.fichasTecnicas[0].status,'aprovada')
 const productLot=s.lotes.find(l=>l.tipo==='produto');assert.equal(productLot.opId,op.id);assert.equal(productLot.status,'liberado');assert.equal(productLot.saldo,0)
 assert.ok(s.fornecedores.every(f=>D.validCnpj(f.documento)&&f.cidade&&f.cep))
 assert.ok(s.auditoria.some(a=>a.acao==='reportProduction'));assert.ok(s.auditoria.some(a=>a.acao==='dispatch'))
 assert.equal(D.validateState(JSON.parse(JSON.stringify(s))).pedidos[0].id,o.id)
})
test('saldos conferem com entradas reais da demonstração e consumo da OP',()=>{
 const s=D.meetingSeed()
 for(const item of s.formulas[0].itens){
   const lots=s.lotes.filter(l=>l.ingredienteId===item.ingredienteId)
   assert.equal(lots.length,1);assert.equal(lots[0].quantidadeInicial,item.quantidade*2);assert.equal(lots[0].saldo,item.quantidade)
   assert.ok(lots[0].valorUnitarioCentavos>lots[0].custoCentavos)
 }
 const pack=s.lotes.find(l=>l.tipo==='embalagem');assert.equal(pack.quantidadeInicial,40);assert.equal(pack.saldo,20)
 assert.equal(s.lotes.length,6)
 assert.ok(s.movimentacoes.every(m=>s.lotes.some(l=>l.id===m.loteId)))
})
