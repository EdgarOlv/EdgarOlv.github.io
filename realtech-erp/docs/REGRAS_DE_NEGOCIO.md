# Catálogo de regras de negócio

## Atualização vigente — 13/10/2026 (v17)

- **RN-ETQ-003 (confirmada, substituída a redação antiga):** lote DDMMAAAA da geração permanece na consulta/reimpressão. Não recalcular data atual ao abrir.
- **RN-ETQ-007 (confirmada):** validade MMM/AAAA; 12 meses a partir de outubro/2026 → OUT/2027. Datas preservadas; validade explícita de lote disponível na geração mantém precedência.
- **RN-QUA-005 (confirmada):** referência do laudo fica oculta no formulário, preservada no domínio/histórico.
- [Decisão, aceite e limites](decisoes/2026-10-13-etiquetas-datas-qualidade.md). O histórico de 28/09 preserva a redação anterior, agora substituída.

**Revisão técnica de 13/10/2026:** [preparação da migração v16/schema 12](../../Docs/MIGRACAO_FLUTTER_2026-10-13/README.md). Não altera maturidade nem homologa propostas. Para RN-PD-002/003, o salvamento valida e mantém rascunho; número publicado só ao ativar (RN-PD-006). Para RN-OP-003, a correção v15.2 permite modificar em aguardando/emProducao, preservando execução; concluída bloqueia. As redações históricas abaixo que mencionam criar versão ao salvar ou somente antes do início devem ser lidas com essas substituições.

**Atualizado em:** 01/10/2026  
**Maturidade estimada:** 80%; os itens restantes serão descobertos e homologados com a empresa.

## Status

Consolidação para Flutter: [contrato oficial](../../Docs/CONSOLIDACAO_FLUTTER_2026-10-01.md). Roteiro de aceite: [HF-01 a HF-14](ROTEIRO_HOMOLOGACAO_FINAL.md). A revisão documental não promove regras demonstradas a confirmadas.

### Fluxo de amostras — RN-AMO-001 (Demonstrada)

Qualidade pode criar e conduzir amostra sem análise financeira e aprovação comercial, com OP, documento e inspeção próprios. O domínio possui teste do ciclo e das permissões. A autorização definitiva e o isolamento do fluxo comercial devem ser homologados no HF-13; não copiar essa exceção para pedidos comerciais.

- **Confirmada:** decisão registrada ou homologada.
- **Demonstrada:** proposta do protótipo aguardando confirmação.
- **Pendente:** informação insuficiente para implementação definitiva.

