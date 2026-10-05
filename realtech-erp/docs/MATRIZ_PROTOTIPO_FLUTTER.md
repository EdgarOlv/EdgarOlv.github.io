# Matriz protótipo → Flutter

**Revisão:** 01/10/2026. “Existe” indica estrutura encontrada, não homologação. [Contrato consolidado](../../Docs/CONSOLIDACAO_FLUTTER_2026-10-01.md) e [aceite por cenário](ROTEIRO_HOMOLOGACAO_FINAL.md) complementam esta matriz. Flutter não teve build/analyze executado nesta revisão.

| Capacidade             | Protótipo                                                                                                | Flutter atual                                                                                               | Próxima ação                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Pedido/análise         | Corte de edição, snapshots e complementar                                                                | Modelos/providers/telas existentes, com divergências                                                        | Portar RN-PED-\*                                                                                  |
| Condições de pagamento | Lista de prazos no pedido, valores automáticos, texto comercial adicional opcional e snapshot após envio | Flutter ainda possui somente o campo textual adicional `condicoesComerciais`; não possui parcelas previstas | Criar entidade de parcela prevista; manter `condicoesComerciais` apenas como observação adicional |
| Entrada e prioridade   | Pedido nasce no sistema; entrada ordena fila e gera prazo de produção de 7 dias corridos                 | Não identificada como regra integrada                                                                       | Modelar entrada, SLA e replanejamento após homologação                                            |
| OP/produção            | OP por item, documento e múltiplos apontamentos                                                          | OP e serviço local existentes                                                                               | Rever UN/kg, apontamentos e idempotência                                                          |
| Estoque                | Validade e atomicidade simulada/testada                                                                  | Mutações locais                                                                                             | Criar transações/concorrência no backend                                                          |
| Cadastro de ingredientes | CRUD com nome, código, INS, categoria funcional, grupo 01–04 e permissão restrita de percentual; recebimento usa a base e exclusão preserva vínculos | Modelo existe sem contrato equivalente de rotulagem e integridade validada | Criar enums/tabelas de referência, caso de uso, rota e restrições por vínculo na API/banco |
| Declaração de ingredientes | Bases primeiro; categorias e itens ordenados pela quantidade; percentual apenas para sal e INS 250/251; aromatizantes fechados e especiarias abertas somente acima de 25% | Não identificada como regra de domínio centralizada | Implementar gerador versionado, com decimal exato e testes de fronteira conforme RN-ING-004, RN-ING-006 e RN-ETQ-005 |
| Ingredientes no produto | Composição inicial oferece apenas ingredientes com lote liberado, válido e saldo                         | Fórmula seleciona ingredientes do cadastro, sem filtro operacional equivalente                              | Definir se a disponibilidade será apenas orientação ou trava definitiva antes de portar           |
| Disponibilidade pré-OP | Bloqueia geração sem matéria-prima suficiente e deriva “Aguardando lote”                                 | Não implementada                                                                                            | Portar após homologar reserva, prioridade e escopo de embalagens                                  |
| Fórmula dinâmica       | Inclusão/remoção de ingredientes, 5 casas decimais e conferência de soma × rendimento                    | Formulário e serviço usam lista fixa; SQL admite decimal, mas exige revisão do contrato                     | Portar RN-PD-002/003 com decimal exato e validação transacional                                   |
| Validade e “Contém” no produto | Validade editável e declaração sugerida por checkboxes, categoria e INS; texto final permanece aberto | Modelo atual não possui os dois campos nem snapshot equivalente                                            | Modelar campos, vínculo dos ingredientes e snapshot conforme RN-PD-004                             |
| Conteúdo de etiqueta por produto | Descrição, alérgicos/glúten, modo de uso e conservação pertencem ao produto e são congelados na operação | Não identificado no modelo Flutter                                                                        | Acrescentar contrato e snapshots conforme RN-PD-005                                                |
| Fórmula para produção  | Documento completo com cabeçalho operacional e composição percentual/em kg da batida                    | Tela Flutter mostra detalhes da OP, mas não reproduz o documento                                           | Criar gerador versionado e campos de visto após homologação de RN-OP-002                           |
| Preço por produto      | Padrões globais herdados e sobrescritos por produto, com snapshot na liberação                           | Modelo não representa todas as sobrescritas por produto                                                     | Modelar overrides e snapshot conforme RN-PD-001                                                   |
| Qualidade              | Inspeção e bloqueio                                                                                      | Tela, provider, modelo e serviço existentes                                                                 | Alinhar histórico e permissões                                                                    |
| Rastreabilidade        | Consulta direta/reversa                                                                                  | `rastrearLote` e diálogo no Despacho                                                                        | Centralizar e expor na Qualidade                                                                  |
| Tomador e entrega      | Despacho exige emitente/destinatário; entrega registra data e recebedor                                  | Frete/despacho existem, sem confirmação de entrega identificada                                             | Acrescentar enum, evento, permissões e auditoria após homologação                                 |
| Faturamento parcelado  | Um recebível por parcela; baixas mensais e expedição independente                                        | Um `Faturamento` único, sem recebíveis por parcela                                                          | Modelar parcelas, baixas, estado paralelo e idempotência no backend                               |
| Ficha Técnica          | Documento demonstrativo imprimível                                                                       | Não há modelo nutricional nem gerador identificado                                                          | Implementar após homologação                                                                      |
| Etiquetas oficiais     | Grande em 105 × 105 mm com cliente destacado; pequena em 105 × 58 mm sem cliente; prévia por item/OP e impressão independente | Não identificada | Implementar templates versionados equivalentes após homologar permissões e o motor de impressão |
| Lote na etiqueta       | Data atual na abertura/impressão; sem campo separado de fabricação; validade herdada do produto/lote    | Não identificada                                                                                             | Definir formato oficial da data e persistir o evento de emissão conforme RN-ETQ-003                |
| Nutrição versionada    | Valores sintéticos na apresentação                                                                       | Não identificada                                                                                            | Criar entidade; não copiar valores demo                                                           |
| PDF/histórico          | Impressão do navegador, sem persistência                                                                 | Não identificado                                                                                            | Gerar, guardar snapshot/hash e auditar                                                            |
| Permissões             | Perfis únicos                                                                                            | `UserProfile` único                                                                                         | Migrar para múltiplas permissões (DEC-002)                                                        |
| Persistência           | `localStorage`                                                                                           | `LocalDataService` em memória                                                                               | API/repositórios e revisão do SQL                                                                 |
| Versões e atualizações | Página v12 com histórico, regras relacionadas e atalhos internos                                          | Não identificada                                                                                            | Replicar apenas se a empresa considerar útil no produto final                                     |

