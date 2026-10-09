'use strict'
function searchableList(key, label, content) {
  return `${input(label, `${key}Search`, '', 'search', 'autocomplete="off" data-list-search="'+key+'"')}<p id="${key}SearchSummary" class="muted small" role="status" aria-live="polite"></p><div data-search-list="${key}">${content}</div>`
}

function clientsView() {
  return searchableList('clients', 'Buscar por cliente, razão social, CNPJ ou vendedor', 
    intro(
      'Clientes',
      'Cadastro, carteira e comportamento financeiro anual. Os exemplos não representam empresas reais.',
      actionButton('+ Novo cliente', 'saveClient')
    ) +
    panel(
      'Carteira de clientes',
      table(
        [
          'Cliente / CNPJ',
          'Vendedor',
          'Situação atual',
          'Meses com atraso',
          'Maior atraso',
          'Limite',
          'Ações'
        ],
        clients().map(c => {
          const h = c.historicoFinanceiro || [],
            late = h.filter(x => x.diasAtraso > 0)
          return [
            `${esc(c.nomeFantasia)}<small>${esc(c.razaoSocial)}</small><small>${esc(c.cnpj)}</small>`,
            esc(find(state.usuarios, c.vendedorId).nome),
            badge(c.ativo ? c.situacaoFinanceira : 'inativo'),
            late.length,
            `${Math.max(0, ...late.map(x => x.diasAtraso))} dias`,
            money(c.limiteCentavos),
            btn('Ver histórico anual', 'clientHistory', c.id)
          ]
        })
      )
    ) +
    '<p class="muted small">O status atual e o histórico mensal apoiam a decisão de crédito; não liberam limite automaticamente.</p>'
  )
}
function productsView() {
  const showCommission = user.perfil !== 'comercial'
  return searchableList('products', 'Buscar por nome, código ou categoria', 
    intro(
      'Produtos e preços liberados',
      'Unidades de venda, embalagens e elegibilidade para novos pedidos.'
    ) +
    panel(
      'Catálogo demonstrativo',
      table(
        [
          'Produto',
          'Categoria',
          'Unidade / embalagem',
          'Volume de transporte',
          'Preço liberado',
          ...(showCommission ? ['Comissão'] : []),
          'Status'
        ],
        state.produtos.map(p => [
          `${esc(p.codigo)} · ${esc(p.nome)}${technical() && p.formulaId ? `<small>${esc(find(state.formulas, p.formulaId).codigo)} · v${find(state.formulas, p.formulaId).versao}</small>` : ''}`,
          esc(p.categoria),
          `${p.unidade} · ${qty(p.pesoKg)} kg<small>${esc(p.embalagem)}</small>`,
          `${esc(p.volumeTipo || 'Volume')} · ${p.unidadesPorVolume || 1} UN<small>limite ${p.limiteUnidadesPorVolume || 1} UN/volume</small>`,
          p.precoLiberado ? money(p.precoCentavos) : 'Não liberado',
          ...(showCommission ? [`${p.comissaoBps / 100}%`] : []),
          badge(p.status)
        ])
      )
    ) +
    notice(
      'Produtos inativos, em desenvolvimento ou sem preço liberado não aparecem no novo pedido. O volume é calculado por tipo e unidades por volume, respeitando o limite máximo configurado. Fórmulas e custos só aparecem para perfis técnicos autorizados.'
    )
  )
}
function suppliersView() {
  return searchableList('suppliers', 'Buscar por nome, documento ou contato',
    intro('Fornecedores', 'Cadastro utilizado no recebimento de matéria-prima.', actionButton('+ Novo fornecedor', 'saveSupplier', null, true)) +
    panel('Fornecedores cadastrados', table(['Fornecedor', 'Documento', 'Contato', 'Status', 'Ações'], state.fornecedores.map(f => [
      esc(f.nome), esc(f.documento || '—'), esc(f.contato || '—'), badge(f.ativo === false ? 'inativo' : 'ativo'), actionButton('Editar', 'saveSupplier', f.id)
    ]))) + notice('Inative fornecedores para impedir novas entradas sem apagar os vínculos dos lotes já recebidos.'))
}
function ingredientsView() {
  const stock = ingredient =>
    D.eligibleLots(state, ingredient.id).reduce(
      (sum, lot) => sum + lot.saldo,
      0
    )
  return (
    intro(
      'Ingredientes',
      'Cadastro-base usado no recebimento de matéria-prima e na criação das fórmulas dos produtos.',
      actionButton('+ Novo ingrediente', 'saveIngredient', null, true)
    ) +
    panel(
      'Ingredientes cadastrados',
      table(
        [
          'Código',
          'Ingrediente / INS',
          'Grupo',
          '% no rótulo',
          'Disponível',
          'Ações'
        ],
        state.ingredientes.map(i => [
          esc(i.codigo),
          ingredientName(i),
          esc(i.grupoPadronizacao || '—'),
          i.exibePercentualRotulo ? 'Sim' : 'Não',
          `${qty(stock(i))} kg`,
          `<div class="actions">${actionButton('Editar', 'saveIngredient', i.id)}${actionButton('Excluir', 'deleteIngredient', i.id)}</div>`
        ])
      )
    ) +
    notice(
      'A exclusão é bloqueada quando o ingrediente já participa de uma fórmula ou possui lote registrado. O INS é opcional, pois nem toda matéria-prima possui esse código.'
    )
  )
}
function packagingView() {
  return intro('Embalagens', 'Cadastre capacidade e custo por unidade. A embalagem compõe o custo e a apresentação, sem entrar no rendimento da fórmula.', actionButton('+ Nova embalagem', 'savePackaging', null, true)) + panel('Catálogo de embalagens', table(
    ['Código / embalagem', 'Tipo', 'Capacidade', 'Custo unitário', 'Situação', 'Ações'],
    state.embalagens.map(pack => [
      `${esc(pack.codigo)}<small>${esc(pack.nome)}</small>`, esc(pack.tipo),
      `${qty(pack.capacidade)} ${pack.unidadeCapacidade === 'L' ? 'L' : 'kg'}`, money(pack.custoCentavos),
      badge(pack.ativo ? 'ativo' : 'inativo'), actionButton('Editar', 'savePackaging', pack.id)
    ])
  )) + notice('Para embalagens em litros, o peso líquido do produto é informado manualmente em kg. A capacidade não converte volume em peso automaticamente.')
}
function formulasView() {
  return (
    intro(
      'Produtos e formulações',
      'Consulte o catálogo de P&D e abra um produto para editar sua fórmula e formação de preço.',
      `${actionButton('Parâmetros de precificação', 'pricingSettings')}${actionButton('Novo produto', 'createProduct', null, true)}`
    ) +
    panel(
      'Catálogo de P&D',
      `${input('Buscar por nome ou código', 'pdProductSearch', '', 'search', 'autocomplete="off"')}<div id="pdProductList">${table(
        [
          'Produto',
          'Fórmula',
          'Apresentação',
          'Preço atual',
          'Situação',
          'Ações'
        ],
        state.produtos.map(p => {
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
          return [
            `<span data-pd-product-row="${esc(`${p.nome} ${p.codigo}`.toLocaleLowerCase('pt-BR'))}">${esc(p.codigo)} · ${esc(p.nome)}</span>`,
            f
              ? `${esc(f.codigo)} · ${f.status === 'emDesenvolvimento' ? 'Rascunho' : `v${f.versao}`} <small>${badge(f.status)}</small>${draft ? `<small class="draft-version-note">Rascunho em edição ${badge('emDesenvolvimento')}</small>` : ''}`
              : 'Sem fórmula',
            `${qty(p.pesoKg)} kg<small>${esc(p.embalagem || 'Sem embalagem')}</small>`,
            p.precoVendaKgCentavos
              ? `${money(p.precoVendaKgCentavos)}/kg`
              : p.precoLiberado
                ? money(p.precoCentavos)
                : 'Não liberado',
            badge(p.status),
            `${actionButton(draft ? 'Revisar rascunho' : 'Abrir', 'productDetails', p.id, true)}${actionButton('Criar a partir', 'createProduct', p.id)}`
          ]
        })
      )}</div>`
    ) +
    notice(
      'A lista mostra apenas os dados necessários para localizar o produto. Fórmula, custos, parâmetros comerciais, cenários e histórico ficam no detalhe.'
    )
  )
}
function pricingView() {
  return formulasView()
}
function productionView() {
  const pending = state.pedidos
    .filter(o => o.status === 'aprovado')
    .sort(
      (a, b) =>
        D.productionDeadline(a).localeCompare(D.productionDeadline(b)) ||
        a.criadoEm.localeCompare(b.criadoEm)
    )
  return searchableList('production', 'Buscar por OP, pedido, cliente ou produto', 
    intro(
      'Ordens de produção',
      'Uma OP por item, documento operacional versionado e apontamentos parciais.'
    ) +
    `<div class="stack">${
      can('createOps') && pending.length
        ? panel(
            'Pedidos aprovados aguardando OPs',
            table(
              [
                'Prioridade',
                'Pedido',
                'Cliente',
                'Limite produção',
                'Estoque',
                'Ação'
              ],
              pending.map(o => {
                const stock = D.orderStockAvailability(state, o)
                return [
                  `${fmtDate(o.criadoEm)}<small>Entrada no sistema</small>`,
                  esc(o.numero),
                  esc(o.clienteNome),
                  `${fmtDate(D.productionDeadline(o))}<small>${esc(D.productionPriority(o).label)}</small>`,
                  stock.available
                    ? badge('liberado')
                    : badge('Aguardando lote'),
                  stock.available
                    ? actionButton('Gerar OPs', 'createOps', o.id, true)
                    : '<button type="button" class="primary-btn" disabled title="Aguardando entrada de lotes liberados">Gerar OPs</button>'
                ]
              })
            )
          )
        : ''
    }${panel(
      'Ordens',
      table(
        [
          'Prioridade',
          'OP / Pedido',
          'Produto',
          'Limite',
          'Produzido',
          'Status',
          'Ação'
        ],
        state.ordens
          .filter(op => find(state.pedidos, op.pedidoId).tipo !== 'amostra')
          .slice()
          .sort(
            (a, b) =>
              a.prazoProducao.localeCompare(b.prazoProducao) ||
              a.prioridadeEm.localeCompare(b.prioridadeEm)
          )
          .map(x => [
            fmtDate(x.prioridadeEm),
            `${esc(x.numero)}<small>${esc(find(state.pedidos, x.pedidoId).numero)} · ${esc(find(state.pedidos, x.pedidoId).clienteNome)}</small>`,
            esc(x.produtoNome),
            `${fmtDate(x.prazoProducao)}<small>${esc(D.productionPriority(find(state.pedidos, x.pedidoId)).label)}</small>`,
            `${qty(x.quantidadeProduzida)} / ${qty(x.quantidadePrevista)} ${unitLabel(x)}`,
            badge(x.status),
            link('Abrir OP', 'producao', x.id)
          ])
      )
    )}</div>`
  )
}
function opView(id) {
  const x = find(state.ordens, id),
    req = D.requirements(
      x,
      (x.quantidadePrevista - x.quantidadeProduzida) * x.pesoKg
    ),
    o = find(state.pedidos, x.pedidoId),
    plan = D.batchPlan(x)
  return `<div class="stack">${intro(x.numero, `${x.produtoNome} · ${o.numero}`, link('← Todas as OPs', 'producao'))}${panel(
    'Ordem e documentos',
    fields([
      ['Fórmula / versão', `${esc(x.formula.codigo)} · v${x.formula.versao}`],
      [
        'Previsto',
        `${qty(x.quantidadePrevista)} ${unitLabel(x)} = ${qty(x.quantidadePrevista * x.pesoKg)} kg`
      ],
      ['Produzido', `${qty(x.quantidadeProduzida)} ${unitLabel(x)}`],
      ['Batidas planejadas', `${plan.quantidade} × ${formulaQty(plan.kgPorBatida)} kg`],
      ['Máximo por batida', `${formulaQty(plan.maximoKg)} kg`],
      ['Status', badge(x.status)],
      [
        'Documento da OP',
        x.documentoOp
          ? `${esc(x.documentoOp.numero)} · ${fmtTime(x.documentoOp.data)}`
          : 'Não gerado'
      ],
      ['Operador', esc(x.operador || 'Não iniciado')]
    ])
  )}<div class="actions">${['aguardando', 'emProducao'].includes(x.status) ? actionButton('Modificar', 'modifyBatches', id) : ''}${!x.documentoOp ? actionButton('Gerar fórmula para produção', 'issueSheet', id, true) : `${btn('Fórmula para produção', 'viewProductionFormula', id, true)}${btn('Etiquetas', 'viewOpLabels', id)}`}${x.status === 'aguardando' && x.documentoOp ? actionButton('Iniciar produção', 'startOp', id, true) : ''}${x.status === 'emProducao' ? actionButton('Apontar produção', 'reportProduction', id, true) : ''}</div>${panel(
    'Etiquetas solicitadas',
    x.etiquetas?.length
      ? table(
          ['Modelo', 'Quantidade'],
          x.etiquetas.map(i => [
            `Etiqueta ${state.etiquetas.findIndex(e => e.id === i.etiquetaId) + 1}`,
            i.quantidade
          ])
        )
      : '<p class="muted">Nenhuma quantidade definida.</p>'
  )}${panel(
    'Necessidade para o saldo da OP',
    table(
      ['Ingrediente', 'Necessário', 'Disponível liberado', 'Saldo estimado'],
      req.map(r => {
        const n = D.eligibleLots(state, r.ingredienteId).reduce(
          (n, l) => n + l.saldo,
          0
        )
        return [
          ingredientName(find(state.ingredientes, r.ingredienteId)),
          `${qty(r.quantidade)} kg`,
          `${qty(n)} kg`,
          n >= r.quantidade
            ? `${qty(n - r.quantidade)} kg`
            : badge('Insuficiente')
        ]
      })
    )
  )}${notice('Lotes vencidos ou bloqueados não podem ser consumidos. O saldo é conferido no apontamento; esta demonstração não faz reserva de estoque. As quantidades consideram os kg a produzir e a unidade preservada do pedido.')}${panel(
    'Apontamentos e rastreabilidade',
    table(
      ['Data / operador', 'Produção', 'Perdas / sobras', 'Lote final', 'Ação'],
      x.apontamentos.map(a => [
        `${fmtTime(a.data)}<small>${esc(a.usuario)}</small>`,
        `${qty(a.quantidade)} ${unitLabel(x)}`,
        `${qty(a.perdasKg)} / ${qty(a.sobrasKg)} kg`,
        `${esc(find(state.lotes, a.loteId).codigo)} ${badge(find(state.lotes, a.loteId).status)}`,
        btn('Rastrear', 'trace', a.loteId)
      ])
    )
  )}</div>`
}
function stockView() {
  const waiting = state.pedidos.filter(
    o => o.status === 'aprovado' && D.stage(state, o) === 'Aguardando lote'
  )
  return (
    intro(
      'Estoque e lotes',
      'Entradas, saldos e movimentos vinculados ao responsável.',
      actionButton('+ Receber matéria-prima', 'receiveLot', '', true)
    ) +
    `<div class="stack">${
      waiting.length
        ? panel(
            'Pedidos aguardando lotes',
            table(
              ['Pedido', 'Cliente', 'Matérias-primas pendentes'],
              waiting.map(o => [
                esc(o.numero),
                esc(o.clienteNome),
                D.orderStockAvailability(state, o)
                  .items.filter(item => item.falta > 0)
                  .map(
                    item =>
                      `${ingredientName(find(state.ingredientes, item.ingredienteId))}<small>Faltam ${qty(item.falta)} kg</small>`
                  )
                  .join('')
              ])
            )
          )
        : ''
    }${panel(
      'Lotes disponíveis e bloqueados',
      table(
        [
          'Lote',
          'Item / origem',
          'Saldo',
          'Fabricação',
          'Validade',
          'Status',
          'Ação'
        ],
        state.lotes.map(l => [
          esc(l.codigo),
          l.tipo === 'ingrediente'
            ? `${ingredientName(find(state.ingredientes, l.ingredienteId))}<small>${esc(find(state.fornecedores, l.fornecedorId).nome)}</small>`
            : esc(find(state.produtos, l.produtoId).nome),
          `${qty(l.saldo)} ${l.tipo === 'ingrediente' ? 'kg' : unitLabel(l)}${l.sobrasKg ? `<small>${qty(l.sobrasKg)} kg de sobra segregada</small>` : ''}`,
          fmtDate(l.fabricacao),
          fmtDate(l.validade),
          l.validade < D.today() ? badge('Vencido') : badge(l.status),
          `<div class="actions">${btn('Rastrear', 'trace', l.id)}${l.tipo === 'ingrediente' ? actionButton('Ajustar', 'adjustLot', l.id) : ''}</div>`
        ])
      )
    )}${panel(
      'Histórico de movimentações',
      table(
        ['Data', 'Lote', 'Tipo', 'Quantidade', 'Motivo', 'Responsável'],
        state.movimentacoes
          .slice()
          .reverse()
          .map(m => [
            fmtTime(m.data),
            esc(find(state.lotes, m.loteId).codigo),
            esc(m.tipo),
            `${qty(m.quantidade)} ${m.unidade}`,
            esc(m.motivo),
            esc(m.responsavel)
          ])
      )
    )}</div>`
  )
}
function qualityView() {
  return (
    intro(
      'Controle de qualidade',
      'Cada lote produzido exige uma decisão. Reprovação bloqueia o faturamento.'
    ) +
    panel(
      'Lotes produzidos',
      table(
        ['Lote / OP', 'Produto', 'Quantidade', 'Situação', 'Ações'],
        state.lotes
          .filter(l => l.tipo === 'produto')
          .map(l => [
            `${esc(l.codigo)}<small>${esc(find(state.ordens, l.opId).numero)}</small>`,
            esc(find(state.produtos, l.produtoId).nome),
            `${qty(l.quantidadeInicial)} ${unitLabel(l)}`,
            badge(l.status),
            `<div class="actions">${l.status === 'pendente' ? actionButton('Inspecionar', 'inspect', l.id, true) : ''}${btn('Rastreabilidade', 'trace', l.id)}${btn('Gerar ficha técnica', 'technicalSheet', l.id)}</div>`
          ])
      )
    )
  )
}
function samplesView() {
  const samples = orders()
    .filter(o => o.tipo === 'amostra')
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  return (
    intro(
      'Amostras · Qualidade',
      'Produção técnica fora do fluxo comercial, com ficha, fórmula, estoque e despacho rastreados.',
      user.perfil === 'qualidade'
        ? actionButton('Nova amostra', 'newSample', '', true)
        : ''
    ) +
    panel(
      'Fila de amostras',
      table(
        [
          'Pedido / cliente',
          'Produto / fórmula',
          'Etapa',
          'Estoque',
          'OPs',
          'Despacho'
        ],
        samples.map(o => {
          const stock = D.orderStockAvailability(state, o),
            ops = state.ordens.filter(op => op.pedidoId === o.id)
          return [
            `${link(o.numero, 'amostras', o.id)}<small>${esc(o.clienteNome)}</small>`,
            o.itens
              .map(
                item =>
                  `${esc(item.nome)}<small>${esc(item.formula.codigo)} · v${item.formula.versao}</small>`
              )
              .join('<br>'),
            badge(D.stage(state, o)),
            stock.available ? badge('Liberado') : badge('Aguardando lote'),
            `${ops.length} / ${o.itens.length}`,
            o.despacho
              ? `${esc(o.despacho.transportadora)}<small>${esc(o.despacho.rastreamento)}</small>`
              : 'Pendente'
          ]
        })
      )
    )
  )
}
function sampleView(id) {
  const order = find(state.pedidos, id)
  if (order.tipo !== 'amostra') throw new Error('Pedido não é uma amostra.')
  const ops = state.ordens.filter(op => op.pedidoId === id),
    stock = D.orderStockAvailability(state, order),
    canOperateSamples = ['administrador', 'qualidade'].includes(user.perfil)
  let actions = btn('Gerar ficha técnica', 'technicalSheet', id)
  if (canOperateSamples && order.status === 'amostra' && !ops.length)
    actions += stock.available
      ? actionButton('Gerar OPs', 'createOps', id, true)
      : '<button type="button" class="primary-btn" disabled title="Aguardando entrada de lotes liberados">Gerar OPs</button>'
  if (
    canOperateSamples &&
    D.stage(state, order) === 'Pronta para despacho' &&
    !order.despacho
  )
    actions += actionButton('Registrar despacho', 'dispatch', id, true)
  if (canOperateSamples && order.despacho && !order.entrega)
    actions += actionButton('Confirmar entrega', 'confirmDelivery', id, true)
  return `<div class="stack">${intro(
    order.numero,
    `Amostra · ${order.clienteNome} · ${D.stage(state, order)}`,
    link('← Fila de amostras', 'amostras')
  )}${panel(
    'Estrutura do pedido',
    fields([
      ['Tipo', 'Amostra'],
      ['Cliente', esc(order.clienteNome)],
      ['Criada em', fmtTime(order.criadoEm)],
      ['Prazo solicitado', fmtDate(order.prazoEntrega)],
      ['Status', badge(D.stage(state, order))],
      ['Observações', esc(order.observacoes || '—')]
    ])
  )}${panel(
    'Produto, fórmula e ficha',
    order.itens
      .map(item => {
        const product = find(state.produtos, item.produtoId)
        return `<section class="sample-item"><h3>${esc(product.codigo)} · ${esc(item.nome)}</h3>${fields(
          [
            ['Produto', `${esc(item.nome)} · ${esc(product.status)}`],
            [
              'Quantidade',
              item.unidade === 'KG' ? `${qty(item.quantidade)} kg a produzir · base de 1 kg` : `${qty(item.quantidade)} UN · ${qty(item.pesoKg)} kg/un`
            ],
            [
              'Fórmula preservada',
              `${esc(item.formula.codigo)} · v${item.formula.versao}`
            ],
            ['Rendimento da fórmula', `${qty(item.formula.rendimento)} kg`]
          ]
        )}${table(
          ['Ingrediente da fórmula', 'Quantidade (kg)'],
          item.formula.itens.map(formulaItem => [
            ingredientName(find(state.ingredientes, formulaItem.ingredienteId)),
            qty(formulaItem.quantidade)
          ])
        )}</section>`
      })
      .join('')
  )}${panel(
    'Estoque para produção',
    table(
      ['Ingrediente', 'Necessário (kg)', 'Disponível (kg)', 'Falta (kg)'],
      stock.items.map(item => [
        ingredientName(find(state.ingredientes, item.ingredienteId)),
        qty(item.necessario),
        qty(item.disponivel),
        item.falta > 0 ? badge(`${qty(item.falta)} kg`) : '—'
      ])
    )
  )}${panel(
    'Produção e inspeção',
    ops.length
      ? table(
          [
            'OP',
            'Produto',
            'Previsto / produzido',
            'Ficha da OP',
            'Status',
            'Ações'
          ],
          ops.map(op => [
            allowed('producao')
              ? link(op.numero, 'producao', op.id)
              : esc(op.numero),
            esc(op.produtoNome),
            `${qty(op.quantidadePrevista)} / ${qty(op.quantidadeProduzida)} ${unitLabel(op)}`,
            op.documentoOp ? esc(op.documentoOp.numero) : 'Pendente',
            badge(op.status),
            op.lotes
              .map(lotId => {
                const lot = find(state.lotes, lotId)
                return `${esc(lot.codigo)} · ${badge(lot.status)} ${can('inspect') ? actionButton('Inspecionar lote', 'inspect', lotId) : ''}`
              })
              .join('<br>') || '—'
          ])
        )
      : '<p class="muted">OPs ainda não geradas.</p>'
  )}${panel(
    'Despacho',
    order.despacho
      ? fields([
          ['Transportadora', esc(order.despacho.transportadora)],
          ['Rastreamento', esc(order.despacho.rastreamento)],
          ['Tomador do frete', esc(order.despacho.tomadorFrete)],
          ['Saída', fmtDate(order.despacho.dataSaida)],
          ['Prazo', fmtDate(order.despacho.prazo)],
          [
            'Entrega',
            order.entrega ? fmtDate(order.entrega.dataEntrega) : 'Pendente'
          ]
        ])
      : '<p class="muted">Aguardando liberação dos lotes produzidos pela Qualidade.</p>'
  )}<div class="actions">${actions}</div></div>`
}
function financialView() {
  const rows = orders().filter(o => o.status === 'aguardandoAprovacao')
  return (
    intro(
      'Análise financeira',
      'Crédito e situação orientam uma decisão registrada, não uma liberação automática.'
    ) +
    panel(
      'Fila de análise',
      table(
        [
          'Pedido / cliente',
          'Valor',
          'Limite / exposição',
          'Crédito após pedido',
          'Decisão',
          'Ação'
        ],
        rows.map(o => {
          const c = find(state.clientes, o.clienteId),
            cr = D.credit(state, o)
          return [
            `${link(o.numero, 'pedidos', o.id)}<small>${esc(c.nomeFantasia)} · ${esc(D.labels[c.situacaoFinanceira])}</small>`,
            money(D.orderTotal(o)),
            `${money(c.limiteCentavos)}<small>Exposição: ${money(cr.exposure)}</small>`,
            money(c.limiteCentavos - cr.projected),
            badge(o.statusAnalise),
            actionButton('Analisar', 'analyze', o.id, true)
          ]
        })
      )
    ) +
    panel(
      'Recebimentos de clientes',
      table(
        [
          'Pedido / cliente',
          'Parcela',
          'Valor',
          'Vencimento',
          'Situação',
          'Ação'
        ],
        state.recebiveis.map(r => {
          const o = find(state.pedidos, r.pedidoId)
          return [
            `${esc(o.numero)}<small>${esc(o.clienteNome)}</small>`,
            `${r.parcelaNumero || 1}/${r.parcelasTotal || 1}<small>${r.prazoDias ?? 30} dias</small>`,
            money(r.valorCentavos),
            fmtDate(r.vencimento),
            r.recebidoEm
              ? `${badge('Pago')}<small>${fmtDate(r.recebidoEm)}</small>`
              : badge('Aberto'),
            r.recebidoEm
              ? 'Registrado'
              : actionButton(
                  'Registrar pagamento',
                  'registerReceipt',
                  r.id,
                  true
                )
          ]
        })
      )
    ) +
    '<p class="muted small">Cada prazo informado no pedido gera uma parcela. O despacho não depende da baixa; a comissão mensal considera somente parcelas pagas na competência.</p>'
  )
}
function billingView() {
  return (
    intro(
      'Faturamento',
      'Registro interno de faturamento. Não emite nota fiscal.'
    ) +
    panel(
      'Pedidos aprovados e faturados',
      table(
        ['Pedido', 'Cliente', 'Valor', 'Liberação', 'Ação'],
        orders()
          .filter(o => o.aprovacao && o.status !== 'cancelado')
          .map(o => {
            const issues = D.billingIssues(state, o)
            return [
              link(o.numero, 'pedidos', o.id),
              esc(o.clienteNome),
              money(D.orderTotal(o)),
              o.faturamento
                ? `${badge(o.faturamento.status === 'concluido' ? 'faturado' : 'Em faturamento')}<small>${esc(o.faturamento.referencia)} · ${o.faturamento.parcelas.length} parcela(s)</small>`
                : issues.length
                  ? `<span class="muted small">${issues.map(esc).join('<br>')}</span>`
                  : badge('liberado'),
              !o.faturamento && !issues.length
                ? actionButton('Iniciar faturamento', 'bill', o.id, true)
                : o.faturamento
                  ? btn('Ver parcelas', 'invoiceInstallments', o.id)
                  : '—'
            ]
          })
      )
    )
  )
}
function dispatchView() {
  return (
    intro(
      'Frete e despacho',
      'Rastreio, tomador do frete, saída e confirmação de entrega vinculados ao pedido.'
    ) +
    panel(
      'Pedidos faturados',
      table(
        [
          'Pedido',
          'Cliente',
          'Transportadora',
          'Tomador',
          'Rastreamento / saída',
          'Situação',
          'Ação'
        ],
        orders()
          .filter(o => o.faturamento)
          .map(o => [
            link(o.numero, 'pedidos', o.id),
            esc(o.clienteNome),
            esc(o.despacho?.transportadora || '—'),
            esc(
              o.despacho?.tomadorFrete === 'destinatario'
                ? 'Destinatário'
                : o.despacho?.tomadorFrete === 'emitente'
                  ? 'Emitente'
                  : '—'
            ),
            o.despacho
              ? `${esc(o.despacho.rastreamento)}<small>${fmtDate(o.despacho.dataSaida)}</small>`
              : '—',
            badge(
              o.entrega ? 'Entregue' : o.despacho ? 'Despachado' : 'Aguardando'
            ),
            !o.despacho
              ? actionButton('Registrar despacho', 'dispatch', o.id, true)
              : !o.entrega
                ? actionButton(
                    'Confirmar entrega',
                    'confirmDelivery',
                    o.id,
                    true
                  )
                : `${fmtDate(o.entrega.dataEntrega)}<small>${esc(o.entrega.recebidoPor)}</small>`
          ])
      )
    )
  )
}
function commissionsView() {
  const month = D.today().slice(0, 7),
    received = state.recebiveis.filter(r => r.recebidoEm?.slice(0, 7) === month)
  return (
    intro(
      'Comissão final por recebimentos',
      'Fechamento do mês baseado somente nos recebíveis efetivamente pagos.'
    ) +
    panel(
      'Resumo do mês',
      fields([
        ['Competência', month.split('-').reverse().join('/')],
        ['Recebimentos considerados', received.length],
        [
          'Base recebida',
          money(received.reduce((n, r) => n + r.valorCentavos, 0))
        ],
        [
          'Comissão final',
          money(received.reduce((n, r) => n + r.comissaoCentavos, 0))
        ]
      ])
    ) +
    panel(
      'Composição do fechamento',
      table(
        [
          'Recebimento',
          'Pedido',
          'Vendedor',
          'Base recebida',
          'Comissão final'
        ],
        received.map(r => [
          fmtDate(r.recebidoEm),
          esc(find(state.pedidos, r.pedidoId).numero),
          esc(find(state.usuarios, r.vendedorId).nome),
          money(r.valorCentavos),
          money(r.comissaoCentavos)
        ])
      )
    ) +
    notice(
      'Regra confirmada: pedido ou faturamento não torna a comissão final. O evento elegível é o recebimento no mês. Baixas parciais e estornos ainda precisam de definição.',
      'warn'
    )
  )
}
function labelsView() {
  const assigned = state.ordens.flatMap(op => {
    const order = find(state.pedidos, op.pedidoId)
    return (op.etiquetas || [])
      .filter(item => item.quantidade > 0)
      .map(item => {
        const model = find(state.etiquetas, item.etiquetaId)
        return {
          op,
          order,
          item,
          model,
          search: [
            op.numero,
            order?.numero,
            order?.clienteNome,
            op.produtoNome,
            model?.nome,
            model?.tamanho
          ]
            .filter(Boolean)
            .join(' '),
          key: `${op.id}:${item.etiquetaId}`
        }
      })
  })
  return (
    intro(
      'Etiquetas',
      'Modelos prontos para uso e etiquetas vinculadas às ordens de produção.'
    ) +
    panel(
      'Modelos de etiqueta',
      table(
        ['Modelo', 'Tamanho', 'Dados previstos', 'Observações', 'Ação'],
        state.etiquetas.map(e => [
          esc(e.nome),
          esc(e.tamanho),
          esc(e.conteudo),
          esc(e.observacoes || '—'),
          actionButton('Modificar dados', 'editLabel', e.id)
        ])
      )
    ) +
    panel(
      'Etiquetas preparadas',
      `${input('Buscar por OP, pedido, cliente ou produto', 'labelSearch', '', 'search', 'autocomplete="off"')}<div id="preparedLabels">${
        assigned.length
          ? table(
              [
                'OP',
                'Pedido',
                'Cliente',
                'Produto',
                'Modelo',
                'Quantidade',
                'Ação'
              ],
              assigned.map(({ op, order, item, model, search, key }) => [
                `<span data-label-search="${esc(search)}">${esc(op.numero)}</span>`,
                esc(order?.numero || '—'),
                esc(order?.clienteNome || '—'),
                esc(op.produtoNome),
                esc(model?.nome || 'Modelo removido'),
                item.quantidade,
                model ? btn('Abrir etiqueta', 'viewLabel', key) : '—'
              ])
            )
          : '<p class="muted">As etiquetas aparecem aqui quando forem definidas em uma OP.</p>'
      }</div><p id="labelSearchEmpty" class="muted" hidden>Nenhuma etiqueta corresponde à busca.</p>`
    )
  )
}
function reportData() {
  const commercial = [
    'administrador',
    'diretor',
    'comercial',
    'financeiro',
    'fiscal'
  ].includes(user.perfil)
  return commercial
    ? {
        headers: ['Pedido', 'Cliente', 'Etapa', 'Valor (R$)'],
        rows: orders().map(o => [
          o.numero,
          o.clienteNome,
          D.stage(state, o),
          (D.orderTotal(o) / 100).toFixed(2)
        ])
      }
    : {
        headers: ['OP', 'Produto', 'Status', 'Produzido (kg)'],
        rows: state.ordens.map(x => [
          x.numero,
          x.produtoNome,
          D.labels[x.status],
          x.quantidadeProduzida * x.pesoKg
        ])
      }
}
function reportsView() {
  const data = reportData()
  return (
    intro(
      'Relatórios da demonstração',
      'Os dados seguem o recorte de acesso do perfil.',
      btn('Exportar CSV deste recorte', 'exportCsv')
    ) +
    panel(
      'Visão consolidada',
      table(
        data.headers,
        data.rows.map(r => r.map(esc))
      )
    ) +
    notice(
      'Exportação sem custos ou fórmulas. Relatórios avançados, filtros por período e indicadores de capacidade não são simulados.'
    )
  )
}
function auditView() {
  return (
    intro(
      'Trilha de auditoria',
      'Eventos locais para consulta. Imutabilidade real dependerá do servidor.'
    ) +
    panel(
      'Ações registradas',
      table(
        ['Quando', 'Responsável', 'Perfil', 'Operação', 'Registro', 'Detalhes'],
        state.auditoria
          .slice()
          .reverse()
          .map(a => [
            fmtTime(a.data),
            esc(a.usuario),
            esc(D.profiles[a.perfil].label),
            esc(actionNames[a.acao] || a.acao),
            esc(a.entidade),
            btn('Antes / depois', 'auditDetails', a.id)
          ])
      )
    )
  )
}
function usersView() {
  return (
    intro(
      'Usuários de demonstração',
      'Contas pré-configuradas para testar permissões e desativação.'
    ) +
    panel(
      'Acessos locais',
      table(
        ['Nome', 'Login', 'Perfil', 'Situação', 'Ação'],
        state.usuarios.map(u => [
          esc(u.nome),
          esc(u.login),
          esc(D.profiles[u.perfil].label),
          badge(u.ativo ? 'ativo' : 'inativo'),
          u.id !== user.id
            ? actionButton(u.ativo ? 'Desativar' : 'Ativar', 'toggleUser', u.id)
            : 'Sessão atual'
        ])
      )
    ) +
    notice(
      'Senhas demonstrativas estão no login e no código público. Isto não é autenticação segura. Cadastro real e permissões finas pertencem ao backend.',
      'warn'
    )
  )
}
function updatesView() {
  const current = D.releases.find(release => release.current)
  return (
    intro(
      'Atualizações do protótipo',
      'Histórico visual das entregas, versões e regras de negócio relacionadas.',
      `<span class="release-current">Versão atual · ${esc(current?.version || `v${D.VERSION}`)}</span>`
    ) +
    notice(
      'Esta página apresenta o que já foi incorporado ao protótipo. “Confirmada”, “Demonstrada” e “Pendente” indicam o nível de definição da regra com a empresa.'
    ) +
    `<div class="release-list">${D.releases
      .map(
        release => `<article class="release-card ${release.current ? 'current' : ''}">
          <header class="release-head">
            <div><div class="release-version-row"><span class="release-version">${esc(release.version)}</span>${release.current ? '<span class="status info">Versão atual</span>' : ''}</div><h2>${esc(release.title)}</h2><p>${esc(release.summary)}</p></div>
            <time datetime="${esc(release.date)}">${fmtDate(release.date)}</time>
          </header>
          <div class="release-changes">${release.changes
            .map(
              change => `<section class="release-change">
                <div class="release-change-head"><span class="release-area">${esc(change.area)}</span><span class="release-maturity">${esc(change.status)}</span></div>
                <h3>${esc(change.title)}</h3>
                <p>${esc(change.description)}</p>
                <footer><div class="release-rules">${change.rules.length ? change.rules.map(rule => `<span>${esc(rule)}</span>`).join('') : '<span>Melhoria visual</span>'}</div>${change.route !== 'atualizacoes' && allowed(change.route) ? link('Ver no protótipo →', change.route) : ''}</footer>
              </section>`
            )
            .join('')}</div>
        </article>`
      )
      .join('')}</div>` +
    panel(
      'Como manter tudo sincronizado',
      '<ol class="guide-list"><li>Cada alteração funcional recebe ou referencia um ID estável no catálogo de regras.</li><li>A entrega entra na versão correspondente desta página e no histórico documental.</li><li>Critérios de aceite, teste e impacto em Flutter/API/banco são atualizados juntos.</li></ol>'
    )
  )
}
function guideView() {
  const scenarios = dataMode === 'with-data' ? panel('Cenários prontos para a reunião', table(
    ['Pedido / cliente', 'Objetivo da demonstração', 'Etapa atual', 'Abrir'],
    orders().filter(o => o.observacoes?.startsWith('Cenário')).map(o => [
      `${esc(o.numero)}<small>${esc(o.clienteNome)}</small>`, esc(o.observacoes),
      esc(D.stage(state, o)), link('Ver pedido', 'pedidos', o.id)
    ])
  )) : ''
  const secondGuide = panel(
    '2º caso de teste — P&D, amostras e etiquetas',
    '<ol class="guide-list"><li>Entre como <b>Administrador</b> para percorrer os módulos sem trocar de perfil. Use apenas dados demonstrativos e escolha ingredientes com lotes liberados, válidos e saldo.</li><li>Em <b>Ingredientes</b>, confira código, INS, categoria funcional e grupo 01–04. Tente excluir um ingrediente vinculado a uma fórmula ou lote: a exclusão deve ser bloqueada.</li><li>Em <b>P&D</b>, crie uma nova versão de fórmula, adicionando e removendo ingredientes. Informe uma quantidade com cinco casas decimais e tente salvar com soma diferente do rendimento; depois ajuste para fechar a composição.</li><li>No produto, confira grupo, validade, descrição, alérgicos, glúten, modo de uso e conservação. Marque os ingredientes do <b>Contém</b> e revise a sugestão: bases primeiro, grupos por participação e percentuais apenas para sal e INS 250/251.</li><li>Confira as últimas regras de declaração: aromatizantes aparecem somente pelo grupo; especiarias até 25% ficam resumidas e, acima de 25%, mostram os nomes em ordem decrescente, sem percentuais.</li><li>Em <b>Precificação</b>, salve parâmetros próprios de um produto. Confira que os padrões globais e outro produto não mudaram; libere a versão e o preço necessários para utilizá-lo.</li><li>Troque para <b>Qualidade</b> e abra <b>Amostras</b>. Crie uma amostra com o produto liberado, confira que ela não exige análise financeira nem aprovação comercial e gere sua OP.</li><li>Na OP da amostra, abra e emita a <b>Fórmula para produção</b>. Confira composição em kg, quantidade e conteúdo do produto antes de iniciar; faça o apontamento e inspecione o lote produzido.</li><li>Abra <b>Etiquetas</b> na OP. Confira o padrão de 1 pequena e 2 grandes, altere as quantidades e compare as prévias: grande <b>105 × 105 mm</b> com cliente e pictograma; pequena <b>105 × 58 mm</b> sem cliente.</li><li>Imprima cada tamanho separadamente, em escala 100%. Confira lote com a data atual, ausência de fabricação separada, validade e peso. A quantidade configurada não gera automaticamente múltiplas cópias; não há exportação .nlbl.</li><li>No módulo <b>Etiquetas</b>, localize a amostra por OP, pedido, cliente ou produto e abra seu modelo. Consulte também a <b>Ficha Técnica</b> na Qualidade: ela é diferente da Fórmula para produção.</li><li>Volte ao Administrador, altere um texto do cadastro do produto e reabra a OP anterior: seu snapshot deve permanecer preservado. Confira auditoria, Atualizações e persistência após recarregar.</li></ol>'
  )
  return (
    intro(
      'Teste o sistema de ponta a ponta',
      'O estilo do protótipo é a referência visual para a futura implementação Flutter. Roteiro final revisado em 01/10/2026.'
    ) +
    `<div class="stack">${scenarios}${notice('Simulação em um navegador. Não há servidor, compartilhamento entre computadores, integração fiscal, sincronização offline ou segurança para dados reais.', 'warn')}${panel('1º caso de teste — ciclo comercial (10 a 15 minutos)', '<ol class="guide-list"><li>Entre como <b>Comercial</b>. Crie pedido para AlimNorte com 100 kg do Tempero e 100 kg do Realçador. Confira <b>R$ 2.300,00 e 200 kg</b>. A comissão não é exibida na criação.</li><li>Envie ao financeiro e use <b>Trocar perfil</b>.</li><li>Entre como <b>Financeiro</b>. Consulte crédito e libere. Use CondCentro para testar restrição ou bloqueio justificado.</li><li>Volte ao <b>Comercial</b> e aprove o pedido. A edição fica bloqueada.</li><li>Entre como <b>Administrador</b> (ou Produção). Gere duas OPs, emita cada ficha e inicie a produção.</li><li>Faça apontamento parcial ou completo. Confira os lotes sugeridos; informe perdas e sobras, se desejar.</li><li>Na <b>Qualidade</b>, inspecione todos os lotes. Reprovação bloqueia o pedido inteiro.</li><li>Com todas as OPs concluídas e lotes aprovados, registre <b>Faturamento</b> interno. Não há NF-e.</li><li>Em <b>Frete e despacho</b>, preencha transportadora, prazo, valor, rastreamento e referência do comprovante.</li><li>No Financeiro, registre o pagamento do cliente. Depois consulte a comissão final do mês, a rastreabilidade e a auditoria. Recarregue para verificar persistência local.</li></ol>')}${secondGuide}${panel('Cenários de bloqueio', '<ul class="guide-list"><li>Senha inválida ou usuário inativo.</li><li>Cliente inativo, produto em desenvolvimento ou preço não liberado.</li><li>Aprovação comercial sem liberação financeira.</li><li>Edição de pedido aprovado ou OP duplicada.</li><li>Produção sem ficha ou com lote vencido, bloqueado ou insuficiente.</li><li>Faturamento com produção parcial ou qualidade pendente/reprovada.</li><li>Despacho antes do faturamento e operações duplicadas.</li></ul>')}${panel('Ferramentas da demonstração', `<p class="muted">Reiniciar apaga somente os dados desta versão no navegador. Não afeta arquivos nem o Flutter.</p><div class="actions">${user.perfil === 'administrador' ? btn('Reiniciar demonstração', 'resetDemo') : 'Use Administrador para reiniciar os dados.'}</div>`)}</div>`
  )
}