| ID         | Área                   | Regra                                                                                                                                                                                                                                                                     | Status                             |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| RN-PED-001 | Pedidos                | Pedido fica imutável ao ser enviado ao Financeiro.                                                                                                                                                                                                                        | Confirmada                         |
| RN-PED-002 | Pedidos                | Correção após o corte ocorre por pedido complementar vinculado.                                                                                                                                                                                                           | Demonstrada                        |
| RN-PED-003 | Pedidos                | Item preserva produto, unidade, peso, preço, comissão e fórmula/versão.                                                                                                                                                                                                   | Confirmada                         |
| RN-PED-004 | Pedidos / Logística    | Item preserva tipo de volume, unidades por volume e limite máximo; o pedido calcula volumes inteiros para transporte arredondando o restante para cima.                                                                                                                   | Demonstrada                        |
| RN-PED-005 | Pedidos                | Somente pedido registrado no sistema pode avançar para análise, produção, faturamento e despacho.                                                                                                                                                                         | Demonstrada                        |
| RN-PED-006 | Pedidos / Financeiro   | O pedido registra uma ou mais parcelas por prazo em dias; seus valores são divididos automaticamente e ficam congelados após o envio ao Financeiro. O campo de condições comerciais é apenas adicional e não substitui nem torna obrigatória a configuração das parcelas. | Demonstrada                        |
| RN-FIN-001 | Financeiro             | Restrição/bloqueio exige justificativa; aprovação revalida crédito.                                                                                                                                                                                                       | Confirmada                         |
| RN-OP-001  | Produção               | Cada item gera no máximo uma OP; Documento da OP antecede o início.                                                                                                                                                                                                       | Confirmada                         |
| RN-OP-002  | Produção / Qualidade   | O Documento da OP usa o formato “Fórmula para produção” e apresenta identificação, cliente, pedido, quantidades, embalagens, lote, validade, modo de uso, declaração “Contém” e composição percentual/em kg da fórmula e da batida.                                          | Confirmada; assinaturas pendentes  |
| RN-ETQ-001 | Produção / Etiquetas   | A etiqueta consultada no pedido ou na OP usa um modelo cadastrado e preenche produto, cliente, ingredientes selecionados no campo “Contém”, lote/data de impressão, validade, peso e embalagem. Ingredientes não marcados permanecem na fórmula, mas não entram automaticamente no rótulo. | Confirmada; redação pendente       |
| RN-ETQ-004 | Produção / Etiquetas   | Cada OP inicia com a sugestão de 1 etiqueta pequena e 2 grandes. A aba Etiquetas permite alterar as quantidades no topo e apresenta abaixo as prévias preenchidas dos dois modelos.                                                                                        | Confirmada                         |
| RN-ETQ-002 | Pedidos / Etiquetas    | Cada item do pedido permite abrir e imprimir a etiqueta grande e os textos fixos do modelo podem ser modificados no módulo Etiquetas. A regra anterior de datas `A definir` foi substituída por RN-ETQ-003.                                                                  | Parcialmente substituída           |
| RN-ETQ-003 | Produção / Etiquetas   | Lote DDMMAAAA e validade MMM/AAAA ficam registrados na geração da etiqueta e são preservados em consulta/reimpressão; sem fabricação separada. Prazo em meses usa a data de geração; validade explícita disponível do lote mantém precedência.                                                                                | Confirmada                         |
| RN-PRD-001 | Produção               | Apontamento pode ser parcial e inclui produto bom, perdas e sobras.                                                                                                                                                                                                       | Demonstrada                        |
| RN-PRD-002 | Produção               | A entrada do pedido define a prioridade e gera limite demonstrativo de conclusão em 7 dias corridos; filas são ordenadas pelo vencimento.                                                                                                                                 | Demonstrada; calendário pendente   |
| RN-EST-001 | Estoque                | Consumo usa lotes liberados, válidos e com saldo, priorizando validade.                                                                                                                                                                                                   | Demonstrada                        |
| RN-EST-002 | Estoque                | Consumo, saldos, perdas, sobras e lote final devem ser atômicos.                                                                                                                                                                                                          | Confirmada como requisito futuro   |
| RN-EST-003 | Estoque / Produção     | Antes de gerar OPs, o pedido aprovado verifica se os lotes válidos e liberados cobrem a necessidade agregada de matérias-primas; se faltar saldo, fica em “Aguardando lote” e é liberado automaticamente após a entrada suficiente.                                       | Demonstrada                        |
| RN-ING-001 | Ingredientes / Estoque | O cadastro central de ingredientes contém nome, código único, INS opcional e categoria; ele alimenta a seleção no recebimento de matéria-prima.                                                                                                                            | Demonstrada                        |
| RN-ING-002 | Ingredientes           | Ingrediente que já possui lote ou participa de fórmula não pode ser excluído, preservando rastreabilidade e histórico.                                                                                                                                                     | Demonstrada                        |
| RN-ING-003 | Ingredientes / P&D     | Na composição inicial de um novo produto, o seletor oferece ingredientes com saldo em lotes liberados e válidos; usos posteriores da produção continuam selecionando lotes.                                                                                               | Demonstrada                        |
| RN-ING-004 | Ingredientes / Rótulo | A declaração usa somente os ingredientes marcados no produto. As bases da fórmula aparecem primeiro, em ordem decrescente de quantidade; os demais são agrupados por categoria funcional, e categorias e itens são ordenados da maior para a menor participação na fórmula. | Confirmada                         |
| RN-ING-005 | Ingredientes / Produtos | Ingredientes registram categoria funcional de rotulagem e grupo padronizado; produtos também registram o grupo. Os grupos são: 01 — matéria-prima, aditivos únicos e especiarias; 02 — condimentos, aditivos gerais, blends, mix e Max; 03 — fumaças, óleos e corantes; 04 — pastas e molhos. | Confirmada                         |
| RN-ING-006 | Ingredientes / Rótulo | Aromatizantes são declarados somente como “Aromatizantes”, sem identificar seus componentes. Especiarias são declaradas somente como “Especiarias” quando sua soma representa até 25% da fórmula; acima de 25%, seus nomes são listados entre parênteses, em ordem decrescente, sem percentuais. | Confirmada                         |
| RN-QUA-001 | Qualidade              | Cada lote exige inspeção; reprovação bloqueia faturamento sem apagar histórico.                                                                                                                                                                                           | Confirmada                         |
| RN-QUA-002 | Qualidade              | Qualidade/Administrador gera Ficha Técnica por pedido ou lote.                                                                                                                                                                                                            | Demonstrada                        |
| RN-QUA-003 | Qualidade              | A ficha reúne pedido, cliente, lote, itens, embalagens, pesos e nutrição por produto.                                                                                                                                                                                     | Demonstrada                        |
| RN-QUA-004 | Qualidade              | Dados nutricionais oficiais precisam de versão e aprovação técnica.                                                                                                                                                                                                       | Pendente                           |
| RN-FAT-001 | Faturamento            | Faturar exige OPs concluídas e lotes aprovados.                                                                                                                                                                                                                           | Confirmada                         |
| RN-FAT-002 | Faturamento            | O faturamento abre um acompanhamento por parcela e só fica concluído quando todas estiverem pagas.                                                                                                                                                                        | Demonstrada                        |
| RN-FIN-002 | Financeiro / Logística | Parcelas são baixadas individualmente e compõem a competência mensal; pagamentos pendentes não bloqueiam despacho nem entrega.                                                                                                                                            | Demonstrada                        |
| RN-RAS-001 | Rastreabilidade        | Rastrear do fornecedor ao cliente e no sentido inverso.                                                                                                                                                                                                                   | Confirmada                         |
| RN-COM-001 | Comissão               | Regra fica no item; comissão final deriva de recebimento confirmado.                                                                                                                                                                                                      | Confirmada, com exceções pendentes |
| RN-SEG-001 | Segurança              | Permissão deve ser validada em UI, caso de uso/API e auditada.                                                                                                                                                                                                            | Confirmada                         |
| RN-GOV-001 | Governança             | O protótipo apresenta versão atual e histórico de entregas, relacionando cada atualização funcional aos IDs das regras e às áreas demonstráveis.                                                                                                                          | Demonstrada                        |
| RN-LOG-001 | Logística              | O despacho exige identificar o tomador do frete como emitente ou destinatário.                                                                                                                                                                                            | Demonstrada                        |
| RN-LOG-002 | Logística              | Após o despacho, a expedição confirma data da entrega e quem recebeu; a confirmação é única e auditada.                                                                                                                                                                   | Demonstrada                        |
| RN-PD-001  | P&D / Precificação     | Parâmetros padrão são carregados na formação de preço e podem ser sobrescritos e salvos por produto, sem alterar o padrão global nem outros produtos.                                                                                                                     | Confirmada                         |
| RN-PD-002  | P&D / Fórmulas         | A composição da nova versão é uma lista dinâmica: permite adicionar e remover ingredientes e salva a lista e as quantidades informadas.                                                                                                                                   | Confirmada                         |
| RN-PD-003  | P&D / Fórmulas         | Quantidades aceitam até 5 casas decimais. Antes da criação, o sistema informa soma e diferença para o rendimento; a versão só é criada quando os valores fecham.                                                                                                         | Confirmada                         |
| RN-PD-004  | P&D / Qualidade        | O produto possui validade aberta para edição e uma declaração “Contém” editável, sugerida a partir dos ingredientes marcados na composição. A sugestão usa categoria e INS do cadastro quando disponíveis.                                                               | Confirmada; redação pendente       |
| RN-PD-005  | P&D / Qualidade        | O produto mantém descrição de etiqueta, declaração de alérgicos habilitada por checkbox, checkbox “Não contém glúten”, modo de uso e conservação. Pedido e OP preservam esses dados para preencher Fórmula para produção e etiquetas.                                      | Confirmada                         |
| RN-ETQ-005 | Ingredientes / Etiquetas | Na lista declarada, percentual é permitido somente para sal e para nitrito/nitrato de sódio (INS 250 e INS 251), calculado sobre o rendimento da fórmula. Os demais ingredientes e aditivos são exibidos sem percentual. | Confirmada                         |
| RN-ETQ-006 | Produção / Etiquetas | A etiqueta grande usa o modelo oficial quadrado de 105 × 105 mm, com cliente destacado; a etiqueta pequena usa o modelo oficial de 105 × 58 mm, sem bloco de cliente. Ambas preservam cabeçalho, declarações, modo de uso, fabricante, lote, validade, peso e rodapé conforme as referências recebidas. | Confirmada |

