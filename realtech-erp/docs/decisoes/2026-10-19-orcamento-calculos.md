# Embalagem separada e orçamento explicável — 19/10/2026 (v19)

Origem: Edgar solicitou no chat separar os blocos de embalagem/orçamento ao editar fórmula e formação de preço, com visão geral do produto e botão de dúvida por hover ou clique mostrando cálculos. Continuação do refinamento de RN-PD-007 e RN-EST-008; não cria nova regra fiscal, motor de preço ou integração.

## RN-PD-008 — Orçamento explicável

**Confirmado:** separar embalagem do orçamento e explicar custo líquido e demais cálculos. **Demonstrado:** apresentação de tabelas/resumo, tooltip por hover/foco e fixação por clique, totais e textos propostos. **Pendente:** aceite visual da empresa e calibração de conteúdo/permissões definitivas de P&D já pendentes; não bloqueiam outros módulos.

- Editor de fórmula/produto: bloco Embalagem final contém seleção, peso/volume e sugestão. Orçamento do produto é seção irmã com markup, ação de calcular e visão geral. Criação/edição de produto usa a mesma separação para consistência.
- Formação de preço: Embalagem e volumes separado dos parâmetros comerciais e do Orçamento do produto. Custo de embalagem ajustado manualmente por kg é identificado como manual, sem prometer atualização do catálogo/apresentação.
- Resumo comum mostra produto/rendimento/peso, todos os ingredientes com quantidade/custo líquido por kg/custo na fórmula e memória dos créditos quando existe recebimento de origem.
- Ajuda do ingrediente: líquido = bruto × (1 − (ICMS creditado + IPI creditado)/100); apenas flags marcadas reduzem custo. Entrada em L: custo líquido/L × litros recebidos ÷ peso líquido total kg. Custo do ingrediente na fórmula = quantidade kg × custo líquido/kg. Matéria-prima/kg = soma desses custos ÷ rendimento.
- Não descontar impostos novamente sobre custo líquido. Sem recebimento de origem, mostrar regra geral e informar que bruto/créditos históricos não estão disponíveis, sem inventar percentuais zero.
- Resumo: matéria-prima, embalagem/kg, materiais, financeiro, mão de obra, outros custos, custo primário, markup, lucro, base com lucro, encargos de venda discriminados na ajuda, preço/kg, preço/embalagem, venda estimada da fórmula e quantidade/custo de embalagens inteiras. Formação de preço exibe ainda preço comercial informado, separado do calculado.
- Equações seguem priceSimulation existente: primário = materiais + adicionais (arredondamento por kg); lucro = primário × markup/100 (centavos); base = primário + lucro; preço/kg = ceil_centavo(base ÷ (1 − encargos/100)); preço/embalagem = preço/kg × peso (centavos). Markup não é margem líquida de venda. Encargos na venda não são créditos na compra.
- Venda estimada da fórmula = preço/kg × rendimento. Embalagens inteiras = ceil(rendimento ÷ peso por embalagem); custo total = quantidade × custo unitário. Informar que preço/kg usa rateio proporcional e que custo das embalagens inteiras não é somado novamente. Última embalagem pode estar incompleta. Mantém o contrato demonstrativo anterior, sem mudar política de parciais de produção.
- `?` é button type=button com nome acessível, aria-controls/expanded e texto vinculado. Hover, foco visível por teclado e clique revelam ajuda; clique fixa/fecha, fora fecha, Escape fecha ajuda antes do diálogo. Textos de cadastros escapados no HTML. A interação não salva, não envia formulário e não libera preço.
- Orçamento usa o resultado do motor existente; renderizador compartilhado para rascunho e formação de preço evita versões divergentes da apresentação. Não altera composição, dados persistidos, fórmulas de preço ou arredondamento.

## Aceite e verificação

1. Abrir Editar fórmula: conferir blocos independentes e ver todos os custos no orçamento. Alterar composição/embalagem/markup e conferir recálculo existente.
2. Em ingrediente com entrada 10 L a R$10, ICMS18% creditado, IPI5% não creditado e peso 8 kg, ajuda deve mostrar (18+0), R$8,20/L e R$10,25/kg. Não repetir desconto no subtotal. Legado deve identificar a ausência da origem.
3. Abrir Editar formação de preço: conferir embalagem/volumes, parâmetros e orçamento separados. Alterar custo adicional e conferir resumo atualizado; abrir ajuda de preço e comparar equação/resultado.
4. Usar hover/clique/Tab/Enter/Escape/clique externo; nenhuma dessas ações deve salvar rascunho ou liberar preço. Escape de uma ajuda aberta mantém o diálogo.

Testes: `node --test tests/*.test.cjs` — 78 aprovados, zero falhas; quatro JS passam em `node --check`. Nova suíte `budget-ui.test.cjs`: separação/visão geral, origem L/kg e flags de crédito com ausência de escrita, legado/manual, escape HTML e botões acessíveis. Log em `../../Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v19-testes.txt`.

QA navegador em origem isolada localhost:8773: edição de fórmula e formação de preço abertas, resumo completo, clique em ajuda e Escape sem fechar diálogo. Evidência visual em `../v19-orcamento-calculos.png`. Hover/foco implementados por CSS; validação de toque e tecnologias assistivas reais permanece pendente (não equivale a homologação integral).

## Matriz de impacto

| Camada | Impacto |
|---|---|
| Protótipo | interactions.js: componentes separados, renderizador comum e ajuda; flows.css: popover e responsividade; index/domain: versão v19. Schema12 e estado intactos |
| Flutter | precificacao_screen.dart ainda não tem paridade desta memória de cálculo. Portar blocos e apresentação usando resultados do caso de uso, Tooltip para hover/foco e popover acionável para clique/toque. Não duplicar motor de cálculo na tela |
| API | Nenhuma nova chamada/mutação. Contrato futuro deve retornar memória do cálculo e origem do custo, com autorização existente |
| Banco | Nenhum novo campo ou migration; reutiliza preço/custo e dados do recebimento v18. Não reconstruir bruto/créditos de legado |

Próxima demonstração: comparar os dois editores e abrir ajuda de ingrediente com créditos, markup e preço final. Flutter/Dart/SQL não alterados; implementação das etapas Flutter permanece conforme checkpoint anterior.
