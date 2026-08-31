# REALTECH — referência do protótipo para Flutter

Atualizado em 31/08/2026. Referência de comportamento e aparência, não especificação homologada. As decisões desta rodada estão detalhadas em `DECISOES_2026-08-31.md`.

## Decisão visual

**Preservar o estilo do protótipo e reproduzi-lo no Flutter**, conforme orientação do usuário. O tema navy do Flutter atual não foi aplicado ao protótipo. Nenhum arquivo do aplicativo Flutter foi alterado nesta entrega.

O arquivo `styles.css` original foi preservado. `flows.css` acrescenta os fluxos, diálogos e adaptação responsiva. Não há framework, fonte remota ou biblioteca de UI a portar: são componentes convencionais.

| Componente do protótipo | Equivalente Flutter sugerido | Contrato visual |
|---|---|---|
| `.app`, `.sidebar`, `.workspace` | `AppScaffold`, `Row`, `Expanded`; `Drawer` em tela estreita | Lateral branca de 252 px, seleção azul clara; não copiar o navy atual |
| `.topbar` | `AppBar` ou header do `AppScaffold` | Branco, título 22–24 px, ações à direita |
| `.metric-card`, `.panel` | `Card`, `Container`, `InkWell` quando clicável | Raio 18 px, borda clara, sombra discreta |
| `.metric-grid`, `.grid-2` | `LayoutBuilder`, `Wrap` ou grid responsivo | 4 indicadores no desktop, 2 no celular; sem altura fixa para texto |
| `.table-wrap`, `table` | `DataTable` em `SingleChildScrollView` horizontal | Cabeçalho discreto, espaçamento 10–11 px, vazio explícito |
| `.primary-btn`, `.ghost-btn` | `FilledButton`, `OutlinedButton` | Raio 12 px; ações com texto, foco visível |
| `input`, `select`, `textarea` | `TextFormField`, `DropdownButtonFormField`, `Form` | Raio 12 px, rótulo visível, validação no formulário |
| `dialog#flowDialog` | `Dialog`, `AlertDialog` com área central rolável | Máximo 940 px e 90% da altura; cabeçalho/rodapé acessíveis |
| `.status` | `StatusBadge` | Cor e texto; nunca depender apenas da cor |
| `.flow-steps` | `Row` rolável ou indicador de etapas próprio | Cada etapa deriva das entidades; não inventar status do pedido |
| `.flow-toast`, `.form-error` | `SnackBar`, mensagem de erro no formulário | Não fechar o formulário se a gravação falhar |
| `.login-shell`, `.login-preview` | `LayoutBuilder`, `Row`/`Column`, `LinearGradient` | Duas áreas no desktop; empilhamento no celular |

### Tokens que devem orientar `AppTheme`

| Token | Valor |
|---|---|
| Primária | `#2563EB` |
| Primária hover | `#1D4ED8` |
| Seleção / destaque claro | `#EAF2FF` |
| Texto principal | `#172033` |
| Texto secundário | `#69758A` |
| Fundo | `#F5F7FB` |
| Painel / lateral | `#FFFFFF` |
| Bordas | `#E6EBF2` |
| Sucesso / alerta / erro | `#16A34A` / `#D97706` / `#DC2626` |
| Raio de card / campo | 18 / 12 px |
| Padding de página desktop / mobile | 26 / 16 px |
| Breakpoints usados | 1100 px (layout intermediário), 800 px (menu móvel) |

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

Tradução para a arquitetura técnica: widgets → casos de uso/Riverpod → repositório/API → Cloud Functions → MySQL. A validação local orienta a interação; autorização, concorrência, validação final, auditoria e transações pertencem ao servidor. O aplicativo não deve se conectar diretamente ao MySQL.

## Contratos de dados e regras críticas

