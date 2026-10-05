# Validação da demonstração

## Revisão atual — 01/10/2026

- Suíte Node: **40 testes aprovados, zero falhas**. Nova regressão normaliza pequena 105×98 para 105×58 sem perder pedidos ou revisão do estado v12.
- Sintaxe de `domain.js`, `script.js`, `views.js` e `interactions.js` verificada com `node --check`, sem erros.
- [Roteiro final HF-01 a HF-14](docs/ROTEIRO_HOMOLOGACAO_FINAL.md) preparado; **não executado manualmente nesta revisão**.
- Medidas confirmadas: grande 105×105 e pequena 105×58 mm. Menções antigas a 180×160/105×98 e v3 atual abaixo são históricas, substituídas por v12 e pelas medidas oficiais.
- Flutter/build/analyze, API, concorrência real, impressão física e aprovação regulatória não validados nesta entrega. Evidências datadas abaixo não representam aceite atual.

## Cobertura do escopo de negócio

| Critério do refinamento    | Situação neste protótipo                                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Usuários e perfis       | Perfis predefinidos, login demo, ativação/desativação e ações restritas. Sem cadastro completo ou segurança real.                                                                                                                   |
| 2. Cadastros               | Cliente básico; ingredientes com CRUD de nome, código, INS, categoria funcional, grupo padronizado e regra restrita de percentual; recebimento de lotes usa o cadastro central. Demais cadastros são de consulta. Parcial.          |
| 3. Fórmulas e versões      | Consulta, composição dinâmica, quantidades com 5 casas decimais, conferência de soma × rendimento, criação de versão, ativação e preservação de histórico. Sem inativação/obsolescência via UI.                                     |
| 4. Custos e preços         | Simulação de insumos/embalagem, parâmetros padrão com variações salvas por produto e liberação com snapshot. Sem tributos/despesas completos.                                                                                       |
| 5. Produto e fórmula       | Valida fórmula ativa, produto ativo e preço liberado; novo produto compõe a fórmula inicial com ingredientes disponíveis. Validade, “Contém”, descrição, alérgicos/glúten, modo de uso e conservação são editáveis.                 |
| 6. Pedidos e análises      | Criação multi-item como entrada oficial, prioridade, prazo de produção e condições de pagamento com uma ou mais parcelas definidas por dias e valor automático. Texto de condições comerciais é opcional e adicional.               |
| 7. OP por item             | Geração independente, sem duplicação e bloqueada enquanto lotes válidos/liberados não cobrirem a necessidade agregada de matérias-primas.                                                                                           |
| 8. Documento da OP         | Geração registrada; Fórmula para produção e Etiquetas possuem botões e telas independentes. O documento traz cabeçalho, embalagem, “Contém”, modo de uso e composição percentual/em kg da batida.                                   |
| 8a. Etiqueta no pedido     | Cada item abre a etiqueta grande; lote recebe a data atual, fabricação não é exibida e validade usa o cadastro do produto até existir lote produzido. Textos fixos continuam editáveis; PDF pelo navegador, sem exportação `.nlbl`. |
| 9. Produção/perdas/consumo | Apontamento parcial, múltiplos lotes, perdas, sobras e custos de insumos. Sem reaproveitamento de sobras.                                                                                                                           |
| 10. Estoque                | Entradas, ajustes justificados, validade, saldo, movimentos e fila de pedidos aguardando lote. Sem inventário completo, reserva ou prioridade entre pedidos.                                                                        |
| 11. Qualidade              | Inspeção pendente/aprovada/reprovada, motivo e laudo; Ficha Técnica demonstrativa por pedido/lote, com itens e nutrição. Sem assinatura ou conteúdo regulatório homologado.                                                         |
| 12. Faturamento            | Abre parcelas previstas no pedido, divide o total exatamente e conclui após todas as baixas. Despacho independente; sem NF-e.                                                                                                       |
| 13. Frete/despacho         | Transportadora, tomador emitente/destinatário, valor, prazo, saída, rastreamento, baixa do lote final e confirmação auditada de entrega.                                                                                            |
| 14. Rastreabilidade        | Consulta de lote de entrada até OP/lote final/pedido/cliente/despacho e caminho reverso.                                                                                                                                            |
| 15. Relatórios             | Recortes básicos por perfil, histórico anual de atraso por cliente e comissão final baseada em recebimentos do mês. Sem conciliação bancária, BI completo ou filtros temporais avançados.                                           |
| 16. Auditoria              | Antes/depois, usuário, perfil, ação e horário. Consulta; sem imutabilidade real de servidor.                                                                                                                                        |
| 17. Versões do protótipo   | Página de atualizações disponível a todos os perfis, com v3 atual, histórico v2, IDs de regras e atalhos para as áreas afetadas.                                                                                                    |