### Amostras — RN-AMO-001

Protótipo: Qualidade conduz fluxo separado, sem análise financeira/comercial, com teste de domínio do ciclo. Paridade Flutter não validada nesta revisão. Homologar autorização e isolamento comercial antes de portar (HF-13).

## Divergências documentais encontradas

- `ESTADO_PROJETO.md` ainda contém localização antiga e lista telas como faltantes embora elas existam.
- A referência do protótipo dizia que a Ficha Técnica ainda não estava implementada.
- O README Flutter chamava o aplicativo de sistema completo apesar de não haver backend/persistência corporativa.
- A tentativa de `flutter analyze` nesta revisão não concluiu nem produziu saída em tempo razoável; compilação/análise estática não foi validada.

## Ordem segura para a Ficha Técnica

Homologar conteúdo → modelar nutrição versionada → definir permissões → criar caso de uso de snapshot → gerar/armazenar/auditar PDF → expor nas duas telas → testar ponta a ponta.

### 01/10/2026 — RN-ETQ-006: cliente na etiqueta grande

Protótipo: espaço reservado ao título e ajuste da fonte pelo espaço disponível. Flutter: layout oficial ainda pendente de portabilidade; aplicar ajuste equivalente no renderizador futuro. API/banco: sem alteração de dados; preservar nome completo no snapshot.


## Impacto de 05/10/2026

RN-UX-001: protótipo busca Clientes/Produtos/Produção; Flutter possui busca em Clientes/Produtos e precisa avaliar paridade e Produção. API futura exige busca autorizada/paginada; banco sem alteração. RN-DEMO-001: seeds locais exclusivos do protótipo, sem portabilidade para produção.

## Impacto P&D — 05/10/2026

| Regra | Protótipo | Flutter | API / banco futuros |
|---|---|---|---|
| RN-PD-006 | Rascunho estável; versão só na ativação | Rever criar/editar/ativar fórmula | Versionar em transação; controlar revisão concorrente e unicidade por família |
| RN-PD-007 | Orçamento temporário na criação/edição | Integrar simulação ao editor | Cálculo sem gravação; decimal e arredondamento iguais à liberação |
| RN-EMB-001 | Cadastro e escolha, custo sem massa; litros com peso kg manual | Embalagem existe; alinhar contrato e snapshots | Catálogo KG/L/custo e apresentação com volume/peso; snapshot pedido/OP |
| RN-EMB-002 | Menor capacidade compatível, custo em empate | Portar após validar algoritmo | Filtrar embalagens ativas/compatíveis; regras técnicas ainda pendentes |

Dart e SQL preservados; nenhum build/analyze Flutter nesta entrega.

## Impacto v15 — 05/10/2026
| Regra | Protótipo | Flutter/API/banco futuro |
|---|---|---|
| RN-PED-007 | KG explícito, base 1 kg e preço/kg; snapshot de embalagem/volumes; legado UN | PedidoItem.quantity double/unidadeMedida existentes; adicionar snapshots e migração sem conversão retroativa |
| RN-OP-003 | Plano máximo/batidas, revisão/auditoria antes do início | Persistir plano, revisões, validação de capacidade e permissão transacional |
| RN-OP-002 / RN-ETQ-003 | Totais, INS, etiquetas sem medidas, DDMMAAAA | Documentos derivados de snapshot; conferir precisão e impressão |
| RN-UX-002 | Linha e teclado abrem consulta | Aplicar navegação em tabelas; separar ações mutáveis |
Capacidades reais por máquina ainda pendentes. Nenhum código Flutter alterado.

## Correção v15.2 — 05/10/2026
A captura da OP em produção evidenciou uma restrição indevida da v15/v15.1. RN-OP-003 passa a permitir **Modificar** ao lado da fórmula em OP aguardando ou em produção. Substitui a limitação anterior ao início. Ajuste revisa planejamento da ficha para o total da OP, com auditoria; não modifica produção, lotes, consumos ou versão da fórmula já registrados. OP concluída permanece bloqueada. Capacidades reais seguem pendentes. 58 testes, incluindo preservação após apontamento parcial.
