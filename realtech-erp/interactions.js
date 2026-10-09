'use strict'
function openOrderForm(id = null, complement = false, sampleOnly = false) {
  sampleOnly = sampleOnly || user.perfil === 'qualidade'
  if (!can('saveOrder')) throw new Error('Sem permissão para criar pedidos.')
  if (
    !clients().some(c => c.ativo) ||
    !state.produtos.some(p => p.status === 'ativo' && p.precoLiberado)
  )
    return modal(
      'Novo pedido',
      notice(
        'O modo sem dados está ativo. Cadastre ou carregue clientes, produtos e preços antes de montar o pedido.',
        'warn'
      )
    )
  const old = id ? find(orders(), id) : null
  editingOrder = {
    id: complement ? null : old?.id,
    complementarDe: complement ? id : null,
    modoQuantidade: !old || complement ? 'KG' : old.modoQuantidade || 'UN'
  }
  modal(
    complement ? 'Pedido complementar' : old ? 'Editar pedido' : 'Novo pedido',
    `${notice(editingOrder.modoQuantidade === 'KG' ? 'Escolha o produto e informe quantos kg produzir. A base é 1 kg; embalagem e volumes são calculados conforme o cadastro. Amostras seguem a Qualidade, sem análise financeira.' : 'Registro histórico em unidades de embalagem. Sua unidade e seus pesos serão preservados ao editar.')}<div class="form-grid">${select(
      'Tipo do pedido',
      'tipo',
      sampleOnly
        ? [['amostra', 'Amostra']]
        : [
            ['producao', 'Produção'],
            ['amostra', 'Amostra']
          ],
      sampleOnly ? 'amostra' : old?.tipo || 'producao'
    )}${select(
      'Cliente',
      'clienteId',
      clients()
        .filter(c => c.ativo)
        .map(c => [c.id, c.nomeFantasia]),
      old?.clienteId || 'c1'
    )}${input('Prazo de entrega', 'prazoEntrega', old?.prazoEntrega || D.day(15), 'date', `required min="${D.today()}"`)}${input('Vendedor responsável', 'sellerLabel', '', 'text', 'readonly')}</div><div id="orderLines"></div><div>${btn('+ Adicionar produto', 'addLine')}</div><div id="orderTotals"></div><div id="commercialOrderFields" ${sampleOnly || old?.tipo === 'amostra' ? 'hidden' : ''}><section class="installment-section"><h3>Condições de pagamento</h3><p class="muted small">Cada prazo corresponde a uma parcela. O valor é dividido automaticamente e os centavos são ajustados para fechar o total.</p><div id="paymentTerms"></div><div>${btn('+ Adicionar parcela', 'addPaymentTerm')}</div><div id="paymentTermsTotal"></div></section>${textarea('Condições comerciais adicionais', 'condicoesComerciais', old?.condicoesComerciais || '')}</div>${textarea('Observações', 'observacoes', complement ? 'Complementar ao ' + old.numero : old?.observacoes || '')}`,
    data => {
      const result = commit('saveOrder', {
        ...editingOrder,
        ...data,
        itens: [...document.querySelectorAll('.order-line')].map(row => ({
          produtoId: row.querySelector('select').value,
          quantidade: row.querySelector('input').value
        })),
        condicoesPagamentoDias: [
          ...document.querySelectorAll('.payment-term-line')
        ].map(row => row.querySelector('input').value)
      })
      route = data.tipo === 'amostra' ? 'amostras' : 'pedidos'
      selectedId = data.tipo === 'amostra' ? null : result
    },
    'Salvar rascunho'
  )
  const items = old?.itens || [{ produtoId: 'p1', quantidade: 1 }]
  items.forEach(i => addOrderLine(i))
  const paymentDays = old?.condicoesPagamentoDias ||
    old?.condicoesComerciais?.match(/\d+/g)?.map(Number) || [30]
  paymentDays.forEach(days => addPaymentTerm(days))
  syncOrderType()
  updateOrderTotals()
}
function syncOrderType() {
  const commercialFields = $('#commercialOrderFields'),
    isSample = $('[name="tipo"]')?.value === 'amostra'
  if (!commercialFields) return
  commercialFields.hidden = isSample
  commercialFields
    .querySelectorAll('input, select, textarea, button')
    .forEach(control => {
      control.disabled = isSample
    })
}
function addOrderLine(i = {}) {
  const c = find(state.clientes, $('[name="clienteId"]').value)
  const eligible = state.produtos.filter(
    p =>
      p.status === 'ativo' &&
      p.precoLiberado &&
      p.tabela === c.tabela &&
      p.formulaId &&
      find(state.formulas, p.formulaId).status === 'ativa'
  )
  const n = document.querySelectorAll('.order-line').length + 1
  $('#orderLines').insertAdjacentHTML(
    'beforeend',
    `<div class="order-line">${select(
      `Produto ${n}`,
      'product',
      eligible.map(p => [p.id, `${p.codigo} · ${editingOrder?.modoQuantidade === 'KG' ? D.productBaseName(p.nome) + ' · base 1 kg' : p.nome}`]),
      i.produtoId || eligible[0]?.id
    )}${input(`Quantidade ${n} (${editingOrder?.modoQuantidade === 'KG' ? 'kg a produzir' : 'UN'})`, 'quantity', i.quantidade || 1, 'number', editingOrder?.modoQuantidade === 'KG' ? 'min="0.001" step="0.001" required' : 'min="1" step="1" required')}<div class="line-amount calculated"></div><button type="button" class="ghost-btn remove-line" data-action="removeLine" aria-label="Remover item ${n}">×</button></div>`
  )
  updateOrderTotals()
}
function orderLinePreview(row) {
  const product = state.produtos.find(p => p.id === row.querySelector('select').value)
  if (!product) return null
  const amount = Number(row.querySelector('input').value) || 0
  const kgMode = editingOrder?.modoQuantidade === 'KG'
  const price = kgMode ? Math.round(product.precoCentavos / product.pesoKg) : product.precoCentavos
  const item = { quantidade: amount, unidade: kgMode ? 'KG' : 'UN', pesoEmbalagemKg: product.pesoKg, unidadesPorVolume: product.unidadesPorVolume }
  return { amount, kg: amount * (kgMode ? 1 : product.pesoKg), price, total: Math.round(amount * price), packages: D.packageCount(item), volumes: D.volumeCount(item), volumeTipo: product.volumeTipo || 'volume' }
}
function updateOrderTotals() {
  if (!$('#orderLines')) return
  const client = find(state.clientes, $('[name="clienteId"]').value)
  $('[name="sellerLabel"]').value = find(state.usuarios, client.vendedorId).nome
  const sums = { total: 0, kg: 0, volumes: 0 }
  document.querySelectorAll('.order-line').forEach(row => {
    const preview = orderLinePreview(row)
    if (!preview) { row.querySelector('.line-amount').textContent = 'Sem preço liberado'; return }
    sums.total += preview.total; sums.kg += preview.kg; sums.volumes += preview.volumes
    row.querySelector('.line-amount').innerHTML = `${money(preview.total)}<small>${money(preview.price)}/${editingOrder?.modoQuantidade === 'KG' ? 'kg' : 'UN'} · ${qty(preview.packages)} embalagem(ns) · ${preview.volumes} ${esc(preview.volumeTipo)}(s)</small>`
  })
  $('#orderTotals').innerHTML = `<div class="summary-total"><div><span class="muted">Total do pedido</span><strong>${money(sums.total)}</strong></div><div><span class="muted">Quantidade a produzir</span><strong>${qty(sums.kg)} kg</strong></div><div><span class="muted">Volumes para transporte</span><strong>${sums.volumes}</strong></div></div>`
  updatePaymentTerms(sums.total)
}
function addPaymentTerm(days = 30) {
  const n = document.querySelectorAll('.payment-term-line').length + 1
  $('#paymentTerms').insertAdjacentHTML(
    'beforeend',
    `<div class="payment-term-line">${input(`Parcela ${n} · prazo em dias`, 'paymentDays', days, 'number', 'required min="0" max="3650" step="1"')}<div class="installment-value calculated"></div><button type="button" class="ghost-btn remove-payment-term" data-action="removePaymentTerm" aria-label="Remover parcela ${n}">×</button></div>`
  )
  updateOrderTotals()
}
function updatePaymentTerms(total = null) {
  if (!$('#paymentTerms')) return
  if (total == null) total = [...document.querySelectorAll('.order-line')].reduce((sum, row) => sum + (orderLinePreview(row)?.total || 0), 0)
  const rows = [...document.querySelectorAll('.payment-term-line')]
  if (!rows.length) return
  const base = Math.floor(total / rows.length),
    remainder = total % rows.length
  rows.forEach((row, index) => {
    row.querySelector('label').childNodes[0].textContent =
      `Parcela ${index + 1} · prazo em dias`
    row.querySelector('.installment-value').textContent = money(
      base + (index < remainder ? 1 : 0)
    )
  })
  $('#paymentTermsTotal').innerHTML =
    `<p class="muted small">${rows.length} parcela(s) · total ${money(total)}</p>`
}
function productionForm(id) {
  const op = find(state.ordens, id),
    remaining = op.quantidadePrevista - op.quantidadeProduzida
  modal(
    'Apontar produção · ' + op.numero,
    `${notice('Informe a produção deste apontamento. A OP permanece aberta até completar a quantidade prevista. Perdas e sobras aumentam o consumo de insumos.')}<div class="form-grid">${input(`Quantidade produzida (${unitLabel(op)})`, 'quantidade', remaining, 'number', `required min="${op.unidade === 'KG' ? '0.001' : '1'}" max="${remaining}" step="${op.unidade === 'KG' ? '0.001' : '1'}"`)}${input('Validade do lote final', 'validade', D.day(180), 'date', `required min="${D.today()}"`)}${input('Perdas (kg)', 'perdasKg', 0, 'number', 'required min="0" step="0.001"')}${input('Sobras segregadas (kg)', 'sobrasKg', 0, 'number', 'required min="0" step="0.001"')}</div><p class="muted small">Validade de 180 dias é apenas exemplo, confirme a regra do produto. Sobras ficam segregadas, sem venda ou reaproveitamento automático.</p><div id="consumptionSummary"></div><div>${btn('Sugerir lotes por validade', 'suggestLots', id)}</div><div id="consumptionRows"></div>${textarea('Observações (obrigatórias se houver perdas ou sobras)', 'observacoes')}`,
    data =>
      commit('reportProduction', {
        id,
        ...data,
        consumos: [...document.querySelectorAll('[data-lot-consumption]')].map(
          el => ({ loteId: el.dataset.lotConsumption, quantidade: el.value })
        )
      }),
    'Registrar apontamento'
  )
  $('#dialogBody').dataset.op = id
  drawConsumption(id)
}
function drawConsumption(id) {
  const op = find(state.ordens, id),
    d = formData(),
    kg =
      Number(d.quantidade) * op.pesoKg + Number(d.perdasKg) + Number(d.sobrasKg)
  const needs = D.requirements(op, Number.isFinite(kg) && kg >= 0 ? kg : 0),
    suggested = D.suggestConsumption(
      state,
      op,
      Number.isFinite(kg) && kg >= 0 ? kg : 0
    )
  $('#consumptionSummary').innerHTML = notice(
    `Massa do apontamento: <b>${qty(kg)} kg</b> = produto embalado + perdas + sobras. Confira os lotes antes de confirmar.`
  )
  $('#consumptionRows').innerHTML = needs
    .map(r => {
      const lots = D.eligibleLots(state, r.ingredienteId),
        available = lots.reduce((n, l) => n + l.saldo, 0)
      return panel(
        esc(find(state.ingredientes, r.ingredienteId).nome),
        `<p class="small">Necessário: <b>${qty(r.quantidade)} kg</b> · disponível: ${qty(available)} kg ${available < r.quantidade ? badge('Insuficiente') : ''}</p>${table(
          ['Lote', 'Fornecedor', 'Validade', 'Saldo', 'Consumir (kg)'],
          lots.map(l => [
            esc(l.codigo),
            esc(find(state.fornecedores, l.fornecedorId).nome),
            fmtDate(l.validade),
            qty(l.saldo),
            `<input class="consumption-input" aria-label="Consumo ${esc(l.codigo)}" data-lot-consumption="${l.id}" type="number" min="0" max="${l.saldo}" step="0.001" value="${suggested.find(c => c.loteId === l.id)?.quantidade || 0}">`
          ])
        )}`
      )
    })
    .join('')
}
function traceBody(id) {
  const lot = find(state.lotes, id),
    isInput = lot.tipo === 'ingrediente'
  const matches = state.ordens.flatMap(op =>
    op.apontamentos
      .filter(a =>
        isInput ? a.consumos.some(c => c.loteId === id) : a.loteId === id
      )
      .map(a => ({ op, a }))
  )
  return `${fields([
    ['Lote', esc(lot.codigo)],
    ['Saldo', `${qty(lot.saldo)} ${isInput ? 'kg' : unitLabel(lot)}`],
    ['Validade', fmtDate(lot.validade)],
    ['Situação', badge(lot.status)]
  ])}${
    matches.length
      ? matches
          .map(({ op, a }) => {
            const order = find(state.pedidos, op.pedidoId),
              final = find(state.lotes, a.loteId)
            return panel(
              `${esc(op.numero)} → ${esc(final.codigo)}`,
              `${fields([
                ['Produto', esc(op.produtoNome)],
                [
                  'Fórmula preservada',
                  `${esc(op.formula.codigo)} · v${op.formula.versao}`
                ],
                [
                  'Pedido / cliente',
                  `${esc(order.numero)} · ${esc(order.clienteNome)}`
                ],
                ['Apontamento', `${qty(a.quantidade)} ${unitLabel(op)} · ${fmtTime(a.data)}`],
                ['Responsável', esc(a.usuario)],
                [
                  'Despacho',
                  order.despacho
                    ? `${esc(order.despacho.transportadora)} · ${esc(order.despacho.rastreamento)}`
                    : 'Ainda não despachado'
                ]
              ])}<h4>Origens consumidas</h4>${table(
                [
                  'Lote de entrada',
                  'Ingrediente',
                  'Fornecedor',
                  'Validade',
                  'Consumo'
                ],
                a.consumos.map(c => {
                  const l = find(state.lotes, c.loteId)
                  return [
                    esc(l.codigo),
                    esc(find(state.ingredientes, c.ingredienteId).nome),
                    esc(find(state.fornecedores, l.fornecedorId).nome),
                    fmtDate(l.validade),
                    `${qty(c.quantidade)} kg`
                  ]
                })
              )}${costs() ? `<p>Custo dos insumos: ${money(a.custoInsumosCentavos)} (inclui consumo relativo às perdas e sobras; embalagem e despesas não incluídas).</p>` : ''}<h4>Inspeções do lote final</h4>${table(
                ['Resultado', 'Responsável', 'Data', 'Observações / laudo'],
                final.inspecoes.map(i => [
                  badge(i.resultado),
                  esc(i.usuario),
                  fmtTime(i.data),
                  `${esc(i.observacoes)}<small>${esc(i.laudo || 'Sem laudo informado')}</small>`
                ])
              )}`
            )
          })
          .join('')
      : notice(
          'Este lote ainda não participou de uma produção. A origem será ligada à OP e ao cliente no apontamento.'
        )
  }`
}
function technicalSheetBody(id) {
  const lot = state.lotes.find(l => l.id === id && l.tipo === 'produto'),
    op = lot ? find(state.ordens, lot.opId) : null,
    order = find(state.pedidos, op ? op.pedidoId : id),
    client = find(state.clientes, order.clienteId)
  const nutrition = {
    p1: [
      ['Valor energético', '210 kcal = 879 kJ', '11%'],
      ['Carboidratos', '38 g', '13%'],
      ['Proteínas', '8 g', '11%'],
      ['Gorduras totais', '3 g', '5%'],
      ['Gorduras saturadas', '0,8 g', '4%'],
      ['Fibra alimentar', '6 g', '24%'],
      ['Sódio', '8.900 mg', '371%']
    ],
    p2: [
      ['Valor energético', '185 kcal = 774 kJ', '9%'],
      ['Carboidratos', '32 g', '11%'],
      ['Proteínas', '10 g', '13%'],
      ['Gorduras totais', '2 g', '4%'],
      ['Gorduras saturadas', '0,5 g', '3%'],
      ['Fibra alimentar', '4 g', '16%'],
      ['Sódio', '10.200 mg', '425%']
    ]
  }
  const itemCards = order.itens
    .map(i => {
      const p = find(state.produtos, i.produtoId),
        rows = nutrition[p.id] || [
          ['Valor energético', 'Não informado', '—'],
          ['Carboidratos', 'Não informado', '—'],
          ['Proteínas', 'Não informado', '—'],
          ['Gorduras totais', 'Não informado', '—'],
          ['Sódio', 'Não informado', '—']
        ]
      return `<section class="technical-product"><h3>${esc(p.codigo)} · ${esc(i.nome)}</h3>${fields(
        [
          ['Quantidade no pedido', `${qty(i.quantidade)} ${unitLabel(i)}`],
          ['Peso líquido por embalagem', `${qty(i.pesoEmbalagemKg || i.pesoKg)} kg`],
          ['Embalagem', esc(i.embalagem || p.embalagem)],
          ['Peso total', `${qty(i.quantidade * i.pesoKg)} kg`]
        ]
      )}<h4>Informação nutricional · porção de 100 g</h4>${table(['Nutriente', 'Quantidade por porção', '% VD*'], rows)}</section>`
    })
    .join('')
  return `<article class="technical-sheet"><header class="technical-sheet-head"><div class="brand-mark">R</div><div><span class="eyebrow">REALTECH · Aditivos e condimentos</span><h2>Ficha técnica do pedido</h2><p>Documento ${esc(order.numero)}-FT · emitido em ${fmtTime(new Date().toISOString())}</p></div></header>${fields(
    [
      ['Pedido', esc(order.numero)],
      ['Cliente', esc(client.razaoSocial)],
      ['CNPJ', esc(client.cnpj)],
      ['Endereço', esc(client.endereco)],
      ['Condição comercial', esc(order.condicoesComerciais)],
      ['Entrega prevista', fmtDate(order.prazoEntrega)],
      ['Lote consultado', lot ? esc(lot.codigo) : 'Todos os itens'],
      [
        'Situação do lote',
        lot ? badge(lot.status) : 'Conforme lotes vinculados'
      ]
    ]
  )}${itemCards}<footer class="technical-note"><b>* % Valores Diários de referência.</b> Dados nutricionais sintéticos para demonstração do layout. Antes do uso comercial, substituir pelos valores aprovados pela Qualidade e responsável técnico.</footer></article><div class="actions">${btn('Imprimir / salvar em PDF', 'printDoc', id, true)}</div>`
}
function labelPreview(op, model, lot, printAction = null, order = null) {
  const product = find(state.produtos, op.produtoId),
    client = order ? find(state.clientes, order.clienteId) : null,
    formulaIngredients = op.formula.itens
      .map(item => find(state.ingredientes, item.ingredienteId)?.nome)
      .filter(Boolean)
      .join(', '),
    fixed = (field, fallback) => esc(model[field] || fallback),
    printedOn = D.today(),
    labelLot = D.compactLotDate(printedOn),
    expires = lot?.validade
      ? (() => {
          const match = String(lot.validade).match(/^(\d{4})-(\d{2})/)
          if (!match) return fmtDate(lot.validade)
          const months = [
            'JAN',
            'FEV',
            'MAR',
            'ABR',
            'MAI',
            'JUN',
            'JUL',
            'AGO',
            'SET',
            'OUT',
            'NOV',
            'DEZ'
          ]
          return `${months[Number(match[2]) - 1]}/${match[1]}`
        })()
      : op.validade || product?.validade || 'A definir',
    contains =
      op.contem ||
      product?.contem ||
      formulaIngredients ||
      'Conforme fórmula aprovada',
    size = String(model.tamanho || '').toLowerCase(),
    action =
      printAction ||
      (size === 'pequena' ? 'printSmallLabel' : 'printLargeLabel'),
    description = op.descricaoProduto || product?.descricaoProduto || '',
    customer = client?.razaoSocial || order?.clienteNome || 'Não informado',
    regulatory = fixed(
      'textoRegulatorio',
      '| Para uso exclusivo em alimentos | Dispensado de registro conforme RDC 843/2024 e IN 281/2024 |'
    ),
    manufacturer = fixed(
      'fabricante',
      'REALTECH INDUSTRIA E COMERCIO DE PRODUTOS ALIMENTICIOS LTDA\nAV CLEMENTE TALARICO, 190 - SÃO CARLOS - SP,\nCEP: 13563-882 - CNPJ: 60.708.408/0001-44.\nCOMERCIALIZADO POR: CNPJ 35.155.744/0001-60.'
    ),
    allergens =
      (op.alergenicosAtivo ?? product?.alergenicosAtivo)
        ? op.alergenicosTexto ||
          product?.alergenicosTexto ||
          'Declaração não informada.'
        : '',
    gluten =
      (op.naoContemGluten ?? product?.naoContemGluten)
        ? 'NÃO CONTÉM GLÚTEN.'
        : '',
    usage = op.modoUso || product?.modoUso || 'Conforme orientação técnica.',
    conservation =
      op.conservacao ||
      product?.conservacao ||
      'Manter em local seco, fresco e arejado.',
    ingredientText = esc(contains).replace(/^(.*?\(\d+(?:[.,]\d+)?%\),)\s*/, '<span class="label-ingredient-base">$1</span>'),
    allergenText = `${allergens ? `<p><b>ALÉRGICOS:</b> ${esc(allergens)}</p>` : ''}${gluten ? `<p>${allergens ? '| ' : ''}<b>${gluten}</b></p>` : ''}`,
    header = `<header><img class="label-logo" src="assets/label-logo.png" alt="REALTECH"><h2>${esc(op.produtoNome)}</h2><p class="label-description">${esc(description)}</p><div class="label-regulatory">${regulatory}</div></header>`,
    batch = `<section class="label-batch-row"><p class="label-manufacturer"><b>${size === 'pequena' ? 'PRODUZIDO POR' : 'FABRICADO POR'}:</b><span>${manufacturer}${size === 'pequena' ? '\nINDÚSTRIA BRASILEIRA.' : ''}</span></p><div class="label-batch-values"><p><b>LOTE:</b> ${esc(labelLot)}</p><p><b>VALIDADE:</b> ${esc(expires)}</p><p><b>PESO LÍQUIDO:</b> ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: size === 'pequena' ? 3 : 1, maximumFractionDigits: 3 }).format(op.unidade === 'KG' ? Math.min(op.quantidadePrevista, op.pesoEmbalagemKg || op.pesoKg) : op.pesoEmbalagemKg || op.pesoKg)} ${size === 'pequena' ? 'kg' : 'KG'}</p></div></section>`,
    largeBody = `<section class="label-composition"><p><b>INGREDIENTES:</b> ${ingredientText}</p><div class="label-allergen-row">${allergens ? '<img src="assets/label-allergen.png" alt="Símbolo de alergênicos">' : ''}<div>${allergenText}</div></div></section><section class="label-directions"><p><b>MODO DE USO:</b> ${esc(usage)}</p><p>${esc(conservation)}</p></section><section class="label-customer"><b>CLIENTE:</b><strong>${esc(customer)}</strong></section>`,
    smallBody = `<section class="label-composition"><p><b>INGREDIENTES:</b> ${ingredientText}</p><div class="label-allergen-row"><div>${allergenText}</div></div></section><section class="label-directions"><p><b>MODO DE USO:</b> ${esc(usage)}</p><p>${esc(conservation)}</p></section>`,
    footer = size === 'pequena'
      ? `REALTECH: ${fixed('slogan', 'QUALIDADE EM PRODUTOS E SERVIÇOS')}`
      : `“${fixed('slogan', 'QUALIDADE EM PRODUTOS E SERVIÇOS')}”`
  return `<div class="label-frame label-frame-${size}"><article class="label-preview label-size-${size}" data-label-preview>${header}${size === 'pequena' ? smallBody : largeBody}${batch}<footer>${footer}</footer></article></div><div class="actions label-actions">${btn('Imprimir / salvar em PDF', action, op.id, true)}</div>`
}

