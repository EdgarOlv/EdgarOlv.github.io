# REALTECH — referência do protótipo para Flutter

**Adendo vigente — v17 de 13/10:** RN-ETQ-003 preserva lote da geração, RN-ETQ-007 exibe validade MMM/AAAA (12 meses desde outubro/2026 → OUT/2027), RN-QUA-005 oculta referência do laudo sem remover dados. [Decisão e impacto](docs/decisoes/2026-10-13-etiquetas-datas-qualidade.md). Não portar a redação histórica de data atual a cada abertura.

## Adendo de preparação — 13/10/2026

Referência vigente v16/schema 12: [diagnóstico e três etapas](../Docs/MIGRACAO_FLUTTER_2026-10-13/README.md). Novos pedidos/amostras KG com legado UN; RN-PD-006 numera só ao ativar; batidas podem ser modificadas em OP aguardando/emProducao conforme v15.2; login RN-UX-003 card único e fornecedores RN-FOR-001 CRUD conectado. Textos antigos abaixo que descrevam UN exclusivo, duas áreas de login ou fornecedores só consulta são históricos. Implementação/arquitetura dependem do recorte aprovado, sem promover regras D a C.

## Adendo vigente — 01/10/2026

Consultar [contrato consolidado](../Docs/CONSOLIDACAO_FLUTTER_2026-10-01.md) e [roteiro final](docs/ROTEIRO_HOMOLOGACAO_FINAL.md). A referência histórica abaixo permanece como contexto; em divergências, prevalecem decisões confirmadas e regras atuais.

- Fórmulas aceitam **cinco casas**, distintas do arredondamento de saldo. API/banco precisam de decimal exato e escala por campo.
- Há recebíveis locais por parcela, sem integração bancária. Financeiro e logística são paralelos: despacho não exige quitação integral; não inferir estado financeiro por estado logístico.
- Etiquetas: grande 105×105 e pequena 105×58 mm; pequena sem cliente. Amostras possuem fluxo separado, demonstrado e sujeito a aceite.
- Flutter ainda não porta integralmente os contratos novos; build/analyze não executado nesta revisão.

Atualizado em 31/08/2026. Referência de comportamento e aparência, não especificação homologada. As decisões desta rodada estão detalhadas em [`docs/decisoes/2026-08-31-ajustes-negocio.md`](docs/decisoes/2026-08-31-ajustes-negocio.md). O índice completo está em [`docs/decisoes/README.md`](docs/decisoes/README.md).

A referência geral de alinhamento do projeto está em [`../REFERENCIA_PROJETO.md`](../REFERENCIA_PROJETO.md). Este arquivo detalha apenas a tradução do protótipo para Flutter; estados, vocabulário, regras de dados, limites e divergências comuns devem ser conferidos no documento geral.

## Decisão visual

**Preservar o estilo do protótipo e reproduzi-lo no Flutter**, conforme orientação do usuário. O tema navy do Flutter atual não foi aplicado ao protótipo. Nenhum arquivo do aplicativo Flutter foi alterado nesta entrega.

O arquivo `styles.css` original foi preservado. `flows.css` acrescenta os fluxos, diálogos e adaptação responsiva. Não há framework, fonte remota ou biblioteca de UI a portar: são componentes convencionais.

| Componente do protótipo          | Equivalente Flutter sugerido                                | Contrato visual                                                       |
| -------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `.app`, `.sidebar`, `.workspace` | `AppScaffold`, `Row`, `Expanded`; `Drawer` em tela estreita | Lateral branca de 252 px, seleção azul clara; não copiar o navy atual |
| `.topbar`                        | `AppBar` ou header do `AppScaffold`                         | Branco, título 22–24 px, ações à direita                              |
| `.metric-card`, `.panel`         | `Card`, `Container`, `InkWell` quando clicável              | Raio 18 px, borda clara, sombra discreta                              |
| `.metric-grid`, `.grid-2`        | `LayoutBuilder`, `Wrap` ou grid responsivo                  | 4 indicadores no desktop, 2 no celular; sem altura fixa para texto    |
| `.table-wrap`, `table`           | `DataTable` em `SingleChildScrollView` horizontal           | Cabeçalho discreto, espaçamento 10–11 px, vazio explícito             |
| `.primary-btn`, `.ghost-btn`     | `FilledButton`, `OutlinedButton`                            | Raio 12 px; ações com texto, foco visível                             |
| `input`, `select`, `textarea`    | `TextFormField`, `DropdownButtonFormField`, `Form`          | Raio 12 px, rótulo visível, validação no formulário                   |
| `dialog#flowDialog`              | `Dialog`, `AlertDialog` com área central rolável            | Máximo 940 px e 90% da altura; cabeçalho/rodapé acessíveis            |
| `.status`                        | `StatusBadge`                                               | Cor e texto; nunca depender apenas da cor                             |
| `.flow-steps`                    | `Row` rolável ou indicador de etapas próprio                | Cada etapa deriva das entidades; não inventar status do pedido        |
| `.flow-toast`, `.form-error`     | `SnackBar`, mensagem de erro no formulário                  | Não fechar o formulário se a gravação falhar                          |
| `.login-shell`, `.login-preview` | `LayoutBuilder`, `Row`/`Column`, `LinearGradient`           | Duas áreas no desktop; empilhamento no celular                        |