1. **UN não é KG.** `quantidade` é número inteiro de embalagens; `pesoKg` é peso por unidade congelado no item/OP. 20 UN × 5 kg = 100 kg. Necessidade = quantidade do ingrediente / rendimento da fórmula × massa do apontamento. Os dois produtos vendáveis desta demo usam UN; venda fracionária em KG ainda não está implementada.
2. **Snapshots.** Item conserva nome, unidade, peso, preço, comissão, tabela e cópia da fórmula/versão. OP recebe essa versão. Nova versão ou tabela de preço não reescreve pedidos e OPs existentes. Revisar um pedido antes da aprovação o devolve a rascunho e invalida a análise atual, mantendo o histórico de decisões.
3. **Estados distintos.** Pedido usa `rascunho`, `aguardandoAprovacao`, `aprovado`, `emProducao`, `faturado`, `cancelado`, como os enums atuais do Flutter. Qualidade e despacho são entidades próprias; o texto “Próxima etapa” é calculado, não um novo enum do pedido. Um pedido despachado continua com status comercial `faturado`.
4. **Duas liberações e corte de edição.** Financeiro decide `liberado`, `liberadoComRestricao` ou `bloqueado`. Restrição/bloqueio exigem motivo. Aprovação comercial requer liberação e revalida crédito para liberações sem ressalvas. A edição é bloqueada já em `submitOrder`, antes da análise financeira; existe criação de complementar vinculado ao original.
5. **Uma OP por item.** Geração é explícita e não se repete. O Documento da OP deve ser gerado antes do início; “Ficha Técnica” fica reservado à Qualidade. Cada apontamento pode ser parcial e gera lote próprio. Conclusão exige quantidade boa acumulada igual à prevista. Sobreprodução de UN não é simulada.
6. **Consumo por lote.** Sugestão prioriza menor validade, mas o operador pode alterar quantidades. Exclui vencidos/bloqueados/sem saldo. Repetições do mesmo lote no payload são agregadas antes da checagem. Verifica todos os saldos e toda a composição antes de gravar qualquer movimento.
7. **Perdas e sobras.** Massa de entrada = UN boas × peso + perdas em kg + sobras em kg. Insumos consumidos incluem essa massa; custo de insumos fica registrado no apontamento. Sobras ficam segregadas no lote, com movimento próprio em KG, sem venda ou reaproveitamento automático. Não somar movimentos em UN e KG sem discriminar a unidade.
8. **Qualidade e saída.** Cada lote exige inspeção; reprovação fica bloqueada, sem botão que simplesmente apague o resultado. Faturamento exige todas as OPs concluídas, documentos da OP, liberações e todos os lotes aprovados, válidos e com saldo. Despacho baixa as UN dos lotes finais; frete é informativo.
9. **Comissão por recebimento.** O pedido conserva percentual/base aplicada, mas a comissão final mensal nasce de recebíveis efetivamente pagos no período. Faturamento apenas cria o recebível aberto. Baixas parciais, estornos e fechamento de competência continuam como decisões abertas.
9. **Dinheiro.** A demo usa centavos inteiros e comissão em basis points (500 = 5%), arredondada por item. Quantidades técnicas usam três casas. Na API/MySQL, seguir `DECIMAL(18,6)` do refinamento; definir o momento de arredondamento e usar tipo decimal apropriado no Dart.
10. **Sem atalhos de segurança.** Perfil é verificado na navegação, no desenho das ações e nos comandos do domínio. Diretor não recebe fórmula/custo por acesso gerencial implícito; seu detalhe de auditoria é resumido. Como todos os dados estão no JavaScript/localStorage, isso simula permissões, não protege segredos.

## Correspondência com o Flutter existente

