const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const D = require('../domain.js')
const source = fs.readFileSync(require('node:path').join(__dirname,'../interactions.js'),'utf8')
function ui(state=D.seed()) {
 const context=vm.createContext({state,D,find:D.get,esc:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money:n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),qty:n=>String(n),formulaQty:n=>String(n),fields:rows=>rows.map(r=>r.join(': ')).join('\n'),table:(headers,rows,totals)=>headers.join('|')+'\n'+rows.map(r=>r.join('|')).join('\n')+(totals ? '\nTOTAL:'+totals.join('|') : ''),input:(label,name)=>`<input name="${name}" aria-label="${label}">`,select:(label,name)=>`<select name="${name}"></select>`,btn:label=>`<button>${label}</button>`})
 vm.runInContext(source.slice(source.indexOf('function packagingEditor('),source.indexOf('function budgetPayload()')),context)
 return context
}
test('edição apresenta embalagem e orçamento independentes, com mesma visão geral na formação de preço',()=>{
 const c=ui(),p=c.state.produtos[0]
 assert.doesNotMatch(c.packagingEditor(p),/draftBudgetResult|orcamentoMargem|Calcular orçamento/)
 assert.match(c.budgetEditor(p),/Orçamento do produto/)
 assert.doesNotMatch(c.budgetEditor(p),/name="embalagemId"/)
 const html=c.budgetOverview(D.priceSimulation(c.state,p),p,D.get(c.state.formulas,p.formulaId))
 for(const label of ['Matéria-prima','Financeiro','Mão de obra','Outros custos','Lucro / markup','Encargos sobre venda','Preço por embalagem','Venda estimada','Embalagens para a fórmula']) assert.ok(html.includes(label))
 assert.match(html,/R\$\s*16,81/)
 assert.match(html,/não margem líquida/)
})
test('ajuda do último recebimento explica créditos selecionados e conversão L/kg sem desconto duplicado',()=>{
 let s=D.seed()
 s=D.execute(s,D.get(s.usuarios,'admin'),'receiveLot',{ingredienteId:'i1',fornecedorId:'s1',codigo:'ORC-L',unidade:'L',quantidade:10,pesoLiquidoKg:8,valorUnitario:10,icmsPercentual:18,icmsCreditado:true,ipiPercentual:5,ipiCreditado:false,fabricacao:D.today(),validade:D.day(90)}).state
 const before=structuredClone(s), c=ui(s),p=s.produtos[0],html=c.budgetOverview(D.priceSimulation(s,p),p,D.get(s.formulas,p.formulaId))
 assert.match(html,/Último recebimento ORC-L/)
 assert.match(html,/18 \+ 0/)
 assert.match(html,/IPI informado: 5% \(não creditado\)/)
 assert.match(html,/10 L ÷ 8 kg = R\$ 10,25\/kg/)
 assert.match(html,/não descontar novamente/)
 assert.deepEqual(s,before)
})
test('legado não inventa valores brutos, e custo manual de embalagem é explicado como manual',()=>{
 const c=ui(),p=c.state.produtos[0],sim=D.priceSimulation(c.state,p)
 const html=c.budgetOverview(sim,p,D.get(c.state.formulas,p.formulaId),{manualPackaging:true,packagingCost:450,approved:'20'})
 assert.match(html,/Sem recebimento de origem disponível/)
 assert.match(html,/Custo líquido = valor unitário/)
 assert.match(html,/Não é recalculado do catálogo/)
 assert.match(html,/Preço comercial informado/)
 assert.match(html,/R\$\s*20,00/)
 assert.match(html,/total considera embalagens inteiras/)
})
test('ajudas escapam nomes e têm controles acessíveis que não submetem formulário',()=>{
 const c=ui();const html=c.calculationHelp('<nome>', '<script>conteúdo</script>')
 assert.doesNotMatch(html,/<script>|<nome>/)
 assert.match(html,/type="button"/)
 assert.match(html,/aria-controls="calculation-help-/)
 assert.match(html,/role="tooltip"/)
 assert.match(html,/&lt;script&gt;/)
})

test('detalhe da fórmula mostra custo líquido unitário, produção e totais de todas as colunas numéricas',()=>{
 const c=ui(), formula=D.get(c.state.formulas,c.state.produtos[0].formulaId)
 const before=structuredClone(c.state),html=c.productCompositionTable(formula)
 assert.match(html,/Custo unitário na fórmula \(R\$\/kg\)/)
 assert.match(html,/Custo de produção \(R\$\)/)
 // 10 kg de ácido a 8,50/kg => 85,00; soma dos 4 ingredientes => 545,00.
 assert.match(html,/10 kg\|10%\|R\$\s*8,50\/kg\|R\$\s*85,00/)
 assert.match(html,/TOTAL:Total\|100 kg\|100%\|R\$\s*70,50\/kg\|R\$\s*545,00/)
 assert.match(html,/não o custo por kg do produto/)
 assert.match(html,/R\$\s*5,45\/kg/)
 assert.deepEqual(c.state,before)
})
