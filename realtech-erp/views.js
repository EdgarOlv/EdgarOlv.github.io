'use strict'
function clientsView() {
  return (
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
            `${esc(c.nomeFantasia)}<small>${esc(c.cnpj)}</small>`,
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
  return (
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
          return [
            `<span data-pd-product-row="${esc(`${p.nome} ${p.codigo}`.toLocaleLowerCase('pt-BR'))}">${esc(p.codigo)} · ${esc(p.nome)}</span>`,
            f
              ? `${esc(f.codigo)} · v${f.versao}<small>${badge(f.status)}</small>`
              : 'Sem fórmula',
            `${qty(p.pesoKg)} kg<small>${esc(p.embalagem || 'Sem embalagem')}</small>`,
            p.precoVendaKgCentavos
              ? `${money(p.precoVendaKgCentavos)}/kg`
              : p.precoLiberado
                ? money(p.precoCentavos)
                : 'Não liberado',
            badge(p.status),
            `${actionButton('Abrir', 'productDetails', p.id, true)}${actionButton('Criar a partir', 'createProduct', p.id)}`
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
  return (
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
          .slice()
          .sort(
            (a, b) =>
              a.prazoProducao.localeCompare(b.prazoProducao) ||
              a.prioridadeEm.localeCompare(b.prioridadeEm)
          )
          .map(x => [
            fmtDate(x.prioridadeEm),
            `${esc(x.numero)}<small>${esc(find(state.pedidos, x.pedidoId).numero)}</small>`,
            esc(x.produtoNome),
            `${fmtDate(x.prazoProducao)}<small>${esc(D.productionPriority(find(state.pedidos, x.pedidoId)).label)}</small>`,
            `${x.quantidadeProduzida} / ${x.quantidadePrevista} UN`,
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
    o = find(state.pedidos, x.pedidoId)
  return `<div class="stack">${intro(x.numero, `${x.produtoNome} · ${o.numero}`, link('← Todas as OPs', 'producao'))}${panel(
    'Ordem e documentos',
    fields([
      ['Fórmula / versão', `${esc(x.formula.codigo)} · v${x.formula.versao}`],
      [
        'Previsto',
        `${x.quantidadePrevista} UN = ${qty(x.quantidadePrevista * x.pesoKg)} kg`
      ],
      ['Produzido', `${x.quantidadeProduzida} UN`],
      ['Status', badge(x.status)],
      [
        'Documento da OP',
        x.documentoOp
          ? `${esc(x.documentoOp.numero)} · ${fmtTime(x.documentoOp.data)}`
          : 'Não gerado'
      ],
      ['Operador', esc(x.operador || 'Não iniciado')]
    ])
  )}<div class="actions">${!x.documentoOp ? actionButton('Gerar documento da OP', 'issueSheet', id, true) : btn('Consultar doc. OP', 'viewSheet', id)}${x.status === 'aguardando' && x.documentoOp ? actionButton('Iniciar produção', 'startOp', id, true) : ''}${x.status === 'emProducao' ? actionButton('Apontar produção', 'reportProduction', id, true) : ''}${actionButton('Definir etiquetas', 'editOpLabels', id)}</div>${panel(
    'Etiquetas solicitadas',
    x.etiquetas?.length
      ? table(
          ['Modelo', 'Quantidade'],
          x.etiquetas.map(i => [
            esc(find(state.etiquetas, i.etiquetaId).nome),
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
          esc(find(state.ingredientes, r.ingredienteId).nome),
          `${qty(r.quantidade)} kg`,
          `${qty(n)} kg`,
          n >= r.quantidade
            ? `${qty(n - r.quantidade)} kg`
            : badge('Insuficiente')
        ]
      })
    )
  )}${notice('Lotes vencidos ou bloqueados não podem ser consumidos. O saldo é conferido no apontamento; esta demonstração não faz reserva de estoque. As quantidades consideram o peso da embalagem.')}${panel(
    'Apontamentos e rastreabilidade',
    table(
      ['Data / operador', 'Produção', 'Perdas / sobras', 'Lote final', 'Ação'],
      x.apontamentos.map(a => [
        `${fmtTime(a.data)}<small>${esc(a.usuario)}</small>`,
        `${a.quantidade} UN`,
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
                      `${esc(find(state.ingredientes, item.ingredienteId).nome)}<small>Faltam ${qty(item.falta)} kg</small>`
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
            ? `${esc(find(state.ingredientes, l.ingredienteId).nome)}<small>${esc(find(state.fornecedores, l.fornecedorId).nome)}</small>`
            : esc(find(state.produtos, l.produtoId).nome),
          `${qty(l.saldo)} ${l.tipo === 'ingrediente' ? 'kg' : 'UN'}${l.sobrasKg ? `<small>${qty(l.sobrasKg)} kg de sobra segregada</small>` : ''}`,
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
            `${l.quantidadeInicial} UN`,
            badge(l.status),
            `<div class="actions">${l.status === 'pendente' ? actionButton('Inspecionar', 'inspect', l.id, true) : ''}${btn('Rastreabilidade', 'trace', l.id)}${btn('Gerar ficha técnica', 'technicalSheet', l.id)}</div>`
          ])
      )
    )
  )
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
  const assigned = state.ordens.flatMap(op =>
    (op.etiquetas || []).map(item => ({
      op,
      item,
      model: find(state.etiquetas, item.etiquetaId)
    }))
  )
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
      assigned.length
        ? table(
            ['OP', 'Produto', 'Modelo', 'Quantidade', 'Ação'],
            assigned.map(({ op, item, model }) => [
              esc(op.numero),
              esc(op.produtoNome),
              esc(model?.nome || 'Modelo removido'),
              item.quantidade,
              model ? btn('Abrir etiqueta', 'viewLabel', op.id) : '—'
            ])
          )
        : '<p class="muted">As etiquetas aparecem aqui quando forem definidas em uma OP.</p>'
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
  return (
    intro(
      'Teste o sistema de ponta a ponta',
      'O estilo do protótipo é a referência visual para a futura implementação Flutter.'
    ) +
    `<div class="stack">${notice('Simulação em um navegador. Não há servidor, compartilhamento entre computadores, integração fiscal, sincronização offline ou segurança para dados reais.', 'warn')}${panel('Roteiro sugerido — 10 a 15 minutos', '<ol class="guide-list"><li>Entre como <b>Comercial</b>. Crie pedido para AlimNorte com 20 UN do Tempero de 5 kg e 5 UN do Realçador de 20 kg. Confira <b>R$ 2.300,00 e 200 kg</b>. A comissão não é exibida na criação.</li><li>Envie ao financeiro e use <b>Trocar perfil</b>.</li><li>Entre como <b>Financeiro</b>. Consulte crédito e libere. Use CondCentro para testar restrição ou bloqueio justificado.</li><li>Volte ao <b>Comercial</b> e aprove o pedido. A edição fica bloqueada.</li><li>Entre como <b>Administrador</b> (ou Produção). Gere duas OPs, emita cada ficha e inicie a produção.</li><li>Faça apontamento parcial ou completo. Confira os lotes sugeridos; informe perdas e sobras, se desejar.</li><li>Na <b>Qualidade</b>, inspecione todos os lotes. Reprovação bloqueia o pedido inteiro.</li><li>Com todas as OPs concluídas e lotes aprovados, registre <b>Faturamento</b> interno. Não há NF-e.</li><li>Em <b>Frete e despacho</b>, preencha transportadora, prazo, valor, rastreamento e referência do comprovante.</li><li>No Financeiro, registre o pagamento do cliente. Depois consulte a comissão final do mês, a rastreabilidade e a auditoria. Recarregue para verificar persistência local.</li></ol>')}${panel('Cenários de bloqueio', '<ul class="guide-list"><li>Senha inválida ou usuário inativo.</li><li>Cliente inativo, produto em desenvolvimento ou preço não liberado.</li><li>Aprovação comercial sem liberação financeira.</li><li>Edição de pedido aprovado ou OP duplicada.</li><li>Produção sem ficha ou com lote vencido, bloqueado ou insuficiente.</li><li>Faturamento com produção parcial ou qualidade pendente/reprovada.</li><li>Despacho antes do faturamento e operações duplicadas.</li></ul>')}${panel('Pontos para validar com a empresa', '<p class="muted">Comissões e precedência; alçadas de restrição; estornos após OP; retrabalho de reprovados; descarte/reaproveitamento de sobras; validade por produto; tributos e custo completo; campos de laudos; anexos reais; permissão para despachar.</p><p class="muted">O Fiscal pode despachar nesta simulação; a matriz técnica cita apenas leitura. Administrador executa o ciclo completo para apresentação. Cadastros completos e offline Windows não são implementados aqui.</p>')}${panel('Ferramentas da demonstração', `<p class="muted">Reiniciar apaga somente os dados desta versão no navegador. Não afeta arquivos nem o Flutter.</p><div class="actions">${user.perfil === 'administrador' ? btn('Reiniciar demonstração', 'resetDemo') : 'Use Administrador para reiniciar os dados.'}</div>`)}</div>`
  )
}

