# Índice de decisões do protótipo

Esta pasta guarda as decisões e propostas surgidas nas conversas de descoberta e homologação. Ela preserva o contexto histórico; o catálogo consolidado e mais fácil de consultar continua sendo [`REGRAS_DE_NEGOCIO.md`](../REGRAS_DE_NEGOCIO.md).

## Como consultar

- Para saber **qual é a regra vigente**, consulte primeiro o catálogo de regras.
- Para entender **quando, por que e com quais pendências** uma regra surgiu, abra o registro de decisão correspondente abaixo.
- Para acompanhar **o que entrou em cada versão**, consulte o [`CHANGELOG.md`](../CHANGELOG.md).
- Uma decisão demonstrada não deve ser tratada como homologada apenas porque existe no protótipo.

## Índice cronológico

| Data | Tema | Regras principais | Maturidade registrada |
| --- | --- | --- | --- |
| 31/08/2026 | [Pedidos, comissões, histórico financeiro e documentos](2026-08-31-ajustes-negocio.md) | RN-PED-001/002/003, RN-COM-001 e Documento da OP | Confirmadas e pendentes, conforme cada seção |
| 10/09/2026 | [Disponibilidade de estoque e governança](2026-09-10-estoque-governanca.md) | RN-EST-003, RN-GOV-001 | Demonstradas; aguardando homologação |
| 14/09/2026 | [Operação, prioridade e logística](2026-09-14-operacao-logistica.md) | RN-PED-005, RN-PRD-002, RN-LOG-001/002 | Demonstradas; aguardando homologação |
| 14/09/2026 | [Faturamento parcelado](2026-09-14-faturamento-parcelado.md) | RN-PED-006, RN-FAT-002, RN-FIN-002 | Demonstradas; aguardando homologação |
| 24/09/2026 | [P&D, fórmulas e precificação](2026-09-24-pd.md) | RN-PD-001/002/003 | Confirmadas pela empresa; detalhes pendentes |
| 24/09/2026 | [Cadastro de ingredientes](2026-09-24-ingredientes.md) | RN-ING-001/002/003 | Demonstradas; aguardando homologação |
| 28/09/2026 | [Qualidade, fórmula para produção e etiqueta](2026-09-28-qualidade-producao-etiqueta.md) | RN-PD-004, RN-OP-002, RN-ETQ-003 | Confirmadas; detalhes regulatórios pendentes |

## Índice por área

| Área | Registros relacionados |
| --- | --- |
| Comercial e pedidos | [31/08](2026-08-31-ajustes-negocio.md), [14/09](2026-09-14-operacao-logistica.md), [faturamento de 14/09](2026-09-14-faturamento-parcelado.md) |
| Financeiro e comissões | [31/08](2026-08-31-ajustes-negocio.md), [faturamento de 14/09](2026-09-14-faturamento-parcelado.md) |
| Estoque e ingredientes | [10/09](2026-09-10-estoque-governanca.md), [ingredientes de 24/09](2026-09-24-ingredientes.md) |
| Produção e logística | [31/08](2026-08-31-ajustes-negocio.md), [14/09](2026-09-14-operacao-logistica.md), [Qualidade/produção de 28/09](2026-09-28-qualidade-producao-etiqueta.md) |
| P&D e precificação | [24/09](2026-09-24-pd.md), [ingredientes de 24/09](2026-09-24-ingredientes.md), [Qualidade/produção de 28/09](2026-09-28-qualidade-producao-etiqueta.md) |
| Governança e documentação | [10/09](2026-09-10-estoque-governanca.md) |

## Padrão para novos registros

1. Nomeie o arquivo como `AAAA-MM-DD-tema-curto.md`.
2. Registre no cabeçalho a data e a maturidade: **confirmada**, **demonstrada** ou **pendente**.
3. Relacione os IDs estáveis de `REGRAS_DE_NEGOCIO.md`.
4. Inclua critérios de aceite, impactos em outros módulos e pendências com responsável quando conhecido.
5. Adicione o novo arquivo aos índices cronológico e por área desta página.
6. Não apague decisões substituídas; marque claramente qual decisão posterior as substituiu.

O modelo completo de registro está em [`COMO_REGISTRAR_MUDANCAS.md`](../COMO_REGISTRAR_MUDANCAS.md).
