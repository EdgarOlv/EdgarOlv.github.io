# Contrato funcional — Etiquetas

**Status:** demonstrado no protótipo; conteúdo e layout final pendentes de homologação.

## Objetivo e acesso

A etiqueta pode ser consultada em cada item do pedido, dentro do Documento da OP na aba `Etiqueta`, ou pelo módulo `Etiquetas`. O sistema usa um modelo previamente cadastrado e preenche a prévia com os dados do pedido, produto e OP, evitando redigitação.

## Conteúdo demonstrado

- marca e identificação REALTECH;
- nome do produto;
- cliente do pedido;
- descrição dos dados previstos no modelo;
- ingredientes derivados da fórmula da OP;
- lote, fabricação e validade quando houver lote de produto;
- peso líquido por unidade e embalagem;
- modelo utilizado e quantidade atribuída à OP;
- impressão ou salvamento em PDF pelo navegador.
- textos fixos editáveis: descrição do produto, texto regulatório, alergênicos, glúten, modo de uso, conservação, fabricante e slogan.

Quando a OP ainda não possui lote produzido, lote, fabricação e validade aparecem como `A definir` ou data vazia. Isso é uma representação provisória e não libera a etiqueta para uso comercial.

## Regras demonstradas

- a etiqueta é vinculada ao produto da OP, não a uma digitação independente;
- a etiqueta grande pode ser aberta diretamente em cada item do pedido, antes da OP;
- antes da produção, os campos de lote e datas aparecem como `A definir`;
- o modelo pode ser consultado no cadastro de Etiquetas;
- a OP pode ter quantidades atribuídas por modelo;
- a consulta do Documento da OP mantém a ficha de demonstração e a etiqueta em abas separadas;
- a impressão atual usa o diálogo do navegador e não gera arquivo armazenado no sistema.

## Critérios de aceite do sistema futuro

1. O modelo possui dimensões físicas, orientação e impressora de destino.
2. O conteúdo oficial é versionado e aprovado pela Qualidade e pelo responsável técnico.
3. Lote, fabricação, validade e peso vêm de dados imutáveis da produção e embalagem.
4. O sistema define quantidade, sequência e agrupamento da impressão.
5. O PDF e a impressão térmica preservam escala, margens e legibilidade.
6. Código de barras ou QR Code, quando exigido, tem regra de origem e validação.
7. A emissão registra usuário, data, modelo, versão e OP na auditoria.

## Pendências para homologação

- confirmar medidas da etiqueta pequena e grande;
- confirmar se o formato demonstrado de 180 × 160 mm corresponde à mídia e às margens reais da impressora;
- confirmar ingredientes, alergênicos, conservação, instruções e textos regulatórios;
- confirmar código de barras, QR Code, lote, validade e formato da data;
- confirmar quantidade por embalagem e quantidade por folha/rolo;
- confirmar impressora, papel, margens e necessidade de impressão em lote;
- definir se a etiqueta pode ser emitida antes da aprovação do lote;
- definir permissões para alterar modelos, quantidades e emitir etiquetas.

## Impacto futuro

A API/banco deverão preservar modelo e versão usados na emissão, snapshot dos dados do produto e lote, vínculo com OP e arquivo/resultado da impressão quando houver armazenamento. A implementação atual é somente demonstrativa e local.