## Testes executados em 14/09/2026

### Revisão incremental em 24/09/2026

- Sintaxe de `domain.js` e `interactions.js` verificada.
- Suíte de domínio: **34 testes passaram, zero falhas**, incluindo CRUD protegido de ingredientes, composição inicial do produto, parâmetros próprios, lista dinâmica e cinco casas decimais.
- Revisão de 28/09/2026 (v10): **36 testes passaram, zero falhas**, incluindo ordenação por quantidade, agrupamento funcional, percentuais restritos a sal/INS 250/251 e preservação do grupo no pedido e na OP. Sintaxe dos quatro arquivos JavaScript verificada.
- Revisão de 29/09/2026 (v11): **37 testes passaram, zero falhas**, incluindo os limites de 25% e acima de 25% para especiarias e a declaração fechada de aromatizantes.
- Revisão de 30/09/2026 (v12): **39 testes passaram, zero falhas**; modelos oficiais configurados em 105 × 105 mm e 105 × 58 mm, com teste automatizado confirmando que as dimensões permanecem no seed. A calibração física depende da impressora e da mídia reais.
- A inspeção visual do novo card e do editor responsivo permanece recomendada antes da próxima apresentação.

### Revisão incremental em 17/09/2026

- Sintaxe dos quatro arquivos JavaScript de execução verificada.
- Suíte de domínio: **30 testes passaram, zero falhas**, incluindo persistência dos textos editáveis do modelo grande.
- Fluxo de navegador validado como Administrador: pedido `PED-01001` → item → `Abrir etiqueta`.
- Editor do modelo grande aberto com todos os campos fixos separados; logotipo carregado e console sem erros.
- Comparação visual registrada em `design-qa.md`, com resultado aprovado para demonstração.

### Domínio

Suíte Node nativa em `tests/domain.test.cjs`: **25 testes passaram, zero falhas**. Verificação de sintaxe dos quatro arquivos JavaScript de execução também passou. A cobertura inclui divisão exata das parcelas, criação sem texto de condições comerciais adicionais, baixas individuais e despacho com faturamento em andamento.

### Interface no navegador

Executado pela UI, sem injetar estados no app:

- Login Comercial, Financeiro e Administrador; indicadores e menus diferentes; credencial inválida recusada.
- Criação do PED-01004 com dois itens, R$ 2.300,00 e 200 kg, sem antecipar comissão ao Comercial.
- Envio pelo Comercial; liberação pelo Financeiro; aprovação comercial e desaparecimento da edição.
- Geração das OP-00002 e OP-00003; emissão de fichas e início de produção.
- Apontamento integral de ambas; primeira fórmula consome dois lotes de ácido cítrico.
- Inspeção dos PA-00001 e PA-00002; faturamento liberado apenas para o pedido elegível.
- Registro de faturamento e despacho; transportadora/rastreio presentes no pedido.
- Consulta da rastreabilidade do PA-00001, incluindo cinco consumos, dois lotes de ácido cítrico, fornecedores, versão da fórmula e despacho.
- Recarga, novo login e recuperação do pedido despachado.
- Abertura de módulos administrativos; consulta de erros do navegador sem erros registrados no recorte inspecionado.
- Revisão visual do login e dashboard desktop; dashboard 390 × 844, valor monetário corrigido para não quebrar centavos; menu móvel abre e fecha.
- Flag de dados ligada por padrão; desligada mantém os nove logins, zera os indicadores, oculta “Novo pedido” sem cadastros e exibe tabelas vazias. Ao religar, o conjunto com dados reaparece sem mistura entre os modos.

### Não validado / não entregue