| Protótipo / comando | Destino existente | Atenção na tradução |
|---|---|---|
| login e módulos por perfil | `features/auth`, `core/router`, `AppScaffold` | Separar acesso de leitura e permissão de mutação; menu não substitui proteção de rota/API |
| `saveOrder`, `submitOrder`, `approveOrder` | `features/pedidos`, `pedidosProvider` | Congelar dados, bloquear revisão, revalidar e invalidar análise ao editar |
| `analyze` | `features/financeiro` | Não reconstruir pedido perdendo campos; guardar decisões históricas |
| `createOps`, `issueSheet`, `reportProduction` | `features/producao`, `ordensProvider` | Peso por embalagem, ficha explícita e lista de apontamentos/lotes |
| `receiveLot`, `adjustLot` | `features/estoque`, lotes/movimentos | Saldo e movimentos na mesma transação; motivo obrigatório |
| `inspect` | `features/qualidade` | Bloquear lote reprovado sem apagar histórico |
| `bill`, `dispatch` | `features/faturamento`, `features/despacho` | Validar todas as OPs, não só a primeira; evitar duplicações |
| `createVersion`, `activateVersion`, `releasePrice` | fórmulas e precificação | Preservar versão; marcar preço como não liberado após troca técnica |
| `trace` | consulta a lotes, OPs e consumos | Navegação direta/reversa até fornecedor e cliente |

Na leitura do `LocalDataService` atual, `criarOrdemProducao` recebe a quantidade comercial sem conversão explícita de embalagem para kg. `concluirProducao` realiza baixas em sequência e guarda um único lote final na OP. Esses pontos precisam de adequação para representar os contratos acima. Isso é uma observação da leitura do código, **não uma validação de execução do Flutter**. O tema atual usa navy `#1A3A5C`; portar os tokens do protótipo é uma alteração futura no Flutter.

## Limites e decisões abertas

- Dados e composições são sintéticos, inspirados no seed do Flutter para manter vocabulário. Não representam catálogo, preço real ou fórmula industrial autorizada. Preço do Realçador nesta demo é R$ 240/UN; não reproduz os R$ 185 do seed Flutter.
- Comissão por produto é a única regra ativa. Precedência por cliente/vendedor/categoria e gatilho de pagamento aguardam decisão. Demo permite pagamento pelo Administrador depois do faturamento.
- Análise usa exposição inicial sintética + pedidos comprometidos. Não há pagamentos bancários nem contas a receber. Novos clientes têm limite zero.
- Cancelar depois de gerar OP exige estorno/replanejamento não simulado. Reprovação não implementa retrabalho. Sobras não implementam destinação.
- Ativação de nova versão mantém anteriores ativas para não impedir OPs já planejadas; inativação/obsolescência por processo não está implementada. Validar a política de corte de versões com P&D.
- Administração tem exceção de acesso total para apresentação. Somente P&D e Administrador fazem ações técnicas. A matriz técnica cita `dispatch.read` para Fiscal, mas a demo permite escrita; confirmar o perfil de expedição.
- Laudo e comprovante são referências textuais; nenhum upload ou documento fiscal é gerado. O Documento da OP pode ser impresso/salvo como PDF pelo navegador, sem assinatura. A futura Ficha Técnica da Qualidade é outro artefato e não está implementada.
- Não implementa autenticação Firebase, autorização real, backend, MySQL, multiusuário, sincronização, SQLite, criptografia, logs imutáveis, NF-e ou integrações externas.
- Cadastro de cliente é reduzido; usuários são predefinidos e ativáveis; ingredientes, fornecedores, embalagens e produtos têm consulta, sem CRUD completo. Relatórios são recortes básicos exportáveis.
- `localStorage` preserva alterações entre recargas e perfis no mesmo navegador/origem. Sessão sempre volta ao login ao recarregar. Há aviso de outra aba e detecção de revisão obsoleta, mas não há lock/transação entre abas. Testar em uma aba por vez.

## Fontes e precedência

- `Sistema/Docs/ERP REALTECH - Refinamento de Negocio.pdf`, v1.1, 21/07/2026: §§3, 4.1–4.18, 4.21 e fluxos/aceite.
- `Sistema/Docs/ERP_REALTECH_Refinamento_Tecnico.pdf`, v1.0, 03/08/2026: §§3–9, 13–14.
- Código atual em `Sistema/realtech_erp/lib/core/models`, `services`, `widgets`, `theme` e telas.

Os PDFs orientam regras. O código Flutter foi consultado para correspondência, não tratado como implementação já homologada. O visual original e o esclarecimento do usuário orientam o tema. A existência deste protótipo não oficializa as premissas pendentes.
