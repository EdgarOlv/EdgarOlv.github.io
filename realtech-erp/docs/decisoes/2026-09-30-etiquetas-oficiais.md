# Etiquetas oficiais — 30/09/2026

**Correção recebida em 01/10/2026:** pequena **105 × 58 mm**. A medida de 105 × 98 mm informada inicialmente foi substituída; grande permanece em 105 × 105 mm.

## Confirmado nesta rodada

- `RN-ETQ-006`: etiqueta grande oficial com 105 × 105 mm, seguindo a primeira referência visual.
- `RN-ETQ-006`: etiqueta pequena oficial com 105 × 98 mm, seguindo a segunda referência visual.
- O modelo grande mantém o bloco de cliente e o pictograma de alergênicos.
- O modelo pequeno não apresenta cliente e usa os textos “Produzido por” e “REALTECH: Qualidade em produtos e serviços”.
- Produto, ingredientes, alergênicos, modo de uso, conservação, fabricante, lote, validade e peso continuam preenchidos pelos dados da OP e seus snapshots.

## Demonstrado no protótipo

- Impressão independente com páginas CSS nomeadas nas dimensões físicas de cada modelo.
- Lote formatado como `DDMMAAAA` e validade de lote como `MMM/AAAA`, coerentes com as referências recebidas.
- A prévia é escalada na tela, mas a impressão preserva milímetros por meio de `@page`.

## Pendente de homologação

- impressora, mídia, compensação de margens e calibração física;
- redação regulatória definitiva por produto;
- política de versionamento, aprovação e permissão de emissão;
- confirmação de que o navegador e o driver selecionado respeitam páginas CSS personalizadas sem escala automática.

## Impacto no sistema futuro

Flutter, API e banco ainda não implementam templates versionados nem evento persistido de emissão. A futura implementação deve guardar modelo, dimensões, versão, usuário, data, OP e snapshot dos campos impressos.
