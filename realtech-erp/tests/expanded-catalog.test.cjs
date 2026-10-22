const test=require('node:test')
const assert=require('node:assert/strict')
const D=require('../domain.js')
test('catálogo ampliado mantém vínculos, lotes, custos e produtos elegíveis sem inflar pedidos',()=>{
 const s=D.expandedMeetingSeed()
 for(const [key,count] of Object.entries({ingredientes:12,produtos:5,embalagens:4,fornecedores:4,clientes:3,lotes:18,pedidos:4,ordens:2}))assert.equal(s[key].length,count,key)
 for(const p of s.produtos){
   const f=D.get(s.formulas,p.formulaId),pack=D.get(s.embalagens,p.embalagemId)
   assert.equal(f.itens.reduce((sum,i)=>sum+i.quantidade,0),f.rendimento)
   assert.equal(new Set(f.itens.map(i=>i.ingredienteId)).size,f.itens.length)
   for(const i of f.itens)assert.ok(s.ingredientes.some(x=>x.id===i.ingredienteId))
   assert.ok(D.eligibleLots(s,null).length>=0)
   assert.ok(s.lotes.some(l=>l.embalagemId===pack.id&&l.saldo>0))
   if(p.status==='ativo'){assert.ok(p.precoLiberado);assert.ok(p.precoVendaKgCentavos>0)}
   else assert.equal(p.precoLiberado,false)
 }
 assert.ok(s.fornecedores.every(f=>D.validCnpj(f.documento)))
 assert.ok(s.ingredientes.every(i=>D.eligibleLots(s,i.id).some(l=>l.saldo>0)))
 assert.ok(s.lotes.filter(l=>l.fornecedorId).every(l=>s.fornecedores.some(f=>f.id===l.fornecedorId)))
 assert.equal(D.validateState(D.clone(s)).pedidos.length,4)
})