### Tokens que devem orientar `AppTheme`

| Token                              | Valor                                               |
| ---------------------------------- | --------------------------------------------------- |
| Primária                           | `#2563EB`                                           |
| Primária hover                     | `#1D4ED8`                                           |
| Seleção / destaque claro           | `#EAF2FF`                                           |
| Texto principal                    | `#172033`                                           |
| Texto secundário                   | `#69758A`                                           |
| Fundo                              | `#F5F7FB`                                           |
| Painel / lateral                   | `#FFFFFF`                                           |
| Bordas                             | `#E6EBF2`                                           |
| Sucesso / alerta / erro            | `#16A34A` / `#D97706` / `#DC2626`                   |
| Raio de card / campo               | 18 / 12 px                                          |
| Padding de página desktop / mobile | 26 / 16 px                                          |
| Breakpoints usados                 | 1100 px (layout intermediário), 800 px (menu móvel) |

Tipografia: Segoe UI, Inter se instalada, Arial e sans-serif. No Flutter, escolher uma fonte distribuída com o app para consistência entre Windows e Web. Não depender de emoji como ícone final: mapear a semântica para `Icons.*` mantendo tamanho e cor. Login e cartões devem usar widgets, não imagens que dificultem responsividade.

## Organização da implementação

```text
index.html                     estrutura do app e diálogo
styles.css + flows.css         tema e layout preservados
script.js                      sessão demo, navegação, persistência, helpers, pedidos/dashboard
views.js                       telas dos demais módulos
interactions.js                formulários, eventos e operações de interface
domain.js                      entidades, seed, validações e transições sem DOM
tests/domain.test.cjs           cenários executáveis no Node
```

Fluxo atual: ação de UI → `commit` → `D.execute` em cópia de estado → persistência local → substituição do estado → renderização. Em erro, a cópia é descartada, o estado anterior é preservado e o diálogo permanece aberto. Isso evita baixa parcial na simulação; **não é transação multiusuário**.

Tradução para uma arquitetura futura: widgets → casos de uso/Riverpod → repositório/cliente HTTP → API → persistência MySQL. A validação local orienta a interação; autorização, concorrência, validação final, auditoria e transações pertencem ao servidor. O aplicativo não deve se conectar diretamente ao MySQL. A tecnologia da API ainda não foi escolhida; `Cloud Functions` é uma possibilidade histórica, não uma decisão vigente.

## Contratos de dados e regras críticas