function packagingEditor(product = {}, suggest = false) {
  const selected = product.embalagemId || (suggest ? D.suggestPackaging(state, 'KG', product.pesoKg || 1)?.id : '') || ''
  const weight = product.pesoKg || 1
  return `<section class="budget-editor"><h3>Embalagem final e orçamento</h3><p class="muted small">A embalagem soma custo, sem somar peso à fórmula. Para litros, informe o volume e o peso líquido manualmente.</p><div class="form-grid">${select('Embalagem final', 'embalagemId', [['', 'Manter apresentação atual'], ...state.embalagens.filter(pack => pack.ativo || pack.id === selected).map(pack => [pack.id, `${pack.codigo} · ${pack.nome} · ${money(pack.custoCentavos)}/UN${pack.ativo ? '' : ' (inativa)'}`])], selected)}${input('Peso líquido por embalagem (kg)', 'pesoLiquidoKg', weight, 'number', 'required min="0.00001" step="0.00001"')}${input('Volume preenchido por embalagem (L)', 'volumeLitros', product.volumeLitros || '', 'number', 'min="0.00001" step="0.00001"')}${input('Lucratividade para orçamento (%)', 'orcamentoMargem', D.pricingProfile(state, product).margemPercentual, 'number', 'required min="0" step="0.01"')}</div><div class="actions">${btn('Sugerir embalagem', 'suggestBudgetPackaging')}${btn('Calcular orçamento', 'calculateDraftBudget')}</div><p id="packagingSuggestion" class="muted small" role="status"></p><div id="draftBudgetResult" aria-live="polite"></div></section>`
}
function budgetPayload() {
  const value = name => $(`[name="${name}"]`)?.value
  const productId = $('[name="sourceProductId"]')?.value || $('#dialogBody').dataset.product
  const baseFormula = $('#dialogBody').dataset.budgetFormula
  const rows = [...document.querySelectorAll('.formula-ingredient-row')]
  return {
    sourceProductId: productId, embalagemId: value('embalagemId'), pesoLiquidoKg: value('pesoLiquidoKg'), volumeLitros: value('volumeLitros'),
    margem: value('orcamentoMargem'), rendimento: value('rendimento') || (baseFormula ? find(state.formulas, baseFormula).rendimento : ''),
    itens: rows.length ? rows.map(row => ({ ingredienteId: row.querySelector('select').value, quantidade: row.querySelector('input').value })) : (baseFormula ? find(state.formulas, baseFormula).itens : [])
  }
}
function updateDraftBudget() {
  const result = $('#draftBudgetResult')
  if (!result) return
  const payload = budgetPayload()
  const pack = state.embalagens.find(x => x.id === payload.embalagemId)
  const weightField = $('[name="pesoLiquidoKg"]')
  if (weightField) weightField.readOnly = !pack
  const volumeField = $('[name="volumeLitros"]')
  const liters = pack?.unidadeCapacidade === 'L'
  if (volumeField) {
    volumeField.disabled = !liters
    volumeField.required = liters
    volumeField.closest('label').hidden = !liters
  }
  try {
    const sim = D.draftBudget(state, payload)
    const balanced = Math.abs(sim.totalIngredientesKg - sim.rendimentoKg) < 0.00001
    result.innerHTML = `${balanced ? '' : notice('Orçamento preliminar: a soma dos ingredientes ainda não fecha com o rendimento. Ajuste antes de salvar.', 'warn')}${fields([
      ['Ingredientes / rendimento', `${formulaQty(sim.totalIngredientesKg)} / ${formulaQty(sim.rendimentoKg)} kg`],
      ['Matéria-prima', `${money(sim.materiaPrimaCentavosKg)}/kg`], ['Embalagem', `${money(sim.embalagemCentavosKg)}/kg · ${esc(sim.embalagem)}`],
      ['Custo primário', `${money(sim.custoPrimarioCentavos)}/kg`], ['Encargos sobre venda', `${qty(sim.encargosPercentual)}%`],
      ['Preço estimado', `${money(sim.precoKgCentavos)}/kg`], ['Apresentação final', `${qty(sim.pesoKg)} kg · ${money(sim.precoCentavos)}/UN`],
      ['Embalagens para a batida', `${sim.unidadesEmbalagem} UN · ${money(sim.custoEmbalagensLoteCentavos)}`]
    ])}<p class="muted small">Simulação para decisão em P&D. A ativação e a liberação comercial do preço continuam separadas. A última embalagem da batida pode ficar incompleta.</p>`
  } catch (error) { result.innerHTML = notice(esc(error.message), 'warn') }
}
function suggestBudgetPackaging() {
  const payload = budgetPayload()
  const current = state.embalagens.find(pack => pack.id === payload.embalagemId)
  try {
    const unit = current?.unidadeCapacidade || 'KG'
    const pack = D.suggestPackaging(state, unit, unit === 'L' ? payload.volumeLitros : payload.pesoLiquidoKg)
    $('#packagingSuggestion').textContent = pack ? `Sugestão aplicada: ${pack.nome}. Critério: menor capacidade compatível; em empate, menor custo unitário. Você pode escolher outra.` : 'Não há embalagem ativa compatível com o conteúdo informado.'
    if (pack) $('[name="embalagemId"]').value = pack.id
    updateDraftBudget()
  } catch (error) { $('#packagingSuggestion').textContent = error.message }
}
function containsEditor(formula, selectedIds = [], currentText = '') {
  const selected = new Set(selectedIds)
  return `<section class="contains-card"><div class="section-heading"><div><h3>Contém</h3><p class="muted small">Marque os ingredientes que devem compor a declaração. Categoria e INS vêm do cadastro do ingrediente.</p></div></div><div class="contains-options">${formula.itens
    .map(item => {
      const ingredient = find(state.ingredientes, item.ingredienteId)
      return `<label><input type="checkbox" name="containsIngredient" value="${esc(ingredient.id)}" ${selected.has(ingredient.id) ? 'checked' : ''}> <span>${esc(ingredient.nome)}<small>${esc(ingredient.categoria || 'Sem categoria')}${ingredient.ins ? ` · INS ${esc(ingredient.ins)}` : ''}</small></span></label>`
    })
    .join(
      ''
    )}</div>${textarea('Texto final de “Contém” (editável)', 'contem', currentText)}<p class="muted small">A seleção monta uma sugestão; o texto pode ser complementado pela Qualidade.</p></section>`
}

