const test = require('node:test')
const assert = require('node:assert/strict')
const D = require('../domain.js')
function harness() {
  let s = D.seed()
  return {
    get s() {
      return s
    },
    run(a, p = {}, who = 'admin') {
      const r = D.execute(s, D.get(s.usuarios, who), a, p)
      s = r.state
      return r.id
    },
    set(fn) {
      fn(s)
    }
  }
}
function create(
  h,
  client = 'c1',
  items = [
    { produtoId: 'p1', quantidade: 20 },
    { produtoId: 'p2', quantidade: 5 }
  ]
) {
  return h.run('saveOrder', {
    clienteId: client,
    itens: items,
    prazoEntrega: D.day(15),
    condicoesPagamentoDias: [14, 20],
    condicoesComerciais: '30/60 dias'
  })
}
test('permite salvar pedido com parcelas sem condições comerciais adicionais', () => {
  const h = harness()
  const id = h.run('saveOrder', {
    clienteId: 'c1',
    itens: [{ produtoId: 'p1', quantidade: 20 }],
    prazoEntrega: D.day(15),
    condicoesPagamentoDias: [30, 60]
  })

  const order = D.get(h.s.pedidos, id)
  assert.equal(order.condicoesComerciais, '')
  assert.deepEqual(order.condicoesPagamentoDias, [30, 60])
})
function approve(h, id) {
  h.run('submitOrder', { id })
  h.run('analyze', { id, decisao: 'liberado' }, 'financeiro')
  h.run('approveOrder', { id }, 'vendedor')
}
function ready(h, id) {
  approve(h, id)
  h.run('createOps', { id }, 'producao')
  for (const op of h.s.ordens) {
    h.run('issueSheet', { id: op.id }, 'producao')
    h.run('startOp', { id: op.id }, 'producao')
  }
}
function report(h, id, q, loss = 0, surplus = 0) {
  const op = D.get(h.s.ordens, id)
  h.run(
    'reportProduction',
    {
      id,
      quantidade: q,
      perdasKg: loss,
      sobrasKg: surplus,
      observacoes: 'Apontamento teste',
      validade: D.day(180),
      consumos: D.suggestConsumption(h.s, op, q * op.pesoKg + loss + surplus)
    },
    'producao'
  )
}
function inspectAll(h) {
  for (const l of h.s.lotes.filter(
    l => l.tipo === 'produto' && l.status === 'pendente'
  ))
    h.run('inspect', { id: l.id, decisao: 'aprovado' }, 'qualidade')
}
function dispatchData(id) {
  return {
    id,
    transportadora: 'Transportadora teste',
    valor: 150,
    rastreamento: 'TESTE123',
    comprovante: 'COMP-DEMO',
    tomadorFrete: 'destinatario',
    dataSaida: D.today(),
    prazo: D.day(3)
  }
}
test('Fluxo completo com dois itens, perfis, produção parcial, perdas, sobras, faturamento e despacho', () => {
  const h = harness(),
    id = create(h)
  assert.equal(D.orderTotal(h.s.pedidos[0]), 230000)
  assert.equal(D.commission(h.s.pedidos[0]), 10900)
  ready(h, id)
  assert.equal(h.s.ordens.length, 2)
  const [a, b] = h.s.ordens
  assert.equal(
    D.requirements(a, 100).reduce((n, r) => n + r.quantidade, 0),
    100
  )
  report(h, a.id, 10, 1, 1)
  assert.equal(D.get(h.s.ordens, a.id).status, 'emProducao')
  assert.throws(() => h.run('bill', { id, referencia: 'FAT' }), /bloqueado/)
  report(h, a.id, 10)
  report(h, b.id, 5)
  assert.throws(() => h.run('bill', { id, referencia: 'FAT' }), /Qualidade/)
  inspectAll(h)
  assert.deepEqual(D.billingIssues(h.s, h.s.pedidos[0]), [])
  h.run('bill', { id, referencia: 'FAT-001' }, 'fiscal')
  h.run('dispatch', dispatchData(id), 'fiscal')
  assert.equal(D.stage(h.s, h.s.pedidos[0]), 'Em faturamento · Despachado')
  h.run(
    'confirmDelivery',
    { id, dataEntrega: D.today(), recebidoPor: 'Cliente teste' },
    'fiscal'
  )
  assert.equal(D.stage(h.s, h.s.pedidos[0]), 'Entregue · Em faturamento')
  assert.ok(
    h.s.lotes.filter(l => l.tipo === 'produto').every(l => l.saldo === 0)
  )
  assert.equal(D.get(h.s.ordens, a.id).sobrasKg, 1)
  assert.equal(D.get(h.s.ordens, a.id).perdasKg, 1)
  const recebivel = h.s.recebiveis[0]
  assert.equal(recebivel.status, 'aberto')
  h.run(
    'registerReceipt',
    { id: recebivel.id, recebidoEm: D.today(), referencia: 'PIX-DEMO' },
    'financeiro'
  )
  assert.equal(
    h.s.recebiveis.reduce((sum, r) => sum + r.comissaoCentavos, 0),
    10900
  )
  assert.equal(h.s.recebiveis[0].status, 'pago')
  assert.ok(h.s.auditoria.some(a => a.perfil === 'financeiro'))
  assert.ok(h.s.auditoria.some(a => a.perfil === 'qualidade'))
  const consumed = D.get(h.s.ordens, a.id)
    .apontamentos.flatMap(a => a.consumos)
    .filter(c => c.ingredienteId === 'i1')
  assert.ok(new Set(consumed.map(c => c.loteId)).size > 1)
  const materialInput = h.s.movimentacoes
    .filter(m => m.tipo === 'consumo')
    .reduce((n, m) => n - m.quantidade, 0)
  assert.ok(Math.abs(materialInput - 202) < 0.001)
})
test('Simulação de preço considera custo primário, encargos fixos e margem de venda', () => {
  const h = harness()
  const p = D.get(h.s.produtos, 'p1')
  const sim = D.priceSimulation(h.s, p, 60)

  assert.equal(sim.margemPercentual, 60)
  assert.ok(sim.custoPrimarioCentavos > 0)
  assert.ok(sim.custoFixosCentavos > 0)
  assert.ok(sim.precoCentavos > sim.custoPrimarioCentavos)
  assert.ok(sim.custoFinalCentavos >= sim.custoPrimarioCentavos)
})