1. **UN não é KG.** `quantidade` é número inteiro de unidades vendidas; `pesoKg` é peso por unidade congelado no item/OP. 20 UN × 5 kg = 100 kg. `volumeTipo`, `unidadesPorVolume` e `limiteUnidadesPorVolume` também são congelados no item; volumes de transporte = teto de `quantidade / unidadesPorVolume`, sem ultrapassar o limite configurado. Necessidade = quantidade do ingrediente / rendimento da fórmula × massa do apontamento. Os dois produtos vendáveis desta demo usam UN; venda fracionária em KG ainda não está implementada.
2. **Snapshots.** Item conserva nome, unidade, peso, preço, comissão, tabela e cópia da fórmula/versão. OP recebe essa versão. Nova versão ou tabela de preço não reescreve pedidos e OPs existentes. Revisar um pedido antes da aprovação o devolve a rascunho e invalida a análise atual, mantendo o histórico de decisões.
3. **Estados distintos.** Pedido usa `rascunho`, `aguardandoAprovacao`, `aprovado`, `emProducao`, `faturado`, `cancelado`, como os enums atuais do Flutter. Qualidade e despacho são entidades próprias; o texto “Próxima etapa” é calculado, não um novo enum do pedido. Um pedido despachado continua com status comercial `faturado`.
4. **Duas liberações e corte de edição.** Financeiro decide `liberado`, `liberadoComRestricao` ou `bloqueado`. Restrição/bloqueio exigem motivo. Aprovação comercial requer liberação e revalida crédito para liberações sem ressalvas. A edição é bloqueada já em `submitOrder`, antes da análise financeira; existe criação de complementar vinculado ao original.
5. **Uma OP por item.** Geração é explícita e não se repete. O Documento da OP deve ser gerado antes do início; “Ficha Técnica” fica reservado à Qualidade. Cada apontamento pode ser parcial e gera lote próprio. Conclusão exige quantidade boa acumulada igual à prevista. Sobreprodução de UN não é simulada.
6. **Consumo por lote.** Sugestão prioriza menor validade, mas o operador pode alterar quantidades. Exclui vencidos/bloqueados/sem saldo. Repetições do mesmo lote no payload são agregadas antes da checagem. Verifica todos os saldos e toda a composição antes de gravar qualquer movimento.
7. **Perdas e sobras.** Massa de entrada = UN boas × peso + perdas em kg + sobras em kg. Insumos consumidos incluem essa massa; custo de insumos fica registrado no apontamento. Sobras ficam segregadas no lote, com movimento próprio em KG, sem venda ou reaproveitamento automático. Não somar movimentos em UN e KG sem discriminar a unidade.
8. **Qualidade e saída.** Cada lote exige inspeção; reprovação fica bloqueada, sem botão que simplesmente apague o resultado. Faturamento exige todas as OPs concluídas, documentos da OP, liberações e todos os lotes aprovados, válidos e com saldo. Despacho baixa as UN dos lotes finais; frete é informativo.
9. **Comissão por recebimento.** O pedido conserva percentual/base aplicada, mas a comissão final mensal nasce de recebíveis efetivamente pagos no período. Faturamento apenas cria o recebível aberto. Baixas parciais, estornos e fechamento de competência continuam como decisões abertas.
10. **Dinheiro.** A demo usa centavos inteiros e comissão em basis points (500 = 5%), arredondada por item. Quantidades técnicas usam três casas. Na API/MySQL, seguir `DECIMAL(18,6)` do refinamento; definir o momento de arredondamento e usar tipo decimal apropriado no Dart.
11. **Sem atalhos de segurança.** Perfil é verificado na navegação, no desenho das ações e nos comandos do domínio. Diretor não recebe fórmula/custo por acesso gerencial implícito; seu detalhe de auditoria é resumido. Como todos os dados estão no JavaScript/localStorage, isso simula permissões, não protege segredos.
12. **Dados de Qualidade no produto.** Validade e declaração “Contém” pertencem ao produto, mas pedido e OP preservam snapshots. A declaração guarda os ingredientes selecionados e o texto final editável; a sugestão por categoria/INS não substitui validação regulatória.
13. **Etiqueta por data.** Na prévia, lote é a data atual e fabricação não aparece separadamente. A validade vem do lote final quando existente ou do cadastro do produto. A futura emissão precisa persistir o snapshot e não recalcular silenciosamente um documento histórico.
14. **Exceções da declaração.** Aromatizantes não abrem seus componentes. Especiarias só listam nomes quando sua soma ultrapassa 25% do rendimento e nunca exibem percentual. A futura API deve calcular o limite com decimal exato e centralizar a regra para todos os documentos.

## Correspondência com o Flutter existente

| Protótipo / comando                                | Destino existente                              | Atenção na tradução                                                                       |
| -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| login e módulos por perfil                         | `features/auth`, `core/router`, `AppScaffold`  | Separar acesso de leitura e permissão de mutação; menu não substitui proteção de rota/API |
| `saveOrder`, `submitOrder`, `approveOrder`         | `features/pedidos`, `pedidosProvider`          | Congelar dados, bloquear revisão, revalidar e invalidar análise ao editar                 |
| `analyze`                                          | `features/financeiro`                          | Não reconstruir pedido perdendo campos; guardar decisões históricas                       |
| `createOps`, `issueSheet`, `reportProduction`      | `features/producao`, `ordensProvider`          | Peso por embalagem, ficha explícita e lista de apontamentos/lotes                         |
| `receiveLot`, `adjustLot`                          | `features/estoque`, lotes/movimentos           | Saldo e movimentos na mesma transação; motivo obrigatório                                 |
| `saveIngredient`, `deleteIngredient`               | modelos/providers de ingredientes e nova tela  | Código único, INS opcional, categoria e bloqueio de exclusão por fórmula/lote              |
| `inspect`                                          | `features/qualidade`                           | Bloquear lote reprovado sem apagar histórico                                              |
| `bill`, `dispatch`                                 | `features/faturamento`, `features/despacho`    | Validar todas as OPs, não só a primeira; evitar duplicações                               |
| `createVersion`, `activateVersion`, `releasePrice` | fórmulas e precificação                        | Preservar versão; marcar preço como não liberado após troca técnica                       |
| RN-PD-001/002/003                               | fórmulas, produtos e precificação               | Lista dinâmica, 5 casas decimais, fechamento do rendimento e parâmetros próprios por produto |
| `trace`                                            | consulta a lotes, OPs e consumos               | Navegação direta/reversa até fornecedor e cliente                                         |
| `technicalSheet`                                   | Qualidade, Pedidos e futuro serviço documental | Criar nutrição versionada, snapshot, permissão, PDF persistido e auditoria                |

