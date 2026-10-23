 'use strict'
// Native selects remain authoritative: saved values and existing change handlers keep their IDs.
const searchableControlNames=new Set(['clienteId','product','produtoId','sourceProductId','fornecedorId','ingredienteId','formulaIngredient','embalagemId','representanteId','formulaId','loteId'])
const normalizeChoice=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
function choiceMetadata(id,data){
  for(const key of ['clientes','produtos','fornecedores','ingredientes','embalagens','representantes','lotes','formulas']){
    const record=(data?.[key]||[]).find(r=>r.id===id)
    if(record)return record
  }
  return null
}
function searchableChoices(select,data){
  return [...select.options].map((option,index)=>{
    const row=choiceMetadata(option.value,data),base=option.textContent.trim(),code=row?.codigoCadastro
    const label=code&&!base.includes(code)?code+' · '+base:base
    return {index,value:option.value,label,disabled:option.disabled||select.disabled,
      search:[label,row?.nome,row?.nomeFantasia,row?.codigo,...(row?.codigosAnteriores||[])].filter(Boolean).join(' ')}
  })
}
function matchChoices(choices,term){
  const normalized=normalizeChoice(term).trim(),tokens=normalized.split(/\s+/).filter(Boolean)
  return choices.filter(choice=>{
    const text=normalizeChoice(choice.search),compact=text.replace(/[\s-]/g,'')
    return tokens.every(token=>text.includes(token)||compact.includes(token.replace(/-/g,'')))
  })
}
function commitSearchableChoice(select,choice,dispatch=()=>select.dispatchEvent(new Event('change',{bubbles:true}))){
  if(select.disabled||choice.disabled)return false
  select.value=choice.value
  dispatch()
  return true
}
let searchableSerial=0
const searchableInstances=new WeakMap()
function enhanceSearchableSelect(select){
  if(searchableInstances.has(select)||!searchableControlNames.has(select.name)||select.multiple)return
  const label=select.closest('label'),title=label?.firstChild?.textContent?.trim()||select.name
  const container=document.createElement('span');container.className='searchable-select'
  const control=document.createElement('input');control.type='text';control.autocomplete='off';control.placeholder='Digite o código ou nome'
  control.setAttribute('role','combobox');control.setAttribute('aria-autocomplete','list');control.setAttribute('aria-expanded','false');control.setAttribute('aria-label',title+' — buscar por código ou nome')
  const list=document.createElement('span');list.className='searchable-options';list.id='searchable-options-'+(++searchableSerial);list.setAttribute('role','listbox');list.setAttribute('aria-label',title);list.hidden=true
  const status=document.createElement('span');status.className='searchable-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite')
  control.setAttribute('aria-controls',list.id)
  container.append(control,list,status);select.after(container)
  select.classList.add('searchable-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true')
  let choices=[],matches=[],active=-1,editing=false
  const current=()=>choices.find(c=>c.value===select.value)
  const close=()=>{status.textContent='';list.hidden=true;control.setAttribute('aria-expanded','false');control.removeAttribute('aria-activedescendant');active=-1}
  const sync=()=>{
    choices=searchableChoices(select,typeof state==='undefined'?null:state)
    control.disabled=select.disabled;control.required=select.required
    if(!editing){control.value=current()?.label||'';control.setCustomValidity(select.required&&!select.value?'Selecione um registro da lista.':'')}
    if(select.disabled)close()
  }
  const highlight=()=>{
    [...list.querySelectorAll('[role="option"]')].forEach((item,i)=>item.setAttribute('aria-selected',String(i===active)))
    if(active>=0){const el=list.querySelectorAll('[role="option"]')[active];control.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'})}
    else control.removeAttribute('aria-activedescendant')
  }
  const choose=choice=>{
    if(!commitSearchableChoice(select,choice))return
    editing=false;sync();close();control.focus()
  }
  const show=term=>{
    sync();matches=matchChoices(choices,term).filter(c=>!c.disabled&&(!select.required||c.value!==''));active=-1
    list.replaceChildren()
    for(const [index,choice] of matches.entries()){
      const item=document.createElement('button');item.type='button';item.className='searchable-option';item.id=list.id+'-'+index;item.setAttribute('role','option');item.setAttribute('aria-selected','false');item.tabIndex=-1;item.textContent=choice.label
      item.addEventListener('pointerdown',e=>e.preventDefault())
      item.addEventListener('click',()=>choose(choice));list.append(item)
    }
    if(!matches.length){const empty=document.createElement('span');empty.className='searchable-empty';empty.textContent='Nenhum registro encontrado';list.append(empty)}
    list.hidden=false;control.setAttribute('aria-expanded','true');status.textContent=matches.length+' opções encontradas'
  }
  control.addEventListener('focus',()=>{show(editing?control.value:'');control.select()})
  control.addEventListener('input',()=>{
    editing=true;control.setCustomValidity('Selecione uma opção da lista para confirmar o cadastro.');show(control.value)
  })
  control.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();if(list.hidden)show(editing?control.value:'')
      if(matches.length){active=(active+(e.key==='ArrowDown'?1:active<0?0:-1)+matches.length)%matches.length;highlight()}
    }else if(e.key==='Enter'&&!list.hidden){e.preventDefault();const choice=matches[active<0?0:active];if(choice)choose(choice)}
    else if(e.key==='Escape'){e.preventDefault();editing=false;sync();close()}
  })
  control.addEventListener('blur',()=>{if(!editing)sync();close()})
  select.addEventListener('invalid',e=>{e.preventDefault();control.focus();control.reportValidity?.()})
  select.addEventListener('change',()=>{editing=false;sync()})
  searchableInstances.set(select,{sync});sync()
}
function syncSearchableSelects(root=document){
  root.querySelectorAll('select').forEach(select=>{enhanceSearchableSelect(select);searchableInstances.get(select)?.sync()})
}
if(typeof document!=='undefined'&&typeof MutationObserver!=='undefined'){
  syncSearchableSelects()
  new MutationObserver(changes=>{
    if(changes.some(m=>['SELECT','OPTION'].includes(m.target.nodeName)||[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('select')||n.querySelector?.('select')))))syncSearchableSelects()
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','selected','required']})
}