RN-ETQ-006 — ajuste visual demonstrado em 01/10/2026: o nome completo do cliente adapta a fonte à largura e altura do bloco, preservando o espaço do título e das divisórias. Legibilidade física continua sujeita à calibração.

Valores, fórmulas, nutrientes, pessoas e credenciais do seed são sintéticos.

## Lacunas prioritárias por módulo

| Módulo                  | Falta fechar                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| Qualidade/Ficha Técnica | conteúdo regulatório, assinatura, responsável, aprovação, revisão, armazenamento e envio                     |
| P&D                     | criação, teste, aprovação, sigilo e publicação de fórmulas/produtos                                          |
| PCP/Produção            | regra da lousa, prioridade, capacidade, replanejamento e retrabalho                                          |
| Fiscal                  | relação com Netspeed, tipos de operação, NF-e, devoluções e remessas                                         |
| Financeiro              | Sicoob, boletos, baixa parcial, estorno, cobrança e contas a pagar                                           |
| Logística               | cotação, escolha de frete, comprovantes, ocorrências e confirmação de entrega                                |
| Estoque / PCP           | reserva de saldo por pedido, prioridade entre pedidos concorrentes e inclusão das embalagens na trava pré-OP |
| Acessos                 | múltiplas permissões, delegação, alçadas e proteção de ações sensíveis                                       |

