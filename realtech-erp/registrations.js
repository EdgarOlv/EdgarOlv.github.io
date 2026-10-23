 'use strict'
// The two navigation proposals operate on the same entities and IDs.
let registryFormContext=null, registrySubmittingPrefix=null
function registryKinds(){return Object.keys(D.registrationGroups).filter(k=>allowed(D.registrationGroups[k].route))}
function registryCode(row){return `<b>${esc(row.codigoCadastro||'A classificar')}</b>${row.classificacaoRevisar?'<small>Classificação a revisar</small>':''}${row.codigo?`<small>Referência anterior: ${esc(row.codigo)}</small>`:''}`}
function registryEditable(kind){return can(D.registrationGroups[kind].action === 'createProduct'?'saveProduct':D.registrationGroups[kind].action)}
function registryRows(kind){return kind==='clientes'?clients():(state[kind]||[])}
function registrationList(kind){
  const cfg=D.registrationGroups[kind]
  return searchableList('registry'+kind,'Buscar por código, nome ou referência anterior',
    intro(cfg.label,'Formato '+cfg.prefix+'-GNNN: grupo, subgrupo e sequência automática por subgrupo.',can(cfg.action)?btn('+ Novo registro',cfg.action,null,true):'')+
    panel('Registros',table(['Código','Nome / descrição','Subgrupo','Situação','Ações'],registryRows(kind).map(r=>[
      registryCode(r),esc(r.nomeFantasia||r.nome),esc(cfg.groups[r.subgrupoCadastro]||'A classificar'),badge(r.ativo===false||r.status==='inativo'?'inativo':r.status||'ativo'),btn(registryEditable(kind)?'Editar':'Consultar','registryOpen',kind+':'+r.id)
    ]))))
}
function registrationsView(){
  const kinds=registryKinds(),kind=kinds.includes(selectedId)?selectedId:kinds[0]
  return intro('Central de cadastros','Alternativa com abas. Os acessos separados do menu Cadastros consultam os mesmos registros.')+
    `<nav class="registry-tabs" aria-label="Tipos de cadastro">${kinds.map(k=>`<button type="button" class="ghost-btn ${kind===k?'registry-tab-active':''}" data-route="cadastros" data-id="${k}" ${kind===k?'aria-current="page"':''}>${D.registrationGroups[k].prefix} · ${esc(D.registrationGroups[k].label)}</button>`).join('')}</nav>`+
    (kind?registrationList(kind):notice('Nenhum cadastro disponível para este perfil.'))
}
function registryActionStart(action,id){
  registryFormContext=null
  if(action==='registrySearch'){
    modal('Buscar cadastro em toda a empresa',input('Código ou nome','globalRegistrySearch','','search','autocomplete="off" placeholder="Ex.: 02-1005 ou 021005"')+'<p class="muted">A busca respeita os cadastros disponíveis ao seu perfil.</p><div id="registryResults" aria-live="polite"></div>')
    updateRegistrySearch('');return true
  }
  if(action==='registryOpen'){
    const [kind,recordId]=String(id).split(':')
    if(!registryKinds().includes(kind))throw new Error('Cadastro indisponível para este perfil.')
    const row=find(registryRows(kind),recordId)
    if(!registryEditable(kind))modal('Consultar cadastro',fields([['Código',esc(row.codigoCadastro)],['Nome',esc(row.nomeFantasia||row.nome)],['Subgrupo',esc(D.registrationGroups[kind].groups[row.subgrupoCadastro])]]))
    else openAction(kind==='produtos'?'saveProduct':D.registrationGroups[kind].action,recordId)
    return true
  }
  const kind=({saveClient:'clientes',saveSupplier:'fornecedores',saveRepresentative:'representantes',saveIngredient:'ingredientes',savePackaging:'embalagens',createProduct:'produtos',saveProduct:'produtos'})[action]
  if(!kind)return false
  if(!can(action))throw new Error('Seu perfil não permite esta ação.')
  registryFormContext={kind,id}
  if(action==='saveRepresentative'){
    const r=id?find(state.representantes,id):null
    modal(r?'Editar representante':'Novo representante',`<div class="form-grid">${input('Nome / razão social','nome',r?.nome||'','text','required')}${input('Documento (opcional)','documento',r?.documento||'')}${input('Contato','contato',r?.contato||'')}${select('Situação','ativo',[['true','Ativo'],['false','Inativo']],String(r?.ativo??true))}</div>`+notice('Cadastro comercial independente dos usuários de acesso. Não altera comissões ou carteira de clientes.'),d=>commit('saveRepresentative',{...d,id,ativo:d.ativo==='true'}),'Salvar representante')
    return true
  }
  return false
}
function prepareRegistrationModal(body,submit){
  const context=registryFormContext;registryFormContext=null
  if(!context||!submit)return {body,submit}
  const {kind,id}=context,cfg=D.registrationGroups[kind],row=id?find(state[kind],id):null
  const fixed=row?.codigoCadastro&&!row.classificacaoRevisar
  const prefix=row?.codigoCadastro?.replace('-','').slice(0,3)||''
  const groups=Object.entries(cfg.groups).map(([key,name])=>[cfg.prefix+key,cfg.prefix+'-'+key+' · '+name])
  const controls=fixed?input('Código do cadastro','prefixoCadastro',prefix,'text','readonly')+`<p>Código: <b>${esc(row.codigoCadastro)}</b></p>`:
    select('Grupo / subgrupo do código','prefixoCadastro',[['','Selecione o subgrupo'],...groups],prefix)
  // Retain legacy references. On new records the core entity code follows the generated code.
  const wrapped=data=>{
    const selected=D.registrationPrefix(kind,data.prefixoCadastro)
    registrySubmittingPrefix=selected
    try{return submit(data)}finally{registrySubmittingPrefix=null}
  }
  return {body:(kind==='produtos'&&row?input('Nome do produto','nomeCadastro',row.nome,'text','required'):'')+`<section class="registry-code-editor" data-registry-kind="${kind}" data-registry-id="${esc(id||'')}">${controls}<p id="registryCodePreview" class="muted small">${fixed?'Código preservado ao editar.':'Os três últimos dígitos são gerados ao salvar. A prévia não reserva uma sequência.'}</p></section>`+body,submit:wrapped}
}
function syncRegistrationPreview(){
  const block=document.querySelector('[data-registry-kind]');if(!block)return
  const prefix=block.querySelector('[name="prefixoCadastro"]')?.value
  const field=document.querySelector('#dialogBody [name="codigo"]')
  if(field){field.readOnly=true;field.required=false;if(!block.dataset.registryId)field.closest('label').hidden=true}
  if(!prefix)return
  try{
    const row=state[block.dataset.registryKind].find(r=>r.id===block.dataset.registryId)
    const same=row?.codigoCadastro?.replace('-','').slice(0,3)===prefix
    const code=same?row.codigoCadastro:D.nextRegistrationCode(state,block.dataset.registryKind,prefix)
    document.querySelector('#registryCodePreview').textContent=(row&&!row.classificacaoRevisar?'Código preservado: ':'Prévia do código: ')+code
    if(field&&!block.dataset.registryId)field.value=code
  }catch(e){document.querySelector('#registryCodePreview').textContent=e.message}
}
function searchRegistrations(term){
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  const query=normalize(term).trim(),digits=query.replace(/[\s-]/g,'')
  return registryKinds().flatMap(kind=>registryRows(kind).filter(r=>{
    const codes=[r.codigoCadastro,r.codigo,...(r.codigosAnteriores||[])].filter(Boolean)
    return !query||normalize(r.nomeFantasia||r.nome).includes(query)||codes.some(code=>normalize(code).includes(query)||normalize(code).replace(/[\s-]/g,'').includes(digits))
  }).map(row=>({kind,row})))
}
function updateRegistrySearch(term){
  const results=searchRegistrations(term),shown=results.slice(0,30)
  document.querySelector('#registryResults').innerHTML=`<p>${results.length} registros encontrados${results.length>30?' (primeiros 30; refine a busca)':''}.</p>`+table(['Código','Cadastro','Nome','Abrir'],shown.map(({kind,row})=>[registryCode(row),esc(D.registrationGroups[kind].label),esc(row.nomeFantasia||row.nome),btn('Abrir','registryOpen',kind+':'+row.id)]))
}
document.addEventListener('input',e=>{if(e.target.name==='globalRegistrySearch')updateRegistrySearch(e.target.value)})
document.addEventListener('change',e=>{if(e.target.name==='prefixoCadastro')syncRegistrationPreview()})