Na leitura do `LocalDataService` atual, `criarOrdemProducao` recebe a quantidade comercial sem conversão explícita de embalagem para kg. `concluirProducao` realiza baixas em sequência e guarda um único lote final na OP. Esses pontos precisam de adequação para representar os contratos acima. Isso é uma observação da leitura do código, **não uma validação de execução do Flutter**. O tema atual usa navy `#1A3A5C`; portar os tokens do protótipo é uma alteração futura no Flutter.

## Limites e decisões abertas

- Dados e composições são sintéticos, inspirados no seed do Flutter para manter vocabulário. Não representam catálogo, preço real ou fórmula industrial autorizada. Preço do Realçador nesta demo é R$ 240/UN; não reproduz os R$ 185 do seed Flutter.
- Comissão por produto é a única regra ativa. Precedência por cliente/vendedor/categoria e gatilho de pagamento aguardam decisão. Demo permite pagamento pelo Administrador depois do faturamento.
- Análise usa exposição inicial sintética + pedidos comprometidos. Não há pagamentos bancários nem contas a receber. Novos clientes têm limite zero.
- Cancelar depois de gerar OP exige estorno/replanejamento não simulado. Reprovação não implementa retrabalho. Sobras não implementam destinação.
- Ativação de nova versão mantém anteriores ativas para não impedir OPs já planejadas; inativação/obsolescência por processo não está implementada. Validar a política de corte de versões com P&D.
- O protótipo já aceita lista dinâmica e cinco casas decimais, mas o Flutter ainda precisa portar o editor e persistir sobrescritas de precificação por produto. Usar decimal exato na futura API/banco; `double` permanece apenas como limitação da demo Flutter.
- Administração tem exceção de acesso total para apresentação. Somente P&D e Administrador fazem ações técnicas. A matriz técnica cita `dispatch.read` para Fiscal, mas a demo permite escrita; confirmar o perfil de expedição.
- Laudo e comprovante são referências textuais; nenhum upload ou documento fiscal é gerado. O Documento da OP e a Ficha Técnica demonstrativa podem ser impressos/salvos como PDF pelo navegador, sem assinatura ou persistência. A Ficha Técnica inclui pedido, cliente, itens, pesos e nutrição sintética; o contrato oficial depende de homologação.
- Não implementa autenticação real, autorização real, backend, MySQL, multiusuário, sincronização, SQLite, criptografia, logs imutáveis, NF-e ou integrações externas.
- Cadastro de cliente é reduzido; usuários são predefinidos e ativáveis; ingredientes possuem CRUD demonstrativo, enquanto fornecedores e produtos não têm CRUD completo. Embalagens possuem cadastro/edição/inativação em P&D desde 05/10/2026. Relatórios são recortes básicos exportáveis.
- `localStorage` preserva alterações entre recargas e perfis no mesmo navegador/origem. Sessão sempre volta ao login ao recarregar. Há aviso de outra aba e detecção de revisão obsoleta, mas não há lock/transação entre abas. Testar em uma aba por vez.

## Fontes e precedência

- `../REFERENCIA_PROJETO.md`: contrato de alinhamento entre protótipo e Flutter.

- `Sistema/Docs/ERP REALTECH - Refinamento de Negocio.pdf`, v1.1, 21/07/2026: §§3, 4.1–4.18, 4.21 e fluxos/aceite.
- `Sistema/Docs/ERP_REALTECH_Refinamento_Tecnico.pdf`, v1.0, 03/08/2026: §§3–9, 13–14.
- Código atual em `Sistema/realtech_erp/lib/core/models`, `services`, `widgets`, `theme` e telas.