## Interface e demonstração — 05/10/2026

- RN-UX-001: busca imediata nas listas de Clientes, Produtos e Produção, sem acentos, com contagem e recorte por perfil. Solicitação confirmada; comportamento demonstrado.
- RN-DEMO-001: oito cenários sintéticos gerados pelas transições do domínio, com narrativa e etapa atual no Guia. Demonstrada.

[Critérios, testes e pendências](decisoes/2026-10-05-busca-cenarios-reuniao.md).

## Decisões da reunião de 05/10/2026 — P&D

- RN-PD-006 (Confirmada): salvamentos editam/reutilizam rascunho; versão incremental é atribuída somente na ativação. Substitui o momento de criação de versão da redação anterior de RN-PD-002/003, preservando composição dinâmica, precisão e fechamento do rendimento.
- RN-PD-007 (Confirmada): orçamento da composição em edição antes de salvar, sem liberar preço comercial.
- RN-EMB-001 (Confirmada): catálogo de embalagens em P&D, capacidade KG/L, custo unitário e peso líquido manual; custo e apresentação separados da massa da fórmula.
- RN-EMB-002 (Solicitação confirmada, algoritmo demonstrado): sugestão por menor capacidade compatível, custo em empate, substituível pelo profissional.

[Contrato, aceite, evidências e pendências](decisoes/2026-10-05-pd-rascunhos-orcamento-embalagens.md).

