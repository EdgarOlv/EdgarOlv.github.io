'use strict'
// Documento do produto: percentuais públicos nunca são usados na fabricação.
function productSheetList() {
  if (!can('saveProductSheet')) return ''
  return panel('Fichas técnicas dos produtos', table(['Produto', 'Revisões', 'Ações'], state.produtos.map(p => [
    esc(p.nome), (state.fichasTecnicas || []).filter(f => f.produtoId === p.id).length,
    btn('Gerenciar ficha técnica', 'productSheet', p.id)
  ])))
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
    notice('Demonstração. Revise os percentuais antes de aprovar. Editar esta ficha não altera a fórmula. O tipo aberta/fechada não aplica margens automáticas.') +
    (stale ? notice('A fórmula do P&D mudou. Revise a composição. Os ajustes anteriores foram preservados.', 'warn') : '') +
    `<div class="actions">${btn('Novo rascunho com fórmula atual', 'newProductSheet', productId)}</div>` +
    select('Tipo da ficha','tipo',[['aberta','Aberta'],['fechada','Fechada']],base.tipo) + rows +
    names.map(([key,label]) => textarea(label,key,base[key] || '')).join('') +
    textarea('Motivo da revisão','motivo',sheet?.status === 'rascunho' ? base.motivo : '') +
    (sheet ? `<p>Revisão ${sheet.revisao} — ${esc(sheet.status)}</p><div class="actions">${btn('Prévia / imprimir', 'previewProductSheet',sheet.id)}${sheet.status === 'rascunho' ? btn('Aprovar revisão salva','approveProductSheet',sheet.id) : ''}</div>` : '') +
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
