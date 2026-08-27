/* Domínio da demonstração: sem DOM, pronto para testes e tradução em casos de uso Dart.
   Não é backend nem barreira de segurança. Todos os dados são sintéticos. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Realtech = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 2;
  const clone = value => JSON.parse(JSON.stringify(value));
  const round = value => Math.round(value * 1000) / 1000;
  const today = () => localDate(new Date());
  function localDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function day(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return localDate(d); }
  const labels = {
    rascunho:'Rascunho', aguardandoAprovacao:'Aguardando aprovação', aprovado:'Aprovado', emProducao:'Em produção', faturado:'Faturado', cancelado:'Cancelado',
    pendente:'Pendente', liberado:'Liberado', liberadoComRestricao:'Liberado com restrição', bloqueado:'Bloqueado', aguardando:'Aguardando', concluida:'Concluída',
    reprovado:'Reprovado', ativo:'Ativo', inativo:'Inativo', ativa:'Ativa', obsoleta:'Obsoleta', emDesenvolvimento:'Em desenvolvimento', regular:'Regular', restricao:'Restrição', inadimplente:'Inadimplente'
  };
  const profiles = {
    administrador: { label:'Administrador', description:'Explore o ciclo completo e acompanhe a operação.', modules:['dashboard','pedidos','clientes','produtos','formulas','precificacao','producao','estoque','qualidade','financeiro','faturamento','despacho','comissoes','relatorios','auditoria','usuarios','guia'] },
    comercial: { label:'Comercial', description:'Crie pedidos, acompanhe sua carteira e suas comissões.', modules:['dashboard','pedidos','clientes','produtos','comissoes','relatorios','guia'] },
    financeiro: { label:'Financeiro', description:'Analise crédito e libere ou bloqueie pedidos.', modules:['dashboard','pedidos','clientes','financeiro','relatorios','guia'] },
    producao: { label:'Produção', description:'Emita fichas e registre produção e consumo por lote.', modules:['dashboard','producao','estoque','relatorios','guia'] },
    qualidade: { label:'Qualidade', description:'Inspecione lotes e consulte a rastreabilidade.', modules:['dashboard','producao','qualidade','relatorios','guia'] },
    fiscal: { label:'Fiscal / Expedição', description:'Registre faturamento e despacho demonstrativos.', modules:['dashboard','pedidos','faturamento','despacho','relatorios','guia'] },
    pd: { label:'P&D', description:'Consulte fórmulas, crie versões e simule preços.', modules:['dashboard','produtos','formulas','precificacao','relatorios','guia'] },
    estoque: { label:'Estoque', description:'Receba lotes e registre ajustes justificados.', modules:['dashboard','estoque','relatorios','guia'] },
    diretor: { label:'Diretor', description:'Visão gerencial sem acesso implícito a fórmulas e custos.', modules:['dashboard','pedidos','clientes','produtos','relatorios','auditoria','guia'] }
  };
  const permissions = {
    saveOrder:['comercial'], submitOrder:['comercial'], approveOrder:['comercial'], cancelOrder:['comercial'],
    analyze:['financeiro'], createOps:['producao'], issueSheet:['producao'], startOp:['producao'], reportProduction:['producao'],
    inspect:['qualidade'], bill:['fiscal'], dispatch:['fiscal'], receiveLot:['estoque'], adjustLot:['estoque'],
    saveClient:['comercial'], createVersion:['pd'], activateVersion:['pd'], releasePrice:['pd'], payCommission:[], toggleUser:[]
  };
  function can(user, action) { return !!user && (user.perfil === 'administrador' || (permissions[action] || []).includes(user.perfil)); }
  function requireThat(condition, message) { if (!condition) throw new Error(message); }
  function get(rows, id) { const row = rows.find(x=>x.id === id); requireThat(row, 'Registro não encontrado.'); return row; }
  function text(value, name, required = true) { const s = String(value ?? '').trim(); requireThat(!required || s.length > 0, `${name} é obrigatório.`); requireThat(s.length <= 2000, `${name}: limite de 2.000 caracteres.`); return s; }
  function number(value, name, min = 0) { const n = Number(value); requireThat(value !== '' && value != null && Number.isFinite(n) && n >= min && n <= 10000000, `${name}: informe um número válido (mínimo ${min}).`); return n; }
  function date(value, name) { requireThat(/^\d{4}-\d{2}-\d{2}$/.test(value || '') && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value, `${name}: data inválida.`); return value; }
  function uid() { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  function orderTotal(o) { return o.itens.reduce((sum,i)=>sum + Math.round(i.quantidade * i.precoCentavos),0); }
  function commission(o) { return o.itens.reduce((sum,i)=>sum + Math.round(i.quantidade * i.precoCentavos * i.comissaoBps / 10000),0); }
  function visibleOrders(s,u) { return s.pedidos.filter(o=>u.perfil !== 'comercial' || o.vendedorId === u.id); }
  function visibleClients(s,u) { return s.clientes.filter(c=>u.perfil !== 'comercial' || c.vendedorId === u.id); }
  function credit(s,o) {
    const c = get(s.clientes,o.clienteId);
    // Não há contas a receber no escopo. O saldo anterior é um cenário sintético fixo.
    const exposure = c.exposicaoInicialCentavos + s.pedidos.filter(p=>p.id !== o.id && p.clienteId === c.id && ['aprovado','emProducao','faturado'].includes(p.status)).reduce((n,p)=>n+orderTotal(p),0);
    return { exposure, available:c.limiteCentavos-exposure, projected:exposure+orderTotal(o), warning:c.situacaoFinanceira !== 'regular' || exposure+orderTotal(o)>c.limiteCentavos };
  }
  function requirements(op, inputKg) { return op.formula.itens.map(i=>({ ingredienteId:i.ingredienteId, quantidade:round(i.quantidade / op.formula.rendimento * inputKg) })); }
  function eligibleLots(s,id) { return s.lotes.filter(l=>l.ingredienteId === id && l.status === 'liberado' && l.validade >= today() && l.fabricacao <= today() && l.saldo > 0).sort((a,b)=>a.validade.localeCompare(b.validade)); }
  function suggestConsumption(s,op,inputKg) {
    return requirements(op,inputKg).flatMap(r=>{ let remaining=r.quantidade; const rows=[];
      for (const lot of eligibleLots(s,r.ingredienteId)) { const q=round(Math.min(remaining,lot.saldo)); if(q>0) rows.push({loteId:lot.id,quantidade:q}); remaining=round(remaining-q); }
      return rows;
    });
  }
  function billingIssues(s,o) {
    const ops=s.ordens.filter(op=>op.pedidoId===o.id);
    const issues=[];
    if (!o.aprovacao || !['liberado','liberadoComRestricao'].includes(o.statusAnalise)) issues.push('Liberações financeira e comercial');
    if (ops.length!==o.itens.length || ops.some(op=>op.status!=='concluida')) issues.push('Todas as OPs concluídas');
    if (ops.length===0 || ops.some(op=>!op.ficha)) issues.push('Fichas técnicas emitidas');
    if (ops.some(op=>!op.lotes.length || op.lotes.some(id=>get(s.lotes,id).status!=='liberado'))) issues.push('Todos os lotes aprovados pela Qualidade');
    if (ops.some(op=>op.lotes.some(id=>{ const l=get(s.lotes,id); return l.validade<today() || l.saldo<l.quantidadeInicial; }))) issues.push('Lotes válidos e saldo integral disponível');
    if (o.status==='cancelado') issues.push('Pedido cancelado');
    return issues;
  }
  function stage(s,o) {
    if(o.status==='cancelado') return 'Cancelado';
    if(o.despacho) return 'Despachado';
    if(o.faturamento) return 'Aguardando despacho';
    if(o.status==='rascunho') return 'Rascunho';
    if(o.statusAnalise==='bloqueado') return 'Bloqueado no financeiro';
    if(o.statusAnalise==='pendente') return 'Análise financeira';
    if(!o.aprovacao) return 'Aprovação comercial';
    const ops=s.ordens.filter(x=>x.pedidoId===o.id);
    if(ops.length<o.itens.length) return 'Gerar OPs';
    if(ops.some(x=>x.status!=='concluida')) return 'Produção';
    if(ops.some(x=>x.lotes.some(id=>get(s.lotes,id).status==='reprovado'))) return 'Bloqueado na qualidade';
    if(billingIssues(s,o).length) return 'Qualidade / liberação';
    return 'Pronto para faturar';
  }
  function seed() {
    const users=[['admin','Administrador','administrador','admin123'],['vendedor','Marina Comercial','comercial','vend123'],['financeiro','Rafael Financeiro','financeiro','fin123'],['producao','Lucas Produção','producao','prod123'],['qualidade','Paula Qualidade','qualidade','qual123'],['fiscal','Camila Fiscal','fiscal','fisc123'],['quimica','Ana P&D','pd','pd123'],['estoque','Bruno Estoque','estoque','esto123'],['diretor','Carlos Diretor','diretor','dir123']].map(([login,nome,perfil,senha])=>({id:login,login,nome,perfil,senha,ativo:true}));
    const ingredients=[['i1','Ácido cítrico',850],['i2','Glutamato monossódico',1500],['i3','Cloreto de sódio',200],['i4','Extrato de levedura',4500]].map(([id,nome,custoCentavos],n)=>({id,codigo:`ING-00${n+1}`,nome,custoCentavos,unidade:'KG'}));
    const formulas=[{id:'f1v2',codigo:'FORM-001',nome:'Tempero Especial A',versao:2,status:'ativa',rendimento:100,itens:[{ingredienteId:'i1',quantidade:10},{ingredienteId:'i2',quantidade:5},{ingredienteId:'i3',quantidade:80},{ingredienteId:'i4',quantidade:5}],observacoes:'Composição exclusivamente ilustrativa, não usar na fabricação.'},{id:'f2v1',codigo:'FORM-002',nome:'Realçador de Sabor B',versao:1,status:'ativa',rendimento:100,itens:[{ingredienteId:'i2',quantidade:40},{ingredienteId:'i3',quantidade:55},{ingredienteId:'i4',quantidade:5}],observacoes:'Composição exclusivamente ilustrativa, não usar na fabricação.'}];
    const s={schemaVersion:VERSION,revision:0,usuarios:users,ingredientes:ingredients,formulas,fornecedores:[{id:'s1',nome:'Fornecedor Alfa — demonstração'},{id:'s2',nome:'Fornecedor Beta — demonstração'}],
      produtos:[{id:'p1',codigo:'PROD-001',nome:'Tempero Especial A 5 kg',categoria:'Temperos',unidade:'UN',pesoKg:5,embalagem:'Balde 5 kg',embalagemCentavos:450,formulaId:'f1v2',status:'ativo',precoCentavos:5500,comissaoBps:500,precoLiberado:true,tabela:'Tabela demonstração 2026'}, {id:'p2',codigo:'PROD-002',nome:'Realçador de Sabor B 20 kg',categoria:'Realçadores',unidade:'UN',pesoKg:20,embalagem:'Bombona 20 kg',embalagemCentavos:1200,formulaId:'f2v1',status:'ativo',precoCentavos:24000,comissaoBps:450,precoLiberado:true,tabela:'Tabela demonstração 2026'}, {id:'p3',codigo:'PROD-003',nome:'Condimento Premium C',categoria:'Condimentos',unidade:'KG',pesoKg:1,embalagem:'Saco',embalagemCentavos:200,formulaId:null,status:'emDesenvolvimento',precoCentavos:0,comissaoBps:600,precoLiberado:false,tabela:'Não liberada'}],
      clientes:[{id:'c1',razaoSocial:'Alimentos do Norte — demonstração',nomeFantasia:'AlimNorte (teste)',cnpj:'12.345.678/0001-95',inscricaoEstadual:'ISENTO',endereco:'Av. Exemplo, 500 · Belém/PA',contato:'Compras · compras@example.com',vendedorId:'vendedor',limiteCentavos:5000000,exposicaoInicialCentavos:800000,situacaoFinanceira:'regular',tabela:'Tabela demonstração 2026',ativo:true},{id:'c2',razaoSocial:'Condimentos do Centro — demonstração',nomeFantasia:'CondCentro (teste)',cnpj:'11.222.333/0001-81',inscricaoEstadual:'ISENTO',endereco:'Rua Exemplo, 200 · Goiânia/GO',contato:'Compras · centro@example.com',vendedorId:'vendedor',limiteCentavos:300000,exposicaoInicialCentavos:280000,situacaoFinanceira:'restricao',tabela:'Tabela demonstração 2026',ativo:true},{id:'c3',razaoSocial:'Cliente Inativo — demonstração',nomeFantasia:'Cliente inativo (teste)',cnpj:'45.723.174/0001-10',inscricaoEstadual:'ISENTO',endereco:'Endereço fictício',contato:'teste@example.com',vendedorId:'vendedor',limiteCentavos:0,exposicaoInicialCentavos:0,situacaoFinanceira:'inadimplente',tabela:'Tabela demonstração 2026',ativo:false}],
      lotes:[],pedidos:[],ordens:[],movimentacoes:[],auditoria:[],seq:{pedido:1000,op:0,lote:0}};
    for(const [id,ing,saldo,expiry,status,forn] of [['l1','i1',8,200,'liberado','s1'],['l2','i1',472,300,'liberado','s1'],['l3','i2',295,300,'liberado','s1'],['l4','i3',998,300,'liberado','s2'],['l5','i4',150,300,'liberado','s1'],['l6','i1',50,-2,'liberado','s2'],['l7','i2',25,100,'bloqueado','s2']]) {
      s.lotes.push({id,codigo:`MP-${id.slice(1).padStart(4,'0')}`,tipo:'ingrediente',ingredienteId:ing,fornecedorId:forn,saldo,quantidadeInicial:saldo,fabricacao:day(-30),validade:day(expiry),status});
      s.movimentacoes.push({id:uid(),loteId:id,tipo:'entrada',quantidade:saldo,unidade:'KG',data:new Date().toISOString(),responsavel:'Carga de demonstração',motivo:'Saldo inicial sintético'});
    }
    return s;
  }
  function formulaCost(s,f) { return f.itens.reduce((n,i)=>n+i.quantidade*get(s.ingredientes,i.ingredienteId).custoCentavos,0)/f.rendimento; }
  function priceSimulation(s,p,margin) { const m=number(margin,'Margem',0); requireThat(m<95,'Margem deve ser menor que 95%.'); const cost=Math.round(formulaCost(s,get(s.formulas,p.formulaId))*p.pesoKg+p.embalagemCentavos); return {custoCentavos:cost,precoCentavos:Math.ceil(cost/(1-m/100))}; }
  function validCnpj(value) {
    const n=value.replace(/\D/g,''); if(n.length!==14 || /^(\d)\1+$/.test(n)) return false;
    for(let len=12;len<14;len++){let sum=0,w=len-7;for(let i=0;i<len;i++){sum+=Number(n[i])*w--;if(w<2)w=9;}const r=sum%11;if(Number(n[len])!==(r<2?0:11-r))return false;}return true;
  }
  function execute(state, user, action, payload={}) {
    requireThat(user && state.usuarios.some(u=>u.id===user.id && u.perfil===user.perfil && u.ativo),'Sessão inválida ou usuário inativo.');
    requireThat(can(user,action),'Seu perfil não permite esta ação.');
    const s=clone(state), now=new Date().toISOString();
    let target, before, result;
    const audit=(entity,previous,next)=>{s.auditoria.push({id:uid(),data:now,usuario:user.nome,perfil:user.perfil,acao:action,entidade:entity,antes:clone(previous ?? null),depois:clone(next ?? null)});};
    const own=o=>requireThat(user.perfil!=='comercial' || o.vendedorId===user.id,'Pedido de outro vendedor.');
    const order=()=>{ const o=get(s.pedidos,payload.id); own(o); target=o;before=clone(o); return o; };
    const op=()=>{const o=get(s.ordens,payload.id);target=o;before=clone(o);return o;};
    const move=(l,q,tipo,motivo,unidade,opId)=>s.movimentacoes.push({id:uid(),loteId:l.id,quantidade:q,tipo,motivo,unidade:unidade || (l.tipo==='ingrediente'?'KG':'UN'),opId,data:now,responsavel:user.nome});
    switch(action) {
      case 'saveOrder': {
        const old=payload.id ? order() : null;
        requireThat(!old || ['rascunho','aguardandoAprovacao'].includes(old.status) && !old.aprovacao,'Pedido aprovado não pode ser editado. Crie um pedido complementar.');
        const c=get(s.clientes,payload.clienteId); requireThat(c.ativo,'Cliente inativo não pode receber pedidos.'); requireThat(user.perfil!=='comercial' || c.vendedorId===user.id,'Cliente fora da sua carteira.');
        const due=date(payload.prazoEntrega,'Prazo de entrega'); requireThat(due>=today(),'Prazo de entrega não pode estar no passado.');
        requireThat(Array.isArray(payload.itens) && payload.itens.length>0,'Adicione ao menos um item.');
        const seen=new Set();
        const items=payload.itens.map(i=>{const p=get(s.produtos,i.produtoId); requireThat(!seen.has(p.id),'Agrupe quantidades do mesmo produto em um único item.');seen.add(p.id);
          requireThat(p.status==='ativo' && p.precoLiberado && p.tabela===c.tabela,'Produto ou tabela de preços não liberados para este cliente.');
          const f=get(s.formulas,p.formulaId); requireThat(f.status==='ativa','Fórmula não está ativa.'); const q=number(i.quantidade,'Quantidade',1);requireThat(Number.isInteger(q),'Produtos em UN exigem quantidade inteira.');
          return {id:uid(),produtoId:p.id,nome:p.nome,unidade:p.unidade,pesoKg:p.pesoKg,quantidade:q,precoCentavos:p.precoCentavos,comissaoBps:p.comissaoBps,tabela:p.tabela,formula:clone(f)};
        });
        target={id:old?.id || uid(),numero:old?.numero || `PED-${String(++s.seq.pedido).padStart(5,'0')}`,clienteId:c.id,clienteNome:c.nomeFantasia,vendedorId:c.vendedorId,itens:items,prazoEntrega:due,condicoesComerciais:text(payload.condicoesComerciais,'Condições comerciais'),observacoes:text(payload.observacoes,'Observações',false),status:'rascunho',statusAnalise:'pendente',criadoEm:old?.criadoEm || now,aprovacao:null,analises:old?.analises || [],complementarDe:old?.complementarDe || payload.complementarDe || null};
        if(target.complementarDe)get(s.pedidos,target.complementarDe);
        requireThat(Number.isSafeInteger(orderTotal(target)) && orderTotal(target)<=10000000000,'Valor do pedido excede o limite da demonstração.');
        if(old)s.pedidos[s.pedidos.findIndex(x=>x.id===old.id)]=target;else s.pedidos.push(target);
        result=target.id;break;
      }
      case 'submitOrder': {
        const o=order();requireThat(o.status==='rascunho','Somente rascunhos podem ser enviados.');requireThat(get(s.clientes,o.clienteId).ativo,'Cliente inativo.');o.status='aguardandoAprovacao';o.statusAnalise='pendente';break;
      }
      case 'analyze': {
        const o=order();requireThat(o.status==='aguardandoAprovacao' && !o.aprovacao,'Pedido não está em análise financeira.');
        requireThat(['liberado','liberadoComRestricao','bloqueado'].includes(payload.decisao),'Decisão inválida.');
        requireThat(payload.decisao!=='liberado' || !credit(s,o).warning,'Há restrição ou crédito insuficiente. Use liberação com restrição e justifique.');
        const reason=text(payload.justificativa,'Justificativa',payload.decisao!=='liberado');
        o.statusAnalise=payload.decisao;o.analises.push({decisao:payload.decisao,justificativa:reason,usuario:user.nome,data:now,credito:credit(s,o)});break;
      }
      case 'approveOrder': {
        const o=order();requireThat(o.status==='aguardandoAprovacao' && !o.aprovacao,'Pedido não está disponível para aprovação.');requireThat(['liberado','liberadoComRestricao'].includes(o.statusAnalise),'Liberação financeira obrigatória antes da aprovação comercial.');
        requireThat(get(s.clientes,o.clienteId).ativo,'Cliente inativo.');
        requireThat(o.statusAnalise!=='liberado' || !credit(s,o).warning,'Crédito mudou desde a análise. Solicite nova decisão financeira antes de aprovar.');
        o.itens.forEach(i=>{const p=get(s.produtos,i.produtoId);requireThat(p.status==='ativo' && get(s.formulas,i.formula.id).status==='ativa','Produto ou versão de fórmula deixou de estar ativo. Revise o pedido.');});
        o.aprovacao={usuario:user.nome,data:now};o.status='aprovado';break;
      }
      case 'cancelOrder': {
        const o=order();requireThat(!['faturado','cancelado'].includes(o.status) && !s.ordens.some(x=>x.pedidoId===o.id),'Cancelamento disponível apenas antes da geração de OPs. Após isso, exige procedimento de estorno não simulado.');o.cancelamento={justificativa:text(payload.justificativa,'Justificativa'),usuario:user.nome,data:now};o.status='cancelado';break;
      }
      case 'createOps': {
        const o=order();requireThat(o.status==='aprovado' && o.aprovacao,'Pedido precisa de aprovação comercial.');requireThat(!s.ordens.some(x=>x.pedidoId===o.id),'OPs já geradas para este pedido.');
        o.itens.forEach(i=>{requireThat(get(s.formulas,i.formula.id).status==='ativa' && get(s.produtos,i.produtoId).status==='ativo','Produto ou fórmula não liberados para nova produção.');
          s.ordens.push({id:uid(),numero:`OP-${String(++s.seq.op).padStart(5,'0')}`,pedidoId:o.id,itemId:i.id,produtoId:i.produtoId,produtoNome:i.nome,formula:clone(i.formula),pesoKg:i.pesoKg,quantidadePrevista:i.quantidade,quantidadeProduzida:0,perdasKg:0,sobrasKg:0,status:'aguardando',lotes:[],apontamentos:[],ficha:null});});o.status='emProducao';break;
      }
      case 'issueSheet': {const x=op();requireThat(x.status!=='concluida','OP já concluída.');requireThat(!x.ficha,'Ficha já emitida.');x.ficha={numero:`FT-${x.numero}`,versao:x.formula.versao,data:now,usuario:user.nome,necessidades:requirements(x,x.quantidadePrevista*x.pesoKg)};break;}
      case 'startOp': {const x=op();requireThat(x.status==='aguardando' && x.ficha,'Emita a ficha técnica antes de iniciar a OP.');x.status='emProducao';x.operador=user.nome;x.inicio=now;break;}
      case 'reportProduction': {
        const x=op();requireThat(x.status==='emProducao' && x.ficha,'OP precisa estar em produção e ter ficha emitida.');
        const q=number(payload.quantidade,'Quantidade produzida',1);requireThat(Number.isInteger(q) && q<=x.quantidadePrevista-x.quantidadeProduzida,'Informe UN inteiras, no máximo o saldo da OP.');
        const loss=round(number(payload.perdasKg,'Perdas')), surplus=round(number(payload.sobrasKg,'Sobras'));
        const reason=text(payload.observacoes,'Observações',loss>0 || surplus>0);
        const expiry=date(payload.validade,'Validade do lote produzido');requireThat(expiry>=today(),'Lote produzido não pode nascer vencido.');
        const inputKg=round(q*x.pesoKg+loss+surplus), needs=requirements(x,inputKg);
        requireThat(Array.isArray(payload.consumos),'Informe os lotes consumidos.');
        const aggregates=new Map();
        for(const c of payload.consumos){const n=round(number(c.quantidade,'Consumo'));if(!n)continue;const l=get(s.lotes,c.loteId);requireThat(l.tipo==='ingrediente' && needs.some(r=>r.ingredienteId===l.ingredienteId),'Lote não pertence à fórmula.');aggregates.set(l.id,round((aggregates.get(l.id)||0)+n));}
        const consumptions=[...aggregates].map(([id,n])=>{const l=get(s.lotes,id);requireThat(eligibleLots(s,l.ingredienteId).some(v=>v.id===id),'Lote vencido, bloqueado ou sem saldo não pode ser consumido.');requireThat(n<=l.saldo,'Saldo insuficiente no lote '+l.codigo);return {loteId:id,ingredienteId:l.ingredienteId,quantidade:n,custoCentavos:Math.round(n*get(s.ingredientes,l.ingredienteId).custoCentavos)};});
        needs.forEach(r=>requireThat(Math.abs(consumptions.filter(c=>c.ingredienteId===r.ingredienteId).reduce((n,c)=>n+c.quantidade,0)-r.quantidade)<0.001,`Consumo de ${get(s.ingredientes,r.ingredienteId).nome} deve ser ${r.quantidade} kg.`));
        // Todas as validações ocorrem antes das movimentações; execute trabalha numa cópia.
        consumptions.forEach(c=>{const l=get(s.lotes,c.loteId);l.saldo=round(l.saldo-c.quantidade);move(l,-c.quantidade,'consumo',x.numero,'KG',x.id);});
        const lot={id:uid(),codigo:`PA-${String(++s.seq.lote).padStart(5,'0')}`,tipo:'produto',produtoId:x.produtoId,opId:x.id,pedidoId:x.pedidoId,quantidadeInicial:q,saldo:q,sobrasKg:surplus,fabricacao:today(),validade:expiry,status:'pendente',inspecoes:[]};s.lotes.push(lot);x.lotes.push(lot.id);move(lot,q,'producao',x.numero,'UN',x.id);
        if(surplus)move(lot,surplus,'sobra','Sobra segregada, não vendável','KG',x.id);
        x.apontamentos.push({id:uid(),data:now,usuario:user.nome,quantidade:q,perdasKg:loss,sobrasKg:surplus,consumos:consumptions,loteId:lot.id,observacoes:reason,custoInsumosCentavos:consumptions.reduce((n,c)=>n+c.custoCentavos,0)});
        x.quantidadeProduzida+=q;x.perdasKg=round(x.perdasKg+loss);x.sobrasKg=round(x.sobrasKg+surplus);if(x.quantidadeProduzida===x.quantidadePrevista){x.status='concluida';x.fim=now;}break;
      }
      case 'inspect': {
        const l=get(s.lotes,payload.id);target=l;before=clone(l);requireThat(l.tipo==='produto' && l.status==='pendente','Somente lote produzido pendente pode ser inspecionado. Reprovado exige tratamento separado.');requireThat(['aprovado','reprovado'].includes(payload.decisao),'Resultado de qualidade inválido.');
        l.inspecoes.push({resultado:payload.decisao,observacoes:text(payload.observacoes,'Motivo da reprovação',payload.decisao==='reprovado'),laudo:text(payload.laudo,'Referência de laudo',false),usuario:user.nome,data:now});l.status=payload.decisao==='aprovado'?'liberado':'reprovado';break;
      }
      case 'bill': {
        const o=order();requireThat(!o.faturamento,'Pedido já faturado.');const issues=billingIssues(s,o);requireThat(!issues.length,'Faturamento bloqueado: '+issues.join('; '));o.faturamento={referencia:text(payload.referencia,'Referência interna'),data:now,usuario:user.nome,valorCentavos:orderTotal(o)};o.status='faturado';break;
      }
      case 'dispatch': {
        const o=order();requireThat(o.faturamento && !o.despacho,'Pedido deve estar faturado e ainda não despachado.');requireThat(!billingIssues(s,o).length,'Há pendência de liberação ou validade nos lotes.');
        const exit=date(payload.dataSaida,'Data de saída');requireThat(exit<=today() && exit>=localDate(new Date(o.faturamento.data)),'Saída deve ocorrer entre o faturamento e hoje.');
        const due=date(payload.prazo,'Prazo do frete');requireThat(due>=exit,'Prazo do frete anterior à saída.');
        const lots=s.ordens.filter(x=>x.pedidoId===o.id).flatMap(x=>x.lotes);
        o.despacho={transportadora:text(payload.transportadora,'Transportadora'),valorCentavos:Math.round(number(payload.valor,'Valor do frete')*100),rastreamento:text(payload.rastreamento,'Rastreamento'),comprovante:text(payload.comprovante,'Referência do comprovante'),dataSaida:exit,prazo:due,data:now,usuario:user.nome,lotes:lots};
        lots.forEach(id=>{const l=get(s.lotes,id);move(l,-l.saldo,'despacho',o.numero,'UN');l.saldo=0;});break;
      }
      case 'receiveLot': {
        get(s.ingredientes,payload.ingredienteId);get(s.fornecedores,payload.fornecedorId);const code=text(payload.codigo,'Código do lote');requireThat(!s.lotes.some(l=>l.codigo.toLowerCase()===code.toLowerCase()),'Código de lote já cadastrado.');
        const made=date(payload.fabricacao,'Fabricação'), expiry=date(payload.validade,'Validade');requireThat(made<=today() && expiry>=made,'Datas de fabricação e validade inconsistentes.');const q=round(number(payload.quantidade,'Quantidade',0.001));
        target={id:uid(),codigo:code,tipo:'ingrediente',ingredienteId:payload.ingredienteId,fornecedorId:payload.fornecedorId,quantidadeInicial:q,saldo:q,fabricacao:made,validade:expiry,status:expiry>=today()?'liberado':'bloqueado'};s.lotes.push(target);move(target,q,'entrada','Recebimento de demonstração');break;
      }
      case 'adjustLot': {const l=get(s.lotes,payload.id);target=l;before=clone(l);requireThat(l.tipo==='ingrediente','Ajuste demonstrativo disponível apenas para matéria-prima.');const q=round(number(payload.saldo,'Novo saldo'));const reason=text(payload.justificativa,'Justificativa');move(l,round(q-l.saldo),'ajuste',reason);l.saldo=q;break;}
      case 'saveClient': {
        const cnpj=text(payload.cnpj,'CNPJ').replace(/\D/g,'');requireThat(validCnpj(cnpj),'CNPJ inválido: confira os dígitos verificadores.');requireThat(!s.clientes.some(c=>c.cnpj.replace(/\D/g,'')===cnpj),'CNPJ já cadastrado.');
        target={id:uid(),cnpj,razaoSocial:text(payload.razaoSocial,'Razão social'),nomeFantasia:text(payload.nomeFantasia,'Nome fantasia'),inscricaoEstadual:text(payload.inscricaoEstadual,'Inscrição estadual'),endereco:text(payload.endereco,'Endereço'),contato:text(payload.contato,'Contato'),vendedorId:user.perfil==='comercial'?user.id:'vendedor',limiteCentavos:0,exposicaoInicialCentavos:0,situacaoFinanceira:'regular',tabela:'Tabela demonstração 2026',ativo:true};s.clientes.push(target);result=target.id;break;
      }
      case 'createVersion': {
        const f=get(s.formulas,payload.id);const rows=payload.itens.map(i=>({ingredienteId:i.ingredienteId,quantidade:round(number(i.quantidade,'Quantidade de ingrediente'))}));requireThat(rows.length===f.itens.length && rows.every((i,n)=>i.ingredienteId===f.itens[n].ingredienteId),'Ingredientes inválidos.');const yieldKg=number(payload.rendimento,'Rendimento',0.001);requireThat(Math.abs(rows.reduce((n,i)=>n+i.quantidade,0)-yieldKg)<0.001,'Na demonstração, a soma dos ingredientes deve ser igual ao rendimento.');
        target={...clone(f),id:uid(),versao:Math.max(...s.formulas.filter(x=>x.codigo===f.codigo).map(x=>x.versao))+1,status:'emDesenvolvimento',rendimento:yieldKg,itens:rows,observacoes:text(payload.justificativa,'Justificativa da versão')};s.formulas.push(target);break;
      }
      case 'activateVersion': {
        const f=get(s.formulas,payload.id);target=f;before=clone(f);requireThat(f.status==='emDesenvolvimento','Apenas versões em desenvolvimento podem ser ativadas.');f.status='ativa';f.ativacao={usuario:user.nome,data:now,justificativa:text(payload.justificativa,'Justificativa de ativação')};
        // Mantém a versão anterior ativa para OPs já planejadas; não sobrescreve snapshots.
        s.produtos.filter(p=>p.formulaId && get(s.formulas,p.formulaId).codigo===f.codigo).forEach(p=>{p.formulaId=f.id;p.precoLiberado=false;});break;
      }
      case 'releasePrice': {
        const p=get(s.produtos,payload.id);target=p;before=clone(p);requireThat(p.formulaId && get(s.formulas,p.formulaId).status==='ativa','Produto precisa de fórmula ativa.');const sim=priceSimulation(s,p,payload.margem);p.precoCentavos=sim.precoCentavos;p.precoLiberado=true;p.liberacaoPreco={...sim,margem:Number(payload.margem),data:now,usuario:user.nome};break;
      }
      case 'payCommission': {const o=order();requireThat(o.faturamento && !o.comissaoPaga,'Comissão só pode ser paga uma vez, após faturamento (premissa demonstrativa).');o.comissaoPaga={data:now,usuario:user.nome,valorCentavos:commission(o)};break;}
      case 'toggleUser': {const u=get(s.usuarios,payload.id);requireThat(u.id!==user.id,'Você não pode desativar sua própria sessão.');target=u;before={id:u.id,ativo:u.ativo};u.ativo=!u.ativo;break;}
      default: throw new Error('Ação desconhecida.');
    }
    audit(target?.numero || target?.codigo || target?.id, before, action==='toggleUser'?{id:target.id,ativo:target.ativo}:target);
    s.revision++;return {state:s,id:result || target?.id};
  }
  function demoSeed() {
    let s=seed();const admin=s.usuarios[0];
    const run=(a,p)=>{const r=execute(s,admin,a,p);s=r.state;return r.id;};
    const create=(client,items,note)=>run('saveOrder',{clienteId:client,itens:items,prazoEntrega:day(15),condicoesComerciais:'30/60 dias',observacoes:note});
    const p1=create('c1',[{produtoId:'p1',quantidade:20},{produtoId:'p2',quantidade:5}],'Cenário completo: duas OPs, 200 kg totais.');
    run('submitOrder',{id:p1});
    const p2=create('c2',[{produtoId:'p2',quantidade:10}],'Cenário de restrição financeira.');run('submitOrder',{id:p2});
    const p3=create('c1',[{produtoId:'p1',quantidade:10}],'Cenário operacional pronto para produzir.');run('submitOrder',{id:p3});run('analyze',{id:p3,decisao:'liberado',justificativa:'Crédito disponível no cenário.'});run('approveOrder',{id:p3});run('createOps',{id:p3});
    s.revision=0;return s;
  }
  function validateState(s) {
    requireThat(s?.schemaVersion===VERSION && Number.isInteger(s.revision) && s.seq,'Dados de demonstração incompatíveis.');
    for(const key of ['usuarios','clientes','produtos','formulas','ingredientes','fornecedores','lotes','pedidos','ordens','movimentacoes','auditoria'])requireThat(Array.isArray(s[key]),'Arquivo de demonstração incompleto.');
    return s;
  }
  return {VERSION,profiles,labels,permissions,can,clone,today,day,get,seed,demoSeed,execute,orderTotal,commission,credit,requirements,eligibleLots,suggestConsumption,billingIssues,stage,visibleOrders,visibleClients,formulaCost,priceSimulation,validCnpj,validateState};
});
