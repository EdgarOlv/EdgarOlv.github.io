# Qualidade, fórmula para produção e etiqueta — 28/09/2026

## Confirmado nesta rodada

- `RN-PD-004`: produto registra validade em texto aberto e declaração “Contém”. Os ingredientes elegíveis são os da fórmula e a seleção por checkbox sugere o texto usando categoria e INS; a redação final permanece editável.
- `RN-OP-002`: o Documento da OP segue a estrutura da planilha “Fórmula para produção”, com dados do cabeçalho, embalagem, modo de uso, “Contém” e composição da batida.
- `RN-ETQ-003`: lote da etiqueta é a data do dia em que a janela de impressão é aberta; não há campo separado de fabricação.
- `RN-ETQ-004`: a OP sugere 1 etiqueta pequena e 2 grandes; a seleção fica no topo da aba e as duas prévias aparecem preenchidas abaixo.
- Ingredientes não marcados no checkbox permanecem na fórmula de produção, mas não entram no texto de ingredientes da etiqueta.
- `RN-PD-005`: descrição da etiqueta, alérgicos, glúten, modo de uso e conservação são dados do produto; alérgicos e “Não contém glúten” possuem habilitação por checkbox.
- Fórmula para produção e Etiquetas são abertas por botões independentes, sem compartilhar a mesma tela de consulta.
- A criação de nova versão continua usando uma lista interativa para adicionar e remover ingredientes.

## Demonstrado no protótipo

- A validade é textual (exemplo sintético: `12 meses`).
- “Contém” é montado como `Categoria INS nnn` quando há INS e `Categoria: ingrediente` quando não há.
- O documento mostra uma batida e calcula cada quantidade proporcionalmente à massa total da OP.
- A validade da etiqueta usa a data do lote final quando ele existe; antes disso mostra a validade textual do produto.

## Pendente de homologação

- redação regulatória definitiva e regras de ordenação/agrupamento do campo “Contém”;
- formato oficial da validade e se ela representa prazo ou data calculada;
- campos e responsáveis pelos vistos da Fórmula para produção;
- quantidade de batidas, regras de embalagem interna/externa e campos de sobra;
- formato visual da data usada como lote, dimensões, margens e impressora da etiqueta.

## Impacto no sistema futuro

Produto, versão de fórmula, item do pedido e OP precisam preservar os dados usados na operação. A emissão da etiqueta deve guardar data, usuário, modelo/versão e snapshot; o protótipo apenas simula isso localmente. Flutter, API e banco ainda não implementam esse contrato.
