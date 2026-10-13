const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const D = require('../domain.js')

function clockDomain() {
  let instant = '2026-10-13T15:00:00Z'
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [instant])) }
    static now() { return new Date(instant).getTime() }
  }
  const context = vm.createContext({ Date: ClockDate, module: { exports: {} } })
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../domain.js'), 'utf8'), context)
  return { D: context.module.exports, advance(value) { instant = value } }
}

test('validade da etiqueta calcula meses/ano e apresenta somente MMM/AAAA', () => {
  assert.equal(D.labelExpiry('12 meses', '2026-10-13'), 'OUT/2027')
  assert.equal(D.labelExpiry('1 mês', '2026-12-31'), 'JAN/2027')
  assert.equal(D.labelExpiry('1 ano', '2026-10-13'), 'OUT/2027')
  assert.equal(D.labelExpiry('2027-10-02', '2026-10-13'), 'OUT/2027')
  assert.equal(D.labelExpiry('90 dias', '2026-10-13'), 'JAN/2027')
  assert.equal(D.labelExpiry('Prazo não definido', '2026-10-13'), 'A definir')
  assert.equal(D.labelExpiry('0 meses', '2026-10-13'), 'A definir')
})

test('consulta em outro dia e restauração preservam lote e validade da geração', () => {
  const clock = clockDomain(), d = clock.D
  let s = d.seed()
  const run = (action, payload) => { const result = d.execute(s, d.get(s.usuarios, 'admin'), action, payload); s = result.state; return result.id }
  const id = run('saveOrder', { modoQuantidade: 'KG', tipo: 'amostra', clienteId: 'c1', itens: [{ produtoId: 'p1', quantidade: 1 }], prazoEntrega: d.day(15) })
  const itemId = d.get(s.pedidos, id).itens[0].id
  run('prepareLabel', { pedidoId: id, itemId })
  let item = d.get(s.pedidos, id).itens[0]
  assert.equal(item.datasEtiqueta.lote, '13102026')
  assert.equal(item.datasEtiqueta.validade, 'OUT/2027')
  const revision = s.revision, events = s.auditoria.length
  clock.advance('2026-11-20T15:00:00Z')
  run('prepareLabel', { pedidoId: id, itemId })
  assert.equal(s.revision, revision)
  assert.equal(s.auditoria.length, events)
  s = d.validateState(JSON.parse(JSON.stringify(s)))
  item = d.get(s.pedidos, id).itens[0]
  assert.equal(item.datasEtiqueta.lote, '13102026')
  assert.equal(item.datasEtiqueta.validade, 'OUT/2027')
  run('createOps', { id })
  assert.equal(s.ordens.find(op => op.pedidoId === id).datasEtiqueta.lote, '13102026')
})

test('etiqueta antiga usa documento registrado e pedido/OP compartilham a data', () => {
  const clock = clockDomain(), d = clock.D
  let s = d.seed()
  const run = (action, payload) => { const result = d.execute(s, d.get(s.usuarios, 'admin'), action, payload); s = result.state; return result.id }
  const id = run('saveOrder', { modoQuantidade: 'KG', tipo: 'amostra', clienteId: 'c1', itens: [{ produtoId: 'p1', quantidade: 1 }], prazoEntrega: d.day(15) })
  run('createOps', { id })
  const opId = s.ordens.find(op => op.pedidoId === id).id
  run('issueSheet', { id: opId })
  delete d.get(s.ordens, opId).datasEtiqueta // Simula OP salva antes da v17.
  clock.advance('2026-11-20T15:00:00Z')
  run('prepareLabel', { opId })
  const op = d.get(s.ordens, opId), item = d.get(s.pedidos, id).itens[0]
  assert.equal(op.datasEtiqueta.lote, '13102026')
  assert.equal(op.datasEtiqueta.origemData, 'documentoOP-legado')
  assert.equal(item.datasEtiqueta.lote, op.datasEtiqueta.lote)
  assert.equal(D.labelDates({ validade: '12 meses' }, '2026-10-13', { validade: '2028-02-20' }).validade, 'FEV/2028')
})

test('geração de etiqueta respeita carteira e autorização e não aceita IDs inválidos', () => {
  let s = D.seed()
  const result = D.execute(s, D.get(s.usuarios, 'admin'), 'saveOrder', { clienteId: 'c1', itens: [{ produtoId: 'p1', quantidade: 1 }], prazoEntrega: D.day(15), condicoesPagamentoDias: [14] })
  s = result.state
  const order = D.get(s.pedidos, result.id), payload = { pedidoId: order.id, itemId: order.itens[0].id }
  assert.throws(() => D.execute(s, D.get(s.usuarios, 'estoque'), 'prepareLabel', payload), /perfil/)
  const other = { ...D.get(s.usuarios, 'vendedor'), id: 'other', nome: 'Outro vendedor' }
  s.usuarios.push(other)
  assert.throws(() => D.execute(s, other, 'prepareLabel', payload), /outro vendedor/)
  assert.throws(() => D.execute(s, D.get(s.usuarios, 'admin'), 'prepareLabel', { ...payload, itemId: 'invalid' }), /Registro não encontrado/)
})