test('Precificação usa markup sobre custo e gross-up sobre encargos da venda', () => {
  const h = harness()
  const p = D.get(h.s.produtos, 'p1')
  p.pesoKg = 1
  p.embalagemCentavos = 0
  p.precificacao = {
    margemPercentual: 60,
    embalagemCentavosKg: 103.654,
    financeiroCentavosKg: 125,
    maoDeObraCentavosKg: 75,
    encargosFixos: [
      { nome: 'Nota fiscal', percentual: 10.5 },
      { nome: 'Comissão técnica', percentual: 5 },
      { nome: 'Comissão comercial', percentual: 5 },
      { nome: 'Comissão extra cliente', percentual: 0 }
    ]
  }
  const sim = D.priceSimulation(h.s, p, 60)

  assert.equal(sim.custoPrimarioCentavos, 849)
  assert.equal(sim.valorLucroCentavos, 509)
  assert.equal(sim.baseComLucroCentavos, 1358)
  assert.equal(sim.encargosPercentual, 20.5)
  assert.equal(sim.precoKgCentavos, 1709)
  assert.equal(sim.precoApresentacoes[1].precoCentavos, 855)
})

test('Parâmetros globais de precificação são usados pelos produtos', () => {
  const h = harness()
  h.run(
    'savePricingSettings',
    {
      margemPadrao: 50,
      cenariosLucratividade: [25, 50, 75],
      financeiroCentavosKg: 2,
      maoDeObraCentavosKg: 3,
      outrosCustosCentavosKg: 0,
      encargosFixos: [
        { nome: 'Nota fiscal', percentual: 10 },
        { nome: 'Comissão técnica', percentual: 5 },
        { nome: 'Comissão comercial', percentual: 0 },
        { nome: 'Comissão extra cliente', percentual: 0 }
      ]
    },
    'quimica'
  )
  const p = D.get(h.s.produtos, 'p1')
  delete p.precificacao.margemPercentual
  const sim = D.priceSimulation(h.s, p)
  assert.equal(sim.margemPercentual, 50)
  assert.equal(sim.encargosPercentual, 15)
  assert.deepEqual(
    D.priceScenarios(h.s, p).map(row => row.margem),
    [25, 50, 75]
  )
})