Os PDFs orientam regras. O código Flutter foi consultado para correspondência, não tratado como implementação já homologada. O visual original e o esclarecimento do usuário orientam o tema. A existência deste protótipo não oficializa as premissas pendentes.


## Atualização P&D — 05/10/2026

RN-PD-006/007 e RN-EMB-001/002: rascunho estável e versão só ao ativar; orçamento temporário na criação/edição; embalagem com capacidade KG/L e custo unitário, sem somar massa, com peso kg manual para litros. Conferir contrato e matriz antes de portar. Estado local mantém esquema v12 com catálogo adicionado por migração.

## v15 — contrato adicional
Portabilidade de KG/UN, preço/kg, embalagem separada e batidas exige snapshots e revisões. Flutter segue experimental. Ver decisão `docs/decisoes/2026-10-05-qualidade-quilos-batidas-ux.md` e matriz; 50 kg não é limite homologado.

## 09/10/2026 — Fornecedores e login
Referência: docs/decisoes/2026-10-09-fornecedores-login.md. Cadastro Flutter existente deve revisar seleção de ativos e histórico; login deve refletir card único e ajuda após homologação. Nenhum Dart alterado.

## v18 — contrato adicional
Ver [recebimentos/P&D/embalagens](docs/decisoes/2026-10-15-pd-recebimentos-embalagens.md): último custo projetado separado do custo do lote, L→kg por peso manual, grupos, fornecedor ampliado, medida livre e consumo UN por apontamento. Portar por etapas, com transação, decimal exato e testes do contrato; nenhuma migração física nesta entrega.

## v19 — orçamento explicável
RN-PD-008: [contrato](docs/decisoes/2026-10-19-orcamento-calculos.md). Separar blocos de embalagem e orçamento; compartilhar apresentação da memória do caso de uso entre edição de fórmula/formação de preço. Ajuda acessível por hover/foco e clique/toque, sem salvar. Dart não alterado.

## v19.1 — tabela da composição
RN-PD-009: [cinco colunas e totais](docs/decisoes/2026-10-19-composicao-custos-totais.md). Unitário líquido/kg, produção = quantidade × unitário. Soma dos unitários não representa custo/kg do produto; mostrar separadamente total produção ÷ rendimento. Sem Dart alterado.

## v20 — categorias compartilhadas
[RN-ING-005/RN-FOR-002](docs/decisoes/2026-10-19-categorias-rotulagem-fornecedores.md): catálogo id/nome/ativo; ingrediente referencia uma categoria e fornecedor várias. Grupos padronizados continuam separados. Preservar IDs/semântica especial e documentos; não duplicar lista fixa nos widgets. Portabilidade/SQL pendentes.


## 22/10/2026 — Ficha técnica v21

Ficha técnica editável por produto: [contrato v21](docs/decisoes/2026-10-22-ficha-tecnica-qualidade.md), com entidades, permissões, projeções públicas e roteiro para as etapas 1/2/3. Não portar ficha legada por pedido como equivalente. Sem implementação Dart nesta entrega.


## Ajuste P&D na v21 — ingrediente único durante a edição

RN-PD-010 (confirmada por Edgar em 22/10/2026): impedir ingrediente duplicado já na seleção da composição, tanto em novo produto quanto em criação/edição de fórmula. Não esperar o salvamento final.

Correção: cada seletor mantém sua escolha atual e desabilita ingredientes usados nas outras linhas, identificando-os como já incluídos. Adicionar também rejeita ID repetido; trocar a seleção atualiza todas as opções; remover libera a opção novamente. Seleção duplicada recebida por evento é revertida imediatamente com aviso para editar a quantidade existente. Quantidades, filtro de estoque e validação final do domínio permanecem.

Aceite: selecionar A na primeira linha e conferir A desabilitado nas outras; trocar A por C e conferir A disponível; remover uma linha e conferir liberação; adicionar até esgotar opções sem repetir; salvar segue a validação de integridade existente. Cobertura em tests/formula-choices.test.cjs (seleção/troca/remoção/reversão e estoque). 92 testes passam; sintaxe JS aprovada. QA visual pendente. Não há nova regra comercial ou cálculo: correção preventiva de uma duplicidade já rejeitada pelo domínio.