test('OP nova usa dia da geração da etiqueta, não a data anterior do documento', () => {
  const clock = clockDomain(), d = clock.D
  let s = d.seed()
  const run = (action, payload) => { const result = d.execute(s, d.get(s.usuarios, 'admin'), action, payload); s = result.state; return result.id }
  const id = run('saveOrder', { modoQuantidade: 'KG', tipo: 'amostra', clienteId: 'c1', itens: [{ produtoId: 'p1', quantidade: 1 }], prazoEntrega: d.day(15) })
  run('createOps', { id })
  const opId = s.ordens.find(op => op.pedidoId === id).id
  run('issueSheet', { id: opId })
  clock.advance('2026-11-20T15:00:00Z')
  run('prepareLabel', { opId })
  assert.equal(d.get(s.ordens, opId).datasEtiqueta.lote, '20112026')
  assert.equal(d.get(s.ordens, opId).datasEtiqueta.validade, 'NOV/2027')
  assert.equal(d.get(s.ordens, opId).datasEtiqueta.origemData, 'geracao')
})

test('prévia usa datas gravadas sem recalcular pelo dia de consulta nos dois modelos', () => {
  const state = D.seed(), item = { id: 'label', produtoId: 'p1', produtoNome: 'Produto', formula: state.formulas[0], pesoKg: 5, unidade: 'KG', quantidadePrevista: 5,
    datasEtiqueta: { lote: '13102026', validade: 'OUT/2027', geradaEm: '2026-10-13' } }
  const context = vm.createContext({ D, state, find: D.get, esc: String, btn: () => '', Intl, document: { addEventListener() {} } })
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../interactions.js'), 'utf8'), context)
  for (const model of state.etiquetas) {
    const html = context.labelPreview(item, model, { validade: '2040-01-01' })
    assert.match(html, /13102026/)
    assert.match(html, /OUT\/2027/)
    assert.doesNotMatch(html, /JAN\/2040/)
  }
})

test('inspeção mantém laudo oculto e preserva referências históricas', () => {
  const state = D.seed()
  state.lotes.push({ id: 'pending', codigo: 'PA-TEST', tipo: 'produto', status: 'pendente' })
  let body
  const context = vm.createContext({ D, state, find: D.get, can: () => true, notice: () => '', select: () => '', textarea: () => '', document: { addEventListener() {} }, modal: (_, value) => { body = value } })
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../interactions.js'), 'utf8'), context)
  context.openAction('inspect', 'pending')
  assert.match(body, /type="hidden" name="laudo"/)
  assert.doesNotMatch(body, /Referência do laudo/)
  state.lotes.push({ id: 'old', tipo: 'produto', status: 'liberado', inspecoes: [{ laudo: 'LAUDO-ANTIGO' }] })
  assert.equal(D.validateState(JSON.parse(JSON.stringify(state))).lotes.find(l => l.id === 'old').inspecoes[0].laudo, 'LAUDO-ANTIGO')
})

test('abrir etiqueta do pedido grava uma vez e voltar ao modal conserva a geração', () => {
  const clock = clockDomain(), d = clock.D
  let state = d.seed()
  const created = d.execute(state, d.get(state.usuarios, 'admin'), 'saveOrder', { clienteId: 'c1', modoQuantidade: 'KG', itens: [{ produtoId: 'p1', quantidade: 1 }], prazoEntrega: d.day(15), condicoesPagamentoDias: [14] })
  state = created.state
  let body, commits = 0
  const context = vm.createContext({ D: d, state, find: d.get, esc: String, btn: () => '', allowed: () => true, can: () => true, notice: () => '',
    document: { addEventListener() {} }, modal: (_, value) => { body = value } })
  context.commit = (action, payload) => { commits++; context.state = d.execute(context.state, d.get(context.state.usuarios, 'admin'), action, payload).state }
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../interactions.js'), 'utf8'), context)
  context.openAction('viewOrderLabel', `${created.id}:0`)
  assert.match(body, /13102026/)
  assert.match(body, /OUT\/2027/)
  clock.advance('2026-11-20T15:00:00Z')
  context.openAction('viewOrderLabel', `${created.id}:0`)
  assert.equal(commits, 1)
  assert.match(body, /13102026/)
  const saved = d.execute(context.state, d.get(context.state.usuarios, 'admin'), 'saveOrder', { id: created.id, clienteId: 'c1', modoQuantidade: 'KG', itens: [{ produtoId: 'p1', quantidade: 2 }], prazoEntrega: d.day(15), condicoesPagamentoDias: [14] })
  assert.equal(d.get(saved.state.pedidos, created.id).itens[0].datasEtiqueta.lote, '13102026')
})
