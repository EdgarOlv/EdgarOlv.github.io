const test = require('node:test')
const assert = require('node:assert/strict')
const D = require('../domain.js')
test('cadastro, edição, auditoria e recebimento mantêm vínculo; inativo bloqueia entrada', () => {
 let s = D.seed()
 const run = (a,p,user='estoque') => { const r=D.execute(s,D.get(s.usuarios,user),a,p); s=r.state; return r.id }
 const id=run('saveSupplier',{nome:'Fornecedor teste',documento:'DOC-001',contato:'Compras',ativo:true})
 assert.equal(D.get(s.fornecedores,id).nome,'Fornecedor teste')
 assert.equal(s.auditoria.at(-1).acao,'saveSupplier')
 assert.throws(()=>run('saveSupplier',{nome:'Duplicado',documento:'doc001'}),/Documento já cadastrado/)
 const lot={ingredienteId:'i1',fornecedorId:id,codigo:'FORN-TESTE',quantidade:2,fabricacao:D.today(),validade:D.day(60)}
 const lid=run('receiveLot',lot)
 run('saveSupplier',{id,nome:'Nome revisado',ativo:false})
 assert.equal(D.get(s.lotes,lid).fornecedorId,id)
 assert.throws(()=>run('receiveLot',{...lot,codigo:'NOVO'}),/Fornecedor inativo/)
 assert.throws(()=>run('saveSupplier',{nome:'Sem acesso'},'vendedor'),/perfil/)
 assert.throws(()=>run('saveSupplier',{nome:'   '}),/Nome/)
 run('saveSupplier',{id,nome:'Nome revisado',ativo:true})
 run('receiveLot',{...lot,codigo:'REATIVADO'})
 assert.equal(D.validateState(D.clone(s)).fornecedores.length,s.fornecedores.length)
})
test('fornecedores antigos sem ativo continuam elegíveis sem reset de dados', () => {
 const s=D.seed(), supplier=s.fornecedores[0]
 assert.equal(supplier.ativo,undefined)
 const r=D.execute(s,D.get(s.usuarios,'estoque'),'receiveLot',{ingredienteId:'i1',fornecedorId:supplier.id,codigo:'LEGADO',quantidade:1,fabricacao:D.today(),validade:D.day(1)})
 assert.equal(D.get(r.state.lotes,r.id).fornecedorId,supplier.id)
})
