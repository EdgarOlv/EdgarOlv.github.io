/* Domínio da demonstração: sem DOM, pronto para testes e tradução em casos de uso Dart.
   Não é backend nem barreira de segurança. Todos os dados são sintéticos. */
;(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.Realtech = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict'
  const VERSION = 6
  const clone = value => JSON.parse(JSON.stringify(value))
  const round = value => Math.round(value * 1000) / 1000
  const today = () => localDate(new Date())
  function localDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  function day(offset) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return localDate(d)
  }
  function addDays(value, offset) {
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`)
    requireThat(!isNaN(d), 'Data base inválida.')
    d.setDate(d.getDate() + offset)
    return localDate(d)
  }
  function productionDeadline(o) {
    return o.prazoProducao || addDays(o.criadoEm, 7)
  }
  function productionPriority(o) {
    const deadline = productionDeadline(o)
    const remaining = Math.ceil(
      (new Date(`${deadline}T12:00:00`) - new Date(`${today()}T12:00:00`)) /
        86400000
    )
    return {
      deadline,
      remaining,
      label:
        remaining < 0
          ? `Atrasado ${Math.abs(remaining)} dia(s)`
          : remaining === 0
            ? 'Vence hoje'
            : `${remaining} dia(s) restante(s)`
    }
  }
  const labels = {
    rascunho: 'Rascunho',
    aguardandoAprovacao: 'Aguardando aprovação',
    aprovado: 'Aprovado',
    emProducao: 'Em produção',
    faturado: 'Faturado',
    cancelado: 'Cancelado',
    pendente: 'Pendente',
    liberado: 'Liberado',
    liberadoComRestricao: 'Liberado com restrição',
    bloqueado: 'Bloqueado',
    aguardando: 'Aguardando',
    concluida: 'Concluída',
    reprovado: 'Reprovado',
    ativo: 'Ativo',
    inativo: 'Inativo',
    ativa: 'Ativa',
    obsoleta: 'Obsoleta',
    emDesenvolvimento: 'Em desenvolvimento',
    regular: 'Regular',
    restricao: 'Restrição',
    inadimplente: 'Inadimplente'
  }
  const releases = [
    {
      version: 'v6',
      date: '2026-09-17',
      current: true,
      title: 'Etiqueta grande editável no pedido',
      summary:
        'O modelo grande reproduz a referência física, permite editar os textos fixos e pode ser aberto em cada item do pedido para impressão.',
      changes: [
        {
          area: 'Pedidos e etiquetas',
          title: 'Prévia da etiqueta direto no pedido',
          description:
            'Cada item do pedido abre a etiqueta grande com produto, cliente, fórmula e peso já preenchidos; lote e datas ficam pendentes até a produção.',
          rules: ['RN-ETQ-001', 'RN-ETQ-002'],
          status: 'Demonstrada; homologação regulatória pendente',
          route: 'pedidos'
        }
      ]
    },
    {
      version: 'v5',
      date: '2026-09-14',
      current: false,
      title: 'Faturamento parcelado e financeiro paralelo',
      summary:
        'O faturamento permite configurar vários vencimentos, divide o valor automaticamente e acompanha cada parcela sem bloquear a expedição.',
      changes: [
        {
          area: 'Faturamento e financeiro',
          title: 'Parcelas configuráveis por prazo',
          description:
            'O usuário adiciona prazos em dias; o sistema divide o total com fechamento exato dos centavos e cria um recebível por parcela. Condições comerciais são texto adicional opcional.',
          rules: ['RN-FAT-002', 'RN-FIN-002'],
          status: 'Demonstrada',
          route: 'faturamento'
        }
      ]
    },
    {
      version: 'v4',
      date: '2026-09-14',
      current: false,
      title: 'Prioridade, prazo e confirmação de entrega',
      summary:
        'O pedido nasce obrigatoriamente no sistema, recebe prioridade por data, limite de produção, tomador do frete e confirmação final de entrega.',
      changes: [
        {
          area: 'Pedidos e produção',
          title: 'Entrada oficial e limite de 7 dias',
          description:
            'Somente pedidos cadastrados no sistema avançam. A entrada define a prioridade e gera automaticamente o limite demonstrativo de produção em 7 dias corridos.',
          rules: ['RN-PED-005', 'RN-PRD-002'],
          status: 'Demonstrada',
          route: 'producao'
        },
        {
          area: 'Logística',
          title: 'Tomador do frete e entrega confirmada',
          description:
            'O despacho exige indicar emitente ou destinatário como tomador e a expedição registra a confirmação de entrega depois da saída.',
          rules: ['RN-LOG-001', 'RN-LOG-002'],
          status: 'Demonstrada',
          route: 'despacho'
        }
      ]
    },
    {
      version: 'v3',
      date: '2026-09-10',
      current: false,
      title: 'Disponibilidade, logística e transparência',
      summary:
        'Evolução do fluxo comercial até a produção, com rastreabilidade das regras demonstradas para homologação.',
      changes: [
        {
          area: 'Pedidos e logística',
          title: 'Volumes para transporte no pedido',
          description:
            'O pedido calcula volumes inteiros conforme o tipo de embalagem e mostra pacotes ou sacos por item e no total.',
          rules: ['RN-PED-004'],
          status: 'Demonstrada',
          route: 'pedidos'
        },
        {
          area: 'Estoque e produção',
          title: 'Trava de estoque antes da OP',
          description:
            'Pedidos sem matéria-prima suficiente ficam em “Aguardando lote”. A geração de OP é liberada automaticamente após uma entrada suficiente.',
          rules: ['RN-EST-001', 'RN-EST-003'],
          status: 'Demonstrada',
          route: 'producao'
        },
        {
          area: 'Qualidade',
          title: 'Ficha Técnica demonstrativa',
          description:
            'A Qualidade pode consultar e imprimir uma ficha vinculada ao pedido ou lote, preservando o contexto técnico apresentado.',
          rules: ['RN-QUA-002', 'RN-QUA-003', 'RN-QUA-004'],
          status: 'Demonstrada com conteúdo pendente',
          route: 'qualidade'
        },
        {
          area: 'Experiência de uso',
          title: 'Resumo do novo pedido reorganizado',
          description:
            'Preço, pacotes, peso e volumes receberam hierarquia e espaçamento responsivos para leitura sem quebras.',
          rules: [],
          status: 'Entregue',
          route: 'pedidos'
        },
        {
          area: 'Governança',
          title: 'Histórico de versões dentro do protótipo',
          description:
            'As entregas passam a ser apresentadas por versão e conectadas às regras de negócio e às áreas atualizadas.',
          rules: ['RN-GOV-001'],
          status: 'Demonstrada',
          route: 'atualizacoes'
        }
      ]
    },
    {
      version: 'v2',
      date: '2026-08-31',
      current: false,
      title: 'Fluxo operacional integrado',
      summary:
        'Consolidação do percurso entre Comercial, Financeiro, Produção, Qualidade, Faturamento e Despacho.',
      changes: [
        {
          area: 'Pedidos',
          title: 'Bloqueio após envio ao Financeiro',
          description:
            'Pedido e valores ficam preservados após o envio; correções seguem por pedido complementar.',
          rules: ['RN-PED-001', 'RN-PED-002', 'RN-PED-003'],
          status: 'Confirmada e demonstrada',
          route: 'pedidos'
        },
        {
          area: 'Financeiro',
          title: 'Análise, crédito e comissão',
          description:
            'Restrições exigem justificativa, o crédito é revalidado e a comissão final deriva de recebimentos confirmados.',
          rules: ['RN-FIN-001', 'RN-COM-001'],
          status: 'Confirmada com exceções pendentes',
          route: 'financeiro'
        },
        {
          area: 'Produção',
          title: 'Uma OP por item e documento operacional',
          description:
            'Cada item gera uma OP independente, com documento obrigatório antes do início da produção.',
          rules: ['RN-OP-001'],
          status: 'Confirmada',
          route: 'producao'
        },
        {
          area: 'Rastreabilidade',
          title: 'Percurso do fornecedor ao cliente',
          description:
            'Lotes, consumos, produção, pedido, cliente e despacho podem ser consultados nos dois sentidos.',
          rules: ['RN-RAS-001'],
          status: 'Confirmada',
          route: 'estoque'
        }
      ]
    }
  ]
  const profiles = {
    administrador: {
      label: 'Administrador',
      description: 'Explore o ciclo completo e acompanhe a operação.',
      modules: [
        'dashboard',
        'pedidos',
        'clientes',
        'produtos',
        'formulas',
        'precificacao',
        'producao',
        'etiquetas',
        'estoque',
        'qualidade',
        'financeiro',
        'faturamento',
        'despacho',
        'comissoes',
        'relatorios',
        'auditoria',
        'usuarios',
        'guia'
      ]
    },
    comercial: {
      label: 'Comercial',
      description:
        'Crie pedidos, acompanhe sua carteira e consulte comissões já confirmadas.',
      modules: [
        'dashboard',
        'pedidos',
        'clientes',
        'produtos',
        'comissoes',
        'relatorios',
        'guia'
      ]
    },
    financeiro: {
      label: 'Financeiro',
      description: 'Analise crédito, libere pedidos e registre recebimentos.',
      modules: [
        'dashboard',
        'pedidos',
        'clientes',
        'financeiro',
        'relatorios',
        'guia'
      ]
    },
    producao: {
      label: 'Produção',
      description:
        'Consulte documentos da OP e registre produção e consumo por lote.',
      modules: [
        'dashboard',
        'producao',
        'etiquetas',
        'estoque',
        'relatorios',
        'guia'
      ]
    },
    qualidade: {
      label: 'Qualidade',
      description: 'Inspecione lotes e consulte a rastreabilidade.',
      modules: ['dashboard', 'producao', 'qualidade', 'relatorios', 'guia']
    },
    fiscal: {
      label: 'Fiscal / Expedição',
      description: 'Registre faturamento e despacho demonstrativos.',
      modules: [
        'dashboard',
        'pedidos',
        'faturamento',
        'despacho',
        'relatorios',
        'guia'
      ]
    },
    pd: {
      label: 'P&D',
      description: 'Consulte fórmulas, crie versões e simule preços.',
      modules: [
        'dashboard',
        'produtos',
        'formulas',
        'precificacao',
        'relatorios',
        'guia'
      ]
    },
    estoque: {
      label: 'Estoque',
      description: 'Receba lotes e registre ajustes justificados.',
      modules: ['dashboard', 'estoque', 'relatorios', 'guia']
    },
    diretor: {
      label: 'Diretor',
      description: 'Visão gerencial sem acesso implícito a fórmulas e custos.',
      modules: [
        'dashboard',
        'pedidos',
        'clientes',
        'produtos',
        'relatorios',
        'auditoria',
        'guia'
      ]
    }
  }
  const permissions = {
    saveOrder: ['comercial'],
    submitOrder: ['comercial'],
    approveOrder: ['comercial'],
    cancelOrder: ['comercial'],
    analyze: ['financeiro'],
    createOps: ['producao'],
    issueSheet: ['producao'],
    startOp: ['producao'],
    reportProduction: ['producao'],
    inspect: ['qualidade'],
    bill: ['fiscal'],
    dispatch: ['fiscal'],
    confirmDelivery: ['fiscal'],
    receiveLot: ['estoque'],
    adjustLot: ['estoque'],
    saveClient: ['comercial'],
    editLabel: ['producao'],
    saveLabel: ['producao'],
    editOpLabels: ['producao'],
    saveOpLabels: ['producao'],
    createVersion: ['pd'],
    activateVersion: ['pd'],
    createProduct: ['pd'],
    savePricingSettings: ['pd'],
    releasePrice: ['pd'],
    registerReceipt: ['financeiro', 'fiscal'],
    toggleUser: []
  }
  function can(user, action) {
    return (
      !!user &&
      (user.perfil === 'administrador' ||
        (permissions[action] || []).includes(user.perfil))
    )
  }
  function requireThat(condition, message) {
    if (!condition) throw new Error(message)
  }
  function get(rows, id) {
    const row = rows.find(x => x.id === id)
    requireThat(row, 'Registro não encontrado.')
    return row
  }
  function text(value, name, required = true) {
    const s = String(value ?? '').trim()
    requireThat(!required || s.length > 0, `${name} é obrigatório.`)
    requireThat(s.length <= 2000, `${name}: limite de 2.000 caracteres.`)
    return s
  }
  function number(value, name, min = 0) {
    const n = Number(value)
    requireThat(
      value !== '' &&
        value != null &&
        Number.isFinite(n) &&
        n >= min &&
        n <= 10000000,
      `${name}: informe um número válido (mínimo ${min}).`
    )
    return n
  }
  function date(value, name) {
    requireThat(
      /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
        !isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value,
      `${name}: data inválida.`
    )
    return value
  }
  function uid() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
  function orderTotal(o) {
    return o.itens.reduce(
      (sum, i) => sum + Math.round(i.quantidade * i.precoCentavos),
      0
    )
  }
  function volumeCount(item) {
    const units = item.unidadesPorVolume || 1
    return Math.ceil(item.quantidade / units)
  }
  function orderVolumeCount(o) {
    return o.itens.reduce((sum, item) => sum + volumeCount(item), 0)
  }
  function installmentPlan(totalCentavos, deadlines) {
    requireThat(
      Number.isSafeInteger(totalCentavos) && totalCentavos > 0,
      'Valor do faturamento inválido.'
    )
    requireThat(
      Array.isArray(deadlines) &&
        deadlines.length > 0 &&
        deadlines.length <= 24,
      'Informe entre 1 e 24 parcelas.'
    )
    const days = deadlines.map((value, index) => {
      const n = number(value, `Prazo da parcela ${index + 1}`, 0)
      requireThat(
        Number.isInteger(n),
        'Os prazos das parcelas devem ser dias inteiros.'
      )
      return n
    })
    requireThat(
      new Set(days).size === days.length,
      'Cada parcela deve ter um prazo diferente.'
    )
    const base = Math.floor(totalCentavos / days.length),
      remainder = totalCentavos % days.length
    return days.map((prazoDias, index) => ({
      numero: index + 1,
      prazoDias,
      valorCentavos: base + (index < remainder ? 1 : 0)
    }))
  }
  function commission(o) {
    return o.itens.reduce(
      (sum, i) =>
        sum +
        Math.round((i.quantidade * i.precoCentavos * i.comissaoBps) / 10000),
      0
    )
  }
  function visibleOrders(s, u) {
    return s.pedidos.filter(
      o => u.perfil !== 'comercial' || o.vendedorId === u.id
    )
  }
  function visibleClients(s, u) {
    return s.clientes.filter(
      c => u.perfil !== 'comercial' || c.vendedorId === u.id
    )
  }
  function credit(s, o) {
    const c = get(s.clientes, o.clienteId)
    // Não há contas a receber no escopo. O saldo anterior é um cenário sintético fixo.
    const exposure =
      c.exposicaoInicialCentavos +
      s.pedidos
        .filter(
          p =>
            p.id !== o.id &&
            p.clienteId === c.id &&
            ['aprovado', 'emProducao', 'faturado'].includes(p.status)
        )
        .reduce((n, p) => n + orderTotal(p), 0)
    return {
      exposure,
      available: c.limiteCentavos - exposure,
      projected: exposure + orderTotal(o),
      warning:
        c.situacaoFinanceira !== 'regular' ||
        exposure + orderTotal(o) > c.limiteCentavos
    }
  }
  function requirements(op, inputKg) {
    return op.formula.itens.map(i => ({
      ingredienteId: i.ingredienteId,
      quantidade: round((i.quantidade / op.formula.rendimento) * inputKg)
    }))
  }
  function eligibleLots(s, id) {
    return s.lotes
      .filter(
        l =>
          l.ingredienteId === id &&
          l.status === 'liberado' &&
          l.validade >= today() &&
          l.fabricacao <= today() &&
          l.saldo > 0
      )
      .sort((a, b) => a.validade.localeCompare(b.validade))
  }
  function suggestConsumption(s, op, inputKg) {
    return requirements(op, inputKg).flatMap(r => {
      let remaining = r.quantidade
      const rows = []
      for (const lot of eligibleLots(s, r.ingredienteId)) {
        const q = round(Math.min(remaining, lot.saldo))
        if (q > 0) rows.push({ loteId: lot.id, quantidade: q })
        remaining = round(remaining - q)
      }
      return rows
    })
  }
  function orderStockAvailability(s, o) {
    const requiredByIngredient = new Map()
    o.itens.forEach(item => {
      requirements(
        { formula: item.formula },
        item.quantidade * item.pesoKg
      ).forEach(r =>
        requiredByIngredient.set(
          r.ingredienteId,
          round((requiredByIngredient.get(r.ingredienteId) || 0) + r.quantidade)
        )
      )
    })
    const items = [...requiredByIngredient].map(
      ([ingredienteId, necessario]) => {
        const disponivel = round(
          eligibleLots(s, ingredienteId).reduce(
            (sum, lot) => sum + lot.saldo,
            0
          )
        )
        return {
          ingredienteId,
          necessario,
          disponivel,
          falta: round(Math.max(0, necessario - disponivel))
        }
      }
    )
    return { available: items.every(item => item.falta === 0), items }
  }
  function billingIssues(s, o) {
    const ops = s.ordens.filter(op => op.pedidoId === o.id)
    const issues = []
    if (
      !o.aprovacao ||
      !['liberado', 'liberadoComRestricao'].includes(o.statusAnalise)
    )
      issues.push('Liberações financeira e comercial')
    if (
      ops.length !== o.itens.length ||
      ops.some(op => op.status !== 'concluida')
    )
      issues.push('Todas as OPs concluídas')
    if (ops.length === 0 || ops.some(op => !op.documentoOp))
      issues.push('Documentos da OP gerados')
    if (
      ops.some(
        op =>
          !op.lotes.length ||
          op.lotes.some(id => get(s.lotes, id).status !== 'liberado')
      )
    )
      issues.push('Todos os lotes aprovados pela Qualidade')
    if (
      ops.some(op =>
        op.lotes.some(id => {
          const l = get(s.lotes, id)
          return l.validade < today() || l.saldo < l.quantidadeInicial
        })
      )
    )
      issues.push('Lotes válidos e saldo integral disponível')
    if (o.status === 'cancelado') issues.push('Pedido cancelado')
    return issues
  }
  function stage(s, o) {
    if (o.status === 'cancelado') return 'Cancelado'
    if (o.entrega && o.faturamento?.status !== 'concluido')
      return 'Entregue · Em faturamento'
    if (o.entrega) return 'Entregue'
    if (o.despacho && o.faturamento?.status !== 'concluido')
      return 'Em faturamento · Despachado'
    if (o.despacho) return 'Despachado'
    if (o.faturamento?.status === 'emAndamento')
      return 'Em faturamento · Aguardando despacho'
    if (o.faturamento?.status === 'concluido')
      return 'Faturado · Aguardando despacho'
    if (o.status === 'rascunho') return 'Rascunho'
    if (o.statusAnalise === 'bloqueado') return 'Bloqueado no financeiro'
    if (o.statusAnalise === 'pendente') return 'Análise financeira'
    if (!o.aprovacao) return 'Aprovação comercial'
    const ops = s.ordens.filter(x => x.pedidoId === o.id)
    if (ops.length < o.itens.length)
      return orderStockAvailability(s, o).available
        ? 'Gerar OPs'
        : 'Aguardando lote'
    if (ops.some(x => x.status !== 'concluida')) return 'Produção'
    if (
      ops.some(x => x.lotes.some(id => get(s.lotes, id).status === 'reprovado'))
    )
      return 'Bloqueado na qualidade'
    if (billingIssues(s, o).length) return 'Qualidade / liberação'
    return 'Pronto para faturar e despachar'
  }
  function seed() {
    const users = [
      ['admin', 'Administrador', 'administrador', 'admin123'],
      ['vendedor', 'Marina Comercial', 'comercial', 'vend123'],
      ['financeiro', 'Rafael Financeiro', 'financeiro', 'fin123'],
      ['producao', 'Lucas Produção', 'producao', 'prod123'],
      ['qualidade', 'Paula Qualidade', 'qualidade', 'qual123'],
      ['fiscal', 'Camila Fiscal', 'fiscal', 'fisc123'],
      ['quimica', 'Ana P&D', 'pd', 'pd123'],
      ['estoque', 'Bruno Estoque', 'estoque', 'esto123'],
      ['diretor', 'Carlos Diretor', 'diretor', 'dir123']
    ].map(([login, nome, perfil, senha]) => ({
      id: login,
      login,
      nome,
      perfil,
      senha,
      ativo: true
    }))
    const ingredients = [
      ['i1', 'Ácido cítrico', 850],
      ['i2', 'Glutamato monossódico', 1500],
      ['i3', 'Cloreto de sódio', 200],
      ['i4', 'Extrato de levedura', 4500]
    ].map(([id, nome, custoCentavos], n) => ({
      id,
      codigo: `ING-00${n + 1}`,
      nome,
      custoCentavos,
      unidade: 'KG'
    }))
    const formulas = [
      {
        id: 'f1v2',
        codigo: 'FORM-001',
        nome: 'Tempero Especial A',
        versao: 2,
        status: 'ativa',
        rendimento: 100,
        itens: [
          { ingredienteId: 'i1', quantidade: 10 },
          { ingredienteId: 'i2', quantidade: 5 },
          { ingredienteId: 'i3', quantidade: 80 },
          { ingredienteId: 'i4', quantidade: 5 }
        ],
        observacoes:
          'Composição exclusivamente ilustrativa, não usar na fabricação.'
      },
      {
        id: 'f2v1',
        codigo: 'FORM-002',
        nome: 'Realçador de Sabor B',
        versao: 1,
        status: 'ativa',
        rendimento: 100,
        itens: [
          { ingredienteId: 'i2', quantidade: 40 },
          { ingredienteId: 'i3', quantidade: 55 },
          { ingredienteId: 'i4', quantidade: 5 }
        ],
        observacoes:
          'Composição exclusivamente ilustrativa, não usar na fabricação.'
      }
    ]
    const s = {
      schemaVersion: VERSION,
      revision: 0,
      configuracoes: {
        precificacao: {
          margemPadrao: 60,
          cenariosLucratividade: [
            10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80
          ],
          encargosFixos: [
            { nome: 'Nota fiscal', percentual: 10.5 },
            { nome: 'Comissão técnica', percentual: 5 },
            { nome: 'Comissão comercial', percentual: 5 },
            { nome: 'Comissão extra cliente', percentual: 0 }
          ],
          financeiroCentavosKg: 125,
          maoDeObraCentavosKg: 75,
          outrosCustosCentavosKg: 0
        }
      },
      usuarios: users,
      ingredientes: ingredients,
      formulas,
      fornecedores: [
        { id: 's1', nome: 'Fornecedor Alfa — demonstração' },
        { id: 's2', nome: 'Fornecedor Beta — demonstração' }
      ],
      produtos: [
        {
          id: 'p1',
          codigo: 'PROD-001',
          nome: 'Tempero Especial A 5 kg',
          categoria: 'Temperos',
          unidade: 'UN',
          pesoKg: 5,
          embalagem: 'Balde 5 kg',
          volumeTipo: 'Pacote',
          unidadesPorVolume: 10,
          limiteUnidadesPorVolume: 10,
          embalagemCentavos: 450,
          formulaId: 'f1v2',
          status: 'ativo',
          precoCentavos: 5500,
          comissaoBps: 500,
          precoLiberado: true,
          tabela: 'Tabela demonstração 2026',
          precificacao: { margemPercentual: 60 }
        },
        {
          id: 'p2',
          codigo: 'PROD-002',
          nome: 'Realçador de Sabor B 20 kg',
          categoria: 'Realçadores',
          unidade: 'UN',
          pesoKg: 20,
          embalagem: 'Bombona 20 kg',
          volumeTipo: 'Saco',
          unidadesPorVolume: 2,
          limiteUnidadesPorVolume: 2,
          embalagemCentavos: 1200,
          formulaId: 'f2v1',
          status: 'ativo',
          precoCentavos: 24000,
          comissaoBps: 450,
          precoLiberado: true,
          tabela: 'Tabela demonstração 2026',
          precificacao: { margemPercentual: 60 }
        },
        {
          id: 'p3',
          codigo: 'PROD-003',
          nome: 'Condimento Premium C',
          categoria: 'Condimentos',
          unidade: 'KG',
          pesoKg: 1,
          embalagem: 'Saco',
          volumeTipo: 'Saco',
          unidadesPorVolume: 1,
          limiteUnidadesPorVolume: 1,
          embalagemCentavos: 200,
          formulaId: null,
          status: 'emDesenvolvimento',
          precoCentavos: 0,
          comissaoBps: 600,
          precoLiberado: false,
          tabela: 'Não liberada'
        }
      ],
      clientes: [
        {
          id: 'c1',
          razaoSocial: 'Alimentos do Norte — demonstração',
          nomeFantasia: 'AlimNorte (teste)',
          cnpj: '12.345.678/0001-95',
          inscricaoEstadual: 'ISENTO',
          endereco: 'Av. Exemplo, 500 · Belém/PA',
          contato: 'Compras · compras@example.com',
          vendedorId: 'vendedor',
          limiteCentavos: 5000000,
          exposicaoInicialCentavos: 800000,
          situacaoFinanceira: 'regular',
          tabela: 'Tabela demonstração 2026',
          ativo: true,
          historicoFinanceiro: [
            { mes: '2026-01', status: 'liberado', diasAtraso: 0 },
            { mes: '2026-02', status: 'liberado', diasAtraso: 0 },
            { mes: '2026-03', status: 'liberadoComRestricao', diasAtraso: 8 },
            { mes: '2026-04', status: 'liberado', diasAtraso: 0 },
            { mes: '2026-05', status: 'liberado', diasAtraso: 0 },
            { mes: '2026-06', status: 'liberadoComRestricao', diasAtraso: 4 }
          ]
        },
        {
          id: 'c2',
          razaoSocial: 'Condimentos do Centro — demonstração',
          nomeFantasia: 'CondCentro (teste)',
          cnpj: '11.222.333/0001-81',
          inscricaoEstadual: 'ISENTO',
          endereco: 'Rua Exemplo, 200 · Goiânia/GO',
          contato: 'Compras · centro@example.com',
          vendedorId: 'vendedor',
          limiteCentavos: 300000,
          exposicaoInicialCentavos: 280000,
          situacaoFinanceira: 'restricao',
          tabela: 'Tabela demonstração 2026',
          ativo: true,
          historicoFinanceiro: [
            { mes: '2026-01', status: 'liberado', diasAtraso: 0 },
            { mes: '2026-02', status: 'liberadoComRestricao', diasAtraso: 12 },
            { mes: '2026-03', status: 'bloqueado', diasAtraso: 35 },
            { mes: '2026-04', status: 'liberadoComRestricao', diasAtraso: 18 },
            { mes: '2026-05', status: 'liberadoComRestricao', diasAtraso: 7 },
            { mes: '2026-06', status: 'bloqueado', diasAtraso: 29 }
          ]
        },
        {
          id: 'c3',
          razaoSocial: 'Cliente Inativo — demonstração',
          nomeFantasia: 'Cliente inativo (teste)',
          cnpj: '45.723.174/0001-10',
          inscricaoEstadual: 'ISENTO',
          endereco: 'Endereço fictício',
          contato: 'teste@example.com',
          vendedorId: 'vendedor',
          limiteCentavos: 0,
          exposicaoInicialCentavos: 0,
          situacaoFinanceira: 'inadimplente',
          tabela: 'Tabela demonstração 2026',
          ativo: false,
          historicoFinanceiro: [
            { mes: '2026-01', status: 'bloqueado', diasAtraso: 60 }
          ]
        }
      ],
      etiquetas: [
        {
          id: 'etq1',
          nome: 'Etiqueta pequena padrão',
          tamanho: 'Pequena',
          conteudo: 'Produto, lote, fabricação, validade e peso líquido',
          observacoes: 'Modelo preliminar para validação.'
        },
        {
          id: 'etq2',
          nome: 'Etiqueta grande REAL MAX',
          tamanho: 'Grande',
          conteudo:
            'Produto, cliente, ingredientes, lote, fabricação, validade, peso líquido e instruções',
          descricaoProduto:
            'Condimento preparado para produtos cárneos com aditivos.',
          textoRegulatorio:
            'Para uso exclusivo em alimentos. Dispensado de registro conforme RDC 843/2024 e IN 281/2024.',
          alergicos: 'Pode conter soja.',
          gluten: 'Não contém glúten.',
          modoUso: '2% sobre a massa. Atender RTIQ do produto pronto.',
          conservacao: 'Manter em local seco, fresco e arejado.',
          fabricante:
            'REALTECH INDÚSTRIA E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA\nAV CLEMENTE TALARICO, 190 - SÃO CARLOS - SP\nCEP: 13563-882 - CNPJ: 60.708.408/0001-44\nCOMERCIALIZADO POR: CNPJ 56.155.744/0001-60.',
          slogan: 'QUALIDADE EM PRODUTOS E SERVIÇOS',
          observacoes:
            'Modelo reproduzido da referência enviada; textos regulatórios e medidas ainda requerem homologação.'
        }
      ],
      recebiveis: [],
      lotes: [],
      pedidos: [],
      ordens: [],
      movimentacoes: [],
      auditoria: [],
      seq: { pedido: 1000, op: 0, lote: 0 }
    }
    for (const [id, ing, saldo, expiry, status, forn] of [
      ['l1', 'i1', 8, 200, 'liberado', 's1'],
      ['l2', 'i1', 472, 300, 'liberado', 's1'],
      ['l3', 'i2', 295, 300, 'liberado', 's1'],
      ['l4', 'i3', 998, 300, 'liberado', 's2'],
      ['l5', 'i4', 150, 300, 'liberado', 's1'],
      ['l6', 'i1', 50, -2, 'liberado', 's2'],
      ['l7', 'i2', 25, 100, 'bloqueado', 's2']
    ]) {
      s.lotes.push({
        id,
        codigo: `MP-${id.slice(1).padStart(4, '0')}`,
        tipo: 'ingrediente',
        ingredienteId: ing,
        fornecedorId: forn,
        saldo,
        quantidadeInicial: saldo,
        fabricacao: day(-30),
        validade: day(expiry),
        status
      })
      s.movimentacoes.push({
        id: uid(),
        loteId: id,
        tipo: 'entrada',
        quantidade: saldo,
        unidade: 'KG',
        data: new Date().toISOString(),
        responsavel: 'Carga de demonstração',
        motivo: 'Saldo inicial sintético'
      })
    }
    return s
  }
  function formulaCost(s, f) {
    return (
      f.itens.reduce(
        (n, i) =>
          n + i.quantidade * get(s.ingredientes, i.ingredienteId).custoCentavos,
        0
      ) / f.rendimento
    )
  }
  function pricingProfile(s, p) {
    const formula = p.formulaId ? get(s.formulas, p.formulaId) : null
    const global = s.configuracoes?.precificacao
    const legacy = p?.precificacao || {}
    const basePercentages = formula
      ? formula.itens.map(i => ({
          ingredienteId: i.ingredienteId,
          nome: get(s.ingredientes, i.ingredienteId).nome,
          percentual: round((i.quantidade / formula.rendimento) * 100),
          custoCentavos: Math.round(
            (i.quantidade / formula.rendimento) *
              get(s.ingredientes, i.ingredienteId).custoCentavos *
              100
          )
        }))
      : []
    const fixedCharges = Array.isArray(global?.encargosFixos)
      ? global.encargosFixos.map(item => ({
          nome: item.nome || 'Encargo',
          percentual: Number(item.percentual || 0)
        }))
      : Array.isArray(legacy.encargosFixos)
        ? legacy.encargosFixos.map(item => ({
            nome: item.nome || 'Encargo',
            percentual: Number(item.percentual || 0)
          }))
        : [
            { nome: 'Nota fiscal', percentual: 10.5 },
            { nome: 'Comissão técnica', percentual: 5 },
            { nome: 'Comissão comercial', percentual: 5 },
            { nome: 'Comissão extra cliente', percentual: 0 }
          ]
    return {
      margemPercentual: Number(
        legacy.margemPercentual ?? global?.margemPadrao ?? 60
      ),
      financeiroCentavosKg: Number(
        global?.financeiroCentavosKg ?? legacy.financeiroCentavosKg ?? 125
      ),
      maoDeObraCentavosKg: Number(
        global?.maoDeObraCentavosKg ?? legacy.maoDeObraCentavosKg ?? 75
      ),
      outrosCustosCentavosKg: Number(
        global?.outrosCustosCentavosKg ?? legacy.outrosCustosCentavosKg ?? 0
      ),
      encargosFixos: fixedCharges,
      composicao: basePercentages
    }
  }
  function priceSimulation(s, p, margin) {
    const m = number(
      margin ?? pricingProfile(s, p).margemPercentual,
      'Margem',
      0
    )
    requireThat(m < 10000, 'Lucratividade deve ser menor que 10.000%.')
    const formula = get(s.formulas, p.formulaId)
    const profile = pricingProfile(s, p)
    const materiaPrima = formulaCost(s, formula)
    const embalagem = Number(
      p.precificacao?.embalagemCentavosKg ??
        (p.embalagemCentavos || 0) / (p.pesoKg || 1)
    )
    const materiais = materiaPrima + embalagem
    const primaryCost = Math.round(
      materiais +
        profile.financeiroCentavosKg +
        profile.maoDeObraCentavosKg +
        profile.outrosCustosCentavosKg
    )
    const fixedCharges = profile.encargosFixos.reduce(
      (sum, charge) => sum + Number(charge.percentual || 0),
      0
    )
    requireThat(
      fixedCharges < 100,
      'Encargos sobre venda devem ser menores que 100%.'
    )
    const profit = Math.round(primaryCost * (m / 100))
    const baseWithProfit = primaryCost + profit
    const finalPrice = Math.ceil(baseWithProfit / (1 - fixedCharges / 100))
    const presentation = weight => Math.round(finalPrice * Number(weight))
    return {
      materiaPrimaCentavosKg: Math.round(materiaPrima),
      embalagemCentavosKg: Math.round(embalagem),
      materiaisCentavosKg: Math.round(materiais),
      financeiroCentavosKg: profile.financeiroCentavosKg,
      maoDeObraCentavosKg: profile.maoDeObraCentavosKg,
      outrosCustosCentavosKg: profile.outrosCustosCentavosKg,
      custoPrimarioCentavos: primaryCost,
      custoFixosCentavos: Math.round(
        profile.financeiroCentavosKg +
          profile.maoDeObraCentavosKg +
          profile.outrosCustosCentavosKg
      ),
      valorLucroCentavos: profit,
      baseComLucroCentavos: baseWithProfit,
      encargosPercentual: fixedCharges,
      custoFinalCentavos: baseWithProfit,
      margemPercentual: m,
      precoKgCentavos: finalPrice,
      precoCentavos: Math.round(finalPrice * p.pesoKg),
      precoApresentacoes: [
        { pesoKg: 1, precoCentavos: presentation(1) },
        { pesoKg: 0.5, precoCentavos: presentation(0.5) },
        { pesoKg: 0.25, precoCentavos: presentation(0.25) }
      ],
      custoCentavos: primaryCost,
      encargosFixos: profile.encargosFixos,
      composicao: profile.composicao
    }
  }
  function priceScenarios(s, p) {
    const margins = s.configuracoes?.precificacao?.cenariosLucratividade || [
      10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80
    ]
    return margins.map(margem => {
      const sim = priceSimulation(s, p, margem)
      return { margem, precoKgCentavos: sim.precoKgCentavos }
    })
  }
  function validCnpj(value) {
    const n = value.replace(/\D/g, '')
    if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
    for (let len = 12; len < 14; len++) {
      let sum = 0,
        w = len - 7
      for (let i = 0; i < len; i++) {
        sum += Number(n[i]) * w--
        if (w < 2) w = 9
      }
      const r = sum % 11
      if (Number(n[len]) !== (r < 2 ? 0 : 11 - r)) return false
    }
    return true
  }
  function execute(state, user, action, payload = {}) {
    requireThat(
      user &&
        state.usuarios.some(
          u => u.id === user.id && u.perfil === user.perfil && u.ativo
        ),
      'Sessão inválida ou usuário inativo.'
    )
    requireThat(can(user, action), 'Seu perfil não permite esta ação.')
    const s = clone(state),
      now = new Date().toISOString()
    let target, before, result
    const audit = (entity, previous, next) => {
      s.auditoria.push({
        id: uid(),
        data: now,
        usuario: user.nome,
        perfil: user.perfil,
        acao: action,
        entidade: entity,
        antes: clone(previous ?? null),
        depois: clone(next ?? null)
      })
    }
    const own = o =>
      requireThat(
        user.perfil !== 'comercial' || o.vendedorId === user.id,
        'Pedido de outro vendedor.'
      )
    const order = () => {
      const o = get(s.pedidos, payload.id)
      own(o)
      target = o
      before = clone(o)
      return o
    }
    const op = () => {
      const o = get(s.ordens, payload.id)
      target = o
      before = clone(o)
      return o
    }
    const move = (l, q, tipo, motivo, unidade, opId) =>
      s.movimentacoes.push({
        id: uid(),
        loteId: l.id,
        quantidade: q,
        tipo,
        motivo,
        unidade: unidade || (l.tipo === 'ingrediente' ? 'KG' : 'UN'),
        opId,
        data: now,
        responsavel: user.nome
      })
    switch (action) {
      case 'saveOrder': {
        const old = payload.id ? order() : null
        requireThat(
          !old || old.status === 'rascunho',
          'Pedido enviado ao Financeiro não pode ser editado. Crie um pedido complementar quando aplicável.'
        )
        const c = get(s.clientes, payload.clienteId)
        requireThat(c.ativo, 'Cliente inativo não pode receber pedidos.')
        requireThat(
          user.perfil !== 'comercial' || c.vendedorId === user.id,
          'Cliente fora da sua carteira.'
        )
        const due = date(payload.prazoEntrega, 'Prazo de entrega')
        requireThat(
          due >= today(),
          'Prazo de entrega não pode estar no passado.'
        )
        requireThat(
          Array.isArray(payload.itens) && payload.itens.length > 0,
          'Adicione ao menos um item.'
        )
        const seen = new Set()
        const items = payload.itens.map(i => {
          const p = get(s.produtos, i.produtoId)
          requireThat(
            !seen.has(p.id),
            'Agrupe quantidades do mesmo produto em um único item.'
          )
          seen.add(p.id)
          requireThat(
            p.status === 'ativo' && p.precoLiberado && p.tabela === c.tabela,
            'Produto ou tabela de preços não liberados para este cliente.'
          )
          const f = get(s.formulas, p.formulaId)
          requireThat(f.status === 'ativa', 'Fórmula não está ativa.')
          const q = number(i.quantidade, 'Quantidade', 1)
          requireThat(
            Number.isInteger(q),
            'Produtos em UN exigem quantidade inteira.'
          )
          const unitsPerVolume = number(
            p.unidadesPorVolume,
            'Unidades por volume',
            1
          )
          const maxUnitsPerVolume = number(
            p.limiteUnidadesPorVolume,
            'Limite de unidades por volume',
            1
          )
          requireThat(
            Number.isInteger(unitsPerVolume) &&
              Number.isInteger(maxUnitsPerVolume) &&
              unitsPerVolume <= maxUnitsPerVolume,
            'Configuração de volume inválida para o produto.'
          )
          return {
            id: uid(),
            produtoId: p.id,
            nome: p.nome,
            unidade: p.unidade,
            pesoKg: p.pesoKg,
            volumeTipo: p.volumeTipo,
            unidadesPorVolume: unitsPerVolume,
            limiteUnidadesPorVolume: maxUnitsPerVolume,
            quantidade: q,
            precoCentavos: p.precoCentavos,
            comissaoBps: p.comissaoBps,
            tabela: p.tabela,
            formula: clone(f)
          }
        })
        target = {
          id: old?.id || uid(),
          numero:
            old?.numero || `PED-${String(++s.seq.pedido).padStart(5, '0')}`,
          clienteId: c.id,
          clienteNome: c.nomeFantasia,
          vendedorId: c.vendedorId,
          itens: items,
          prazoEntrega: due,
          condicoesPagamentoDias: installmentPlan(
            orderTotal({ itens: items }),
            payload.condicoesPagamentoDias
          ).map(p => p.prazoDias),
          condicoesComerciais: text(
            payload.condicoesComerciais,
            'Condições comerciais',
            false
          ),
          observacoes: text(payload.observacoes, 'Observações', false),
          origem: 'sistema',
          status: 'rascunho',
          statusAnalise: 'pendente',
          criadoEm: old?.criadoEm || now,
          prazoProducao: old?.prazoProducao || addDays(now, 7),
          aprovacao: null,
          analises: old?.analises || [],
          complementarDe: old?.complementarDe || payload.complementarDe || null
        }
        if (target.complementarDe) get(s.pedidos, target.complementarDe)
        requireThat(
          Number.isSafeInteger(orderTotal(target)) &&
            orderTotal(target) <= 10000000000,
          'Valor do pedido excede o limite da demonstração.'
        )
        if (old) s.pedidos[s.pedidos.findIndex(x => x.id === old.id)] = target
        else s.pedidos.push(target)
        result = target.id
        break
      }
      case 'submitOrder': {
        const o = order()
        requireThat(
          o.origem === 'sistema',
          'Pedido externo não pode avançar. Cadastre-o primeiro no sistema.'
        )
        requireThat(
          o.status === 'rascunho',
          'Somente rascunhos podem ser enviados.'
        )
        requireThat(get(s.clientes, o.clienteId).ativo, 'Cliente inativo.')
        o.status = 'aguardandoAprovacao'
        o.statusAnalise = 'pendente'
        break
      }
      case 'analyze': {
        const o = order()
        requireThat(
          o.status === 'aguardandoAprovacao' && !o.aprovacao,
          'Pedido não está em análise financeira.'
        )
        requireThat(
          ['liberado', 'liberadoComRestricao', 'bloqueado'].includes(
            payload.decisao
          ),
          'Decisão inválida.'
        )
        requireThat(
          payload.decisao !== 'liberado' || !credit(s, o).warning,
          'Há restrição ou crédito insuficiente. Use liberação com restrição e justifique.'
        )
        const reason = text(
          payload.justificativa,
          'Justificativa',
          payload.decisao !== 'liberado'
        )
        o.statusAnalise = payload.decisao
        o.analises.push({
          decisao: payload.decisao,
          justificativa: reason,
          usuario: user.nome,
          data: now,
          credito: credit(s, o)
        })
        break
      }
      case 'approveOrder': {
        const o = order()
        requireThat(
          o.status === 'aguardandoAprovacao' && !o.aprovacao,
          'Pedido não está disponível para aprovação.'
        )
        requireThat(
          ['liberado', 'liberadoComRestricao'].includes(o.statusAnalise),
          'Liberação financeira obrigatória antes da aprovação comercial.'
        )
        requireThat(get(s.clientes, o.clienteId).ativo, 'Cliente inativo.')
        requireThat(
          o.statusAnalise !== 'liberado' || !credit(s, o).warning,
          'Crédito mudou desde a análise. Solicite nova decisão financeira antes de aprovar.'
        )
        o.itens.forEach(i => {
          const p = get(s.produtos, i.produtoId)
          requireThat(
            p.status === 'ativo' &&
              get(s.formulas, i.formula.id).status === 'ativa',
            'Produto ou versão de fórmula deixou de estar ativo. Revise o pedido.'
          )
        })
        o.aprovacao = { usuario: user.nome, data: now }
        o.status = 'aprovado'
        break
      }
      case 'cancelOrder': {
        const o = order()
        requireThat(
          !['faturado', 'cancelado'].includes(o.status) &&
            !s.ordens.some(x => x.pedidoId === o.id),
          'Cancelamento disponível apenas antes da geração de OPs. Após isso, exige procedimento de estorno não simulado.'
        )
        o.cancelamento = {
          justificativa: text(payload.justificativa, 'Justificativa'),
          usuario: user.nome,
          data: now
        }
        o.status = 'cancelado'
        break
      }
      case 'createOps': {
        const o = order()
        requireThat(
          o.origem === 'sistema',
          'Pedido externo não pode gerar produção. Cadastre-o primeiro no sistema.'
        )
        requireThat(
          o.status === 'aprovado' && o.aprovacao,
          'Pedido precisa de aprovação comercial.'
        )
        requireThat(
          !s.ordens.some(x => x.pedidoId === o.id),
          'OPs já geradas para este pedido.'
        )
        const stock = orderStockAvailability(s, o)
        requireThat(
          stock.available,
          `Estoque insuficiente para gerar OP. Aguardando lote: ${stock.items
            .filter(item => item.falta > 0)
            .map(
              item =>
                `${get(s.ingredientes, item.ingredienteId).nome} (faltam ${item.falta} kg)`
            )
            .join(', ')}.`
        )
        o.itens.forEach(i => {
          requireThat(
            get(s.formulas, i.formula.id).status === 'ativa' &&
              get(s.produtos, i.produtoId).status === 'ativo',
            'Produto ou fórmula não liberados para nova produção.'
          )
          s.ordens.push({
            id: uid(),
            numero: `OP-${String(++s.seq.op).padStart(5, '0')}`,
            pedidoId: o.id,
            itemId: i.id,
            produtoId: i.produtoId,
            produtoNome: i.nome,
            formula: clone(i.formula),
            pesoKg: i.pesoKg,
            quantidadePrevista: i.quantidade,
            quantidadeProduzida: 0,
            prioridadeEm: o.criadoEm,
            prazoProducao: productionDeadline(o),
            perdasKg: 0,
            sobrasKg: 0,
            status: 'aguardando',
            lotes: [],
            apontamentos: [],
            documentoOp: null,
            etiquetas: []
          })
        })
        o.status = 'emProducao'
        break
      }
      case 'issueSheet': {
        const x = op()
        requireThat(x.status !== 'concluida', 'OP já concluída.')
        requireThat(!x.documentoOp, 'Documento da OP já gerado.')
        x.documentoOp = {
          numero: `DOC-${x.numero}`,
          versao: x.formula.versao,
          data: now,
          usuario: user.nome,
          necessidades: requirements(x, x.quantidadePrevista * x.pesoKg)
        }
        break
      }
      case 'startOp': {
        const x = op()
        requireThat(
          x.status === 'aguardando' && x.documentoOp,
          'Gere o documento da OP antes de iniciar a produção.'
        )
        x.status = 'emProducao'
        x.operador = user.nome
        x.inicio = now
        break
      }
      case 'reportProduction': {
        const x = op()
        requireThat(
          x.status === 'emProducao' && x.documentoOp,
          'OP precisa estar em produção e ter documento gerado.'
        )
        const q = number(payload.quantidade, 'Quantidade produzida', 1)
        requireThat(
          Number.isInteger(q) &&
            q <= x.quantidadePrevista - x.quantidadeProduzida,
          'Informe UN inteiras, no máximo o saldo da OP.'
        )
        const loss = round(number(payload.perdasKg, 'Perdas')),
          surplus = round(number(payload.sobrasKg, 'Sobras'))
        const reason = text(
          payload.observacoes,
          'Observações',
          loss > 0 || surplus > 0
        )
        const expiry = date(payload.validade, 'Validade do lote produzido')
        requireThat(
          expiry >= today(),
          'Lote produzido não pode nascer vencido.'
        )
        const inputKg = round(q * x.pesoKg + loss + surplus),
          needs = requirements(x, inputKg)
        requireThat(
          Array.isArray(payload.consumos),
          'Informe os lotes consumidos.'
        )
        const aggregates = new Map()
        for (const c of payload.consumos) {
          const n = round(number(c.quantidade, 'Consumo'))
          if (!n) continue
          const l = get(s.lotes, c.loteId)
          requireThat(
            l.tipo === 'ingrediente' &&
              needs.some(r => r.ingredienteId === l.ingredienteId),
            'Lote não pertence à fórmula.'
          )
          aggregates.set(l.id, round((aggregates.get(l.id) || 0) + n))
        }
        const consumptions = [...aggregates].map(([id, n]) => {
          const l = get(s.lotes, id)
          requireThat(
            eligibleLots(s, l.ingredienteId).some(v => v.id === id),
            'Lote vencido, bloqueado ou sem saldo não pode ser consumido.'
          )
          requireThat(n <= l.saldo, 'Saldo insuficiente no lote ' + l.codigo)
          return {
            loteId: id,
            ingredienteId: l.ingredienteId,
            quantidade: n,
            custoCentavos: Math.round(
              n * get(s.ingredientes, l.ingredienteId).custoCentavos
            )
          }
        })
        needs.forEach(r =>
          requireThat(
            Math.abs(
              consumptions
                .filter(c => c.ingredienteId === r.ingredienteId)
                .reduce((n, c) => n + c.quantidade, 0) - r.quantidade
            ) < 0.001,
            `Consumo de ${get(s.ingredientes, r.ingredienteId).nome} deve ser ${r.quantidade} kg.`
          )
        )
        // Todas as validações ocorrem antes das movimentações; execute trabalha numa cópia.
        consumptions.forEach(c => {
          const l = get(s.lotes, c.loteId)
          l.saldo = round(l.saldo - c.quantidade)
          move(l, -c.quantidade, 'consumo', x.numero, 'KG', x.id)
        })
        const lot = {
          id: uid(),
          codigo: `PA-${String(++s.seq.lote).padStart(5, '0')}`,
          tipo: 'produto',
          produtoId: x.produtoId,
          opId: x.id,
          pedidoId: x.pedidoId,
          quantidadeInicial: q,
          saldo: q,
          sobrasKg: surplus,
          fabricacao: today(),
          validade: expiry,
          status: 'pendente',
          inspecoes: []
        }
        s.lotes.push(lot)
        x.lotes.push(lot.id)
        move(lot, q, 'producao', x.numero, 'UN', x.id)
        if (surplus)
          move(
            lot,
            surplus,
            'sobra',
            'Sobra segregada, não vendável',
            'KG',
            x.id
          )
        x.apontamentos.push({
          id: uid(),
          data: now,
          usuario: user.nome,
          quantidade: q,
          perdasKg: loss,
          sobrasKg: surplus,
          consumos: consumptions,
          loteId: lot.id,
          observacoes: reason,
          custoInsumosCentavos: consumptions.reduce(
            (n, c) => n + c.custoCentavos,
            0
          )
        })
        x.quantidadeProduzida += q
        x.perdasKg = round(x.perdasKg + loss)
        x.sobrasKg = round(x.sobrasKg + surplus)
        if (x.quantidadeProduzida === x.quantidadePrevista) {
          x.status = 'concluida'
          x.fim = now
        }
        break
      }
      case 'inspect': {
        const l = get(s.lotes, payload.id)
        target = l
        before = clone(l)
        requireThat(
          l.tipo === 'produto' && l.status === 'pendente',
          'Somente lote produzido pendente pode ser inspecionado. Reprovado exige tratamento separado.'
        )
        requireThat(
          ['aprovado', 'reprovado'].includes(payload.decisao),
          'Resultado de qualidade inválido.'
        )
        l.inspecoes.push({
          resultado: payload.decisao,
          observacoes: text(
            payload.observacoes,
            'Motivo da reprovação',
            payload.decisao === 'reprovado'
          ),
          laudo: text(payload.laudo, 'Referência de laudo', false),
          usuario: user.nome,
          data: now
        })
        l.status = payload.decisao === 'aprovado' ? 'liberado' : 'reprovado'
        break
      }
      case 'bill': {
        const o = order()
        requireThat(
          o.origem === 'sistema',
          'Pedido externo não pode ser faturado neste fluxo.'
        )
        requireThat(!o.faturamento, 'Pedido já faturado.')
        const issues = billingIssues(s, o)
        requireThat(
          !issues.length,
          'Faturamento bloqueado: ' + issues.join('; ')
        )
        const plan = installmentPlan(orderTotal(o), o.condicoesPagamentoDias)
        o.faturamento = {
          referencia: text(payload.referencia, 'Referência interna'),
          data: now,
          usuario: user.nome,
          valorCentavos: orderTotal(o),
          status: 'emAndamento',
          parcelas: plan.map(p => ({
            ...p,
            vencimento: addDays(now, p.prazoDias)
          }))
        }
        const totalCommission = commission(o)
        plan.forEach(p =>
          s.recebiveis.push({
            id: uid(),
            pedidoId: o.id,
            faturamentoReferencia: o.faturamento.referencia,
            parcelaNumero: p.numero,
            parcelasTotal: plan.length,
            prazoDias: p.prazoDias,
            clienteId: o.clienteId,
            vendedorId: o.vendedorId,
            valorCentavos: p.valorCentavos,
            comissaoCentavos: Math.floor(
              (totalCommission * p.valorCentavos) / orderTotal(o)
            ),
            vencimento: addDays(now, p.prazoDias),
            recebidoEm: null,
            status: 'aberto'
          })
        )
        const commissionDifference =
          totalCommission -
          s.recebiveis
            .filter(r => r.pedidoId === o.id)
            .reduce((sum, r) => sum + r.comissaoCentavos, 0)
        s.recebiveis.find(r => r.pedidoId === o.id).comissaoCentavos +=
          commissionDifference
        break
      }
      case 'registerReceipt': {
        const r = get(s.recebiveis, payload.id)
        target = r
        before = clone(r)
        requireThat(
          r.status === 'aberto' && !r.recebidoEm,
          'Recebimento já registrado.'
        )
        const paid = date(payload.recebidoEm, 'Data do recebimento')
        requireThat(
          paid <= today(),
          'Data do recebimento não pode estar no futuro.'
        )
        const o = get(s.pedidos, r.pedidoId)
        requireThat(
          paid >= localDate(new Date(o.faturamento.data)),
          'Recebimento não pode ser anterior ao faturamento.'
        )
        r.recebidoEm = paid
        r.status = 'pago'
        r.referencia = text(payload.referencia, 'Referência do recebimento')
        r.registradoPor = user.nome
        r.registradoEm = now
        const orderReceivables = s.recebiveis.filter(x => x.pedidoId === o.id)
        if (
          o.faturamento &&
          orderReceivables.length &&
          orderReceivables.every(x => x.status === 'pago')
        ) {
          o.faturamento.status = 'concluido'
          o.faturamento.concluidoEm = now
          o.status = 'faturado'
        }
        break
      }
      case 'dispatch': {
        const o = order()
        requireThat(
          o.origem === 'sistema',
          'Pedido externo não pode ser despachado neste fluxo.'
        )
        requireThat(!o.despacho, 'Pedido já despachado.')
        requireThat(
          !billingIssues(s, o).length,
          'Há pendência de liberação ou validade nos lotes.'
        )
        const exit = date(payload.dataSaida, 'Data de saída')
        requireThat(exit <= today(), 'Data de saída não pode estar no futuro.')
        const due = date(payload.prazo, 'Prazo do frete')
        requireThat(due >= exit, 'Prazo do frete anterior à saída.')
        const lots = s.ordens
          .filter(x => x.pedidoId === o.id)
          .flatMap(x => x.lotes)
        o.despacho = {
          transportadora: text(payload.transportadora, 'Transportadora'),
          valorCentavos: Math.round(
            number(payload.valor, 'Valor do frete') * 100
          ),
          rastreamento: text(payload.rastreamento, 'Rastreamento'),
          comprovante: text(payload.comprovante, 'Referência do comprovante'),
          tomadorFrete: text(payload.tomadorFrete, 'Tomador do frete'),
          dataSaida: exit,
          prazo: due,
          data: now,
          usuario: user.nome,
          lotes: lots
        }
        requireThat(
          ['emitente', 'destinatario'].includes(o.despacho.tomadorFrete),
          'Tomador do frete deve ser emitente ou destinatário.'
        )
        lots.forEach(id => {
          const l = get(s.lotes, id)
          move(l, -l.saldo, 'despacho', o.numero, 'UN')
          l.saldo = 0
        })
        break
      }
      case 'confirmDelivery': {
        const o = order()
        requireThat(
          o.despacho,
          'Registre o despacho antes de confirmar a entrega.'
        )
        requireThat(!o.entrega, 'Entrega já confirmada.')
        const delivered = date(payload.dataEntrega, 'Data da entrega')
        requireThat(
          delivered >= o.despacho.dataSaida && delivered <= today(),
          'Entrega deve ocorrer entre a saída e hoje.'
        )
        o.entrega = {
          dataEntrega: delivered,
          recebidoPor: text(payload.recebidoPor, 'Recebido por'),
          comprovante: text(
            payload.comprovanteEntrega,
            'Referência do comprovante',
            false
          ),
          confirmadoEm: now,
          usuario: user.nome
        }
        break
      }
      case 'receiveLot': {
        get(s.ingredientes, payload.ingredienteId)
        get(s.fornecedores, payload.fornecedorId)
        const code = text(payload.codigo, 'Código do lote')
        requireThat(
          !s.lotes.some(l => l.codigo.toLowerCase() === code.toLowerCase()),
          'Código de lote já cadastrado.'
        )
        const made = date(payload.fabricacao, 'Fabricação'),
          expiry = date(payload.validade, 'Validade')
        requireThat(
          made <= today() && expiry >= made,
          'Datas de fabricação e validade inconsistentes.'
        )
        const q = round(number(payload.quantidade, 'Quantidade', 0.001))
        target = {
          id: uid(),
          codigo: code,
          tipo: 'ingrediente',
          ingredienteId: payload.ingredienteId,
          fornecedorId: payload.fornecedorId,
          quantidadeInicial: q,
          saldo: q,
          fabricacao: made,
          validade: expiry,
          status: expiry >= today() ? 'liberado' : 'bloqueado'
        }
        s.lotes.push(target)
        move(target, q, 'entrada', 'Recebimento de demonstração')
        break
      }
      case 'adjustLot': {
        const l = get(s.lotes, payload.id)
        target = l
        before = clone(l)
        requireThat(
          l.tipo === 'ingrediente',
          'Ajuste demonstrativo disponível apenas para matéria-prima.'
        )
        const q = round(number(payload.saldo, 'Novo saldo'))
        const reason = text(payload.justificativa, 'Justificativa')
        move(l, round(q - l.saldo), 'ajuste', reason)
        l.saldo = q
        break
      }
      case 'saveClient': {
        const cnpj = text(payload.cnpj, 'CNPJ').replace(/\D/g, '')
        requireThat(
          validCnpj(cnpj),
          'CNPJ inválido: confira os dígitos verificadores.'
        )
        requireThat(
          !s.clientes.some(c => c.cnpj.replace(/\D/g, '') === cnpj),
          'CNPJ já cadastrado.'
        )
        target = {
          id: uid(),
          cnpj,
          razaoSocial: text(payload.razaoSocial, 'Razão social'),
          nomeFantasia: text(payload.nomeFantasia, 'Nome fantasia'),
          inscricaoEstadual: text(
            payload.inscricaoEstadual,
            'Inscrição estadual'
          ),
          endereco: text(payload.endereco, 'Endereço'),
          contato: text(payload.contato, 'Contato'),
          vendedorId: user.perfil === 'comercial' ? user.id : 'vendedor',
          limiteCentavos: 0,
          exposicaoInicialCentavos: 0,
          situacaoFinanceira: 'regular',
          tabela: 'Tabela demonstração 2026',
          ativo: true,
          historicoFinanceiro: []
        }
        s.clientes.push(target)
        result = target.id
        break
      }
      case 'savePricingSettings': {
        const margins = (payload.cenariosLucratividade || []).map(
          (value, index) => number(value, `Lucratividade ${index + 1}`, 0)
        )
        requireThat(
          margins.length > 0,
          'Informe ao menos um cenário de lucratividade.'
        )
        requireThat(
          new Set(margins).size === margins.length,
          'Os cenários de lucratividade não podem se repetir.'
        )
        const charges = (payload.encargosFixos || []).map(item => ({
          nome: text(item.nome, 'Nome do encargo'),
          percentual: number(item.percentual, 'Percentual do encargo')
        }))
        requireThat(
          charges.reduce((sum, item) => sum + item.percentual, 0) < 100,
          'A soma dos encargos deve ser menor que 100%.'
        )
        target = s.configuracoes || (s.configuracoes = {})
        before = clone(target.precificacao || null)
        target.precificacao = {
          margemPadrao: number(payload.margemPadrao, 'Lucratividade padrão'),
          cenariosLucratividade: margins,
          encargosFixos: charges,
          financeiroCentavosKg: Math.round(
            number(payload.financeiroCentavosKg, 'Financeiro por kg', 0) * 100
          ),
          maoDeObraCentavosKg: Math.round(
            number(payload.maoDeObraCentavosKg, 'Mão de obra por kg', 0) * 100
          ),
          outrosCustosCentavosKg: Math.round(
            number(payload.outrosCustosCentavosKg, 'Outros custos por kg', 0) *
              100
          )
        }
        break
      }
      case 'createProduct': {
        const source = get(
          s.produtos,
          payload.sourceProductId || s.produtos.find(p => p.formulaId)?.id
        )
        const sourceFormula = get(s.formulas, source.formulaId)
        const code = text(payload.codigo, 'Código do produto')
        const name = text(payload.nome, 'Nome do produto')
        requireThat(
          !s.produtos.some(p => p.codigo.toLowerCase() === code.toLowerCase()),
          'Código do produto já cadastrado.'
        )
        const formula = {
          ...clone(sourceFormula),
          id: uid(),
          codigo: text(
            payload.formulaCodigo || `${code}-FORM`,
            'Código da fórmula'
          ),
          nome: text(payload.formulaNome || name, 'Nome da fórmula'),
          versao: 1,
          status: 'emDesenvolvimento',
          observacoes: text(
            payload.observacoes ||
              'Fórmula criada a partir de produto existente.',
            'Observações',
            false
          )
        }
        requireThat(
          !s.formulas.some(
            f => f.codigo.toLowerCase() === formula.codigo.toLowerCase()
          ),
          'Código da fórmula já cadastrado.'
        )
        s.formulas.push(formula)
        const productPricing = {
          margemPercentual: Number(
            payload.margem ?? source.precificacao?.margemPercentual ?? 60
          ),
          historico: []
        }
        if (source.precificacao?.embalagemCentavosKg != null)
          productPricing.embalagemCentavosKg =
            source.precificacao.embalagemCentavosKg
        target = {
          ...clone(source),
          id: uid(),
          codigo: code,
          nome: name,
          categoria: text(payload.categoria || source.categoria, 'Categoria'),
          formulaId: formula.id,
          status: 'emDesenvolvimento',
          precoCentavos: 0,
          precoLiberado: false,
          precificacao: productPricing
        }
        s.produtos.push(target)
        result = target.id
        break
      }
      case 'saveLabel': {
        const e = get(s.etiquetas, payload.id)
        target = e
        before = clone(e)
        e.nome = text(payload.nome, 'Nome')
        e.conteudo = text(payload.conteudo, 'Dados da etiqueta')
        for (const field of [
          'descricaoProduto',
          'textoRegulatorio',
          'alergicos',
          'gluten',
          'modoUso',
          'conservacao',
          'fabricante',
          'slogan'
        ])
          e[field] = text(payload[field], field, false)
        e.observacoes = text(payload.observacoes, 'Observações', false)
        break
      }
      case 'saveOpLabels': {
        const x = op()
        x.etiquetas = [
          {
            etiquetaId: 'etq1',
            quantidade: Math.round(
              number(payload.pequena, 'Quantidade pequena')
            )
          },
          {
            etiquetaId: 'etq2',
            quantidade: Math.round(number(payload.grande, 'Quantidade grande'))
          }
        ].filter(i => i.quantidade > 0)
        target = x
        break
      }
      case 'createVersion': {
        const f = get(s.formulas, payload.id)
        const rows = payload.itens.map(i => ({
          ingredienteId: i.ingredienteId,
          quantidade: round(number(i.quantidade, 'Quantidade de ingrediente'))
        }))
        requireThat(
          rows.length === f.itens.length &&
            rows.every((i, n) => i.ingredienteId === f.itens[n].ingredienteId),
          'Ingredientes inválidos.'
        )
        const yieldKg = number(payload.rendimento, 'Rendimento', 0.001)
        requireThat(
          Math.abs(rows.reduce((n, i) => n + i.quantidade, 0) - yieldKg) <
            0.001,
          'Na demonstração, a soma dos ingredientes deve ser igual ao rendimento.'
        )
        target = {
          ...clone(f),
          id: uid(),
          versao:
            Math.max(
              ...s.formulas
                .filter(x => x.codigo === f.codigo)
                .map(x => x.versao)
            ) + 1,
          status: 'emDesenvolvimento',
          rendimento: yieldKg,
          itens: rows,
          observacoes: text(payload.justificativa, 'Justificativa da versão')
        }
        s.formulas.push(target)
        break
      }
      case 'activateVersion': {
        const f = get(s.formulas, payload.id)
        target = f
        before = clone(f)
        requireThat(
          f.status === 'emDesenvolvimento',
          'Apenas versões em desenvolvimento podem ser ativadas.'
        )
        f.status = 'ativa'
        f.ativacao = {
          usuario: user.nome,
          data: now,
          justificativa: text(
            payload.justificativa,
            'Justificativa de ativação'
          )
        }
        // Mantém a versão anterior ativa para OPs já planejadas; não sobrescreve snapshots.
        s.produtos
          .filter(
            p => p.formulaId && get(s.formulas, p.formulaId).codigo === f.codigo
          )
          .forEach(p => {
            p.formulaId = f.id
            p.precoLiberado = false
          })
        break
      }
      case 'releasePrice': {
        const p = get(s.produtos, payload.id)
        target = p
        before = clone(p)
        requireThat(
          p.formulaId && get(s.formulas, p.formulaId).status === 'ativa',
          'Produto precisa de fórmula ativa.'
        )
        const volumeTipo = text(
            payload.volumeTipo ?? p.volumeTipo,
            'Tipo de volume'
          ),
          unitsPerVolume = number(
            payload.unidadesPorVolume ?? p.unidadesPorVolume,
            'Unidades por volume',
            1
          ),
          maxUnitsPerVolume = number(
            payload.limiteUnidadesPorVolume ?? p.limiteUnidadesPorVolume,
            'Limite de unidades por volume',
            1
          )
        requireThat(
          Number.isInteger(unitsPerVolume) &&
            Number.isInteger(maxUnitsPerVolume) &&
            unitsPerVolume <= maxUnitsPerVolume,
          'Configuração de volume inválida para o produto.'
        )
        const pricingProduct = {
          ...p,
          precificacao: {
            ...(p.precificacao || {}),
            margemPercentual: payload.margem
          }
        }
        const sim = priceSimulation(s, pricingProduct, payload.margem)
        const approvedKg = payload.precoVendaKg
          ? Math.round(
              number(payload.precoVendaKg, 'Preço comercial por kg', 0) * 100
            )
          : sim.precoKgCentavos
        const snapshot = {
          ...clone(sim),
          formulaId: p.formulaId,
          produtoId: p.id,
          precoCalculadoKgCentavos: sim.precoKgCentavos,
          precoVendaKgCentavos: approvedKg,
          motivoAjuste: text(
            payload.motivoAjuste,
            'Motivo do ajuste',
            approvedKg !== sim.precoKgCentavos
          ),
          status: 'APROVADO',
          data: now,
          usuario: user.nome
        }
        p.volumeTipo = volumeTipo
        p.unidadesPorVolume = unitsPerVolume
        p.limiteUnidadesPorVolume = maxUnitsPerVolume
        p.precoCentavos = sim.precoCentavos
        p.precoLiberado = true
        p.precificacao = {
          ...(p.precificacao || {}),
          margemPercentual: Number(payload.margem),
          historico: p.precificacao?.historico || []
        }
        p.precificacao.historico = [
          ...(p.precificacao.historico || []),
          snapshot
        ]
        p.liberacaoPreco = snapshot
        p.precoCalculadoKgCentavos = sim.precoKgCentavos
        p.precoVendaKgCentavos = approvedKg
        p.precoCentavos = Math.round(approvedKg * p.pesoKg)
        break
      }
      case 'toggleUser': {
        const u = get(s.usuarios, payload.id)
        requireThat(
          u.id !== user.id,
          'Você não pode desativar sua própria sessão.'
        )
        target = u
        before = { id: u.id, ativo: u.ativo }
        u.ativo = !u.ativo
        break
      }
      default:
        throw new Error('Ação desconhecida.')
    }
    audit(
      target?.numero || target?.codigo || target?.id,
      before,
      action === 'toggleUser' ? { id: target.id, ativo: target.ativo } : target
    )
    s.revision++
    return { state: s, id: result || target?.id }
  }
  function demoSeed() {
    let s = seed()
    const admin = s.usuarios[0]
    const run = (a, p) => {
      const r = execute(s, admin, a, p)
      s = r.state
      return r.id
    }
    const create = (client, items, note) =>
      run('saveOrder', {
        clienteId: client,
        itens: items,
        prazoEntrega: day(15),
        condicoesPagamentoDias: [14, 20],
        condicoesComerciais: '30/60 dias',
        observacoes: note
      })
    const p1 = create(
      'c1',
      [
        { produtoId: 'p1', quantidade: 20 },
        { produtoId: 'p2', quantidade: 5 }
      ],
      'Cenário completo: duas OPs, 200 kg totais.'
    )
    run('submitOrder', { id: p1 })
    const p2 = create(
      'c2',
      [{ produtoId: 'p2', quantidade: 10 }],
      'Cenário de restrição financeira.'
    )
    run('submitOrder', { id: p2 })
    const p3 = create(
      'c1',
      [{ produtoId: 'p1', quantidade: 10 }],
      'Cenário operacional pronto para produzir.'
    )
    run('submitOrder', { id: p3 })
    run('analyze', {
      id: p3,
      decisao: 'liberado',
      justificativa: 'Crédito disponível no cenário.'
    })
    run('approveOrder', { id: p3 })
    run('createOps', { id: p3 })
    s.revision = 0
    return s
  }
  function emptySeed() {
    const s = seed()
    // Keep synthetic reference data so the empty presentation can still run a new order.
    for (const key of [
      'recebiveis',
      'pedidos',
      'ordens',
      'movimentacoes',
      'auditoria'
    ])
      s[key] = []
    s.seq = { pedido: 1000, op: 0, lote: 0 }
    return s
  }
  function validateState(s) {
    requireThat(
      s?.schemaVersion === VERSION && Number.isInteger(s.revision) && s.seq,
      'Dados de demonstração incompatíveis.'
    )
    for (const key of [
      'usuarios',
      'clientes',
      'produtos',
      'formulas',
      'ingredientes',
      'fornecedores',
      'etiquetas',
      'recebiveis',
      'lotes',
      'pedidos',
      'ordens',
      'movimentacoes',
      'auditoria'
    ])
      requireThat(Array.isArray(s[key]), 'Arquivo de demonstração incompleto.')
    return s
  }
  return {
    VERSION,
    profiles,
    labels,
    releases,
    permissions,
    can,
    clone,
    today,
    day,
    addDays,
    productionDeadline,
    productionPriority,
    get,
    seed,
    demoSeed,
    emptySeed,
    execute,
    orderTotal,
    volumeCount,
    orderVolumeCount,
    installmentPlan,
    commission,
    credit,
    requirements,
    eligibleLots,
    suggestConsumption,
    orderStockAvailability,
    billingIssues,
    stage,
    visibleOrders,
    visibleClients,
    formulaCost,
    priceSimulation,
    priceScenarios,
    validCnpj,
    validateState
  }
})
