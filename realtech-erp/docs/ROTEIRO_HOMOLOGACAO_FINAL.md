# Roteiro final de homologação — 01/10/2026

Base: protótipo v12 + correção de 01/10; cobre as entregas recentes e regressão do ciclo completo. Duração sugerida: uma sessão por setor, além da sessão integrada. Todos os dados são sintéticos.

O Guia de demonstração apresenta dois casos sugeridos: **1º ciclo comercial** e **2º P&D, amostras e etiquetas**. O segundo percorre as atualizações recentes em 12 passos; os cenários HF abaixo permanecem como checklist detalhado fora da tela do guia. Os blocos de pendências empresariais e homologação final foram retirados apenas da apresentação navegável.

## Preparação e evidência

Use uma base local exclusiva de teste. Exportar/preservar o estado antes de reiniciar a demonstração; reiniciar remove o histórico local. Iniciar com dados demonstrativos para referências de ingredientes/lotes. Anotar navegador, data, perfil, IDs de pedido/OP/lote e resultado por cenário. Não usar clientes, fórmulas ou preços reais.

Status inicial dos cenários manuais abaixo: **não executados nesta revisão**. Testes Node já existentes são evidência automatizada de domínio, não aceite visual/operacional. Registrar resultado como aprovado, reprovado ou pendente; só a empresa pode homologar as propostas.

| ID | Ação e casos a demonstrar | Resultado esperado / evidência automatizada relacionada |
| --- | --- | --- |
| HF-01 | Ingredientes: cadastrar/editar código, INS opcional, categoria e grupo; tentar excluir ingrediente com fórmula/lote; comparar ingrediente com e sem lote liberado/válido/saldo no novo produto | Cadastro-base separado do estoque; vínculo impede exclusão; composição inicial filtra disponibilidade. Testes cadastro e criação de produto |
| HF-02 | P&D: adicionar/remover ingrediente na nova versão; usar 0,00001; tentar soma menor/maior que rendimento; fechar corretamente | Versão só nasce com composição consistente, sem truncar para 3 casas. Teste fórmula dinâmica |
| HF-03 | Precificação: mudar padrões, salvar override de um produto, comparar outro produto e preço já liberado | Override não altera padrão nem produto vizinho; histórico liberado preservado. Testes preço/overrides/snapshot |
| HF-04 | Contém: selecionar/desmarcar ingredientes; bases e categorias fora de ordem; sal/INS250/251 e ingrediente não elegível a %; aromatizantes; especiarias em 25% e acima de 25% | Ordem por participação; apenas percentuais permitidos; aromas fechados; especiarias abrem somente acima do limite, sem %. Testes declaração e fronteira |
| HF-05 | Produto: salvar validade livre, descrição, alérgicos/glúten, uso/conservação e Contém manual; enviar pedido/gerar OP; depois editar cadastro | Pedido/OP anteriores mantêm snapshot; novo pedido usa revisão nova. Testes conteúdo do produto e versões preservadas |
| HF-06 | Comercial: 20 UN × 5 kg e 5 UN × 20 kg, conferir 200 kg e R$2.300 do seed; volumes com resto; parcelas 14/20 dias sem texto comercial adicional | UN não se confunde com kg; volumes arredondados; soma dos centavos fecha. Testes ciclo, volumes e parcelas |
| HF-07 | Enviar ao Financeiro e tentar editar; bloquear/restringir sem motivo; liberar, mudar crédito e tentar aprovar; testar complementar e acesso por outro vendedor | Corte de edição, motivo obrigatório e revalidação de crédito; histórico preservado. Testes financeiro, edição e segregação |
| HF-08 | Aprovar sem estoque suficiente; receber/liberar lote; gerar OPs, tentar duplicar; consultar Fórmula para produção; iniciar sem emissão do documento | Aguardando lote deriva do estoque; uma OP/item; documento obrigatório, composição em kg da batida. Testes pré-OP/documento/duplicação |
| HF-09 | Apontar parcialmente com perdas/sobras; tentar lote vencido/bloqueado, saldo insuficiente e lote repetido; concluir restante | FEFO elegível, consumos agregados e nenhuma baixa parcial na falha; histórico de apontamentos e sobras segregado. Testes atomicidade e ciclo |
| HF-10 | Abrir etiquetas na OP e no módulo; buscar OP/pedido/cliente/produto; conferir 1 pequena/2 grandes e editar; imprimir separadamente grande e pequena; comparar com imagens oficiais | Grande 105×105 com cliente/pictograma; pequena 105×58 sem cliente; conteúdo do snapshot, lote do dia, sem fabricação separada, validade herdada; nenhuma exportação .nlbl. Medir papel a 100%, sem ajustar à página. Registrar impressora/mídia/margens. Quantidade configurada NÃO comprova N cópias impressas |
| HF-11 | Inspecionar cada lote; reprovar um e tentar faturar/reinspecionar; consultar rastreabilidade direta/reversa e Ficha Técnica | Reprovação não desaparece; faturamento bloqueado; vínculos íntegros. Ficha Técnica distinta da Fórmula para produção; valores nutricionais demo não homologados. Testes Qualidade/rastreabilidade do ciclo |
| HF-12 | Com todos os lotes aprovados, faturar; conferir recebíveis, duplicação, despachar ainda sem quitar todas as parcelas; tomador obrigatório; confirmar entrega; receber por parcela | Financeiro paralelo à logística; saída/entrega auditadas; comissão mensal baseada em recebimentos. Testes parcelas/despacho/entrega/duplicação |
| HF-13 | Qualidade cria amostra, gera OP/documento, produz/inspeciona/encaminha; tentar fazê-la seguir análise comercial ou faturamento comercial | Rota separada de amostra sem dupla aprovação comercial; permissões próprias. Teste amostra ponta a ponta; aceite empresarial ainda pendente |
| HF-14 | Trocar perfis, acessar ação proibida, usuário inativo; recarregar; verificar auditoria e Atualizações; comparar dados antigos das etiquetas após atualização | Bloqueios no domínio, persistência local íntegra, histórico atual único, correção 105×98→105×58 sem apagar estado. Testes permissões/persistência/releases/normalização |

## Regressão automática

Na pasta `Prototipo`, executar `node --test tests/domain.test.cjs`. Conferir sintaxe com `node --check domain.js`, `script.js`, `views.js` e `interactions.js`. Resultado desta revisão deve ser registrado em `VALIDACAO.md`; falha bloqueia a entrega da fatia afetada.

## Registro de aceite

Para cada HF: data, responsável/setor, perfil, registros utilizados, resultado, evidência (captura/PDF/medição), regra relacionada, pendência e responsável por responder. Correção exige repetir o cenário reprovado e os dependentes. Não marcar a sessão inteira aprovada por executar apenas o caminho feliz.

## Fora da cobertura do protótipo

Homologar separadamente Flutter Web/Windows, autenticação/API, concorrência de saldo e escrita, idempotência de requisições, decimal no banco, anexos/documentos persistidos, impressão real, backup/restauração, integração fiscal e offline se contratado. O protótipo não comprova esses itens.