## 05/10/2026 — v15
- RN-PED-007 (confirmada): novos pedidos e amostras em kg, base 1 kg, embalagem/volumes separados; histórico UN preservado.
- RN-OP-003 (confirmada; padrão demonstrativo): máximo e quantidade de batidas recalculam entre si antes do início. Padrão sintético 50 kg editável.
- RN-OP-002 (ampliada): INS antes do nome, somatórios de percentual/fórmula/batida/OP, etiquetas registradas sem medidas e lote compacto.
- RN-UX-002 (confirmada): linhas de registros clicáveis e acessíveis por Enter/Espaço, sem disparar ações de alteração por clique na área de dados.
Critérios, permissões e pendências: [decisão v15](decisoes/2026-10-05-qualidade-quilos-batidas-ux.md).

## Correção v15.2 — 05/10/2026
A captura da OP em produção evidenciou uma restrição indevida da v15/v15.1. RN-OP-003 passa a permitir **Modificar** ao lado da fórmula em OP aguardando ou em produção. Substitui a limitação anterior ao início. Ajuste revisa planejamento da ficha para o total da OP, com auditoria; não modifica produção, lotes, consumos ou versão da fórmula já registrados. OP concluída permanece bloqueada. Capacidades reais seguem pendentes. 58 testes, incluindo preservação após apontamento parcial.

## 09/10/2026 — Fornecedores e login
RN-FOR-001: cadastro alimenta recebimento (solicitação confirmada; campos/status/perfis demonstrados). RN-UX-003: card único de login com ajuda em modal (confirmada; apresentação demonstrada). [Aceite e pendências](decisoes/2026-10-09-fornecedores-login.md).

## 15/10/2026 — v18
RN-EST-008: unidades KG/L, créditos ICMS/IPI e último custo; RN-ING-004: grupos editáveis; RN-EMB-003: medida livre; RN-FOR-002: CNPJ/endereço/observação/categorias; RN-EMB-004: estoque e consumo de embalagens. Solicitações e custo/peso confirmados; FEFO, parcial cumulativa e categorias demonstrados. [Decisão v18](decisoes/2026-10-15-pd-recebimentos-embalagens.md).

## 19/10/2026 — v19
**RN-PD-008:** separar embalagem/orçamento e explicar cálculos no ? (hover, foco, clique). Orçamento completo usa resultados do cálculo existente; créditos na compra e encargos sobre venda são distintos. Solicitação confirmada, apresentação demonstrada. [Aceite e impacto](decisoes/2026-10-19-orcamento-calculos.md).

## 19/10/2026 — v19.1
**RN-PD-009:** composição no detalhe com custo unitário líquido/kg e custo de produção (quantidade × unitário), somas em rodapé. Soma unitária identificada como soma aritmética, separada do custo/kg da mistura. [Aceite e impacto](decisoes/2026-10-19-composicao-custos-totais.md).

## 19/10/2026 — v20
**RN-ING-005:** catálogo compartilhado de categorias de rotulagem, segunda tabela em grupos; IDs estáveis, criar/editar/inativar. **RN-FOR-002 ampliada/esclarecida:** manter Ingredientes/Embalagens e selecionar também várias categorias do mesmo catálogo do ingrediente. [Contrato e aceite](decisoes/2026-10-19-categorias-rotulagem-fornecedores.md).


## 22/10/2026 — Ficha técnica v21

RN-FT-001 confirmada: edição manual dos percentuais públicos, pré-preenchidos do P&D, sem margem uniforme. RN-FT-002 confirmada: ficha e fórmula independentes. RN-FT-003 demonstrada: revisões e aprovação pela Qualidade/Administrador. [Contrato](decisoes/2026-10-22-ficha-tecnica-qualidade.md).


