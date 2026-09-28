# Histórico de versões do protótipo

Este documento espelha a página **Atualizações do protótipo**. Alterações funcionais devem atualizar, na mesma entrega, a coleção `releases` em `domain.js`, o catálogo `REGRAS_DE_NEGOCIO.md`, os critérios em `VALIDACAO.md`, a matriz de impacto e este histórico.

## v10 — 28/09/2026 — versão atual

### Padronização e ordenação da declaração de ingredientes

- **Ingredientes / Rótulo — RN-ING-004 — Confirmada:** bases da fórmula aparecem primeiro e os demais ingredientes são agrupados por categoria funcional, sempre em ordem decrescente de participação.
- **Cadastros — RN-ING-005 — Confirmada:** ingredientes passam a registrar categoria funcional e grupo padronizado 01–04; o produto também registra seu grupo para reaproveitamento em etiquetas, fichas e documentos.
- **Etiquetas — RN-ETQ-005 — Confirmada:** percentuais são calculados pela fórmula e permitidos apenas para sal, nitrito de sódio (INS 250) e nitrato de sódio (INS 251).
- **Rastreabilidade:** grupo e declaração ficam congelados no item do pedido e na OP.
- **Pendência:** confirmar se o item manuscrito semelhante a “Max” pertence oficialmente ao grupo 02; ele não foi criado como categoria autônoma no protótipo.

## v9 — 28/09/2026

### Fórmula para produção e dados de Qualidade no produto

- **P&D / Qualidade — RN-PD-004 — Confirmada:** produto passa a registrar validade e declaração “Contém”; checkboxes dos ingredientes montam uma sugestão baseada em categoria e INS, mantendo o texto aberto para revisão.
- **Produção — RN-OP-002 — Confirmada:** Documento da OP foi remodelado como Fórmula para produção, com identificação, quantidades, embalagens, modo de uso, “Contém” e composição calculada para a batida.
- **Etiquetas — RN-ETQ-003 — Confirmada:** lote assume a data do dia ao abrir a impressão, o campo fabricação deixa de ser exibido e a validade usa o produto até existir lote final.
- **Etiquetas — RN-ETQ-001 / RN-ETQ-004 — Confirmadas:** somente os ingredientes marcados no “Contém” alimentam a lista da etiqueta; a aba abre com 1 pequena e 2 grandes, permite alterar as quantidades no topo e mostra os dois modelos preenchidos.
- **Impressão:** Fórmula para produção recebeu estrutura compacta de planilha, bordas, cabeçalho e estilos específicos para papel; a etiqueta grande aproxima hierarquia, divisórias e destaques variáveis da referência física.
- **P&D / Qualidade — RN-PD-005 — Confirmada:** descrição, alérgicos, glúten, modo de uso e conservação passam a pertencer ao produto e são congelados no pedido/OP.
- **Navegação:** Fórmula para produção e Etiquetas deixaram de compartilhar a mesma tela; cada botão da OP abre somente seu documento.
- **Identidade da etiqueta:** modelos pequeno e grande usam fundo branco e texto integralmente preto, seguindo as faixas e divisórias da nova referência.
- **Pendências:** homologar redação regulatória do “Contém”, formato da validade, quantidade de etiquetas, dimensões de impressão e responsáveis pelos vistos.
- **Impacto futuro:** Flutter, API e banco precisam persistir validade/declaração no produto e preservar snapshots no pedido, OP e emissão da etiqueta.

## v8 — 24/09/2026

### Cadastro operacional de ingredientes

- **Ingredientes / Estoque — RN-ING-001 — Demonstrada:** módulo em Operação com cadastro, edição, consulta e exclusão de nome, código, INS opcional e categoria; o recebimento usa a mesma base.
- **Ingredientes — RN-ING-002 — Demonstrada:** exclusão protegida quando há fórmula ou lote vinculado.
- **Ingredientes / P&D — RN-ING-003 — Demonstrada:** a composição inicial do novo produto lista ingredientes com saldo em lotes liberados e válidos; a produção continua consumindo por lote.
- **Impacto futuro:** Flutter, API e banco precisam separar o cadastro-base do ingrediente dos lotes de estoque e aplicar integridade referencial na exclusão.

## v7 — 24/09/2026

### Fórmulas precisas e precificação por produto

- **P&D / Precificação — RN-PD-001 — Confirmada:** parâmetros padrão são apresentados em um card editável e as variações ficam salvas somente no produto.
- **P&D / Fórmulas — RN-PD-002 — Confirmada:** o editor de nova versão permite adicionar e remover ingredientes e persiste a lista informada.
- **P&D / Fórmulas — RN-PD-003 — Confirmada:** quantidades aceitam cinco casas decimais; soma, falta ou excesso são exibidos e a criação exige fechamento com o rendimento.
- **Impacto futuro:** Flutter, API e banco devem representar as sobrescritas por produto e usar decimal exato para as quantidades.

