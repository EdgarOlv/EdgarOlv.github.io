const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')
const D = require('../domain.js')
test('busca normaliza acentos, CNPJ e termos; limpar restaura as linhas', () => {
  const source = fs.readFileSync(path.join(__dirname, '../interactions.js'), 'utf8')
  const fn = source.slice(source.indexOf('function filterSearchList('), source.indexOf("document.addEventListener(", source.indexOf('function filterSearchList(')))
  const rows = [{textContent:'São Carlos 12.345.678/0001-95'}, {textContent:'Belém PED-01003 Tempero'}]
  const status = {}
  const context = vm.createContext({document:{querySelectorAll:()=>rows}, $:()=>status})
  vm.runInContext(fn,context)
  const search = value => context.filterSearchList({value,dataset:{listSearch:'clients'}})
  search('sao carlos'); assert.deepEqual(rows.map(r=>r.hidden), [false,true])
  search('12345678000195'); assert.deepEqual(rows.map(r=>r.hidden), [false,true])
  search('belem tempero'); assert.deepEqual(rows.map(r=>r.hidden), [true,false])
  search('inexistente'); assert.ok(rows.every(r=>r.hidden)); assert.match(status.textContent,/Nenhum/)
  search(''); assert.ok(rows.every(r=>!r.hidden)); assert.match(status.textContent,/2 de 2/)
})
test('três listas renderizam campo de busca, escopo e cliente da OP', () => {
  const s = D.demoSeed()
  const context = vm.createContext({state:s,user:s.usuarios[0],D,find:D.get,clients:()=>s.clientes,technical:()=>true,can:()=>true,esc:String,money:String,qty:String,unitLabel:r=>r.unidade==='KG'?'kg':'UN',fmtDate:String,badge:String,btn:()=>'',actionButton:()=>'',link:()=>'',notice:()=>'',intro:()=>'',panel:(_,body)=>body,input:(_,name,value,type,attrs)=>`<input id="${name}" ${attrs}>`,table:(_,rows)=>JSON.stringify(rows)})
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../views.js'),'utf8'),context)
  for (const [fn,key] of [['clientsView','clients'],['productsView','products'],['productionView','production']]) {
    const html = context[fn]()
    assert.ok(html.includes(`data-list-search="${key}"`))
    assert.ok(html.includes(`data-search-list="${key}"`))
  }
  assert.match(context.productionView(),/AlimNorte/)
})