## Ajuste P&D na v21 — ingrediente único durante a edição

RN-PD-010 (confirmada por Edgar em 22/10/2026): impedir ingrediente duplicado já na seleção da composição, tanto em novo produto quanto em criação/edição de fórmula. Não esperar o salvamento final.

Correção: cada seletor mantém sua escolha atual e desabilita ingredientes usados nas outras linhas, identificando-os como já incluídos. Adicionar também rejeita ID repetido; trocar a seleção atualiza todas as opções; remover libera a opção novamente. Seleção duplicada recebida por evento é revertida imediatamente com aviso para editar a quantidade existente. Quantidades, filtro de estoque e validação final do domínio permanecem.

Aceite: selecionar A na primeira linha e conferir A desabilitado nas outras; trocar A por C e conferir A disponível; remover uma linha e conferir liberação; adicionar até esgotar opções sem repetir; salvar segue a validação de integridade existente. Cobertura em tests/formula-choices.test.cjs (seleção/troca/remoção/reversão e estoque). 92 testes passam; sintaxe JS aprovada. QA visual pendente. Não há nova regra comercial ou cálculo: correção preventiva de uma duplicidade já rejeitada pelo domínio.

Impacto Flutter/API/banco: na etapa de telas, derivar opções disponíveis dos IDs selecionados no ViewModel e atualizar ao adicionar/trocar/remover; manter validação de unicidade no caso de uso/API e futura restrição composta (revisão da fórmula, ingrediente). Não remover opção atual ao reconstruir formulário. Sem novo campo, DDL ou Dart nesta entrega. Próximo cenário: demonstrar duas linhas e troca/remoção para P&D; não há pendência funcional para este bloqueio.


## 22/10/2026 — Recebimentos e fornecedores v22

RN-EMB-005: recebimento por código com nome/apresentação do cadastro. RN-EST-009: compra/custo em colunas distintas e unidade comparável. RN-FOR-003: CNPJ obrigatório e validado, IE opcional e endereço separado. Confirmadas; opções visuais demonstradas. [Contrato](decisoes/2026-10-22-recebimentos-precos-fornecedores.md).


## 22/10/2026 — v23 apresentação integrada

RN-DEMO-002: um pedido de 100 kg/R$1.100, 20 baldes/2 caixas, 2 fornecedores, recebimentos, OP, ficha, lote aprovado, despacho e duas parcelas de R$550 (uma paga). 100 testes aprovados; chave local nova preserva a anterior e o modo vazio. Contrato, aceite, migração e impacto Flutter em [decisão v23](decisoes/2026-10-22-demonstracao-integrada.md). Guia atualizado; QA visual pendente. Sem mudanças Dart/SQL/backend. E1/E2/E3 continuam não iniciadas.


## 22/10/2026 — v24 quatro cenários

RN-DEMO-002 corrigida por solicitação de Edgar: quatro pedidos em rascunho, análise, produção parcial e despacho; duas OPs iniciais; guia completo com links e ações ponta a ponta. [Contrato, aceite e impacto Flutter](decisoes/2026-10-22-quatro-cenarios-apresentacao.md). 102 testes passam, inclusive concluir os quatro em sequência, sem faltar estoque. Nova chave local preserva bases antigas. QA visual pendente; E1/E2/E3 e Dart/SQL/backend sem execução.


## 22/10/2026 — v25 catálogo e acesso à ficha

RN-DEMO-002 ampliada: 12 ingredientes, 5 produtos, 4 embalagens, 4 fornecedores, 3 clientes, 18 lotes; quatro pedidos/duas OPs e guia preservados. RN-FT-004: Visualizar ficha técnica como ação primária no início do modal, prévia da revisão salva. [Contrato e impacto Flutter](decisoes/2026-10-22-catalogo-ampliado-ficha-acesso.md). 104 testes aprovados; chave local nova preserva anteriores. QA visual pendente. Dart/SQL/backend/E1/E2/E3 sem execução.