Impacto Flutter/API/banco: na etapa de telas, derivar opções disponíveis dos IDs selecionados no ViewModel e atualizar ao adicionar/trocar/remover; manter validação de unicidade no caso de uso/API e futura restrição composta (revisão da fórmula, ingrediente). Não remover opção atual ao reconstruir formulário. Sem novo campo, DDL ou Dart nesta entrega. Próximo cenário: demonstrar duas linhas e troca/remoção para P&D; não há pendência funcional para este bloqueio.


## 22/10/2026 — Recebimentos e fornecedores v22

[Contrato v22](docs/decisoes/2026-10-22-recebimentos-precos-fornecedores.md): RN-EMB-005/EST-009/FOR-003, lookup, projeção de preços e cadastro/validação do fornecedor. E1 dados e migração; E2 validações/casos de uso; E3 telas. Sem Dart nesta entrega.


## 22/10/2026 — v23 apresentação integrada

RN-DEMO-002: um pedido de 100 kg/R$1.100, 20 baldes/2 caixas, 2 fornecedores, recebimentos, OP, ficha, lote aprovado, despacho e duas parcelas de R$550 (uma paga). 100 testes aprovados; chave local nova preserva a anterior e o modo vazio. Contrato, aceite, migração e impacto Flutter em [decisão v23](docs/decisoes/2026-10-22-demonstracao-integrada.md). Guia atualizado; QA visual pendente. Sem mudanças Dart/SQL/backend. E1/E2/E3 continuam não iniciadas.


## 22/10/2026 — v24 quatro cenários

RN-DEMO-002 corrigida por solicitação de Edgar: quatro pedidos em rascunho, análise, produção parcial e despacho; duas OPs iniciais; guia completo com links e ações ponta a ponta. [Contrato, aceite e impacto Flutter](docs/decisoes/2026-10-22-quatro-cenarios-apresentacao.md). 102 testes passam, inclusive concluir os quatro em sequência, sem faltar estoque. Nova chave local preserva bases antigas. QA visual pendente; E1/E2/E3 e Dart/SQL/backend sem execução.


## 22/10/2026 — v25 catálogo e acesso à ficha

RN-DEMO-002 ampliada: 12 ingredientes, 5 produtos, 4 embalagens, 4 fornecedores, 3 clientes, 18 lotes; quatro pedidos/duas OPs e guia preservados. RN-FT-004: Visualizar ficha técnica como ação primária no início do modal, prévia da revisão salva. [Contrato e impacto Flutter](docs/decisoes/2026-10-22-catalogo-ampliado-ficha-acesso.md). 104 testes aprovados; chave local nova preserva anteriores. QA visual pendente. Dart/SQL/backend/E1/E2/E3 sem execução.


## 23/10/2026 - v26 jornadas Realtech e Qualidade
RN-DEMO-003 e RN-QUA-006: 13 pedidos/amostras, 13 produtos e 24 ingredientes; estados operacionais e de bloqueio, catálogo RealMix/RealMax sintético, lotes com busca/filtro e fichas recolhíveis. Botão do lote resolve produtoId; ficha atual do produto, sem snapshot histórico da emissão. Chave v26 preserva bases anteriores. [Contrato, aceite, testes e impacto](docs/decisoes/2026-10-23-jornadas-realtech-qualidade.md). Flutter/API/SQL não alterados; QA visual pendente por bloqueio de file://.


## 23/10/2026 - v27 cadastros e códigos
RN-CAD-001/002/003: grupo Cadastros no menu e Central com seis abas sobre as mesmas entidades. Código GG-SNNN, sequência por subgrupo, prefixo selecionado e sufixo automático. Busca global normaliza formato e respeita perfis/carteira. Representantes separado de usuários; produtos acabados reutilizam produtos. Migração local aditiva, IDs/referências anteriores preservados, classificações dos exemplos a revisar. [Contrato, aceite, pendências e impacto](docs/decisoes/2026-10-23-cadastros-codigos-centralizados.md). Flutter/API/SQL não implementados; classificação e reclassificação de base real dependem da empresa.


## 23/10/2026 - v28 seletores pesquisáveis
RN-CAD-002: sequência inicial 001 confirmada por Edgar. RN-UX-004: seletores pesquisáveis por código/nome nos pedidos, recebimentos e P&D; componente compartilhado preserva IDs, filtros, eventos e cálculos. Campo pesquisável não integra dados do formulário; quantidades lidas por tipo/nome para evitar conflito. [Contrato, aceite e impacto](docs/decisoes/2026-10-23-seletores-pesquisaveis.md). Flutter/API/SQL sem alterações. QA visual pendente; interação testada em DOM simulado.