## v6 — 17/09/2026

### Etiqueta grande editável e acessível pelo pedido

- **Pedidos / Etiquetas — RN-ETQ-001 / RN-ETQ-002 — Demonstrada:** cada item do pedido abre a prévia da etiqueta grande com produto, cliente, ingredientes e peso preenchidos automaticamente.
- **Etiquetas — Entregue no protótipo:** o modelo enviado foi reproduzido com seções para informações regulatórias, alergênicos, modo de uso, conservação, cliente, fabricante, lote, validade e peso.
- **Edição:** os textos fixos podem ser modificados no módulo Etiquetas; lote, fabricação e validade continuam derivados da produção.
- **Impressão:** a ação abre o diálogo do navegador com área demonstrativa de 180 × 160 mm.
- **Homologação pendente:** medidas, margens, conteúdo regulatório, permissões e impressora de destino ainda precisam ser validados.

## Registro incremental — 16/09/2026

### Etiquetas vinculadas ao Documento da OP

- **Produção / Etiquetas — RN-ETQ-001 — Demonstrada:** a consulta do Documento da OP possui aba de etiqueta com prévia preenchida pelos dados da OP e do produto, sem redigitação do cadastro.
- **Etiquetas — Entregue no protótipo:** o módulo lista modelos cadastrados e etiquetas atribuídas às OPs, permitindo abrir a prévia e imprimir/salvar em PDF pelo navegador.
- **Escopo atual:** lote, fabricação e validade são preenchidos quando já existe lote de produto; antes disso, a etiqueta informa que esses dados serão definidos na produção.
- **Homologação pendente:** medidas físicas, quantidade por impressão, conteúdo regulatório, código de barras, instruções, identidade visual e impressão em lote ainda precisam ser confirmados.

## v5 — 14/09/2026 — versão atual

### Faturamento parcelado e financeiro paralelo

- **Pedidos — RN-PED-006 — Demonstrada:** prazos de parcelas são adicionados como itens no novo pedido e ficam congelados após o envio.
- **Correção de consistência — RN-PED-006:** condições comerciais passaram a ser tratadas como texto adicional opcional; a configuração das parcelas é a fonte dos prazos e valores.
- **Faturamento — RN-FAT-002 — Demonstrada:** o valor total é dividido automaticamente, com ajuste exato dos centavos, e cada parcela recebe vencimento e baixa próprios.
- **Financeiro e logística — RN-FIN-002 — Demonstrada:** o faturamento mensal considera as parcelas pagas; despacho e entrega seguem mesmo com parcelas abertas.

## v4 — 14/09/2026

### Prioridade, prazo e confirmação de entrega

- **Pedidos — RN-PED-005 — Demonstrada:** somente pedidos registrados no sistema avançam no fluxo.
- **Produção — RN-PRD-002 — Demonstrada:** entrada define prioridade e limite automático de 7 dias corridos, com fila por vencimento e alerta de atraso.
- **Logística — RN-LOG-001 / RN-LOG-002 — Demonstrada:** tomador do frete obrigatório e confirmação de entrega com data e recebedor.

## v3 — 10/09/2026

### Disponibilidade, logística e transparência

- **Pedidos e logística — RN-PED-004 — Demonstrada:** cálculo de volumes inteiros por tipo de embalagem, com total para transporte.
- **Estoque e produção — RN-EST-001 / RN-EST-003 — Demonstrada:** etapa “Aguardando lote”, detalhamento das faltas e trava de geração de OP até existir matéria-prima suficiente.
- **Qualidade — RN-QUA-002 / RN-QUA-003 / RN-QUA-004 — Demonstrada com conteúdo pendente:** Ficha Técnica consultável e imprimível por pedido ou lote.
- **Experiência de uso — Entregue:** reorganização responsiva de preço, pacotes, peso e volumes no novo pedido.
- **Governança — RN-GOV-001 — Demonstrada:** versão atual e histórico de entregas visíveis dentro do protótipo.

## v2 — 31/08/2026

### Fluxo operacional integrado

- **Pedidos — RN-PED-001 / RN-PED-002 / RN-PED-003:** imutabilidade após envio ao Financeiro, pedido complementar e snapshots.
- **Financeiro — RN-FIN-001 / RN-COM-001:** análise com justificativa, revalidação de crédito e comissão por recebimento.
- **Produção — RN-OP-001:** uma OP por item e Documento da OP obrigatório antes do início.
- **Rastreabilidade — RN-RAS-001:** percurso consultável do fornecedor ao cliente e no sentido inverso.

## Pendências de manutenção

- Validar com a empresa os textos e a seleção de entregas históricas.
- Não apresentar regra demonstrada ou pendente como requisito homologado.
- Manter datas e IDs idênticos entre esta página, a coleção `releases` e o catálogo de regras.