function updateContainsText(force = false) {
  const field = $('[name="contem"]')
  if (!field || (!force && field.dataset.edited === 'true')) return
  const ids = [
    ...document.querySelectorAll('[name="containsIngredient"]:checked')
  ].map(el => el.value)
  const rows = [...document.querySelectorAll('.formula-ingredient-row')]
  let formula
  if (rows.length) {
    formula = {
      rendimento: Number($('[name="rendimento"]')?.value || 0),
      itens: rows.map(row => ({
        ingredienteId: row.querySelector('select').value,
        quantidade: Number(row.querySelector('input').value || 0)
      }))
    }
  } else {
    const product = state.produtos.find(
      p => p.id === $('#dialogBody')?.dataset.product
    )
    formula = product?.formulaId
      ? find(state.formulas, product.formulaId)
      : null
  }
  field.value = D.ingredientDeclaration(state, formula, ids)
}

function syncContainsOptions() {
  const box = $('.contains-options')
  if (!box) return
  const checked = new Set(
    [...box.querySelectorAll('input:checked')].map(el => el.value)
  )
  const ids = [
    ...document.querySelectorAll('.formula-ingredient-row select')
  ].map(el => el.value)
  box.innerHTML = [...new Set(ids)]
    .map(id => {
      const ingredient = find(state.ingredientes, id)
      return `<label><input type="checkbox" name="containsIngredient" value="${esc(id)}" ${checked.has(id) ? 'checked' : ''}> <span>${esc(ingredient.nome)}<small>${esc(ingredient.categoria || 'Sem categoria')}${ingredient.ins ? ` · INS ${esc(ingredient.ins)}` : ''}</small></span></label>`
    })
    .join('')
  updateContainsText()
}
function openAction(a, id, productContext = null) {
  if (a in D.permissions && !can(a))
    throw new Error('Seu perfil não permite esta ação.')
  if (a === 'saveOrder') return openOrderForm(id || null)
  if (a === 'newSample') return openOrderForm(null, false, true)
  if (a === 'complement') return openOrderForm(id, true)
  if (a === 'addLine') return addOrderLine()
  if (a === 'suggestLots') return drawConsumption(id)
  if (a === 'reportProduction') return productionForm(id)
  if (a === 'pricingSettings') {
    const base = state.produtos.find(p => p.formulaId)
    const fallback = base ? D.priceSimulation(state, base) : null
    const settings = state.configuracoes?.precificacao || {}
    const scenarios = settings.cenariosLucratividade || [
      10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80
    ]
    const charges = settings.encargosFixos ||
      fallback?.encargosFixos || [
        { nome: 'Nota fiscal', percentual: 10.5 },
        { nome: 'Comissão técnica', percentual: 5 },
        { nome: 'Comissão comercial', percentual: 5 },
        { nome: 'Comissão extra cliente', percentual: 0 }
      ]
    const chargeValue = name =>
      charges.find(item => item.nome === name)?.percentual ?? 0
    return modal(
      'Parâmetros globais de precificação',
      notice(
        'Estes valores pertencem à política de precificação da empresa. Os produtos usam esta tabela para compor o preço; não é necessário repetir comissões em cada produto.'
      ) +
        `<h3>Tabela de lucratividade</h3><div class="form-grid">${input('Lucratividade padrão (%)', 'margemPadrao', settings.margemPadrao ?? 60, 'number', 'required min="0" max="9999.99" step="0.01"')}</div><div class="table-wrap"><table><thead><tr><th>Lucratividade</th><th>Percentual do cenário</th></tr></thead><tbody>${scenarios.map(m => `<tr><td>${qty(m)}%</td><td>${input(`Cenário ${m}%`, `cenario${m}`, m, 'number', 'required min="0" max="9999.99" step="0.01"')}</td></tr>`).join('')}</tbody></table></div><h3>Percentuais fixos sobre a venda</h3><div class="form-grid">${input('Nota fiscal / impostos (%)', 'notaFiscal', chargeValue('Nota fiscal'), 'number', 'required min="0" max="100" step="0.01"')}${input('Comissão técnica (%)', 'comissaoTecnica', chargeValue('Comissão técnica'), 'number', 'required min="0" max="100" step="0.01"')}${input('Comissão comercial (%)', 'comissaoComercial', chargeValue('Comissão comercial'), 'number', 'required min="0" max="100" step="0.01"')}${input('Comissão extra cliente (%)', 'comissaoExtra', chargeValue('Comissão extra cliente'), 'number', 'required min="0" max="100" step="0.01"')}</div><h3>Custos internos padrão</h3><div class="form-grid">${input('Financeiro (R$/kg)', 'financeiroCentavosKg', (settings.financeiroCentavosKg ?? fallback?.financeiroCentavosKg ?? 125) / 100, 'number', 'required min="0" step="0.0001"')}${input('Mão de obra / custo fixo (R$/kg)', 'maoDeObraCentavosKg', (settings.maoDeObraCentavosKg ?? fallback?.maoDeObraCentavosKg ?? 75) / 100, 'number', 'required min="0" step="0.0001"')}${input('Outros custos fixos (R$/kg)', 'outrosCustosCentavosKg', (settings.outrosCustosCentavosKg ?? fallback?.outrosCustosCentavosKg ?? 0) / 100, 'number', 'required min="0" step="0.0001"')}</div>`,
      d =>
        commit('savePricingSettings', {
          margemPadrao: d.margemPadrao,
          cenariosLucratividade: scenarios.map(m => d[`cenario${m}`]),
          financeiroCentavosKg: d.financeiroCentavosKg,
          maoDeObraCentavosKg: d.maoDeObraCentavosKg,
          outrosCustosCentavosKg: d.outrosCustosCentavosKg,
          encargosFixos: [
            { nome: 'Nota fiscal', percentual: d.notaFiscal },
            { nome: 'Comissão técnica', percentual: d.comissaoTecnica },
            { nome: 'Comissão comercial', percentual: d.comissaoComercial },
            { nome: 'Comissão extra cliente', percentual: d.comissaoExtra }
          ]
        }),
      'Salvar parâmetros'
    )
  }
  if (a === 'analyze') {
    const o = find(orders(), id),
      c = find(state.clientes, o.clienteId),
      cr = D.credit(state, o)
    return modal(
      'Análise financeira · ' + o.numero,
      `${fields([
        ['Cliente', esc(c.nomeFantasia)],
        ['Situação', badge(c.situacaoFinanceira)],
        ['Limite', money(c.limiteCentavos)],
        ['Exposição anterior', money(cr.exposure)],
        ['Este pedido', money(D.orderTotal(o))],
        ['Crédito após pedido', money(c.limiteCentavos - cr.projected)]
      ])}${cr.warning ? notice('Há restrição ou crédito insuficiente. Liberação exige decisão com restrição e justificativa.', 'warn') : notice('O crédito disponível comporta este pedido.')}${select(
        'Decisão',
        'decisao',
        [
          ['liberado', 'Liberado'],
          ['liberadoComRestricao', 'Liberado com restrição'],
          ['bloqueado', 'Bloqueado']
        ],
        cr.warning ? 'liberadoComRestricao' : 'liberado'
      )}${textarea('Justificativa (obrigatória em restrição ou bloqueio)', 'justificativa')}`,
      d => commit(a, { id, ...d }),
      'Registrar análise'
    )
  }
  if (a === 'inspect') {
    const l = find(state.lotes, id)
    return modal(
      'Inspecionar ' + l.codigo,
      notice(
        'Resultado vinculado ao lote e responsável. Reprovação bloqueia faturamento; retrabalho não é simulado.'
      ) +
        select('Resultado', 'decisao', [
          ['aprovado', 'Aprovado'],
          ['reprovado', 'Reprovado']
        ]) +
        textarea('Observações / motivo de reprovação', 'observacoes') +
        input('Referência do laudo (opcional, sem upload)', 'laudo'),
      d => commit(a, { id, ...d }),
      'Registrar inspeção'
    )
  }
  if (a === 'bill')
    return (() => {
      const order = find(state.pedidos, id),
        plan = D.installmentPlan(
          D.orderTotal(order),
          order.condicoesPagamentoDias
        )
      return modal(
        'Registrar faturamento interno',
        notice(
          'Inicia o acompanhamento financeiro das parcelas. O despacho continua independente dos pagamentos.'
        ) +
          input(
            'Referência interna',
            'referencia',
            'FAT-DEMO-' + find(state.pedidos, id).numero,
            'text',
            'required'
          ) +
          table(
            ['Parcela', 'Prazo', 'Valor'],
            plan.map(p => [
              `${p.numero}/${plan.length}`,
              `${p.prazoDias} dias`,
              money(p.valorCentavos)
            ])
          ),
        d => commit(a, { id, ...d }),
        'Iniciar faturamento'
      )
    })()
  if (a === 'invoiceInstallments') {
    const order = find(state.pedidos, id),
      rows = state.recebiveis.filter(r => r.pedidoId === id)
    return modal(
      'Faturamento e parcelas · ' + order.numero,
      table(
        ['Parcela', 'Prazo', 'Vencimento', 'Valor', 'Situação', 'Ação'],
        rows.map(r => [
          `${r.parcelaNumero}/${r.parcelasTotal}`,
          `${r.prazoDias} dias`,
          fmtDate(r.vencimento),
          money(r.valorCentavos),
          r.status === 'pago'
            ? `${badge('Pago')}<small>${fmtDate(r.recebidoEm)}</small>`
            : badge('Aberto'),
          r.status === 'pago'
            ? 'Registrado'
            : actionButton('Marcar como paga', 'registerReceipt', r.id, true)
        ])
      )
    )
  }
  if (a === 'registerReceipt')
    return modal(
      'Registrar pagamento do cliente',
      notice(
        'Somente o recebimento confirmado entra no fechamento mensal de comissão.'
      ) +
        `<div class="form-grid">${input('Data do recebimento', 'recebidoEm', D.today(), 'date', `required max="${D.today()}"`)}${input('Referência do recebimento', 'referencia', '', 'text', 'required')}</div>`,
      d => commit(a, { id, ...d }),
      'Confirmar recebimento'
    )
  if (a === 'dispatch')
    return modal(
      'Registrar frete e despacho',
      notice(
        'Dados informativos. Comprovante é uma referência textual, não um arquivo enviado.'
      ) +
        `<div class="form-grid">${input('Transportadora', 'transportadora', '', 'text', 'required')}${select(
          'Tomador do frete',
          'tomadorFrete',
          [
            ['emitente', 'Emitente'],
            ['destinatario', 'Destinatário']
          ]
        )}${input('Valor do frete (R$)', 'valor', 0, 'number', 'required min="0" step="0.01"')}${input('Data de saída', 'dataSaida', D.today(), 'date', `required max="${D.today()}"`)}${input('Prazo de entrega do frete', 'prazo', D.day(5), 'date', 'required')}${input('Código de rastreamento', 'rastreamento', '', 'text', 'required')}${input('Referência do comprovante', 'comprovante', '', 'text', 'required')}</div>`,
      d => commit(a, { id, ...d }),
      'Confirmar despacho'
    )
  if (a === 'confirmDelivery')
    return modal(
      'Confirmar entrega do pedido',
      notice(
        'A confirmação encerra o acompanhamento logístico do pedido e fica registrada na auditoria.'
      ) +
        `<div class="form-grid">${input('Data da entrega', 'dataEntrega', D.today(), 'date', `required max="${D.today()}"`)}${input('Recebido por', 'recebidoPor', '', 'text', 'required')}${input('Referência do comprovante (opcional)', 'comprovanteEntrega', '', 'text')}</div>`,
      d => commit(a, { id, ...d }),
      'Confirmar entrega'
    )
  if (a === 'receiveLot' && !state.fornecedores.some(f => f.ativo !== false)) throw new Error('Cadastre ou ative um fornecedor em Fornecedores antes de receber matéria-prima.')
  if (a === 'receiveLot')
    return modal(
      'Receber matéria-prima',
      `<div class="form-grid">${select(
        'Ingrediente',
        'ingredienteId',
        state.ingredientes.map(i => [i.id, `${i.codigo} · ${i.nome}`])
      )}${select(
        'Fornecedor',
        'fornecedorId',
        state.fornecedores.filter(i => i.ativo !== false).map(i => [i.id, i.nome])
      )}${input('Código único do lote', 'codigo', '', 'text', 'required')}${input('Quantidade (kg)', 'quantidade', 100, 'number', 'min="0.001" step="0.001" required')}${input('Fabricação', 'fabricacao', D.today(), 'date', 'required')}${input('Validade', 'validade', D.day(180), 'date', 'required')}</div>`,
      d => commit(a, d),
      'Registrar entrada'
    )
  if (a === 'saveSupplier') {
    const supplier = id ? find(state.fornecedores, id) : null
    return modal(supplier ? 'Editar fornecedor' : 'Novo fornecedor',
      `<div class="form-grid">${input('Nome / razão social', 'nome', supplier?.nome || '', 'text', 'required')}${input('Documento (opcional)', 'documento', supplier?.documento || '')}${input('Contato (opcional)', 'contato', supplier?.contato || '')}</div><label class="check-card"><input type="checkbox" name="ativo" ${supplier?.ativo !== false ? 'checked' : ''}><span>Fornecedor ativo <small>Disponível para novos recebimentos.</small></span></label>`,
      d => commit(a, { ...d, id: supplier?.id, ativo: !!document.querySelector('[name="ativo"]:checked') }), 'Salvar fornecedor')
  }
  if (a === 'saveIngredient') {
    const ingredient = id ? find(state.ingredientes, id) : null
    const categories = [
      'Base da fórmula',
      'Acidulantes',
      'Antioxidantes',
      'Conservadores',
      'Espessantes',
      'Reguladores de acidez',
      'Corantes',
      'Umectantes',
      'Realçadores de sabor',
      'Estabilizantes',
      'Antiumectantes',
      'Especiarias',
      'Aromatizantes',
      'Outros'
    ]
    const standardizedGroups = [
      ['01', '01 · Matéria-prima, aditivos únicos e especiarias'],
      ['02', '02 · Condimentos, aditivos gerais, blends, mix e Max'],
      ['03', '03 · Fumaças, óleos e corantes'],
      ['04', '04 · Pastas e molhos']
    ]
    return modal(
      ingredient ? 'Editar ingrediente' : 'Novo ingrediente',
      `<div class="form-grid">${input('Código', 'codigo', ingredient?.codigo || '', 'text', 'required')}${input('Nome', 'nome', ingredient?.nome || '', 'text', 'required')}${input('INS (opcional)', 'ins', ingredient?.ins || '', 'text', 'inputmode="numeric"')}${select(
        'Categoria para rotulagem',
        'categoriaRotulagem',
        categories.map(c => [c, c]),
        ingredient?.categoriaRotulagem || ingredient?.categoria || 'Outros'
      )}${select('Grupo padronizado', 'grupoPadronizacao', standardizedGroups, ingredient?.grupoPadronizacao || '01')}</div><label class="check-card"><input type="checkbox" name="exibePercentualRotulo" ${ingredient?.exibePercentualRotulo ? 'checked' : ''}><span>Exibir percentual na etiqueta <small>Permitido somente para sal, nitrito de sódio/INS 250 e nitrato de sódio/INS 251.</small></span></label>`,
      d =>
        commit(a, {
          id: ingredient?.id,
          ...d,
          exibePercentualRotulo: !!document.querySelector(
            '[name="exibePercentualRotulo"]:checked'
          )
        }),
      ingredient ? 'Salvar alterações' : 'Cadastrar ingrediente'
    )
  }
  if (a === 'deleteIngredient') {
    const ingredient = find(state.ingredientes, id)
    return modal(
      'Excluir ingrediente',
      notice(
        `Excluir <strong>${esc(ingredient.codigo)} · ${esc(ingredient.nome)}</strong>? A ação só será aceita se não houver fórmula ou lote vinculado.`,
        'warn'
      ),
      () => commit(a, { id }),
      'Excluir ingrediente'
    )
  }
  if (a === 'adjustLot')
    return modal(
      'Ajustar ' + find(state.lotes, id).codigo,
      input(
        'Novo saldo (kg)',
        'saldo',
        find(state.lotes, id).saldo,
        'number',
        'required min="0" step="0.001"'
      ) + textarea('Justificativa do ajuste', 'justificativa', '', true),
      d => commit(a, { id, ...d }),
      'Registrar ajuste'
    )
  if (a === 'saveClient')
    return modal(
      'Novo cliente de demonstração',
      notice(
        'Use apenas dados fictícios. CNPJ deve ter dígitos verificadores válidos e ser único. Limite inicial: zero.'
      ) +
        `<div class="form-grid">${input('Razão social', 'razaoSocial', '', 'text', 'required')}${input('Nome fantasia', 'nomeFantasia', '', 'text', 'required')}${input('CNPJ', 'cnpj', '', 'text', 'required')}${input('Inscrição estadual / ISENTO', 'inscricaoEstadual', 'ISENTO', 'text', 'required')}${input('Endereço completo', 'endereco', '', 'text', 'required')}${input('Contato (nome, e-mail ou telefone)', 'contato', '', 'text', 'required')}</div>`,
      d => commit(a, d),
      'Cadastrar cliente'
    )
  if (a === 'savePackaging') {
    const pack = id ? find(state.embalagens, id) : null
    return modal(pack ? 'Editar embalagem' : 'Nova embalagem',
      `<div class="form-grid">${input('Código', 'codigo', pack?.codigo || '', 'text', 'required')}${input('Nome', 'nome', pack?.nome || '', 'text', 'required')}${input('Tipo de embalagem', 'tipo', pack?.tipo || '', 'text', 'required placeholder="Ex.: saco, balde, bombona"')}${input('Capacidade', 'capacidade', pack?.capacidade || '', 'number', 'required min="0.00001" step="0.00001"')}${select('Unidade da capacidade', 'unidadeCapacidade', [['KG', 'Quilos (kg)'], ['L', 'Litros (L)']], pack?.unidadeCapacidade || 'KG')}${input('Custo por unidade (R$)', 'custo', (pack?.custoCentavos || 0) / 100, 'number', 'required min="0" step="0.01"')}${select('Situação', 'ativo', [['true', 'Ativa'], ['false', 'Inativa']], String(pack?.ativo ?? true))}</div>`,
      d => commit(a, { ...d, id, ativo: d.ativo === 'true' }), 'Salvar embalagem')
  }
  if (a === 'productDetails') {
    const p = find(state.produtos, id)
    const f = p.formulaId ? find(state.formulas, p.formulaId) : null
    const draft = f
      ? state.formulas
          .filter(
            x =>
              x.codigo === f.codigo &&
              x.status === 'emDesenvolvimento' &&
              x.id !== f.id
          )
          .sort((a, b) => b.versao - a.versao)[0]
      : null
    const editFormula = (label, formulaId) => actionButton(label, 'createVersion', formulaId).replace('<button ', `<button data-product-id="${esc(p.id)}" `)
    const sim = f ? D.priceSimulation(state, p) : null
    return modal(
      'Detalhes do produto · ' + p.nome,
      `<div class="actions">${actionButton('Editar dados do produto', 'saveProduct', p.id)}${f ? editFormula('Editar fórmula', draft?.id || f.id) : ''}${f && f.status === 'emDesenvolvimento' ? actionButton('Ativar fórmula', 'activateVersion', f.id, true) : ''}${f && f.status === 'ativa' ? actionButton('Editar formação de preço', 'releasePrice', p.id, true) : ''}</div>${
        draft
          ? `<section class="draft-version-card"><div class="section-heading"><div><span class="eyebrow">Alterações salvas</span><h3>Rascunho de ${esc(draft.codigo)}</h3></div>${badge(draft.status)}</div>${fields(
              [
                ['Rendimento', `${formulaQty(draft.rendimento)} kg`],
                [
                  'Soma dos ingredientes',
                  `${formulaQty(draft.itens.reduce((sum, item) => sum + item.quantidade, 0))} kg`
                ],
                ['Justificativa', esc(draft.observacoes || '—')]
              ]
            )}${table(
              ['Ingrediente', 'Quantidade'],
              draft.itens.map(item => [
                esc(find(state.ingredientes, item.ingredienteId).nome),
                `${formulaQty(item.quantidade)} kg`
              ])
            )}<div class="actions">${editFormula('Continuar editando', draft.id)}${actionButton('Ativar rascunho', 'activateVersion', draft.id, true)}</div></section>`
          : ''
      }${fields([
        ['Código', esc(p.codigo)],
        ['Produto', esc(p.nome)],
        ['Categoria', esc(p.categoria)],
        ['Grupo padronizado', esc(p.grupoPadronizacao || 'Não informado')],
        ['Validade', esc(p.validade || 'Não informada')],
        ['Contém', esc(p.contem || 'Nenhum item selecionado')],
        ['Descrição para etiqueta', esc(p.descricaoProduto || 'Não informada')],
        [
          'Alérgicos',
          p.alergenicosAtivo ? esc(p.alergenicosTexto) : 'Não exibir declaração'
        ],
        [
          'Glúten',
          p.naoContemGluten ? 'Não contém glúten' : 'Declaração não marcada'
        ],
        ['Modo de uso', esc(p.modoUso || 'Não informado')],
        ['Conservação', esc(p.conservacao || 'Não informada')],
        [
          'Fórmula',
          f
            ? `${esc(f.codigo)} · ${f.status === 'emDesenvolvimento' ? 'Rascunho' : `v${f.versao}`}  · ${badge(f.status)}`
            : 'Não cadastrada'
        ],
        [
          'Apresentação base',
          `${qty(p.pesoKg)} kg · ${esc(p.embalagem || 'Sem embalagem')}`
        ],
        [
          'Preço atual',
          p.precoVendaKgCentavos
            ? `${money(p.precoVendaKgCentavos)}/kg`
            : 'Não liberado'
        ]
      ])}${
        f
          ? `<div class="grid-2"><section><h3>Composição da fórmula</h3>${table(
              ['Ingrediente', 'Quantidade', 'Participação', 'Custo vigente'],
              f.itens.map(item => {
                const ingredient = find(state.ingredientes, item.ingredienteId)
                return [
                  esc(ingredient.nome),
                  `${formulaQty(item.quantidade)} kg`,
                  `${qty((item.quantidade / f.rendimento) * 100)}%`,
                  money(
                    Math.round(
                      (item.quantidade / f.rendimento) *
                        ingredient.custoCentavos
                    )
                  )
                ]
              })
            )}${fields([['Embalagem final', esc(p.embalagem)], ['Peso líquido', `${qty(p.pesoKg)} kg`], ['Custo por embalagem', money(p.embalagemCentavos || 0)]])}</section>${
              sim
                ? `<section><h3>Formação do preço por kg</h3>${fields([
                    ['Matéria-prima', money(sim.materiaPrimaCentavosKg)],
                    ['Embalagem', money(sim.embalagemCentavosKg)],
                    ['Custo primário', money(sim.custoPrimarioCentavos)],
                    [
                      'Lucro aplicado',
                      `${qty(sim.margemPercentual)}% · ${money(sim.valorLucroCentavos)}`
                    ],
                    ['Base com lucro', money(sim.baseComLucroCentavos)],
                    ['Encargos sobre venda', `${qty(sim.encargosPercentual)}%`],
                    ['Preço calculado', `${money(sim.precoKgCentavos)}/kg`]
                  ])}${table(
                    ['Lucratividade', 'Preço por kg'],
                    D.priceScenarios(state, p).map(row => [
                      `${qty(row.margem)}%`,
                      money(row.precoKgCentavos)
                    ])
                  )}</section>`
                : ''
            }</div>`
          : notice(
              'Cadastre ou copie uma fórmula para começar a formação do preço.',
              'warn'
            )
      }`,
      null
    )
  }
  if (a === 'saveProduct') {
    const p = find(state.produtos, id)
    const formula = p.formulaId ? find(state.formulas, p.formulaId) : null
    if (!formula)
      throw new Error(
        'Cadastre uma fórmula antes de configurar o campo Contém.'
      )
    modal(
      'Dados de qualidade · ' + p.nome,
      `<div class="form-grid">${select(
        'Grupo padronizado do produto',
        'grupoPadronizacao',
        [
          ['01', '01 · Matéria-prima, aditivos únicos e especiarias'],
          ['02', '02 · Condimentos, aditivos gerais, blends, mix e Max'],
          ['03', '03 · Fumaças, óleos e corantes'],
          ['04', '04 · Pastas e molhos']
        ],
        p.grupoPadronizacao || '02'
      )}${input('Validade do produto', 'validade', p.validade || '', 'text', 'placeholder="Ex.: 12 meses"')}${textarea('Descrição do produto na etiqueta', 'descricaoProduto', p.descricaoProduto || '')}${textarea('Modo de uso', 'modoUso', p.modoUso || '')}${textarea('Conservação', 'conservacao', p.conservacao || '')}</div><section class="product-label-options"><h3>Declarações da etiqueta</h3><label class="check-card"><input type="checkbox" name="alergenicosAtivo" ${p.alergenicosAtivo ? 'checked' : ''}><span>Exibir declaração de alérgicos</span></label>${textarea('Texto de alérgicos', 'alergenicosTexto', p.alergenicosTexto || '')}<label class="check-card"><input type="checkbox" name="naoContemGluten" ${p.naoContemGluten ? 'checked' : ''}><span>Exibir “Não contém glúten”</span></label></section>${containsEditor(formula, p.contemItens, p.contem)}${packagingEditor(p)}`,
      d =>
        commit(a, {
          id,
          embalagemId: d.embalagemId, pesoLiquidoKg: d.pesoLiquidoKg, volumeLitros: d.volumeLitros,
          grupoPadronizacao: d.grupoPadronizacao,
          validade: d.validade,
          contem: d.contem,
          descricaoProduto: d.descricaoProduto,
          modoUso: d.modoUso,
          conservacao: d.conservacao,
          alergenicosAtivo: !!document.querySelector(
            '[name="alergenicosAtivo"]:checked'
          ),
          alergenicosTexto: d.alergenicosTexto,
          naoContemGluten: !!document.querySelector(
            '[name="naoContemGluten"]:checked'
          ),
          contemItens: [
            ...document.querySelectorAll('[name="containsIngredient"]:checked')
          ].map(el => el.value)
        }),
      'Salvar dados'
    )
    $('#dialogBody').dataset.product = p.id
    $('#dialogBody').dataset.budgetFormula = formula.id
    updateDraftBudget()
    return
  }
  if (a === 'createProduct') {
    const source = id
      ? find(state.produtos, id)
      : state.produtos.find(p => p.formulaId)
    const sourceFormula = source?.formulaId
      ? find(state.formulas, source.formulaId)
      : null
    modal(
      id ? 'Criar produto a partir de ' + source.nome : 'Novo produto',
      notice(
        'O produto será criado em desenvolvimento com uma cópia da fórmula selecionada. A fórmula e o preço precisam ser revisados antes de entrar em pedidos.'
      ) +
        `<div class="form-grid">${select(
          'Produto base / fórmula inicial',
          'sourceProductId',
          state.produtos
            .filter(p => p.formulaId)
            .map(p => [p.id, `${p.codigo} · ${p.nome}`]),
          source?.id
        )}${input('Código do produto', 'codigo', id ? `${source.codigo}-NOVO` : '', 'text', 'required')}${input('Nome do produto', 'nome', id ? `${source.nome} · Cópia` : '', 'text', 'required')}${input('Categoria', 'categoria', source?.categoria || '', 'text', 'required')}${select(
          'Grupo padronizado',
          'grupoPadronizacao',
          [
            ['01', '01 · Matéria-prima, aditivos únicos e especiarias'],
            ['02', '02 · Condimentos, aditivos gerais, blends, mix e Max'],
            ['03', '03 · Fumaças, óleos e corantes'],
            ['04', '04 · Pastas e molhos']
          ],
          source?.grupoPadronizacao || '02'
        )}${input('Validade do produto', 'validade', source?.validade || '', 'text', 'placeholder="Ex.: 12 meses"')}${input('Código da fórmula', 'formulaCodigo', id ? `${source.codigo}-FORM` : '', 'text', 'required')}${input('Nome da fórmula', 'formulaNome', id ? `${source.nome} · Fórmula` : '', 'text', 'required')}</div><section class="formula-editor" data-stock-only="true"><div class="section-heading"><div><h3>Composição inicial</h3><p class="muted small">A lista oferece ingredientes com saldo em lotes liberados e válidos.</p></div>${btn('+ Adicionar ingrediente', 'addFormulaIngredient')}</div><div class="form-grid">${input('Rendimento (kg)', 'rendimento', source?.formulaId ? find(state.formulas, source.formulaId).rendimento : 100, 'number', 'required min="0.00001" step="0.00001"')}</div><div id="formulaIngredientRows"></div><div id="formulaBalance"></div></section>${sourceFormula ? containsEditor(sourceFormula, source.contemItens, source.contem) : ''}${packagingEditor(source, true)}${textarea('Observações', 'observacoes', '')}`,
      d =>
        commit(a, {
          ...d,
          margem: d.orcamentoMargem,
          contemItens: [
            ...document.querySelectorAll('[name="containsIngredient"]:checked')
          ].map(el => el.value),
          itens: [...document.querySelectorAll('.formula-ingredient-row')].map(
            row => ({
              ingredienteId: row.querySelector('select').value,
              quantidade: row.querySelector('input').value
            })
          )
        }),
      'Criar produto'
    )
    const inStockIds = new Set(
      state.ingredientes
        .filter(i => D.eligibleLots(state, i.id).some(l => l.saldo > 0))
        .map(i => i.id)
    )
    const initialItems = (sourceFormula?.itens || []).filter(i =>
      inStockIds.has(i.ingredienteId)
    )
    ;(initialItems.length
      ? initialItems
      : [
          {
            ingredienteId: [...inStockIds][0],
            quantidade: sourceFormula?.rendimento || 100
          }
        ]
    ).forEach(item => addFormulaIngredientRow(item))
    document.querySelectorAll('[name="containsIngredient"]').forEach(el => {
      el.checked = (source?.contemItens || []).includes(el.value)
    })
    if ($('[name="contem"]')) $('[name="contem"]').value = source?.contem || ''
    updateFormulaBalance()
    return
  }
  if (a === 'createVersion') {
    const f = find(state.formulas, id)
    const p = productContext ? find(state.produtos, productContext) : state.produtos.find(
      product =>
        product.formulaId &&
        find(state.formulas, product.formulaId).codigo === f.codigo
    )
    modal(
      'Editar rascunho · ' + f.codigo,
      notice(
        'A fórmula ativa será preservada. Salvar atualiza o mesmo rascunho; a próxima versão numerada nasce somente ao ativar. A soma dos insumos deve corresponder ao rendimento.'
      ) +
        `<div class="form-grid">${input('Rendimento (kg)', 'rendimento', f.rendimento, 'number', 'required min="0.00001" step="0.00001"')}${input('Validade do produto', 'validade', p?.validade || '', 'text', 'placeholder="Ex.: 12 meses"')}</div><section class="formula-editor"><div class="section-heading"><div><h3>Ingredientes</h3><p class="muted small">Adicione, remova e informe cada quantidade com até 5 casas decimais.</p></div>${btn('+ Adicionar ingrediente', 'addFormulaIngredient')}</div><div id="formulaIngredientRows"></div><div id="formulaBalance"></div></section>${containsEditor(f, p?.contemItens, p?.contem)}${packagingEditor(f.apresentacaoRascunho || p)}${textarea('Justificativa da revisão', 'justificativa', f.observacoes || '', true)}`,
      d =>
        commit(a, {
          id,
          produtoId: p?.id,
          ...d,
          contemItens: [
            ...document.querySelectorAll('[name="containsIngredient"]:checked')
          ].map(el => el.value),
          itens: [...document.querySelectorAll('.formula-ingredient-row')].map(
            row => ({
              ingredienteId: row.querySelector('select').value,
              quantidade: row.querySelector('input').value
            })
          )
        }),
      'Salvar rascunho'
    )
    $('#dialogBody').dataset.product = p?.id || ''
    f.itens.forEach(item => addFormulaIngredientRow(item))
    document.querySelectorAll('[name="containsIngredient"]').forEach(el => {
      el.checked = (p?.contemItens || []).includes(el.value)
    })
    if ($('[name="contem"]')) $('[name="contem"]').value = p?.contem || ''
    updateFormulaBalance()
    return
  }
  if (a === 'activateVersion')
    return modal(
      'Ativar versão',
      notice(
        'Produtos vinculados passam a usar esta versão para novos pedidos. Preços precisarão de nova liberação. Pedidos e OPs existentes preservam sua composição.'
      ) + textarea('Justificativa de ativação', 'justificativa', '', true),
      d => commit(a, { id, ...d }),
      'Ativar versão'
    )
  if (a === 'releasePrice') {
    const p = find(state.produtos, id)
    const settings = state.configuracoes?.precificacao || {}
    const defaults = D.priceSimulation(state, p)
    const scenarios = settings.cenariosLucratividade || [
      10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80
    ]
    const charges = settings.encargosFixos || defaults.encargosFixos
    const profile = D.pricingProfile(state, p)
    const chargeValue = name =>
      profile.encargosFixos.find(item => item.nome === name)?.percentual ?? 0
    modal(
      'Simular preço · ' + p.nome,
      notice(
        'Os campos abaixo começam com os parâmetros padrão da empresa e podem ser ajustados e salvos somente para este produto.'
      ) +
        `<section class="product-pricing-card"><div class="section-heading"><div><span class="eyebrow">Parâmetros deste produto</span><h3>Formação de preço</h3></div></div><div class="form-grid">${select(
          'Lucratividade / markup (%)',
          'margem',
          scenarios.map(value => [value, `${value}%`]),
          p.precificacao?.margemPercentual ?? settings.margemPadrao ?? 60
        )}${input('Embalagem (R$/kg)', 'embalagemCentavosKg', defaults.embalagemCentavosKg / 100, 'number', 'required min="0" step="0.0001"')}${input('Financeiro (R$/kg)', 'financeiroCentavosKg', profile.financeiroCentavosKg / 100, 'number', 'required min="0" step="0.0001"')}${input('Mão de obra (R$/kg)', 'maoDeObraCentavosKg', profile.maoDeObraCentavosKg / 100, 'number', 'required min="0" step="0.0001"')}${input('Outros custos (R$/kg)', 'outrosCustosCentavosKg', profile.outrosCustosCentavosKg / 100, 'number', 'required min="0" step="0.0001"')}${input('Nota fiscal / impostos (%)', 'notaFiscal', chargeValue('Nota fiscal'), 'number', 'required min="0" max="100" step="0.01"')}${input('Comissão técnica (%)', 'comissaoTecnica', chargeValue('Comissão técnica'), 'number', 'required min="0" max="100" step="0.01"')}${input('Comissão comercial (%)', 'comissaoComercial', chargeValue('Comissão comercial'), 'number', 'required min="0" max="100" step="0.01"')}${input('Comissão extra cliente (%)', 'comissaoExtra', chargeValue('Comissão extra cliente'), 'number', 'required min="0" max="100" step="0.01"')}${input('Preço comercial aprovado (R$/kg)', 'precoVendaKg', p.precoVendaKgCentavos ? p.precoVendaKgCentavos / 100 : '', 'number', 'min="0" step="0.0001"')}${input('Tipo de volume', 'volumeTipo', p.volumeTipo || 'Pacote', 'text', 'required')}${input('Unidades por volume', 'unidadesPorVolume', p.unidadesPorVolume || 1, 'number', 'required min="1" step="1"')}${input('Limite máximo por volume', 'limiteUnidadesPorVolume', p.limiteUnidadesPorVolume || 1, 'number', 'required min="1" step="1"')}${textarea('Motivo do ajuste manual', 'motivoAjuste', '')}</div></section><div id="priceResult"></div>` +
        notice(
          'A configuração define quantas unidades formam um volume e o limite máximo permitido. A nova liberação vale somente para pedidos criados ou revisados depois; histórico dos pedidos existentes não muda.'
        ),
      d =>
        commit(a, {
          id,
          ...d,
          encargosFixos: [
            { nome: 'Nota fiscal', percentual: d.notaFiscal },
            { nome: 'Comissão técnica', percentual: d.comissaoTecnica },
            { nome: 'Comissão comercial', percentual: d.comissaoComercial },
            { nome: 'Comissão extra cliente', percentual: d.comissaoExtra }
          ]
        }),
      'Liberar preço'
    )
    $('#dialogBody').dataset.product = id
    updatePrice()
    return
  }
  if (a === 'trace') {
    if (
      !['administrador', 'producao', 'qualidade', 'estoque'].includes(
        user.perfil
      )
    )
      throw new Error('Rastreabilidade restrita à operação.')
    return modal(
      'Rastreabilidade · ' + find(state.lotes, id).codigo,
      traceBody(id)
    )
  }
  if (a === 'technicalSheet') {
    const sample = find(state.pedidos, id).tipo === 'amostra'
    if (
      !['administrador', 'qualidade'].includes(user.perfil) &&
      !(sample && user.perfil === 'pd')
    )
      throw new Error('Ficha técnica restrita à Qualidade.')
    return modal('Ficha técnica para o cliente', technicalSheetBody(id))
  }
  if (a === 'viewLabel') {
    if (!allowed('etiquetas')) throw new Error('Acesso restrito às etiquetas.')
    const [opId, modelId] = String(id).split(':'),
      x = find(state.ordens, opId),
      item = x.etiquetas?.find(
        entry =>
          entry.quantidade > 0 && (!modelId || entry.etiquetaId === modelId)
      ),
      model = item ? find(state.etiquetas, item.etiquetaId) : null,
      lot = x.lotes?.map(lotId => find(state.lotes, lotId)).find(Boolean)
    if (!model) throw new Error('Nenhuma etiqueta definida para esta OP.')
    return modal(
      'Etiqueta · ' + x.numero,
      labelPreview(x, model, lot, null, find(state.pedidos, x.pedidoId))
    )
  }
  if (a === 'viewOrderLabel') {
    if (!allowed('pedidos')) throw new Error('Acesso restrito ao pedido.')
    const [orderId, itemIndex] = String(id).split(':'),
      order = find(state.pedidos, orderId),
      item = order?.itens?.[Number(itemIndex)],
      model = find(state.etiquetas, 'etq2'),
      op = item
        ? {
            id,
            produtoId: item.produtoId,
            produtoNome: item.nome,
            unidade: item.unidade, quantidadePrevista: item.quantidade,
            pesoKg: item.pesoKg, pesoEmbalagemKg: item.pesoEmbalagemKg || item.pesoKg,
            validade: item.validade,
            contem: item.contem,
            descricaoProduto: item.descricaoProduto,
            alergenicosAtivo: item.alergenicosAtivo,
            alergenicosTexto: item.alergenicosTexto,
            naoContemGluten: item.naoContemGluten,
            modoUso: item.modoUso,
            conservacao: item.conservacao,
            formula: item.formula
          }
        : null
    if (!order || !op || !model)
      throw new Error('Etiqueta do item não encontrada.')
    return modal(
      `Etiqueta · ${order.numero} · ${item.nome}`,
      notice(
        'Prévia vinculada ao pedido. O lote assume a data de hoje; a validade usa o cadastro do produto até existir lote produzido.'
      ) + labelPreview(op, model, null, 'printLabel', order)
    )
  }
  if (a === 'modifyBatches') {
    if (!can(a)) throw new Error('Seu perfil não permite modificar batidas.')
    const op = find(state.ordens, id), plan = D.batchPlan(op)
    modal('Modificar batidas · ' + op.numero,
      notice(`Produção total: ${formulaQty(plan.totalKg)} kg. Padrão demonstrativo da máquina: 50 kg por batida, editável. A ficha divide o total da OP pelos kg por batida. Apontamentos, lotes e consumos já registrados permanecem preservados.`) +
      `<div class="form-grid">${input('Quantidade máxima por batida (kg)', 'maximoKg', plan.maximoKg, 'text', 'required inputmode="decimal"')}${input('Quantidade de batidas', 'quantidadeBatidas', plan.quantidade, 'number', 'required min="1" max="10000" step="1"')}</div><div id="batchPlanPreview" role="status"></div>`,
      data => commit(a, { id, maximoKg: batchDecimal(data.maximoKg), quantidadeBatidas: data.quantidadeBatidas }), 'Salvar batidas')
    $('#dialogBody').dataset.batchOp = id
    updateBatchPlan()
    return
  }
  if (['viewProductionFormula', 'viewOpLabels'].includes(a)) {
    if (!technical()) throw new Error('Documento da OP restrito.')
    const x = find(state.ordens, id),
      d = x.documentoOp,
      order = find(state.pedidos, x.pedidoId),
      product = { ...find(state.produtos, x.produtoId), embalagem: x.embalagem || find(state.produtos, x.produtoId).embalagem },
      plan = d.batidas || D.batchPlan(x),
      batchKg = plan.totalKg,
      composition = D.productionFormulaRows(x, plan),
      getLabelQty = eid =>
        x.etiquetas?.find(item => item.etiquetaId === eid)?.quantidade || 0
    return modal(
      `${a === 'viewOpLabels' ? 'Etiquetas' : 'Fórmula para produção'} · ${x.numero}`,
      `<section class="production-formula" data-doc-panel="demonstracao" ${a === 'viewOpLabels' ? 'hidden' : ''}><header class="production-formula-head"><div><span class="eyebrow">Documento operacional</span><h2>Fórmula para produção</h2></div><img src="assets/logo-horizontal.png" alt="Realtech"><strong>${esc(d.numero)}</strong></header>${fields(
        [
          ['Data/hora de produção', fmtTime(d.data)],
          ['Cliente / local', esc(order.clienteNome)],
          ['Pedido', esc(order.numero)],
          ['Produto', esc(x.produtoNome)],
          [
            'Grupo padronizado',
            esc(
              x.grupoPadronizacao ||
                product.grupoPadronizacao ||
                'Não informado'
            )
          ],
          [
            'Fórmula / versão',
            `${esc(x.formula.codigo)} · v${x.formula.versao}`
          ],
          ['Quantidade a produzir', `${qty(batchKg)} kg`],
          ['Quantidade de batidas', String(plan.quantidade)],
          ['Quantidade por batida', `${formulaQty(plan.kgPorBatida)} kg`],
          ['Máximo por batida', `${formulaQty(plan.maximoKg)} kg`],
          [
            'Quantidade de volumes',
            `${D.volumeCount({ quantidade: x.quantidadePrevista, unidade: x.unidade, pesoEmbalagemKg: x.pesoEmbalagemKg || x.pesoKg, unidadesPorVolume: x.unidadesPorVolume || product.unidadesPorVolume })} ${esc(x.volumeTipo || product.volumeTipo || 'volume')}(s)`
          ],
          ['Peso líquido por embalagem', `${qty(x.pesoEmbalagemKg || x.pesoKg)} kg`],
          ['Embalagem externa', esc(product.embalagem || 'Não informada')],
          ['Lote', D.compactLotDate()],
          ['Validade', esc(x.validade || product.validade || 'Não informada')],
          ['Modo de uso', esc(x.modoUso || product.modoUso || 'Não informado')],
          ['Responsável', esc(d.usuario)],
          ['Etiquetas registradas', (x.etiquetas || []).filter(entry => entry.quantidade > 0).map(entry => `${`Etiqueta ${esc(entry.etiquetaId.replace(/\D/g, '') || 'registrada')}`} · ${entry.quantidade} unidade(s)`).join('<br>') || 'Nenhuma']
        ]
      )}<div class="production-callout">ENTREGAR ASSIM QUE FICAR PRONTO</div><section class="production-contains"><span>CONTÉM</span><p>${esc(x.contem || product.contem || 'Não informado')}</p></section>${table(
        ['Ingrediente / INS', 'Total fórmula (%)', 'Total fórmula (kg)', 'Por batida (kg)', 'Total da OP (kg)'],
        composition.map(row => [
          ingredientName(find(state.ingredientes, row.ingredienteId)), `${formulaQty(row.percentual)}%`,
          formulaQty(row.formulaKg), formulaQty(row.batidaKg), formulaQty(row.totalKg)
        ]),
        ['TOTAL', `${formulaQty(composition.reduce((sum, row) => sum + row.percentual, 0))}%`,
          `${formulaQty(composition.reduce((sum, row) => sum + row.formulaKg, 0))} kg`,
          `${formulaQty(composition.reduce((sum, row) => sum + row.batidaKg, 0))} kg`,
          `${formulaQty(composition.reduce((sum, row) => sum + row.totalKg, 0))} kg`]
      )}<div class="production-total"><span>Total da fórmula</span><strong>${formulaQty(x.formula.rendimento)} kg</strong><span>Por batida (${plan.quantidade} batidas)</span><strong>${formulaQty(plan.kgPorBatida)} kg</strong><span>Total da OP</span><strong>${formulaQty(batchKg)} kg</strong></div><div class="signature-grid"><span>Visto Administração</span><span>Visto Produção</span><span>Visto Colaborador responsável</span></div>${btn('Imprimir / salvar em PDF', 'printDoc', id, true)}</section><section class="labels-sheet" data-doc-panel="etiqueta" ${a === 'viewOpLabels' ? '' : 'hidden'}><div class="label-quantity-bar"><div><span class="eyebrow">Preparação da impressão</span><h3>Quantidade de etiquetas</h3><p class="muted small">Padrão sugerido: 1 pequena e 2 grandes.</p></div><div class="label-quantity-fields">${input('Pequenas', 'inlineSmallLabels', getLabelQty('etq1'), 'number', 'min="0" step="1"')}${input('Grandes', 'inlineLargeLabels', getLabelQty('etq2'), 'number', 'min="0" step="1"')}${can('saveOpLabels') ? btn('Atualizar prévias', 'updateOpLabelQuantities', id, true) : ''}</div></div><div class="label-preview-grid">${[
        'etq1',
        'etq2'
      ]
        .map(eid => {
          const e = find(state.etiquetas, eid)
          const lot = x.lotes
            ?.map(lotId => find(state.lotes, lotId))
            .find(Boolean)
          const quantity = getLabelQty(eid)
          const sizeClass =
            String(e.tamanho || '').toLowerCase() === 'pequena'
              ? 'label-instance-pequena'
              : 'label-instance-grande'
          return `<div class="label-instance ${sizeClass}"><div class="label-instance-head"><strong>${esc(e.nome)}</strong><span>${quantity} unidade(s)</span></div>${labelPreview(x, e, lot, null, order)}</div>`
        })
        .join(
          ''
        )}</div>${notice('Cada tamanho tem sua própria prévia e impressão em PDF. Dados de produto, cliente e lote são preenchidos pela OP; medidas e margens ainda precisam ser validadas na impressora.', 'warn')}</section>`
    )
  }
  if (a === 'updateOpLabelQuantities') {
    commit('saveOpLabels', {
      id,
      pequena: $('[name="inlineSmallLabels"]')?.value || 0,
      grande: $('[name="inlineLargeLabels"]')?.value || 0
    })
    openAction('viewOpLabels', id)
    toast('Quantidades e prévias atualizadas.')
    return
  }
  if (a === 'editLabel') {
    const e = find(state.etiquetas, id)
    return modal(
      'Modificar etiqueta · ' + e.tamanho,
      `<div class="form-grid">${input('Nome do modelo', 'nome', e.nome, 'text', 'required')}` +
        input(
          'Dados que devem constar',
          'conteudo',
          e.conteudo,
          'text',
          'required'
        ) +
        textarea(
          'Texto regulatório',
          'textoRegulatorio',
          e.textoRegulatorio || ''
        ) +
        textarea('Dados da fabricante', 'fabricante', e.fabricante || '') +
        input('Slogan', 'slogan', e.slogan || '') +
        textarea('Observações', 'observacoes', e.observacoes || '') +
        `</div>`,
      d => commit('saveLabel', { id, ...d }),
      'Salvar modelo'
    )
  }
  if (a === 'editOpLabels') {
    const x = find(state.ordens, id),
      getQty = eid =>
        x.etiquetas?.find(i => i.etiquetaId === eid)?.quantidade || 0
    return modal(
      'Etiquetas da ' + x.numero,
      notice(
        'Quantidades e conteúdo são uma proposta provisória e poderão mudar após o detalhamento.',
        'warn'
      ) +
        `<div class="form-grid">${input('Etiqueta pequena', 'pequena', getQty('etq1'), 'number', 'required min="0" step="1"')}${input('Etiqueta grande', 'grande', getQty('etq2'), 'number', 'required min="0" step="1"')}</div>`,
      d => commit('saveOpLabels', { id, ...d }),
      'Salvar quantidades'
    )
  }
  if (a === 'printDoc') {
    window.print()
    return
  }
  if (['printLabel', 'printSmallLabel', 'printLargeLabel'].includes(a)) {
    $('#dialogBody').dataset.print = 'label'
    const printSize =
      a === 'printSmallLabel'
        ? 'pequena'
        : a === 'printLargeLabel'
          ? 'grande'
          : null
    if (printSize) $('#dialogBody').dataset.printSize = printSize
    window.print()
    delete $('#dialogBody').dataset.print
    delete $('#dialogBody').dataset.printSize
    return
  }
  if (a === 'clientHistory') {
    if (!allowed('clientes')) throw new Error('Acesso restrito.')
    const c = find(clients(), id),
      h = c.historicoFinanceiro || [],
      late = h.filter(x => x.diasAtraso > 0)
    return modal(
      'Histórico financeiro · ' + c.nomeFantasia,
      fields([
        ['Status atual', badge(c.situacaoFinanceira)],
        ['Limite vigente', money(c.limiteCentavos)],
        ['Meses com atraso', late.length],
        ['Maior atraso', `${Math.max(0, ...late.map(x => x.diasAtraso))} dias`]
      ]) +
        table(
          ['Mês', 'Situação da análise', 'Atraso observado'],
          h.map(x => [
            x.mes.split('-').reverse().join('/'),
            badge(x.status),
            x.diasAtraso ? `${x.diasAtraso} dias` : 'Em dia'
          ])
        ) +
        notice(
          'O histórico apoia a análise humana de limite. A situação atual não deve apagar decisões ou atrasos anteriores.'
        )
    )
  }
  if (a === 'auditDetails') {
    if (!allowed('auditoria')) throw new Error('Auditoria restrita.')
    const event = find(state.auditoria, id)
    const redact = value => {
      if (user.perfil === 'administrador') return value
      if (!value) return null
      return {
        id: value.id,
        numero: value.numero,
        status: value.status,
        statusAnalise: value.statusAnalise,
        ativo: value.ativo
      }
    }
    return modal(
      actionNames[event.acao] || event.acao,
      notice(
        user.perfil === 'diretor'
          ? 'Diretor vê resumo sem fórmulas e custos.'
          : 'Snapshot local do registro antes e depois.'
      ) +
        `<div class="grid-2">${panel('Antes', `<pre class="audit-json">${esc(JSON.stringify(redact(event.antes), null, 2))}</pre>`)}${panel('Depois', `<pre class="audit-json">${esc(JSON.stringify(redact(event.depois), null, 2))}</pre>`)}</div>`
    )
  }
  if (a === 'exportCsv') {
    if (!allowed('relatorios')) throw new Error('Acesso restrito.')
    const d = reportData(),
      safe = v =>
        '"' +
        String(v)
          .replace(/^[=+@\-\t\r]/, "'$&")
          .replace(/"/g, '""') +
        '"'
    const csv =
      '\uFEFF' +
      [d.headers, ...d.rows].map(r => r.map(safe).join(';')).join('\r\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    )
    const el = document.createElement('a')
    el.href = url
    el.download = `realtech-demo-${user.perfil}-${D.today()}.csv`
    el.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast('CSV do recorte atual exportado.')
    return
  }
  if (a === 'resetDemo') {
    if (user.perfil !== 'administrador')
      throw new Error('Somente Administrador pode reiniciar.')
    const label =
      dataMode === 'with-data' ? 'três cenários iniciais' : 'ambiente vazio'
    return modal(
      'Reiniciar demonstração',
      notice(
        `Os registros deste modo serão substituídos pelo ${label}. O outro modo não será alterado.`,
        'warn'
      ),
      () => {
        const fresh = freshState()
        fresh.revision = state.revision + 1
        localStorage.setItem(KEY, JSON.stringify(fresh))
        state = fresh
        user = state.usuarios[0]
        storageProblem = false
        $('#storageWarning').classList.add('hidden')
        route = 'dashboard'
        selectedId = null
      },
      'Reiniciar este modo'
    )
  }
  const confirmations = {
    submitOrder:
      'Enviar este rascunho ao Financeiro? A edição será bloqueada imediatamente.',
    approveOrder: 'Aprovar comercialmente este pedido?',
    createOps: 'Gerar uma OP independente para cada item deste pedido?',
    issueSheet:
      'Gerar o documento operacional com a versão da fórmula preservada?',
    startOp: 'Iniciar a produção desta OP?',
    toggleUser: 'Alterar a situação de acesso deste usuário?'
  }
  if (a === 'cancelOrder')
    return modal(
      'Cancelar pedido',
      textarea('Justificativa do cancelamento', 'justificativa', '', true),
      d => commit(a, { id, ...d }),
      'Cancelar pedido'
    )
  if (confirmations[a])
    return modal(actionNames[a], notice(confirmations[a]), () =>
      commit(a, { id })
    )
  throw new Error('Ação não reconhecida.')
}
function updatePrice() {
  const el = $('[name="margem"]')
  if (!el || !$('#priceResult')) return
  try {
    const product = find(state.produtos, $('#dialogBody').dataset.product)
    const value = name => Number($(`[name="${name}"]`)?.value || 0)
    const current = {
      ...product,
      precificacao: {
        ...(product.precificacao || {}),
        margemPercentual: el.value,
        embalagemCentavosKg: value('embalagemCentavosKg') * 100,
        financeiroCentavosKg: value('financeiroCentavosKg') * 100,
        maoDeObraCentavosKg: value('maoDeObraCentavosKg') * 100,
        outrosCustosCentavosKg: value('outrosCustosCentavosKg') * 100,
        encargosFixos: [
          { nome: 'Nota fiscal', percentual: value('notaFiscal') },
          { nome: 'Comissão técnica', percentual: value('comissaoTecnica') },
          {
            nome: 'Comissão comercial',
            percentual: value('comissaoComercial')
          },
          { nome: 'Comissão extra cliente', percentual: value('comissaoExtra') }
        ]
      }
    }
    const sim = D.priceSimulation(state, current, el.value)
    $('#priceResult').innerHTML = fields([
      ['Custo primário', `${money(sim.custoPrimarioCentavos)}/kg`],
      ['Lucro aplicado', `${money(sim.valorLucroCentavos)}/kg`],
      ['Base com lucro', `${money(sim.baseComLucroCentavos)}/kg`],
      ['Encargos sobre venda', `${sim.encargosPercentual.toFixed(2)}%`],
      ['Preço calculado', `${money(sim.precoKgCentavos)}/kg`]
    ])
  } catch (e) {
    $('#priceResult').innerHTML = notice(esc(e.message), 'warn')
  }
}
function addFormulaIngredientRow(item = {}) {
  const used = new Set(
    [...document.querySelectorAll('.formula-ingredient-row select')].map(
      el => el.value
    )
  )
  const stockOnly = !!document.querySelector(
    '.formula-editor[data-stock-only="true"]'
  )
  const available = state.ingredientes.filter(
    i =>
      (i.id === item.ingredienteId || !used.has(i.id)) &&
      (!stockOnly || D.eligibleLots(state, i.id).some(l => l.saldo > 0))
  )
  if (!available.length)
    return toast('Todos os ingredientes já foram adicionados.')
  const n = document.querySelectorAll('.formula-ingredient-row').length + 1
  $('#formulaIngredientRows').insertAdjacentHTML(
    'beforeend',
    `<div class="formula-ingredient-row">${select(
      `Ingrediente ${n}`,
      'formulaIngredient',
      available.map(i => [i.id, `${i.codigo} · ${i.nome}`]),
      item.ingredienteId || available[0].id
    )}${input('Quantidade (kg)', 'formulaQuantity', item.quantidade ?? 0, 'number', 'required min="0" step="0.00001"')}<button type="button" class="ghost-btn remove-formula-ingredient" data-action="removeFormulaIngredient" aria-label="Remover ingrediente ${n}">×</button></div>`
  )
  updateFormulaBalance()
  syncContainsOptions()
}
function updateFormulaBalance() {
  updateDraftBudget()
  if (!$('#formulaBalance')) return
  const yieldKg = Number($('[name="rendimento"]')?.value || 0)
  const total = [
    ...document.querySelectorAll('.formula-ingredient-row input')
  ].reduce((sum, el) => sum + Number(el.value || 0), 0)
  const difference = yieldKg - total
  const matches = Math.abs(difference) < 0.00001
  $('#formulaBalance').innerHTML = notice(
    `Soma dos ingredientes: <strong>${total.toFixed(5)} kg</strong> · Rendimento: <strong>${yieldKg.toFixed(5)} kg</strong>${matches ? ' · Valores conferem.' : ` · ${difference > 0 ? 'Restam' : 'Excedem'} <strong>${Math.abs(difference).toFixed(5)} kg</strong>.`}`,
    matches ? 'success' : 'warn'
  )
}
function batchDecimal(value) { return Number(String(value).trim().replace(',', '.')) }
function updateBatchPlan(changed = null) {
  const preview = $('#batchPlanPreview')
  if (!preview) return
  const op = find(state.ordens, $('#dialogBody').dataset.batchOp)
  const total = op.quantidadePrevista * op.pesoKg
  const max = $('[name="maximoKg"]'), count = $('[name="quantidadeBatidas"]')
  if (changed === 'maximoKg' && batchDecimal(max.value) > 0) count.value = Math.ceil(total / batchDecimal(max.value))
  if (changed === 'quantidadeBatidas' && Number.isInteger(Number(count.value)) && Number(count.value) > 0) max.value = (total / Number(count.value)).toFixed(5)
  try {
    const plan = D.batchPlan(op, batchDecimal(max.value), count.value)
    preview.innerHTML = fields([['Total da OP', `${formulaQty(plan.totalKg)} kg`], ['Divisão planejada', `${plan.quantidade} batida(s) de ${formulaQty(plan.kgPorBatida)} kg`]]) + notice('Ao alterar o máximo, recalculamos o mínimo de batidas. Ao alterar as batidas, recalculamos o máximo necessário por batida. O padrão de 50 kg é apenas uma referência demonstrativa.')
  } catch (error) { preview.innerHTML = notice(esc(error.message), 'warn') }
}
function openTableRecord(row) {
  const readActions = new Set(['productDetails', 'clientHistory', 'trace', 'technicalSheet', 'viewOrderLabel', 'viewLabel', 'viewProductionFormula', 'viewOpLabels', 'editLabel', 'saveSupplier', 'saveIngredient', 'savePackaging'])
  const controls = [...row.querySelectorAll('button[data-route], button[data-action]')].filter(button => !button.disabled)
  const primary = controls.find(button => button.dataset.route) || controls.find(button => readActions.has(button.dataset.action))
  if (primary) { primary.click(); return }
  const headers = [...row.closest('table').querySelectorAll('thead th')]
  modal('Detalhes do registro', fields([...row.cells].map((cell, index) => [
    esc(headers[index]?.textContent || `Campo ${index + 1}`), esc(cell.textContent.trim()) || '—'
  ])))
}
document.addEventListener('keydown', e => {
  if (!['Enter', ' '].includes(e.key) || !e.target.matches('tr[data-table-row]')) return
  e.preventDefault()
  try { openTableRecord(e.target) } catch (error) { toast(error.message) }
})
document.addEventListener('click', e => {
  const record = e.target.closest('tr[data-table-row]')
  if (record && user && !e.target.closest('button,a,input,select,textarea,label,summary,[contenteditable]')) {
    if (window.getSelection()?.toString()) return
    try { openTableRecord(record) } catch (error) { toast(error.message) }
    return
  }

  const tab = e.target.closest('[data-doc-tab]')
  if (tab) {
    document
      .querySelectorAll('[data-doc-tab]')
      .forEach(b => b.classList.toggle('active', b === tab))
    document
      .querySelectorAll('[data-doc-panel]')
      .forEach(p => (p.hidden = p.dataset.docPanel !== tab.dataset.docTab))
    return
  }
  const demo = e.target.closest('[data-demo]')
  if (demo && !user) {
    const u = find(state.usuarios, demo.dataset.demo)
    $('#username').value = u.login
    $('#password').value = u.senha
    document
      .querySelectorAll('.profile-choice')
      .forEach(b => b.classList.toggle('active', b.dataset.demo === u.id))
    return
  }
  const nav = e.target.closest('[data-route]')
  if (nav && user) {
    if ($('#flowDialog').open) closeModal()
    go(nav.dataset.route, nav.dataset.id || null)
    return
  }
  const action = e.target.closest('[data-action]')
  if (!action || !user) return
  if (action.dataset.action === 'calculateDraftBudget') { updateDraftBudget(); return }
  if (action.dataset.action === 'suggestBudgetPackaging') { suggestBudgetPackaging(); return }
  if (action.dataset.action === 'removeLine') {
    action.closest('.order-line').remove()
    updateOrderTotals()
    return
  }
  if (action.dataset.action === 'addFormulaIngredient') {
    addFormulaIngredientRow()
    return
  }
  if (action.dataset.action === 'removeFormulaIngredient') {
    action.closest('.formula-ingredient-row').remove()
    updateFormulaBalance()
    syncContainsOptions()
    return
  }
  if (action.dataset.action === 'addPaymentTerm') {
    const terms = [...document.querySelectorAll('.payment-term-line input')],
      nextDays = terms.length ? (Number(terms.at(-1).value) || 0) + 15 : 30
    addPaymentTerm(nextDays)
    return
  }
  if (action.dataset.action === 'removePaymentTerm') {
    if (document.querySelectorAll('.payment-term-line').length === 1)
      return toast('O pedido precisa ter ao menos uma parcela.')
    action.closest('.payment-term-line').remove()
    updatePaymentTerms()
    return
  }
  try {
    openAction(action.dataset.action, action.dataset.id, action.dataset.productId || null)
  } catch (error) {
    toast(error.message)
  }
})
function filterOrders() {
  if (!$('#orderResults')) return
  const term = ($('#orderSearch').value || '').toLocaleLowerCase('pt-BR'),
    status = $('[name="filterStatus"]').value
  const rows = orders().filter(
    o =>
      (!status || o.status === status) &&
      `${o.numero} ${o.clienteNome} ${D.stage(state, o)}`
        .toLocaleLowerCase('pt-BR')
        .includes(term)
  )
  $('#orderResults').innerHTML = table(
    ['Pedido', 'Cliente', 'Status', 'Próxima etapa', 'Valor', 'Entrega'],
    orderRows(rows.slice().reverse())
  )
}
function filterPdProducts() {
  const term = ($('#pdProductSearch')?.value || '').toLocaleLowerCase('pt-BR')
  document.querySelectorAll('[data-pd-product-row]').forEach(cell => {
    cell.closest('tr').hidden = !cell.dataset.pdProductRow.includes(term)
  })
}
function filterLabels() {
  const term = ($('#labelSearch')?.value || '')
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''),
    rows = [...document.querySelectorAll('[data-label-search]')]
  let visible = 0
  rows.forEach(cell => {
    const value = cell.dataset.labelSearch
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    cell.closest('tr').hidden = !value.includes(term)
    if (value.includes(term)) visible += 1
  })
  const empty = $('#labelSearchEmpty')
  if (empty) empty.hidden = !term || visible > 0
}
function filterSearchList(input) {
  const normalize = value => String(value).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const tokens = normalize(input.value).trim().split(/\s+/).filter(Boolean)
  const key = input.dataset.listSearch
  const rows = [...document.querySelectorAll(`[data-search-list="${key}"] tbody tr`)]
  let visible = 0
  rows.forEach(row => {
    const value = normalize(row.textContent)
    const identifiers = (row.textContent.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g) || []).map(value => value.replace(/\D/g, ''))
    row.hidden = !tokens.every(token => value.includes(token) || (/^\d+$/.test(token) && identifiers.some(value => value.includes(token))))
    if (!row.hidden) visible++
  })
  $(`#${key}SearchSummary`).textContent = visible ? `${visible} de ${rows.length} registros encontrados.` : 'Nenhum registro encontrado. Limpe ou altere a busca.'
}
document.addEventListener('change', e => { if (e.target.closest('.budget-editor') || e.target.name === 'sourceProductId' || e.target.name === 'formulaIngredient') updateDraftBudget() })
document.addEventListener('input', e => {
  if (['maximoKg', 'quantidadeBatidas'].includes(e.target.name)) updateBatchPlan(e.target.name)
  if (e.target.closest('.budget-editor')) updateDraftBudget()
  if (e.target.dataset.listSearch) filterSearchList(e.target)

  if (e.target.name === 'contem') e.target.dataset.edited = 'true'
  if (e.target.id === 'orderSearch') filterOrders()
  if (e.target.id === 'pdProductSearch') filterPdProducts()
  if (e.target.id === 'labelSearch') filterLabels()
  if (e.target.closest('.order-line')) updateOrderTotals()
  if (e.target.closest('.payment-term-line')) updatePaymentTerms()
  if (e.target.closest('.formula-editor') || e.target.name === 'rendimento')
    updateFormulaBalance()
  if (
    [
      'margem',
      'notaFiscal',
      'comissaoTecnica',
      'comissaoComercial',
      'comissaoExtra',
      'financeiroCentavosKg',
      'maoDeObraCentavosKg',
      'outrosCustosCentavosKg',
      'embalagemCentavosKg'
    ].includes(e.target.name)
  )
    updatePrice()
  if (
    ['quantidade', 'perdasKg', 'sobrasKg'].includes(e.target.name) &&
    $('#consumptionRows')
  )
    drawConsumption($('#dialogBody').dataset.op)
})
document.addEventListener('change', e => {
  if (e.target.name === 'containsIngredient') updateContainsText(true)
  if (e.target.name === 'formulaIngredient') syncContainsOptions()
  if (e.target.name === 'filterStatus') filterOrders()
  if (e.target.name === 'tipo') syncOrderType()
  if (e.target.name === 'clienteId' && $('#orderLines')) updateOrderTotals()
  if (e.target.closest('.order-line')) updateOrderTotals()
})

