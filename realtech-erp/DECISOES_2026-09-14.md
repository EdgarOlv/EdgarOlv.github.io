# Decisões e propostas — 14/09/2026

## RN-PED-005 — Pedido obrigatoriamente registrado no sistema

- Pedido da empresa: não aceitar pedidos que não estejam inseridos no sistema.
- Status: demonstrado, aguardando homologação.
- Regra: análise, produção, faturamento e despacho exigem pedido criado pelo fluxo oficial do sistema.
- Critério de aceite: uma origem externa/adulterada é recusada antes de avançar e toda criação recebe número, data e auditoria.
- Impacto futuro: a API deverá ser a autoridade de criação; integrações externas precisarão cadastrar o pedido antes de qualquer operação.

## RN-PRD-002 — Prioridade por data e limite de produção

- Pedido da empresa: exibir prioridade por data na entrada e na finalização da produção, com exemplo de 7 dias entre pedido e conclusão.
- Status: demonstrado, aguardando homologação.
- Regra demonstrada: a entrada no sistema define a prioridade; o limite é entrada + 7 dias corridos; filas são ordenadas primeiro pelo vencimento e depois pela entrada. O sistema alerta atraso, mas não impede apontamento tardio.
- Critérios de aceite: mostrar entrada e limite no pedido, pedido aprovado e OP; manter o mesmo limite em todas as OPs; sinalizar dias restantes ou atraso.
- Pendências: confirmar dias úteis ou corridos, horário de corte, feriados, permissão de repriorização, pausas por falta de estoque/qualidade e consequência do atraso.
- Impacto futuro: API/banco precisam guardar instante de entrada, prazo calculado, política/versionamento do SLA e histórico de replanejamento.

## RN-LOG-001 — Tomador do frete

- Pedido da empresa: informar no despacho se o tomador é emitente ou destinatário.
- Status: demonstrado, aguardando homologação.
- Critério de aceite: despacho não é salvo sem uma das duas opções e o valor aparece na lista e no detalhe do pedido.
- Pendência: confirmar se haverá terceiros/redespacho e relação com campos fiscais da NF-e.

## RN-LOG-002 — Confirmação de entrega

- Pedido da empresa: confirmar a entrega dos produtos do pedido.
- Status: demonstrado, aguardando homologação.
- Regra demonstrada: somente pedido despachado pode receber confirmação única, com data entre a saída e hoje e nome de quem recebeu; referência do comprovante é opcional e textual.
- Critérios de aceite: etapa final “Entrega”, ação da Expedição/Administrador e registro na auditoria.
- Pendências: confirmar quem pode registrar, evidência obrigatória, entrega parcial, recusa, avaria, devolução e correção indevida.
