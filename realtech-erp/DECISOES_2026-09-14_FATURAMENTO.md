# Decisões e propostas — faturamento parcelado — 14/09/2026

## RN-PED-006 — Condições de pagamento no pedido

- Pedido da empresa: adicionar prazos como se fossem itens; cada card de dias representa uma parcela.
- Status: demonstrado, aguardando homologação.
- Regra demonstrada: o Comercial informa uma ou mais quantidades inteiras de dias. O sistema divide o total igualmente e distribui eventual diferença de centavos entre as primeiras parcelas.
- Condições comerciais: o texto livre é opcional e serve apenas para informações adicionais; não é necessário preenchê-lo quando as parcelas já foram configuradas.
- Corte: prazos e valores ficam congelados quando o pedido é enviado ao Financeiro.
- Validações: de 1 a 24 parcelas, prazos entre 0 e 3.650 dias e sem prazos repetidos.

## RN-FAT-002 — Acompanhamento manual por parcela

- Status: demonstrado, aguardando homologação.
- Regra demonstrada: após produção e qualidade, “Iniciar faturamento” cria um recebível por prazo do pedido. Cada parcela mostra número, prazo, vencimento, valor e situação; Fiscal ou Financeiro marca a parcela como paga manualmente e a baixa é auditada.
- Conclusão: o faturamento fica “Em andamento” até todas as parcelas serem pagas; então passa a “Concluído”.
- Competência: relatórios mensais consideram a data efetiva de pagamento de cada parcela.

## RN-FIN-002 — Paralelismo com despacho

- Status: demonstrado, aguardando homologação.
- Regra demonstrada: produção e qualidade liberadas habilitam faturamento e despacho em paralelo. Parcela aberta não impede despacho nem confirmação de entrega.
- Estados apresentados: “Em faturamento · Aguardando despacho”, “Em faturamento · Despachado” e “Entregue · Em faturamento”.
- Pendências: confirmar se o check representa pagamento recebido ou emissão fiscal; definir vencidos, pagamento parcial de uma parcela, juros, desconto, renegociação, estorno, cancelamento e integração bancária/NF-e.