test('Produto pode ser criado por cópia e preço aprovado gera snapshot', () => {
  const h = harness()
  const id = h.run(
    'createProduct',
    {
      sourceProductId: 'p1',
      codigo: 'PROD-COPIA',
      nome: 'Produto copiado',
      categoria: 'Testes',
      formulaCodigo: 'FORM-COPIA',
      formulaNome: 'Fórmula copiada'
    },
    'quimica'
  )
  const product = D.get(h.s.produtos, id)
  assert.equal(product.precoLiberado, false)
  assert.notEqual(product.formulaId, 'f1v2')
  assert.equal(
    D.get(h.s.formulas, product.formulaId).status,
    'emDesenvolvimento'
  )

  h.run(
    'activateVersion',
    {
      id: product.formulaId,
      justificativa: 'Validação da fórmula copiada'
    },
    'quimica'
  )
  h.run(
    'releasePrice',
    {
      id,
      margem: 60,
      financeiroCentavosKg: 125,
      maoDeObraCentavosKg: 75,
      outrosCustosCentavosKg: 0,
      embalagemCentavosKg: 100,
      encargosFixos: [
        { nome: 'Nota fiscal', percentual: 10.5 },
        { nome: 'Comissão técnica', percentual: 5 },
        { nome: 'Comissão comercial', percentual: 5 },
        { nome: 'Comissão extra cliente', percentual: 0 }
      ],
      motivoAjuste: ''
    },
    'quimica'
  )
  const approved = D.get(h.s.produtos, id)
  assert.equal(approved.precificacao.historico.length, 1)
  assert.equal(approved.precificacao.historico[0].status, 'APROVADO')
  assert.equal(
    approved.precificacao.historico[0].precoVendaKgCentavos,
    approved.precoVendaKgCentavos
  )
})

