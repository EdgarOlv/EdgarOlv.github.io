/* Domínio da demonstração: sem DOM, pronto para testes e tradução em casos de uso Dart.
   Não é backend nem barreira de segurança. Todos os dados são sintéticos. */
;(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.Realtech = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict'
  const VERSION = 12
  const clone = value => JSON.parse(JSON.stringify(value))
  const round = value => Math.round(value * 1000) / 1000
  const roundFormula = value => Math.round(value * 100000) / 100000
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
    amostra: 'Amostra',
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
      version: 'v16', date: '2026-10-09', current: true,
      title: 'Fornecedores e login simplificado',
      summary: 'Cadastro conectado ao recebimento e instruções de acesso em modal.',
      changes: [
        { area: 'Estoque', title: 'Fornecedores', description: 'Cadastrar, editar e inativar; novos recebimentos selecionam somente ativos, mantendo vínculos existentes.', rules: ['RN-FOR-001'], status: 'Solicitação confirmada; detalhes demonstrados', route: 'fornecedores' },
        { area: 'Acesso', title: 'Card único de login', description: 'Perfis, modo de dados e instruções estão no botão de ajuda.', rules: ['RN-UX-003'], status: 'Solicitação confirmada', route: 'guia' }
      ]
    },
    {
      version: 'v15', date: '2026-10-05', current: false,
      title: 'Pedidos em kg e planejamento de batidas',
      summary: 'Novos pedidos e amostras em kg, linhas clicáveis e fórmula com totais, INS e etiquetas.',
      changes: [
        { area: 'Pedidos e Qualidade', title: 'Escolha o produto e quantos kg produzir', description: 'Base de 1 kg, inclusive para amostras. Embalagens e volumes seguem o cadastro; históricos em unidades são preservados.', rules: ['RN-PED-007'], status: 'Confirmada em reunião', route: 'amostras' },
        { area: 'Produção', title: 'Modificar batidas', description: 'Máximo editável e número de batidas recalculam entre si. Fórmula apresenta totais, INS, etiquetas e lote sem barras. Padrão de 50 kg demonstrativo.', rules: ['RN-OP-003','RN-OP-002'], status: 'Confirmada; padrão demonstrativo', route: 'producao' },
        { area: 'Navegação', title: 'Abrir pela linha inteira', description: 'Linhas abrem detalhes também com Enter ou Espaço; botões de alteração continuam explícitos.', rules: ['RN-UX-002'], status: 'Confirmada em reunião', route: 'dashboard' }
      ]
    },
    {
      version: 'v14', date: '2026-10-05', current: false,
      title: 'P&D: rascunhos, orçamento e embalagens',
      summary: 'Rascunhos são editados sem gerar versões extras; orçamento disponível antes de salvar e catálogo de embalagens em kg ou litros.',
      changes: [
        { area: 'P&D · Fórmulas', title: 'Versão somente na ativação', description: 'Continuar editando salva o mesmo rascunho. A ativação define v1, v2 e seguintes; pedidos e OPs preservam seus snapshots.', status: 'Confirmada em reunião', rules: ['RN-PD-006'], route: 'formulas' },
        { area: 'P&D · Orçamento', title: 'Simulação durante a criação', description: 'Orçamento usa a composição em edição e a embalagem escolhida, sem liberar preço comercial.', status: 'Confirmada em reunião', rules: ['RN-PD-007'], route: 'formulas' },
        { area: 'P&D · Embalagens', title: 'Capacidade, custo e sugestão', description: 'Cadastro de tipo/capacidade em kg ou litros e custo unitário. Litros usam peso líquido manual em kg; embalagem não altera o rendimento.', status: 'Confirmada; sugestão demonstrada', rules: ['RN-EMB-001', 'RN-EMB-002'], route: 'embalagens' }
      ]
    },
    {
      version: 'v13', date: '2026-10-05', current: false,
      title: 'Busca e cenários para apresentação',
      summary: 'Busca em Clientes, Produtos e Ordens de produção; oito cenários conectados e guia com a etapa atual de cada pedido.',
      changes: [{ area: 'Apresentação', title: 'Busca e dados explicativos', description: 'Busca sem acentos, CNPJ com ou sem pontuação e cenários de rascunho até despacho com parcelas abertas.', rules: ['RN-UX-001', 'RN-DEMO-001'], status: 'Demonstrada', route: 'guia' }]
    },
    {
      version: 'v12',
      date: '2026-09-30',
      current: false,
      title: 'Etiquetas oficiais grande e pequena',
      summary:
        'Os dois modelos passam a seguir as referências oficiais e suas medidas físicas de 105 × 105 mm e 105 × 58 mm.',
      changes: [
        {
          area: 'Documentação e homologação',
          title: 'Consolidação final para Flutter — 01/10/2026',
          description:
            'Contrato consolidado com impactos API/banco e roteiro final de 14 cenários. A pequena foi corrigida para 105 × 58 mm; a calibração física e as pendências de negócio permanecem explícitas.',
          rules: ['RN-ETQ-006', 'RN-GOV-001'],
          status: 'Documentado; homologação final pendente',
          route: 'guia'
        },
        {
          area: 'Produção e etiquetas',
          title: 'Dois layouts oficiais com impressão em escala física',
          description:
            'A etiqueta grande mantém cliente e pictograma de alergênicos; o nome completo do cliente ajusta a fonte à largura e altura disponíveis, sem invadir divisórias. A pequena usa a composição própria sem cliente. Cada modelo seleciona sua página de impressão em milímetros.',
          rules: ['RN-ETQ-006'],
          status: 'Confirmada; calibração da impressora pendente',
          route: 'etiquetas'
        }
      ]
    },
    {
      version: 'v11',
      date: '2026-09-29',
      current: false,
      title: 'Tratamento de especiarias e aromatizantes',
      summary:
        'A declaração passa a resumir aromatizantes e a detalhar especiarias somente quando o grupo ultrapassa 25% da fórmula.',
      changes: [
        {
          area: 'P&D, Qualidade e etiquetas',
          title: 'Exceções por categoria funcional',
          description:
            'Aromatizantes aparecem apenas pelo nome do grupo. Especiarias aparecem apenas pelo grupo até 25% e listam seus nomes, sem percentual, quando a soma ultrapassa 25% da fórmula.',
          rules: ['RN-ING-006'],
          status: 'Confirmada',
          route: 'ingredientes'
        }
      ]
    },
    {
      version: 'v10',
      date: '2026-09-28',
      current: false,
      title: 'Padronização e ordenação da declaração de ingredientes',
      summary:
        'Ingredientes recebem grupo, categoria funcional e regra de percentual; o texto do rótulo passa a respeitar a composição da fórmula do maior para o menor.',
      changes: [
        {
          area: 'P&D, Qualidade e etiquetas',
          title: 'Declaração calculada pela fórmula',
          description:
            'Bases aparecem primeiro e os demais ingredientes são agrupados pela categoria funcional e ordenados pela participação total. Percentuais ficam restritos a sal e INS 250/251.',
          rules: ['RN-ING-004', 'RN-ETQ-005'],
          status: 'Confirmada',
          route: 'ingredientes'
        },
        {
          area: 'Cadastros',
          title: 'Grupos padronizados',
          description:
            'Ingredientes e produtos registram o grupo 01 a 04 da padronização informada; ingredientes também usam uma categoria funcional controlada.',
          rules: ['RN-ING-005'],
          status: 'Confirmada',
          route: 'ingredientes'
        }
      ]
    },
    {
      version: 'v9',
      date: '2026-09-28',
      current: false,
      title: 'Fórmula para produção, composição declarada e etiqueta por data',
      summary:
        'O produto passa a guardar validade e a declaração “Contém”; o Documento da OP reúne os dados completos da fórmula para produção e a etiqueta usa a data de impressão como lote.',
      changes: [
        {
          area: 'Qualidade e P&D',
          title: '“Contém” dinâmico e validade no produto',
          description:
            'A declaração é construída a partir dos ingredientes marcados, usando sua categoria e INS quando disponível, e permanece editável junto da validade do produto.',
          rules: ['RN-PD-004'],
          status: 'Confirmada; texto regulatório pendente de homologação',
          route: 'formulas'
        },
        {
          area: 'Produção',
          title: 'Documento completo da fórmula para produção',
          description:
            'A consulta da OP apresenta identificação, quantidades, embalagem, modo de uso, declaração “Contém” e composição calculada para a batida.',
          rules: ['RN-OP-002'],
          status: 'Confirmada; campos de assinatura pendentes',
          route: 'producao'
        },
        {
          area: 'Etiquetas',
          title: 'Lote igual à data de impressão',
          description:
            'A prévia abre com a data atual como lote, sem campo separado de fabricação; a validade vem do lote produzido ou do cadastro do produto.',
          rules: ['RN-ETQ-003'],
          status: 'Confirmada',
          route: 'etiquetas'
        }
      ]
    },
    {
      version: 'v8',
      date: '2026-09-24',
      current: false,
      title: 'Cadastro operacional de ingredientes',
      summary:
        'Ingredientes passam a ter CRUD próprio e alimentam o recebimento de matéria-prima e a composição inicial de produtos conforme o estoque disponível.',
      changes: [
        {
          area: 'Operação e estoque',
          title: 'Cadastro central de ingredientes',
          description:
            'Nome, código, INS e categoria são mantidos em um único cadastro; registros em uso não podem ser excluídos.',
          rules: ['RN-ING-001', 'RN-ING-002'],
          status: 'Demonstrada',
          route: 'ingredientes'
        },
        {
          area: 'P&D e produtos',
          title: 'Composição inicial baseada no estoque',
          description:
            'Ao criar um produto, a seleção da fórmula inicial oferece ingredientes com saldo em lotes liberados e válidos.',
          rules: ['RN-ING-003'],
          status: 'Demonstrada',
          route: 'formulas'
        }
      ]
    },
    {
      version: 'v7',
      date: '2026-09-24',
      current: false,
      title: 'Fórmulas precisas e precificação por produto',
      summary:
        'P&D mantém composição dinâmica com cinco casas decimais e ajusta por produto os parâmetros herdados da política padrão.',
      changes: [
        {
          area: 'P&D e precificação',
          title: 'Parâmetros próprios por produto',
          description:
            'A formação de preço apresenta os padrões em um card editável; a variação fica salva no produto sem alterar os padrões globais.',
          rules: ['RN-PD-001'],
          status: 'Confirmada',
          route: 'formulas'
        },
        {
          area: 'P&D e fórmulas',
          title: 'Composição dinâmica e conferência do rendimento',
          description:
            'Ingredientes podem ser adicionados ou removidos, quantidades aceitam cinco casas decimais e o sistema mostra soma, falta ou excesso.',
          rules: ['RN-PD-002', 'RN-PD-003'],
          status: 'Confirmada',
          route: 'formulas'
        }
      ]
    },
    {
      version: 'v6',
      date: '2026-09-17',
      current: false,
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
        'embalagens',
        'precificacao',
        'producao',
        'etiquetas',
        'estoque',
        'fornecedores',
        'ingredientes',
        'qualidade',
        'amostras',
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
        'ingredientes',
        'relatorios',
        'guia'
      ]
    },
    qualidade: {
      label: 'Qualidade',
      description: 'Inspecione lotes e consulte a rastreabilidade.',
      modules: [
        'dashboard',
        'producao',
        'qualidade',
        'amostras',
        'relatorios',
        'guia'
      ]
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
        'embalagens',
        'precificacao',
        'fornecedores',
        'ingredientes',
        'amostras',
        'relatorios',
        'guia'
      ]
    },
    estoque: {
      label: 'Estoque',
      description: 'Receba lotes e registre ajustes justificados.',
      modules: ['dashboard', 'fornecedores', 'ingredientes', 'estoque', 'relatorios', 'guia']
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
    saveOrder: ['comercial', 'qualidade'],
    submitOrder: ['comercial'],
    approveOrder: ['comercial'],
    cancelOrder: ['comercial'],
    analyze: ['financeiro'],
    createOps: ['producao', 'qualidade'],
    modifyBatches: ['producao', 'qualidade'],
    issueSheet: ['producao', 'qualidade'],
    startOp: ['producao', 'qualidade'],
    reportProduction: ['producao', 'qualidade'],
    inspect: ['qualidade'],
    bill: ['fiscal'],
    dispatch: ['fiscal', 'qualidade'],
    confirmDelivery: ['fiscal', 'qualidade'],
    receiveLot: ['estoque'],
    adjustLot: ['estoque'],
    saveSupplier: ['estoque', 'pd'],
    saveIngredient: ['estoque', 'pd'],
    deleteIngredient: ['estoque', 'pd'],
    saveClient: ['comercial'],
    editLabel: ['producao'],
    saveLabel: ['producao'],
    editOpLabels: ['producao'],
    saveOpLabels: ['producao'],
    savePackaging: ['pd'],
    createVersion: ['pd'],
    activateVersion: ['pd'],
    createProduct: ['pd'],
    saveProduct: ['pd'],
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
  function packageCount(item) {
    return item.unidade === 'KG'
      ? Math.ceil(item.quantidade / (item.pesoEmbalagemKg || 1))
      : item.quantidade
  }
  function volumeCount(item) {
    const units = item.unidadesPorVolume || 1
    return Math.ceil(packageCount(item) / units)
  }
  function productBaseName(name) {
    return String(name).replace(/\s+\d+(?:[.,]\d+)?\s*(?:kg|l)\s*$/i, '').trim()
  }
  function compactLotDate(value = today()) {
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
    requireThat(match, 'Data do lote inválida.')
    return `${match[3]}${match[2]}${match[1]}`
  }
  function batchPlan(op, limit = null, count = null) {
    const totalKg = roundFormula(op.quantidadePrevista * op.pesoKg)
    const maxKg = number(limit ?? op.batidas?.maximoKg ?? 50, 'Quantidade máxima por batida', 0.00001)
    const batches = number(count ?? op.batidas?.quantidade ?? Math.ceil(totalKg / maxKg), 'Quantidade de batidas', 1)
    requireThat(Number.isInteger(batches) && batches <= 10000, 'Informe de 1 a 10.000 batidas inteiras.')
    requireThat(totalKg / batches <= maxKg + 0.00001, 'A quantidade por batida excede o máximo informado.')
    return { totalKg, maximoKg: maxKg, quantidade: batches, kgPorBatida: totalKg / batches, padraoMaquinaKg: 50 }
  }
  function productionFormulaRows(op, plan = batchPlan(op)) {
    const rows = op.formula.itens.map(item => ({
      ingredienteId: item.ingredienteId,
      percentual: roundFormula(item.quantidade / op.formula.rendimento * 100),
      formulaKg: roundFormula(item.quantidade),
      batidaKg: roundFormula(item.quantidade / op.formula.rendimento * plan.kgPorBatida),
      totalKg: roundFormula(item.quantidade / op.formula.rendimento * plan.totalKg)
    }))
    // Assign only display rounding residuals; do not rewrite formula quantities or stock consumption.
    const largest = rows.reduce((best, row, index) => row.formulaKg > rows[best].formulaKg ? index : best, 0)
    if (rows.length) for (const [field, total] of [['percentual', 100], ['batidaKg', roundFormula(plan.kgPorBatida)], ['totalKg', plan.totalKg]]) {
      rows[largest][field] = roundFormula(rows[largest][field] + total - rows.reduce((sum, row) => sum + row[field], 0))
    }
    return rows
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
  function sampleDispatchIssues(s, o) {
    const ops = s.ordens.filter(op => op.pedidoId === o.id),
      issues = []
    if (
      ops.length !== o.itens.length ||
      ops.some(op => op.status !== 'concluida')
    )
      issues.push('Todas as OPs concluídas')
    if (ops.some(op => !op.documentoOp)) issues.push('Documentos da OP gerados')
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
          const lot = get(s.lotes, id)
          return lot.validade < today() || lot.saldo < lot.quantidadeInicial
        })
      )
    )
      issues.push('Lotes válidos e saldo integral disponível')
    if (o.status === 'cancelado') issues.push('Pedido cancelado')
    return issues
  }
  function stage(s, o) {
    if (o.status === 'cancelado') return 'Cancelado'
    if (o.tipo === 'amostra') {
      if (o.entrega) return 'Entregue'
      if (o.despacho) return 'Despachada'
      const ops = s.ordens.filter(op => op.pedidoId === o.id)
      if (!ops.length)
        return orderStockAvailability(s, o).available
          ? 'Aguardando produção'
          : 'Aguardando estoque'
      if (ops.some(op => op.status !== 'concluida')) return 'Produção'
      if (
        ops.some(op =>
          op.lotes.some(id => get(s.lotes, id).status === 'pendente')
        )
      )
        return 'Aguardando qualidade'
      if (
        ops.some(op =>
          op.lotes.some(id => get(s.lotes, id).status === 'reprovado')
        )
      )
        return 'Reprovada pela qualidade'
      return 'Pronta para despacho'
    }
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
  function packagingSeed() {
    return [
      { id: 'emb-balde5', codigo: 'EMB-001', nome: 'Balde alimentício 5 kg', tipo: 'Balde', capacidade: 5, unidadeCapacidade: 'KG', custoCentavos: 450, ativo: true },
      { id: 'emb-saco20', codigo: 'EMB-002', nome: 'Saco multicamadas 20 kg', tipo: 'Saco', capacidade: 20, unidadeCapacidade: 'KG', custoCentavos: 200, ativo: true },
      { id: 'emb-bombona20', codigo: 'EMB-003', nome: 'Bombona alimentícia 20 L', tipo: 'Bombona', capacidade: 20, unidadeCapacidade: 'L', custoCentavos: 1200, ativo: true },
      { id: 'emb-pote1', codigo: 'EMB-004', nome: 'Pote alimentício 1 kg', tipo: 'Pote', capacidade: 1, unidadeCapacidade: 'KG', custoCentavos: 180, ativo: true }
    ]
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
      ['i1', 'Ácido cítrico', '330', 'Acidulantes', '01', false, 850],
      [
        'i2',
        'Glutamato monossódico',
        '621',
        'Realçadores de sabor',
        '01',
        false,
        1500
      ],
      ['i3', 'Sal refinado não iodado', '', 'Base da fórmula', '01', true, 200],
      [
        'i4',
        'Extrato de levedura',
        '',
        'Realçadores de sabor',
        '01',
        false,
        4500
      ]
    ].map(
      (
        [
          id,
          nome,
          ins,
          categoriaRotulagem,
          grupoPadronizacao,
          exibePercentualRotulo,
          custoCentavos
        ],
        n
      ) => ({
        id,
        codigo: `ING-00${n + 1}`,
        nome,
        ins,
        categoria: categoriaRotulagem,
        categoriaRotulagem,
        grupoPadronizacao,
        exibePercentualRotulo,
        custoCentavos,
        unidade: 'KG'
      })
    )
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
      embalagens: packagingSeed(),
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
          grupoPadronizacao: '02',
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
          precificacao: { margemPercentual: 60 },
          validade: '12 meses',
          contemItens: ['i1', 'i2', 'i4'],
          contem:
            'Acidulantes (INS 330), Realçadores de sabor (INS 621 e Extrato de levedura)',
          descricaoProduto:
            'Condimento preparado para produtos cárneos com aditivos.',
          alergenicosAtivo: true,
          alergenicosTexto: 'Contém derivados de soja.',
          naoContemGluten: true,
          modoUso:
            'Usar 1% sobre a massa ou conforme padrão de identidade e qualidade do produto e especificação técnica.',
          conservacao: 'Manter em local seco, fresco e arejado.'
        },
        {
          id: 'p2',
          codigo: 'PROD-002',
          nome: 'Realçador de Sabor B 20 kg',
          categoria: 'Realçadores',
          grupoPadronizacao: '02',
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
          precificacao: { margemPercentual: 60 },
          validade: '12 meses',
          contemItens: ['i2', 'i4'],
          contem: 'Realçadores de sabor (INS 621 e Extrato de levedura)',
          descricaoProduto: 'Realçador preparado para produtos alimentícios.',
          alergenicosAtivo: true,
          alergenicosTexto: 'Pode conter derivados de soja.',
          naoContemGluten: true,
          modoUso: 'Utilizar conforme a especificação técnica do produto.',
          conservacao: 'Manter em local seco, fresco e arejado.'
        },
        {
          id: 'p3',
          codigo: 'PROD-003',
          nome: 'Condimento Premium C',
          categoria: 'Condimentos',
          grupoPadronizacao: '02',
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
          tabela: 'Não liberada',
          validade: '',
          contemItens: [],
          contem: '',
          descricaoProduto: '',
          alergenicosAtivo: false,
          alergenicosTexto: '',
          naoContemGluten: false,
          modoUso: '',
          conservacao: ''
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
          nome: 'Etiqueta pequena oficial · 105 × 58 mm',
          tamanho: 'Pequena',
          dimensoesMm: { largura: 105, altura: 58 },
          conteudo:
            'Produto, ingredientes, alergênicos, modo de uso, fabricante, lote/data de impressão, validade e peso líquido',
          observacoes: 'Modelo oficial conforme referência visual recebida em 30/09/2026.'
        },
        {
          id: 'etq2',
          nome: 'Etiqueta grande oficial · 105 × 105 mm',
          tamanho: 'Grande',
          dimensoesMm: { largura: 105, altura: 105 },
          conteudo:
            'Produto, cliente, ingredientes, contém, lote/data de impressão, validade, peso líquido e instruções',
          descricaoProduto:
            'Condimento preparado para produtos cárneos com aditivos.',
          textoRegulatorio:
            'Para uso exclusivo em alimentos. Dispensado de registro conforme RDC 843/2024 e IN 281/2024.',
          alergicos: 'Pode conter soja.',
          gluten: 'Não contém glúten.',
          modoUso: '2% sobre a massa. Atender RTIQ do produto pronto.',
          conservacao: 'Manter em local seco, fresco e arejado.',
          fabricante:
            'REALTECH INDÚSTRIA E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA\nAV CLEMENTE TALARICO, 190 - SÃO CARLOS - SP\nCEP: 13563-882 - CNPJ: 60.708.408/0001-44\nCOMERCIALIZADO POR: CNPJ 35.155.744/0001-60.',
          slogan: 'QUALIDADE EM PRODUTOS E SERVIÇOS',
          observacoes:
            'Modelo oficial conforme referência visual recebida em 30/09/2026; redações variáveis continuam vinculadas ao produto.'
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
  function packagingSelection(s, payload, product) {
    if (!payload.embalagemId) return clone(product)
    const pack = get(s.embalagens, payload.embalagemId)
    requireThat(pack.ativo, 'Embalagem inativa. Escolha outra embalagem.')
    const weight = number(payload.pesoLiquidoKg, 'Peso líquido (kg)', 0.00001)
    const amount = pack.unidadeCapacidade === 'L'
      ? number(payload.volumeLitros, 'Volume preenchido (L)', 0.00001)
      : weight
    requireThat(amount <= pack.capacidade, 'Conteúdo excede a capacidade da embalagem.')
    return {
      ...clone(product), embalagemId: pack.id, embalagem: pack.nome,
      embalagemSnapshot: clone(pack), embalagemCentavos: pack.custoCentavos,
      pesoKg: weight, volumeLitros: pack.unidadeCapacidade === 'L' ? amount : null,
      precificacao: { ...(product.precificacao || {}), embalagemCentavosKg: pack.custoCentavos / weight }
    }
  }
  function suggestPackaging(s, unit, amount) {
    const quantity = number(amount, 'Conteúdo da embalagem', 0.00001)
    requireThat(['KG', 'L'].includes(unit), 'Unidade da embalagem inválida.')
    return s.embalagens.filter(pack => pack.ativo && pack.unidadeCapacidade === unit && pack.capacidade >= quantity)
      .slice().sort((a, b) => a.capacidade - b.capacidade || a.custoCentavos - b.custoCentavos)[0] || null
  }
  function draftBudget(s, payload) {
    const source = payload.sourceProductId ? get(s.produtos, payload.sourceProductId) : s.produtos.find(p => p.formulaId)
    const formula = {
      id: 'budget-draft', rendimento: number(payload.rendimento, 'Rendimento', 0.00001),
      itens: (payload.itens || []).map(item => ({ ingredienteId: get(s.ingredientes, item.ingredienteId).id, quantidade: number(item.quantidade, 'Quantidade', 0) }))
    }
    requireThat(formula.itens.length > 0, 'Inclua ingredientes para calcular o orçamento.')
    requireThat(new Set(formula.itens.map(i => i.ingredienteId)).size === formula.itens.length, 'Ingrediente duplicado no orçamento.')
    let product = { ...clone(source), formulaId: formula.id, precificacao: { ...(source.precificacao || {}), margemPercentual: number(payload.margem ?? pricingProfile(s, source).margemPercentual, 'Lucratividade') } }
    product = packagingSelection(s, payload, product)
    const transient = { ...s, formulas: [...s.formulas, formula] }
    const sim = priceSimulation(transient, product)
    return { ...sim, pesoKg: product.pesoKg, embalagem: product.embalagem,
      totalIngredientesKg: roundFormula(formula.itens.reduce((sum, item) => sum + item.quantidade, 0)),
      rendimentoKg: formula.rendimento, unidadesEmbalagem: Math.ceil(formula.rendimento / product.pesoKg),
      custoEmbalagensLoteCentavos: Math.ceil(formula.rendimento / product.pesoKg) * product.embalagemCentavos
    }
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
  function containsText(s, ingredientIds) {
    return [...new Set(ingredientIds || [])]
      .map(id => get(s.ingredientes, id))
      .map(
        i =>
          `${i.categoria || 'Ingrediente'}${i.ins ? ` INS ${i.ins}` : `: ${i.nome}`}`
      )
      .join('; ')
  }
  const functionalCategoryLabels = {
    Acidulantes: 'Acidulantes',
    Antioxidantes: 'Antioxidantes',
    Conservadores: 'Conservadores',
    Espessantes: 'Espessantes',
    'Reguladores de acidez': 'Reguladores de acidez',
    Corantes: 'Corantes',
    Umectantes: 'Umectantes',
    'Realçadores de sabor': 'Realçadores de sabor',
    Estabilizantes: 'Estabilizantes',
    Antiumectantes: 'Antiumectantes',
    Especiarias: 'Especiarias',
    Aromatizantes: 'Aromatizantes'
  }
  const allowedLabelCategories = [
    'Base da fórmula',
    ...Object.keys(functionalCategoryLabels),
    'Outros'
  ]
  const legacyLabelCategories = {
    Acidulante: 'Acidulantes',
    Antioxidante: 'Antioxidantes',
    Conservador: 'Conservadores',
    Espessante: 'Espessantes',
    Corante: 'Corantes',
    Umectante: 'Umectantes',
    'Realçador de sabor': 'Realçadores de sabor',
    Estabilizante: 'Estabilizantes',
    Antiumectante: 'Antiumectantes',
    Especiaria: 'Especiarias',
    Aromatizante: 'Aromatizantes'
  }
  function declarationPercent(value) {
    const rounded = Math.round(value * 100) / 100
    return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%'
  }
  function ingredientDeclaration(s, formula, ingredientIds) {
    if (!formula?.rendimento) return ''
    const selected = new Set(ingredientIds || [])
    const rows = formula.itens
      .filter(item => selected.has(item.ingredienteId))
      .map(item => ({
        ...item,
        ingredient: get(s.ingredientes, item.ingredienteId),
        percentual: (item.quantidade / formula.rendimento) * 100
      }))
    const renderItem = row =>
      `${row.ingredient.ins ? `INS ${row.ingredient.ins}` : row.ingredient.nome}${row.ingredient.exibePercentualRotulo ? ` (${declarationPercent(row.percentual)})` : ''}`
    const bases = rows
      .filter(row => row.ingredient.categoriaRotulagem === 'Base da fórmula')
      .sort((a, b) => b.quantidade - a.quantidade)
      .map(renderItem)
    const grouped = new Map()
    rows
      .filter(row => row.ingredient.categoriaRotulagem !== 'Base da fórmula')
      .forEach(row => {
        const category = functionalCategoryLabels[
          row.ingredient.categoriaRotulagem
        ]
          ? row.ingredient.categoriaRotulagem
          : row.ingredient.categoriaRotulagem || 'Outros'
        if (!grouped.has(category)) grouped.set(category, [])
        grouped.get(category).push(row)
      })
    const groups = [...grouped.entries()]
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => b.quantidade - a.quantidade),
        total: items.reduce((sum, item) => sum + item.quantidade, 0)
      }))
      .sort((a, b) => b.total - a.total)
      .map(group => {
        const label = functionalCategoryLabels[group.category] || group.category
        if (group.category === 'Aromatizantes') return label
        if (group.category === 'Especiarias') {
          const groupPercent = (group.total / formula.rendimento) * 100
          return groupPercent > 25
            ? `${label} (${group.items.map(item => item.ingredient.nome).join(', ')})`
            : label
        }
        return `${label} (${group.items.map(renderItem).join(' e ')})`
      })
    return [...bases, ...groups].join(', ')
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
    const fixedCharges = Array.isArray(legacy.encargosFixos)
      ? legacy.encargosFixos.map(item => ({
          nome: item.nome || 'Encargo',
          percentual: Number(item.percentual || 0)
        }))
      : Array.isArray(global?.encargosFixos)
        ? global.encargosFixos.map(item => ({
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
        legacy.financeiroCentavosKg ?? global?.financeiroCentavosKg ?? 125
      ),
      maoDeObraCentavosKg: Number(
        legacy.maoDeObraCentavosKg ?? global?.maoDeObraCentavosKg ?? 75
      ),
      outrosCustosCentavosKg: Number(
        legacy.outrosCustosCentavosKg ?? global?.outrosCustosCentavosKg ?? 0
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
    const requireSampleScope = o =>
      requireThat(
        user.perfil === 'administrador' ||
          (o.tipo === 'amostra'
            ? user.perfil === 'qualidade'
            : user.perfil !== 'qualidade'),
        'Este perfil não pode operar este pedido.'
      )
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
        unidade: unidade || (l.tipo === 'ingrediente' ? 'KG' : l.unidade || 'UN'),
        opId,
        data: now,
        responsavel: user.nome
      })
    switch (action) {
      case 'saveOrder': {
        const old = payload.id ? order() : null
        requireThat(
          !old ||
            old.status === 'rascunho' ||
            (old.tipo === 'amostra' &&
              old.status === 'amostra' &&
              !s.ordens.some(op => op.pedidoId === old.id)),
          'Pedido enviado ao Financeiro não pode ser editado. Crie um pedido complementar quando aplicável.'
        )
        const tipo = payload.tipo || old?.tipo || 'producao'
        requireThat(
          ['producao', 'amostra'].includes(tipo),
          'Tipo de pedido inválido.'
        )
        requireThat(
          user.perfil !== 'qualidade' || tipo === 'amostra',
          'A Qualidade só pode cadastrar amostras.'
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
          const isKg = payload.modoQuantidade === 'KG' || (old?.modoQuantidade === 'KG' && payload.modoQuantidade !== 'UN')
          const q = number(i.quantidade, 'Quantidade', isKg ? 0.001 : 1)
          requireThat(isKg ? Math.abs(q - round(q)) < 1e-9 : Number.isInteger(q),
            isKg ? 'Quantidades em kg aceitam até três casas decimais.' : 'Produtos em UN exigem quantidade inteira.')
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
            nome: isKg ? productBaseName(p.nome) : p.nome,
            unidade: isKg ? 'KG' : p.unidade,
            pesoKg: isKg ? 1 : p.pesoKg,
            pesoEmbalagemKg: p.pesoKg,
            embalagem: p.embalagem || '', embalagemId: p.embalagemId || null,
            embalagemSnapshot: clone(p.embalagemSnapshot || null), volumeLitros: p.volumeLitros ?? null,
            volumeTipo: p.volumeTipo,
            unidadesPorVolume: unitsPerVolume,
            limiteUnidadesPorVolume: maxUnitsPerVolume,
            quantidade: q,
            precoCentavos: isKg ? Math.round(p.precoCentavos / p.pesoKg) : p.precoCentavos,
            comissaoBps: p.comissaoBps,
            tabela: p.tabela,
            validade: p.validade || '',
            grupoPadronizacao: p.grupoPadronizacao || '02',
            contem: p.contem || '',
            contemItens: clone(p.contemItens || []),
            descricaoProduto: p.descricaoProduto || '',
            alergenicosAtivo: !!p.alergenicosAtivo,
            alergenicosTexto: p.alergenicosTexto || '',
            naoContemGluten: !!p.naoContemGluten,
            modoUso: p.modoUso || '',
            conservacao: p.conservacao || '',
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
          modoQuantidade: items.every(item => item.unidade === 'KG') ? 'KG' : 'UN',
          tipo,
          prazoEntrega: due,
          condicoesPagamentoDias:
            tipo === 'amostra'
              ? []
              : installmentPlan(
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
          status: tipo === 'amostra' ? 'amostra' : 'rascunho',
          statusAnalise: tipo === 'amostra' ? 'naoAplicavel' : 'pendente',
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
        requireSampleScope(o)
        requireThat(
          o.origem === 'sistema',
          'Pedido externo não pode gerar produção. Cadastre-o primeiro no sistema.'
        )
        requireThat(
          o.tipo === 'amostra'
            ? o.status === 'amostra'
            : o.status === 'aprovado' && o.aprovacao,
          o.tipo === 'amostra'
            ? 'A amostra não está disponível para produção.'
            : 'Pedido precisa de aprovação comercial.'
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
            unidade: i.unidade,
            pesoEmbalagemKg: i.pesoEmbalagemKg || i.pesoKg,
            volumeTipo: i.volumeTipo, unidadesPorVolume: i.unidadesPorVolume, limiteUnidadesPorVolume: i.limiteUnidadesPorVolume,
            formula: clone(i.formula),
            validade: i.validade || '',
            grupoPadronizacao: i.grupoPadronizacao || '02',
            contem: i.contem || '',
            contemItens: clone(i.contemItens || []),
            descricaoProduto: i.descricaoProduto || '',
            alergenicosAtivo: !!i.alergenicosAtivo,
            alergenicosTexto: i.alergenicosTexto || '',
            naoContemGluten: !!i.naoContemGluten,
            modoUso: i.modoUso || '',
            conservacao: i.conservacao || '',
            pesoKg: i.pesoKg,
            embalagem: i.embalagem || '', embalagemId: i.embalagemId || null,
            embalagemSnapshot: clone(i.embalagemSnapshot || null), volumeLitros: i.volumeLitros ?? null,
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
            etiquetas: [
              { etiquetaId: 'etq1', quantidade: 1 },
              { etiquetaId: 'etq2', quantidade: 2 }
            ]
          })
        })
        if (o.tipo !== 'amostra') o.status = 'emProducao'
        break
      }
      case 'modifyBatches': {
        const x = op()
        requireSampleScope(get(s.pedidos, x.pedidoId))
        requireThat(['aguardando', 'emProducao'].includes(x.status), 'Batidas só podem ser alteradas em uma OP aberta.')
        const plan = batchPlan(x, payload.maximoKg, payload.quantidadeBatidas)
        x.batidas = { ...plan, usuario: user.nome, atualizadoEm: now }
        if (x.documentoOp) {
          x.documentoOp.revisaoPlanejamento = (x.documentoOp.revisaoPlanejamento || 0) + 1
          x.documentoOp.batidas = clone(x.batidas)
          x.documentoOp.necessidades = requirements(x, plan.totalKg)
        }
        break
      }
      case 'issueSheet': {
        const x = op()
        requireSampleScope(get(s.pedidos, x.pedidoId))
        requireThat(x.status !== 'concluida', 'OP já concluída.')
        requireThat(!x.documentoOp, 'Documento da OP já gerado.')
        x.documentoOp = {
          numero: `DOC-${x.numero}`,
          versao: x.formula.versao,
          data: now,
          usuario: user.nome,
          batidas: batchPlan(x), revisaoPlanejamento: 0,
          necessidades: requirements(x, x.quantidadePrevista * x.pesoKg)
        }
        break
      }
      case 'startOp': {
        const x = op()
        requireSampleScope(get(s.pedidos, x.pedidoId))
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
        requireSampleScope(get(s.pedidos, x.pedidoId))
        requireThat(
          x.status === 'emProducao' && x.documentoOp,
          'OP precisa estar em produção e ter documento gerado.'
        )
        const isKg = x.unidade === 'KG'
        const q = number(payload.quantidade, 'Quantidade produzida', isKg ? 0.001 : 1)
        requireThat((isKg ? Math.abs(q - round(q)) < 1e-9 : Number.isInteger(q)) && q <= round(x.quantidadePrevista - x.quantidadeProduzida),
          isKg ? 'Informe kg com até três casas decimais, no máximo o saldo da OP.' : 'Informe UN inteiras, no máximo o saldo da OP.')
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
          unidade: x.unidade || 'UN',
          saldo: q,
          sobrasKg: surplus,
          fabricacao: today(),
          validade: expiry,
          status: 'pendente',
          inspecoes: []
        }
        s.lotes.push(lot)
        x.lotes.push(lot.id)
        move(lot, q, 'producao', x.numero, x.unidade || 'UN', x.id)
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
        x.quantidadeProduzida = round(x.quantidadeProduzida + q)
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
        requireSampleScope(o)
        requireThat(
          o.origem === 'sistema',
          'Pedido externo não pode ser despachado neste fluxo.'
        )
        requireThat(!o.despacho, 'Pedido já despachado.')
        const issues =
          o.tipo === 'amostra'
            ? sampleDispatchIssues(s, o)
            : billingIssues(s, o)
        requireThat(
          !issues.length,
          o.tipo === 'amostra'
            ? 'Há pendências de produção, qualidade ou validade.'
            : 'Há pendência de liberação ou validade nos lotes.'
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
          move(l, -l.saldo, 'despacho', o.numero, l.unidade || 'UN')
          l.saldo = 0
        })
        break
      }
      case 'confirmDelivery': {
        const o = order()
        requireSampleScope(o)
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
        requireThat(get(s.fornecedores, payload.fornecedorId).ativo !== false, 'Fornecedor inativo não pode receber novos lotes.')
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
      case 'saveSupplier': {
        const old = payload.id ? get(s.fornecedores, payload.id) : null
        const nome = text(payload.nome, 'Nome do fornecedor')
        const documento = text(payload.documento, 'Documento', false).toUpperCase()
        const normalized = value => value.replace(/[^A-Z0-9]/g, '')
        requireThat(!documento || !s.fornecedores.some(f => f.id !== old?.id && normalized((f.documento || '').toUpperCase()) === normalized(documento)), 'Documento já cadastrado.')
        before = old ? clone(old) : null
        target = old || { id: uid() }
        Object.assign(target, { nome, documento, contato: text(payload.contato, 'Contato', false), ativo: payload.ativo !== false })
        if (!old) s.fornecedores.push(target)
        break
      }
      case 'saveIngredient': {
        const ingredient = payload.id ? get(s.ingredientes, payload.id) : null
        const code = text(payload.codigo, 'Código')
        requireThat(
          !s.ingredientes.some(
            i =>
              i.id !== ingredient?.id &&
              i.codigo.toLowerCase() === code.toLowerCase()
          ),
          'Código de ingrediente já cadastrado.'
        )
        target = ingredient || {
          id: uid(),
          custoCentavos: 0,
          unidade: 'KG'
        }
        before = ingredient ? clone(ingredient) : null
        target.codigo = code
        target.nome = text(payload.nome, 'Nome')
        target.ins = text(payload.ins, 'INS', false)
        target.categoriaRotulagem = text(
          payload.categoriaRotulagem || payload.categoria,
          'Categoria de rotulagem'
        )
        target.categoriaRotulagem =
          legacyLabelCategories[target.categoriaRotulagem] ||
          target.categoriaRotulagem
        requireThat(
          allowedLabelCategories.includes(target.categoriaRotulagem),
          'Categoria de rotulagem inválida.'
        )
        target.categoria = target.categoriaRotulagem
        target.grupoPadronizacao = text(
          payload.grupoPadronizacao || '01',
          'Grupo padronizado'
        )
        requireThat(
          ['01', '02', '03', '04'].includes(target.grupoPadronizacao),
          'Grupo padronizado inválido.'
        )
        target.exibePercentualRotulo = !!payload.exibePercentualRotulo
        const percentAllowed =
          target.ins === '250' ||
          target.ins === '251' ||
          /(^|\s)sal(\s|$)|nitrito de s[oó]dio|nitrato de s[oó]dio/i.test(
            target.nome
          )
        requireThat(
          !target.exibePercentualRotulo || percentAllowed,
          'Percentual na etiqueta é permitido somente para sal, nitrito de sódio (INS 250) ou nitrato de sódio (INS 251).'
        )
        if (!ingredient) s.ingredientes.push(target)
        result = target.id
        break
      }
      case 'deleteIngredient': {
        const ingredient = get(s.ingredientes, payload.id)
        requireThat(
          !s.formulas.some(f =>
            f.itens.some(i => i.ingredienteId === ingredient.id)
          ),
          'Ingrediente vinculado a uma fórmula não pode ser excluído.'
        )
        requireThat(
          !s.lotes.some(l => l.ingredienteId === ingredient.id),
          'Ingrediente com lote registrado não pode ser excluído.'
        )
        target = ingredient
        before = clone(ingredient)
        s.ingredientes = s.ingredientes.filter(i => i.id !== ingredient.id)
        result = ingredient.id
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
      case 'savePackaging': {
        const old = payload.id ? get(s.embalagens, payload.id) : null
        before = old ? clone(old) : null
        const code = text(payload.codigo, 'Código da embalagem')
        requireThat(!s.embalagens.some(pack => pack.id !== old?.id && pack.codigo.toLocaleLowerCase('pt-BR') === code.toLocaleLowerCase('pt-BR')), 'Código da embalagem já cadastrado.')
        const unit = text(payload.unidadeCapacidade, 'Unidade de capacidade')
        requireThat(['KG', 'L'].includes(unit), 'Capacidade deve usar KG ou L.')
        target = { id: old?.id || uid(), codigo: code, nome: text(payload.nome, 'Nome da embalagem'), tipo: text(payload.tipo, 'Tipo da embalagem'),
          capacidade: number(payload.capacidade, 'Capacidade', 0.00001), unidadeCapacidade: unit,
          custoCentavos: Math.round(number(payload.custo, 'Custo unitário') * 100), ativo: payload.ativo !== false }
        if (old) Object.assign(old, target)
        else s.embalagens.push(target)
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
          versao: 0,
          status: 'emDesenvolvimento',
          observacoes: text(
            payload.observacoes ||
              'Fórmula criada a partir de produto existente.',
            'Observações',
            false
          )
        }
        if (Array.isArray(payload.itens)) {
          requireThat(payload.itens.length > 0, 'A fórmula deve ter ao menos um ingrediente.')
          const rows = payload.itens.map(i => ({
            ingredienteId: i.ingredienteId,
            quantidade: roundFormula(
              number(i.quantidade, 'Quantidade de ingrediente', 0)
            )
          }))
          requireThat(
            rows.every(i => s.ingredientes.some(x => x.id === i.ingredienteId)),
            'Ingrediente inválido.'
          )
          requireThat(
            new Set(rows.map(i => i.ingredienteId)).size === rows.length,
            'O mesmo ingrediente não pode aparecer mais de uma vez na fórmula.'
          )
          const yieldKg = number(payload.rendimento, 'Rendimento', 0.001)
          const totalIngredients = roundFormula(
            rows.reduce((sum, i) => sum + i.quantidade, 0)
          )
          requireThat(
            Math.abs(totalIngredients - yieldKg) < 0.00001,
            `A soma dos ingredientes é ${totalIngredients.toFixed(5)} kg; o rendimento é ${yieldKg.toFixed(5)} kg.`
          )
          formula.rendimento = yieldKg
          formula.itens = rows
        }
        requireThat(
          !s.formulas.some(
            f => f.codigo.toLowerCase() === formula.codigo.toLowerCase()
          ),
          'Código da fórmula já cadastrado.'
        )
        for (const field of ['ativacao', 'produtoId', 'apresentacaoRascunho', 'orcamentoMargem']) delete formula[field]
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
          grupoPadronizacao: text(
            payload.grupoPadronizacao || source.grupoPadronizacao || '02',
            'Grupo padronizado'
          ),
          formulaId: formula.id,
          status: 'emDesenvolvimento',
          precoCentavos: 0,
          precoLiberado: false,
          precificacao: productPricing
        }
        requireThat(
          ['01', '02', '03', '04'].includes(target.grupoPadronizacao),
          'Grupo padronizado do produto inválido.'
        )
        target.validade = text(
          payload.validade ?? source.validade,
          'Validade',
          false
        )
        target.contemItens = (
          payload.contemItens ||
          source.contemItens ||
          []
        ).filter(id => formula.itens.some(item => item.ingredienteId === id))
        target.contem = text(
          payload.contem ||
            ingredientDeclaration(s, formula, target.contemItens),
          'Contém',
          false
        )
        target = packagingSelection(s, payload, target)
        s.produtos.push(target)
        result = target.id
        break
      }
      case 'saveProduct': {
        const p = get(s.produtos, payload.id)
        target = p
        before = clone(p)
        const formula = p.formulaId ? get(s.formulas, p.formulaId) : null
        const allowedIds = new Set(
          (formula?.itens || []).map(item => item.ingredienteId)
        )
        const selected = [...new Set(payload.contemItens || [])]
        requireThat(
          selected.every(id => allowedIds.has(id)),
          'O campo Contém só pode usar ingredientes da fórmula atual.'
        )
        p.validade = text(payload.validade, 'Validade', false)
        p.contemItens = selected
        p.contem = text(
          payload.contem || ingredientDeclaration(s, formula, selected),
          'Contém',
          false
        )
        p.grupoPadronizacao = text(
          payload.grupoPadronizacao || p.grupoPadronizacao,
          'Grupo padronizado'
        )
        requireThat(
          ['01', '02', '03', '04'].includes(p.grupoPadronizacao),
          'Grupo padronizado do produto inválido.'
        )
        p.descricaoProduto = text(
          payload.descricaoProduto,
          'Descrição do produto',
          false
        )
        p.alergenicosAtivo = !!payload.alergenicosAtivo
        p.alergenicosTexto = text(
          payload.alergenicosTexto,
          'Declaração de alergênicos',
          p.alergenicosAtivo
        )
        p.naoContemGluten = !!payload.naoContemGluten
        p.modoUso = text(payload.modoUso, 'Modo de uso', false)
        p.conservacao = text(payload.conservacao, 'Conservação', false)
        if (payload.embalagemId) {
          const presentation = packagingSelection(s, payload, p)
          const changed = p.embalagemId !== presentation.embalagemId || p.pesoKg !== presentation.pesoKg || p.volumeLitros !== presentation.volumeLitros || p.embalagemCentavos !== presentation.embalagemCentavos
          Object.assign(p, presentation)
          if (changed) p.precoLiberado = false
        }
        break
      }
      case 'saveLabel': {
        const e = get(s.etiquetas, payload.id)
        target = e
        before = clone(e)
        e.nome = text(payload.nome, 'Nome')
        e.conteudo = text(payload.conteudo, 'Dados da etiqueta')
        for (const field of ['textoRegulatorio', 'fabricante', 'slogan'])
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
          quantidade: roundFormula(
            number(i.quantidade, 'Quantidade de ingrediente', 0)
          )
        }))
        requireThat(
          rows.length > 0,
          'A fórmula deve ter ao menos um ingrediente.'
        )
        requireThat(
          rows.every(i => s.ingredientes.some(x => x.id === i.ingredienteId)),
          'Ingrediente inválido.'
        )
        requireThat(
          new Set(rows.map(i => i.ingredienteId)).size === rows.length,
          'O mesmo ingrediente não pode aparecer mais de uma vez na fórmula.'
        )
        const yieldKg = number(payload.rendimento, 'Rendimento', 0.001)
        const totalIngredients = roundFormula(
          rows.reduce((n, i) => n + i.quantidade, 0)
        )
        requireThat(
          Math.abs(totalIngredients - yieldKg) < 0.00001,
          `A soma dos ingredientes é ${totalIngredients.toFixed(5)} kg; o rendimento é ${yieldKg.toFixed(5)} kg. Ajuste ${Math.abs(yieldKg - totalIngredients).toFixed(5)} kg antes de criar a versão.`
        )
        const existingDraft = f.status === 'emDesenvolvimento' ? f : s.formulas.find(x => x.codigo === f.codigo && x.status === 'emDesenvolvimento')
        before = existingDraft ? clone(existingDraft) : null
        target = {
          ...clone(existingDraft || f), id: existingDraft?.id || uid(), versao: 0,
          status: 'emDesenvolvimento', rendimento: yieldKg, itens: rows,
          observacoes: text(payload.justificativa, 'Justificativa da revisão')
        }
        delete target.ativacao
        const product = payload.produtoId ? get(s.produtos, payload.produtoId) : s.produtos.find(p => p.formulaId && get(s.formulas, p.formulaId).codigo === f.codigo)
        if (product) {
          requireThat(get(s.formulas, product.formulaId).codigo === f.codigo, 'Produto não pertence a esta fórmula.')
          target.produtoId = product.id
        }
        if (product && payload.embalagemId)
          target.apresentacaoRascunho = packagingSelection(s, payload, product)
        if (payload.orcamentoMargem != null) target.orcamentoMargem = number(payload.orcamentoMargem, 'Lucratividade')
        if (existingDraft) Object.assign(existingDraft, target)
        else s.formulas.push(target)
        if (product) {
          product.validade = text(
            payload.validade ?? product.validade,
            'Validade',
            false
          )
          product.contemItens = [
            ...new Set(payload.contemItens || product.contemItens || [])
          ].filter(id => rows.some(item => item.ingredienteId === id))
          product.contem = text(
            payload.contem ||
              ingredientDeclaration(
                s,
                { ...f, rendimento: yieldKg, itens: rows },
                product.contemItens
              ),
            'Contém',
            false
          )
        }
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
        if (f.apresentacaoRascunho?.embalagemId)
          requireThat(get(s.embalagens, f.apresentacaoRascunho.embalagemId).ativo, 'Embalagem do rascunho foi inativada. Revise antes de ativar.')
        f.versao = Math.max(0, ...s.formulas.filter(x => x.codigo === f.codigo && x.status !== 'emDesenvolvimento').map(x => x.versao || 0)) + 1
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
            if (f.apresentacaoRascunho && (!f.produtoId || f.produtoId === p.id)) {
              const presentation = f.apresentacaoRascunho
              for (const field of ['embalagemId', 'embalagem', 'embalagemSnapshot', 'embalagemCentavos', 'pesoKg', 'volumeLitros'])
                p[field] = clone(presentation[field] ?? null)
              p.precificacao = { ...(p.precificacao || {}), embalagemCentavosKg: presentation.embalagemCentavos / presentation.pesoKg }
            }
            if (f.orcamentoMargem != null && (!f.produtoId || f.produtoId === p.id)) p.precificacao = { ...(p.precificacao || {}), margemPercentual: f.orcamentoMargem }
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
        const currentProfile = pricingProfile(s, p)
        const pricingProduct = {
          ...p,
          precificacao: {
            ...(p.precificacao || {}),
            margemPercentual: payload.margem,
            financeiroCentavosKg: Math.round(
              number(
                payload.financeiroCentavosKg ??
                  currentProfile.financeiroCentavosKg / 100,
                'Financeiro por kg',
                0
              ) * 100
            ),
            maoDeObraCentavosKg: Math.round(
              number(
                payload.maoDeObraCentavosKg ??
                  currentProfile.maoDeObraCentavosKg / 100,
                'Mão de obra por kg',
                0
              ) * 100
            ),
            outrosCustosCentavosKg: Math.round(
              number(
                payload.outrosCustosCentavosKg ??
                  currentProfile.outrosCustosCentavosKg / 100,
                'Outros custos por kg',
                0
              ) * 100
            ),
            embalagemCentavosKg: Math.round(
              number(
                payload.embalagemCentavosKg ??
                  (p.precificacao?.embalagemCentavosKg ??
                    (p.embalagemCentavos || 0) / (p.pesoKg || 1)) / 100,
                'Embalagem por kg',
                0
              ) * 100
            ),
            encargosFixos: (
              payload.encargosFixos || currentProfile.encargosFixos
            ).map(item => ({
              nome: text(item.nome, 'Nome do encargo'),
              percentual: number(item.percentual, 'Percentual do encargo', 0)
            }))
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
          ...pricingProduct.precificacao,
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
    s.clientes.push(
      { ...clone(s.clientes[0]), id: 'c4', razaoSocial: 'Serra Dourada Alimentos Ltda — demonstração', nomeFantasia: 'Serra Dourada (teste)', cnpj: '00.000.000/0004-00', endereco: 'Rua das Indústrias, 240 · Curitiba/PR (fictício)', contato: 'Equipe de compras · serra@example.com', limiteCentavos: 2000000, exposicaoInicialCentavos: 0 },
      { ...clone(s.clientes[0]), id: 'c5', razaoSocial: 'Vale Verde Preparados Ltda — demonstração', nomeFantasia: 'Vale Verde (teste)', cnpj: '00.000.000/0005-00', endereco: 'Av. do Distrito Industrial, 80 · Ribeirão Preto/SP (fictício)', contato: 'Planejamento industrial · vale@example.com', limiteCentavos: 1500000, exposicaoInicialCentavos: 200000 }
    )
    s.produtos.push(
      { ...clone(s.produtos[0]), id: 'p4', codigo: 'DEMO-TEMP-01', nome: 'Tempero para linguiça — embalagem piloto (demo)', status: 'emDesenvolvimento', precoLiberado: false },
      { ...clone(s.produtos[1]), id: 'p5', codigo: 'DEMO-REAL-02', nome: 'Realçador — apresentação descontinuada (demo)', status: 'inativo', precoLiberado: false }
    )
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
        condicoesComerciais: 'Duas parcelas em 14 e 20 dias após o faturamento. Frete por conta do destinatário.',
        observacoes: note
      })
    const p1 = create(
      'c1',
      [
        { produtoId: 'p1', quantidade: 20 },
        { produtoId: 'p2', quantidade: 5 }
      ],
      'Cenário 1 — Análise financeira: 20 embalagens de 5 kg e 5 de 20 kg; 200 kg e R$ 2.300,00. Liberar, aprovar e gerar duas OPs.'
    )
    run('submitOrder', { id: p1 })
    const p2 = create(
      'c2',
      [{ produtoId: 'p2', quantidade: 10 }],
      'Cenário 2 — Crédito em restrição: consultar atrasos e limite disponível. Demonstrar bloqueio ou liberação com restrição e justificativa obrigatória.'
    )
    run('submitOrder', { id: p2 })
    const p3 = create(
      'c1',
      [{ produtoId: 'p1', quantidade: 10 }],
      'Cenário 3 — OP aguardando: emitir a Fórmula para produção, conferir etiquetas, iniciar e apontar 10 embalagens de 5 kg.'
    )
    run('submitOrder', { id: p3 })
    run('analyze', {
      id: p3,
      decisao: 'liberado',
      justificativa: 'Crédito disponível no cenário.'
    })
    run('approveOrder', { id: p3 })
    run('createOps', { id: p3 })
    // Build presentation scenarios through the same validated transitions as the UI.
    const operational = (note, quantity = 6) => {
      const id = create('c1', [{ produtoId: 'p1', quantidade: quantity }], note)
      run('submitOrder', { id })
      run('analyze', { id, decisao: 'liberado', justificativa: 'Cliente regular; exposição dentro do limite demonstrativo.' })
      run('approveOrder', { id })
      run('createOps', { id })
      return id
    }
    const produce = (id, quantity) => {
      const op = s.ordens.find(x => x.pedidoId === id)
      if (op.status === 'aguardando') {
        run('issueSheet', { id: op.id })
        run('startOp', { id: op.id })
      }
      return run('reportProduction', {
        id: op.id, quantidade: quantity, perdasKg: 0, sobrasKg: 0,
        validade: day(180), consumos: suggestConsumption(s, op, quantity * op.pesoKg),
        observacoes: 'Batida demonstrativa: conferir consumo por lote e rastreabilidade até o cliente.'
      })
    }
    create('c1', [{ produtoId: 'p2', quantidade: 2 }],
      'Cenário 4 — Rascunho: revisar quantidades e parcelas antes de enviar ao Financeiro; após o envio a edição é bloqueada.')
    const partial = operational('Cenário 5 — Produção parcial: 3 de 6 embalagens prontas. Apontar o saldo e mostrar que cada apontamento gera seu próprio lote.')
    produce(partial, 3)
    const quality = operational('Cenário 6 — Qualidade pendente: produção completa, lote aguardando inspeção. Aprovar o lote para liberar o faturamento.')
    produce(quality, 6)
    const billing = operational('Cenário 7 — Pronto para faturar: lote aprovado. Faturar para abrir duas parcelas e demonstrar o despacho sem exigir pagamento.')
    produce(billing, 6)
    for (const lot of s.lotes.filter(l => l.tipo === 'produto' && l.pedidoId === billing))
      run('inspect', { id: lot.id, decisao: 'aprovado', observacoes: 'Conferência demonstrativa de embalagem e identificação aprovada.', laudo: 'LAUDO-DEMO-007' })
    const dispatched = operational('Cenário 8 — Despachado com uma parcela paga: confirmar entrega com a segunda parcela aberta; mostrar comissão pela competência do recebimento.')
    produce(dispatched, 6)
    for (const lot of s.lotes.filter(l => l.tipo === 'produto' && l.pedidoId === dispatched))
      run('inspect', { id: lot.id, decisao: 'aprovado', observacoes: 'Lote demonstrativo aprovado.', laudo: 'LAUDO-DEMO-008' })
    run('bill', { id: dispatched, referencia: 'FAT-DEMO-008' })
    run('registerReceipt', { id: s.recebiveis.find(r => r.pedidoId === dispatched).id, recebidoEm: today(), referencia: 'REC-DEMO-008-01' })
    run('dispatch', { id: dispatched, transportadora: 'Rota Sul Logística — demonstração', valor: 150, rastreamento: 'DEMO-RT-008', comprovante: 'ROMANEIO-DEMO-008', tomadorFrete: 'destinatario', dataSaida: today(), prazo: day(3) })
    s.revision = 0
    return clone(s)
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
    if (!Array.isArray(s.embalagens)) s.embalagens = packagingSeed()
    // A correção das medidas não invalida pedidos ou textos já editados no navegador.
    for (const model of s.etiquetas) {
      if (model.id === 'etq1') {
        model.dimensoesMm = { largura: 105, altura: 58 }
        model.nome = model.nome.replace('105 × 98', '105 × 58')
      } else if (model.id === 'etq2') {
        model.dimensoesMm = { largura: 105, altura: 105 }
      }
    }
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
    packageCount,
    productBaseName,
    compactLotDate,
    batchPlan,
    productionFormulaRows,
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
    packagingSelection,
    suggestPackaging,
    draftBudget,
    formulaCost,
    containsText,
    ingredientDeclaration,
    pricingProfile,
    priceSimulation,
    priceScenarios,
    validCnpj,
    validateState
  }
})

