'use strict'
// Documento do produto: percentuais públicos nunca são usados na fabricação.
function productSheetList() {
  if (!can('saveProductSheet')) return ''
  return `<details class="quality-sheets"><summary>Fichas técnicas dos produtos <span class="muted">(${state.produtos.length})</span></summary><div class="quality-sheet-content">${input('Buscar produto ou código','sheetSearch','','search')}<p id="sheetSummary" class="muted small" role="status" aria-live="polite">${state.produtos.length} produtos</p>${state.produtos.map(p=>{
    const history=(state.fichasTecnicas||[]).filter(f=>f.produtoId===p.id)
    const current=[...history].reverse().find(f=>f.status==='aprovada')||history.at(-1)
    return `<details class="quality-product" data-sheet-search="${esc(p.codigo+' '+p.nome)}"><summary>${esc(p.nome)} <small>${esc(p.codigo)} · ${current?'Rev. '+current.revisao+' · '+esc(current.status):'Sem ficha salva'}</small></summary><div class="quality-sheet-content"><div class="actions">${current?btn('Visualizar ficha técnica','previewProductSheet',current.id,true):''}${btn('Gerenciar ficha técnica','productSheet',p.id)}</div>${table(['Revisão','Situação','Ações'],history.map(f=>[f.revisao,esc(f.status),btn('Abrir revisão','sheetRevision',f.id)]))}</div></details>`
  }).join('')}</div></details>`
}
function openProductSheet(productId, revisionId) {
  if (!can('saveProductSheet')) throw new Error('Ficha restrita à Qualidade.')
  const p = find(state.produtos, productId)
  const history = (state.fichasTecnicas || []).filter(f => f.produtoId === productId)
  const sheet = revisionId === '__new__' ? null : revisionId ? find(history, revisionId) : [...history].reverse().find(f => f.status === 'rascunho') || history.at(-1)
  const base = sheet || D.productSheetDraft(state, productId)
  const stale = D.productSheetStale(state, base)
  const rows = base.composicao.map((r, i) => `<div class="form-grid">${input('Ingrediente', 'nome'+i, r.nome, 'text', 'required')}${input('Percentual interno — referência P&D', 'interno'+i, r.percentualInterno+'%', 'text', 'readonly')}${input('Percentual para exibição (vazio = ocultar)', 'percentual'+i, r.percentualExibicao)}</div>`).join('')
  const names = [['descricao','Descrição'],['registro','Registro'],['modoUso','Modo de uso'],['especificacoes','Especificações técnicas'],['conservacao','Estocagem'],['transporte','Transporte'],['embalagem','Embalagem'],['alergenicos','Declaração de alergênicos e glúten'],['nutricao','Informações nutricionais revisadas'],['validade','Validade'],['responsavel','Responsável técnico e registro']]
  modal('Ficha técnica — '+p.nome,
    (sheet ? `<div class="actions">${btn('Visualizar ficha técnica', 'previewProductSheet', sheet.id, true)}<span class="muted small">Revisão ${sheet.revisao} salva — ${esc(sheet.status)}</span></div>` : '<p class="muted small">Salve o primeiro rascunho para visualizar a ficha técnica.</p>') +
    notice('Demonstração. Revise os percentuais antes de aprovar. Editar esta ficha não altera a fórmula. O tipo aberta/fechada não aplica margens automáticas.') +
    (stale ? notice('A fórmula do P&D mudou. Revise a composição. Os ajustes anteriores foram preservados.', 'warn') : '') +
    `<div class="actions">${btn('Novo rascunho com fórmula atual', 'newProductSheet', productId)}</div>` +
    select('Tipo da ficha','tipo',[['aberta','Aberta'],['fechada','Fechada']],base.tipo) + rows +
    names.map(([key,label]) => textarea(label,key,base[key] || '')).join('') +
    textarea('Motivo da revisão','motivo',sheet?.status === 'rascunho' ? base.motivo : '') +
    (sheet ? `<p>Revisão ${sheet.revisao} — ${esc(sheet.status)}</p><div class="actions">${sheet.status === 'rascunho' ? btn('Aprovar revisão salva','approveProductSheet',sheet.id) : ''}</div>` : '') +
    table(['Revisão','Situação','Data','Ações'],history.map(f => [f.revisao,esc(f.status),esc(f.atualizadoEm),btn('Abrir revisão','sheetRevision',f.id)])),
    data => commit('saveProductSheet', {produtoId: productId, sourceId:sheet?.id, id:sheet?.status === 'rascunho' ? sheet.id : null,
      ...Object.fromEntries(names.map(([key]) => [key,data[key]])),tipo:data.tipo,motivo:data.motivo,
      composicao:base.composicao.map((r,i) => ({...r,nome:data['nome'+i],percentualExibicao:data['percentual'+i]}))}),
    sheet?.status === 'aprovada' || sheet?.status === 'substituida' ? 'Salvar nova revisão' : 'Salvar rascunho')
}
function productSheetPreview(sheet) {
  const composition = sheet.composicao.map(r => esc(r.nome)+(r.percentualExibicao ? ` (${esc(r.percentualExibicao)})` : '')).join(', ')
  return `<article class="technical-sheet"><header><h2>REALTECH — Ficha técnica</h2><h3>${esc(sheet.produtoNome)}</h3><p>Revisão ${sheet.revisao} — ${esc(sheet.status)} — ${esc(sheet.tipo)}</p><p>DADOS DEMONSTRATIVOS — sem validade oficial</p></header>${fields([
    ['Registro',esc(sheet.registro)],['Descrição',esc(sheet.descricao)],['Ingredientes',composition],['Modo de uso',esc(sheet.modoUso)],['Especificações técnicas',esc(sheet.especificacoes)],['Estocagem',esc(sheet.conservacao)],['Transporte',esc(sheet.transporte)],['Embalagem',esc(sheet.embalagem)],['Alergênicos',esc(sheet.alergenicos)],['Informações nutricionais',esc(sheet.nutricao || 'Não informado')],['Validade',esc(sheet.validade)],['Responsável técnico',esc(sheet.responsavel)],['Revisado em',esc(sheet.aprovadoEm || sheet.atualizadoEm)]
  ])}</article><div class="actions">${btn('Imprimir / salvar em PDF','printDoc',sheet.id,true)}</div>`
}