test('Pedido calcula volumes por tipo, unidades por volume e arredonda o restante', () => {
  const h = harness(),
    id = create(h)
  const order = D.get(h.s.pedidos, id)
  assert.equal(D.volumeCount(order.itens[0]), 2)
  assert.equal(D.volumeCount(order.itens[1]), 3)
  assert.equal(D.orderVolumeCount(order), 5)
  assert.equal(order.itens[0].volumeTipo, 'Pacote')
  assert.equal(order.itens[1].limiteUnidadesPorVolume, 2)
  h.set(s => (s.produtos[0].limiteUnidadesPorVolume = 9))
  assert.throws(
    () => create(h, 'c1', [{ produtoId: 'p1', quantidade: 1 }]),
    /Configuração de volume/
  )
})
test('Parcelas nascem no pedido, dividem centavos exatamente e não bloqueiam despacho', () => {
  const h = harness(),
    id = create(h, 'c1', [{ produtoId: 'p1', quantidade: 1 }])
  const order = D.get(h.s.pedidos, id),
    plan = D.installmentPlan(D.orderTotal(order), order.condicoesPagamentoDias)
  assert.deepEqual(
    plan.map(p => p.prazoDias),
    [14, 20]
  )
  assert.equal(
    plan.reduce((sum, p) => sum + p.valorCentavos, 0),
    D.orderTotal(order)
  )
  ready(h, id)
  report(h, h.s.ordens[0].id, 1)
  inspectAll(h)
  h.run('bill', { id, referencia: 'FAT-PARCELADA' })
  assert.equal(h.s.recebiveis.length, 2)
  assert.equal(h.s.pedidos[0].faturamento.status, 'emAndamento')
  h.run('dispatch', dispatchData(id))
  assert.equal(D.stage(h.s, h.s.pedidos[0]), 'Em faturamento · Despachado')
  for (const r of h.s.recebiveis)
    h.run(
      'registerReceipt',
      { id: r.id, recebidoEm: D.today(), referencia: `P-${r.parcelaNumero}` },
      'financeiro'
    )
  assert.equal(h.s.pedidos[0].faturamento.status, 'concluido')
})
test('Pedido aprovado aguarda lote e só libera geração de OP com estoque suficiente', () => {
  const h = harness(),
    id = create(h, 'c1', [{ produtoId: 'p1', quantidade: 20 }])
  approve(h, id)
  h.set(s =>
    s.lotes
      .filter(l => l.tipo === 'ingrediente' && l.ingredienteId === 'i1')
      .forEach(l => (l.saldo = 0))
  )
  const order = D.get(h.s.pedidos, id)
  assert.equal(D.orderStockAvailability(h.s, order).available, false)
  assert.equal(D.stage(h.s, order), 'Aguardando lote')
  assert.throws(
    () => h.run('createOps', { id }, 'producao'),
    /Estoque insuficiente.*Aguardando lote/
  )
  h.run(
    'receiveLot',
    {
      ingredienteId: 'i1',
      fornecedorId: 's1',
      codigo: 'REC-ESTOQUE-TESTE',
      quantidade: 100,
      fabricacao: D.today(),
      validade: D.day(90)
    },
    'estoque'
  )
  assert.equal(D.orderStockAvailability(h.s, order).available, true)
  assert.equal(D.stage(h.s, order), 'Gerar OPs')
  h.run('createOps', { id }, 'producao')
  assert.equal(h.s.ordens.length, 1)
})
test('Histórico de versões identifica a versão atual e mantém releases íntegros', () => {
  const current = D.releases.filter(release => release.current)
  assert.equal(current.length, 1)
  assert.equal(current[0].version, `v${D.VERSION}`)
  assert.equal(
    new Set(D.releases.map(release => release.version)).size,
    D.releases.length
  )
  assert.ok(
    D.releases.every(
      release =>
        release.date &&
        release.title &&
        release.changes.length > 0 &&
        release.changes.every(
          change => change.area && change.title && change.status
        )
    )
  )
})
test('Pedido nasce no sistema, recebe prioridade e limite de produção em 7 dias', () => {
  const h = harness(),
    id = create(h)
  const order = D.get(h.s.pedidos, id)
  assert.equal(order.origem, 'sistema')
  assert.equal(D.productionDeadline(order), D.addDays(order.criadoEm, 7))
  h.set(s => (s.pedidos[0].origem = 'externo'))
  assert.throws(() => h.run('submitOrder', { id }), /Pedido externo/)
})
test('Despacho exige tomador válido e entrega só é confirmada após a saída', () => {
  const h = harness(),
    id = create(h, 'c1', [{ produtoId: 'p1', quantidade: 1 }])
  ready(h, id)
  report(h, h.s.ordens[0].id, 1)
  inspectAll(h)
  h.run('bill', { id, referencia: 'FAT' })
  assert.throws(
    () => h.run('dispatch', { ...dispatchData(id), tomadorFrete: 'terceiro' }),
    /Tomador/
  )
  h.run('dispatch', dispatchData(id))
  assert.throws(
    () =>
      h.run('confirmDelivery', {
        id,
        dataEntrega: D.day(1),
        recebidoPor: 'Cliente'
      }),
    /entre a saída e hoje/
  )
  h.run('confirmDelivery', {
    id,
    dataEntrega: D.today(),
    recebidoPor: 'Cliente'
  })
  assert.throws(
    () =>
      h.run('confirmDelivery', {
        id,
        dataEntrega: D.today(),
        recebidoPor: 'Cliente'
      }),
    /já confirmada/
  )
})
test('Autorizações são verificadas no domínio, não apenas nos botões', () => {
  const h = harness(),
    id = create(h)
  for (const [a, p, u] of [
    ['analyze', { id, decisao: 'liberado' }, 'vendedor'],
    ['approveOrder', { id }, 'financeiro'],
    ['reportProduction', {}, 'financeiro'],
    ['releasePrice', { id: 'p1', margem: 30 }, 'diretor'],
    ['dispatch', { id }, 'qualidade']
  ])
    assert.throws(() => h.run(a, p, u), /perfil/)
})
test('Cliente inativo, produto em desenvolvimento, tabela e fórmula não liberadas são recusados', () => {
  const h = harness()
  assert.throws(() => create(h, 'c3'), /inativo/)
  assert.throws(
    () => create(h, 'c1', [{ produtoId: 'p3', quantidade: 2 }]),
    /liberados/
  )
  h.set(s => (s.produtos[0].precoLiberado = false))
  assert.throws(() => create(h), /liberados/)
  h.set(s => {
    s.produtos[0].precoLiberado = true
    s.formulas[0].status = 'obsoleta'
  })
  assert.throws(() => create(h), /ativa/)
})
test('Quantidades, prazo, itens duplicados e valores não finitos são recusados', () => {
  const h = harness()
  for (const n of [0, -1, 1.5, NaN, Infinity])
    assert.throws(() => create(h, 'c1', [{ produtoId: 'p1', quantidade: n }]))
  assert.throws(
    () =>
      create(h, 'c1', [
        { produtoId: 'p1', quantidade: 1 },
        { produtoId: 'p1', quantidade: 1 }
      ]),
    /Agrupe/
  )
  assert.throws(
    () =>
      h.run('saveOrder', {
        clienteId: 'c1',
        itens: [{ produtoId: 'p1', quantidade: 1 }],
        prazoEntrega: D.day(-1),
        condicoesComerciais: 'À vista'
      }),
    /passado/
  )
})
test('Financeiro bloqueia avanço e exige motivo de restrição; nova liberação permite continuar', () => {
  const h = harness(),
    id = create(h, 'c2')
  h.run('submitOrder', { id })
  assert.throws(() => h.run('approveOrder', { id }), /Liberação/)
  assert.throws(
    () => h.run('analyze', { id, decisao: 'liberado' }),
    /restrição/
  )
  assert.throws(
    () => h.run('analyze', { id, decisao: 'bloqueado' }),
    /Justificativa/
  )
  h.run('analyze', {
    id,
    decisao: 'bloqueado',
    justificativa: 'Crédito insuficiente'
  })
  assert.throws(() => h.run('approveOrder', { id }), /Liberação/)
  h.run('analyze', {
    id,
    decisao: 'liberadoComRestricao',
    justificativa: 'Autorização demonstrativa'
  })
  h.run('approveOrder', { id })
  assert.equal(h.s.pedidos[0].analises.length, 2)
})
test('Envio ao Financeiro bloqueia edição imediatamente no domínio', () => {
  const h = harness(),
    id = create(h)
  h.run('submitOrder', { id })
  assert.throws(
    () =>
      h.run('saveOrder', {
        id,
        clienteId: 'c1',
        itens: [{ produtoId: 'p1', quantidade: 2 }],
        prazoEntrega: D.day(10),
        condicoesComerciais: 'À vista'
      }),
    /enviado ao Financeiro/
  )
  h.run('analyze', { id, decisao: 'liberado' })
  h.run('approveOrder', { id })
  assert.throws(() => h.run('saveOrder', { id }), /não pode ser editado/)
})
test('Versão e preços preservam pedidos e OPs existentes', () => {
  const h = harness(),
    id = create(h)
  ready(h, id)
  const old = D.clone(h.s.pedidos[0].itens[0])
  h.run(
    'createVersion',
    {
      id: 'f1v2',
      rendimento: 100,
      itens: h.s.formulas[0].itens,
      justificativa: 'Revisão teste'
    },
    'quimica'
  )
  const f = h.s.formulas.at(-1)
  h.run(
    'activateVersion',
    { id: f.id, justificativa: 'Versão validada' },
    'quimica'
  )
  assert.equal(h.s.produtos[0].precoLiberado, false)
  h.run('releasePrice', { id: 'p1', margem: 40 }, 'quimica')
  assert.deepEqual(h.s.pedidos[0].itens[0], old)
  assert.equal(h.s.ordens[0].formula.versao, 2)
  assert.equal(h.s.produtos[0].formulaId, f.id)
})
test('Produção exige documento da OP e início, e rejeita duplicações de OP', () => {
  const h = harness(),
    id = create(h)
  approve(h, id)
  h.run('createOps', { id })
  assert.throws(() => h.run('createOps', { id }))
  const op = h.s.ordens[0]
  assert.throws(() => h.run('startOp', { id: op.id }), /documento da OP/)
  assert.throws(() => report(h, op.id, 20), /em produção/)
  h.run('issueSheet', { id: op.id })
  assert.throws(() => h.run('issueSheet', { id: op.id }), /já gerado/)
})
test('Lotes vencidos e bloqueados nunca entram na sugestão', () => {
  const h = harness()
  assert.ok(!D.eligibleLots(h.s, 'i1').some(l => l.id === 'l6'))
  assert.ok(!D.eligibleLots(h.s, 'i2').some(l => l.id === 'l7'))
})
test('Falha de consumo não baixa parcialmente o estoque e agrega repetição do mesmo lote', () => {
  const h = harness(),
    id = create(h)
  ready(h, id)
  const op = h.s.ordens[0],
    before = D.clone(h.s),
    base = {
      id: op.id,
      quantidade: 20,
      perdasKg: 0,
      sobrasKg: 0,
      validade: D.day(180),
      consumos: D.suggestConsumption(h.s, op, 100)
    }
  for (const mutate of [
    p => p.consumos.push({ loteId: 'l6', quantidade: 1 }),
    p => p.consumos.push({ loteId: 'l7', quantidade: 1 }),
    p => (p.consumos[0].quantidade = 9999),
    p => p.consumos.pop(),
    p => p.consumos.push(p.consumos[0])
  ]) {
    const p = D.clone(base)
    mutate(p)
    assert.throws(() => h.run('reportProduction', p))
    assert.deepEqual(h.s, before)
  }
  const p = D.clone(base),
    first = p.consumos.shift()
  p.consumos.push(
    { ...first, quantidade: first.quantidade / 2 },
    { ...first, quantidade: first.quantidade / 2 }
  )
  h.run('reportProduction', p)
  assert.equal(
    h.s.ordens[0].apontamentos[0].consumos.filter(
      c => c.loteId === first.loteId
    ).length,
    1
  )
})
test('Reprovação de um lote bloqueia faturamento e não pode ser apagada por reinspeção', () => {
  const h = harness(),
    id = create(h, 'c1', [{ produtoId: 'p1', quantidade: 2 }])
  ready(h, id)
  report(h, h.s.ordens[0].id, 2)
  const l = h.s.lotes.at(-1)
  assert.throws(
    () => h.run('inspect', { id: l.id, decisao: 'reprovado' }),
    /Motivo/
  )
  h.run('inspect', {
    id: l.id,
    decisao: 'reprovado',
    observacoes: 'Teste fora da especificação'
  })
  assert.throws(() => h.run('bill', { id, referencia: 'FAT' }), /Qualidade/)
  assert.throws(
    () => h.run('inspect', { id: l.id, decisao: 'aprovado' }),
    /pendente/
  )
})
test('Faturamento, despacho e recebimento não podem duplicar', () => {
  const h = harness(),
    id = create(h, 'c1', [{ produtoId: 'p1', quantidade: 1 }])
  assert.throws(() => h.run('dispatch', dispatchData(id)), /pendência/)
  ready(h, id)
  report(h, h.s.ordens[0].id, 1)
  inspectAll(h)
  h.run('bill', { id, referencia: 'FAT' })
  assert.throws(() => h.run('bill', { id, referencia: 'FAT' }), /já faturado/)
  h.run('dispatch', dispatchData(id))
  assert.throws(() => h.run('dispatch', dispatchData(id)))
  const rid = h.s.recebiveis[0].id
  assert.throws(
    () =>
      h.run(
        'registerReceipt',
        { id: rid, recebidoEm: D.today(), referencia: 'PIX' },
        'vendedor'
      ),
    /perfil/
  )
  h.run(
    'registerReceipt',
    { id: rid, recebidoEm: D.today(), referencia: 'PIX' },
    'financeiro'
  )
  assert.throws(
    () =>
      h.run(
        'registerReceipt',
        { id: rid, recebidoEm: D.today(), referencia: 'PIX' },
        'financeiro'
      ),
    /já registrado/
  )
})
test('Ajustes justificam o delta e os movimentos reconciliam com os saldos', () => {
  const h = harness()
  assert.throws(
    () => h.run('adjustLot', { id: 'l1', saldo: 0 }),
    /Justificativa/
  )
  h.run('adjustLot', { id: 'l1', saldo: 10, justificativa: 'Inventário teste' })
  assert.equal(h.s.movimentacoes.at(-1).quantidade, 2)
  for (const l of h.s.lotes)
    assert.equal(
      h.s.movimentacoes
        .filter(m => m.loteId === l.id)
        .reduce((n, m) => n + m.quantidade, 0),
      l.saldo
    )
})
test('CNPJ tem verificador e unicidade; usuário inativo não executa comando', () => {
  const h = harness()
  assert.equal(D.validCnpj('12.345.678/0001-95'), true)
  assert.equal(D.validCnpj('12.345.678/0001-90'), false)
  assert.throws(
    () => h.run('saveClient', { cnpj: '12.345.678/0001-95' }),
    /cadastrado/
  )
  h.run('toggleUser', { id: 'vendedor' })
  assert.throws(() => h.run('saveOrder', {}, 'vendedor'), /inativo/)
  assert.throws(() => h.run('toggleUser', { id: 'admin' }), /própria/)
})
test('Cancelamento após OP é bloqueado; segregação comercial por vendedor', () => {
  const h = harness(),
    id = create(h)
  ready(h, id)
  assert.throws(
    () => h.run('cancelOrder', { id, justificativa: 'Teste' }),
    /estorno/
  )
  h.set(s => {
    s.pedidos[0].vendedorId = 'outro'
  })
  assert.equal(D.visibleOrders(h.s, D.get(h.s.usuarios, 'vendedor')).length, 0)
  assert.throws(() => h.run('saveOrder', { id }, 'vendedor'), /outro vendedor/)
})
test('Seed e persistência JSON mantêm relacionamentos; esquema desconhecido é recusado', () => {
  const s = D.demoSeed()
  assert.equal(s.pedidos.length, 3)
  assert.equal(s.ordens.length, 1)
  assert.deepEqual(D.validateState(JSON.parse(JSON.stringify(s))), s)
  assert.throws(() => D.validateState({ schemaVersion: 99 }))
})
test('Aprovação revalida crédito alterado desde a decisão financeira', () => {
  const h = harness(),
    id = create(h)
  h.run('submitOrder', { id })
  h.run('analyze', { id, decisao: 'liberado' })
  h.set(s => (s.clientes[0].limiteCentavos = 100))
  assert.throws(() => h.run('approveOrder', { id }), /Crédito mudou/)
  h.run('analyze', {
    id,
    decisao: 'liberadoComRestricao',
    justificativa: 'Exceção de teste'
  })
  h.run('approveOrder', { id })
})
test('Modo sem dados mantém referências sintéticas e remove os registros operacionais', () => {
  const s = D.emptySeed()
  assert.equal(s.usuarios.length, 9)
  for (const key of [
    'ingredientes',
    'formulas',
    'fornecedores',
    'produtos',
    'clientes',
    'etiquetas',
    'lotes'
  ])
    assert.ok(s[key].length > 0)
  for (const key of [
    'recebiveis',
    'pedidos',
    'ordens',
    'movimentacoes',
    'auditoria'
  ])
    assert.deepEqual(s[key], [])
  assert.deepEqual(s.seq, { pedido: 1000, op: 0, lote: 0 })
  assert.doesNotThrow(() => D.validateState(JSON.parse(JSON.stringify(s))))
})

test('Modelo de etiqueta grande preserva os textos fixos editáveis', () => {
  const h = harness()
  h.run('saveLabel', {
    id: 'etq2',
    nome: 'Etiqueta grande aprovada para teste',
    conteudo: 'Produto, cliente, lote e validade',
    descricaoProduto: 'Descrição revisada',
    textoRegulatorio: 'Texto regulatório em validação',
    alergicos: 'Pode conter soja.',
    gluten: 'Não contém glúten.',
    modoUso: '2% sobre a massa.',
    conservacao: 'Manter em local seco.',
    fabricante: 'REALTECH LTDA',
    slogan: 'QUALIDADE EM PRODUTOS E SERVIÇOS',
    observacoes: 'Uso demonstrativo.'
  })
  const model = h.s.etiquetas.find(x => x.id === 'etq2')
  assert.equal(model.modoUso, '2% sobre a massa.')
  assert.equal(model.fabricante, 'REALTECH LTDA')
  assert.equal(model.slogan, 'QUALIDADE EM PRODUTOS E SERVIÇOS')
})