- Não foi executado build, teste ou alteração do Flutter.
- A Ficha Técnica teve sintaxe e regressão do domínio verificadas, mas ainda requer homologação visual e de conteúdo pela Qualidade; os nutrientes são sintéticos.
- Não houve publicação nem teste em hospedagem externa.
- Não foi validado fluxo compartilhado entre computadores: não existe backend nesta demo.
- A suíte não testa concorrência real, segurança em produção ou integração fiscal.
- A inspeção visual não é uma auditoria completa de acessibilidade ou compatibilidade em todos os navegadores.
- Etiquetas: ainda não foram homologadas as medidas físicas, conteúdo regulatório, código de barras, quantidade por impressão, impressão em lote ou integração com impressora térmica.
- Etiqueta grande: o formato de impressão 180 × 160 mm é demonstrativo e deve ser conferido na impressora e mídia reais antes do uso.
- Testes de domínio de P&D, estoque e cadastro não substituem homologação operacional completa de seus formulários pela empresa.

Antes de enviar à empresa, revisar `REFERENCIA_FLUTTER.md` e confirmar que as premissas demonstrativas estão adequadas. Dados de teste criados no navegador de revisão não fazem parte do seed distribuído: nova origem/navegador começa com os três cenários iniciais.


### RN-ETQ-006 — Nome do cliente (01/10/2026)

Abrir etiqueta grande no pedido e na OP com cliente curto, ALIMENTOS DO NORTE — DEMONSTRAÇÃO e nome extenso. Conferir texto completo entre as divisórias em janela larga/estreita e na prévia de impressão 105 × 105 mm. Calibração física permanece pendente. A suíte de domínio não mede geometria de texto no navegador.


Validação executada: 40 testes de domínio aprovados e conferência geométrica no Edge com quatro nomes (incluindo texto sem espaços), em larguras de 735, 360 e 397 px; 12 cenários sem transbordamento. Script: tests/check-label-layout.cjs (requer Playwright e Edge). Impressão física não executada.


## Entrega 05/10/2026

43 testes automatizados aprovados (domain.test.cjs + search.test.cjs). Busca verificada com acentos, múltiplos termos, CNPJ sem pontuação, vazio e restauração; renderização das três listas verificada em VM. Oito cenários e persistência JSON validados. Sintaxe JS aprovada. Validação visual em navegador e homologação presencial não executadas nesta entrega.

## P&D — Reunião 05/10/2026 (v14)

53 testes automatizados aprovados: domain.test.cjs, pd.test.cjs e search.test.cjs; sintaxe dos quatro arquivos JS aprovada. Navegador validado em origem isolada localhost:8766: orçamento antes de salvar, bombona 20 L com peso kg manual (18 kg), cadastro de saco 10 kg/R$ 2,35, persistência após recarga, edições repetidas em rascunho, primeira ativação v1 e segunda v2. Layout do catálogo conferido em tela compacta. Domínio cobre v2→v3→v4, permissões, capacidade, inatividade, migração e snapshots de pedido/OP. Não houve execução Flutter ou integração com estoque/API/banco.

## v15 — 05/10/2026
57 testes de domínio/P&D/busca/qualidade aprovados. Navegador isolado em 8767: novo pedido base 1 kg, amostra 100 kg, abertura por célula, OP, ajuste 2→3 batidas e máximo 33,33333, emissão de fórmula, totais 100%/100 kg/33,33333 kg/100 kg, lote 05102026 e etiquetas sem dimensões. Visualização do documento conferida. Impressão física e capacidades reais continuam pendentes.

Navegação por Enter na linha da OP também conferida no navegador. Recarregamento confirmou v15 e persistência da amostra de teste no ambiente isolado.

### Ajuste de apresentação — 05/10/2026
RN-OP-003: botão **Modificar** imediatamente ao lado de **Gerar fórmula para produção**, na OP aguardando início. O modal informa máximo em kg e batidas; o valor salvo alimenta os kg por ingrediente/batida na ficha. Sem alteração de fórmula, consumo ou versão. Cache dos recursos atualizado para v15.1.

## Correção v15.2 — 05/10/2026
A captura da OP em produção evidenciou uma restrição indevida da v15/v15.1. RN-OP-003 passa a permitir **Modificar** ao lado da fórmula em OP aguardando ou em produção. Substitui a limitação anterior ao início. Ajuste revisa planejamento da ficha para o total da OP, com auditoria; não modifica produção, lotes, consumos ou versão da fórmula já registrados. OP concluída permanece bloqueada. Capacidades reais seguem pendentes. 58 testes, incluindo preservação após apontamento parcial.
