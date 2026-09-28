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
- lote preenchido com a data atual na abertura da impressão e validade obtida do lote final ou do produto;
- peso líquido por unidade e embalagem;
- modelo utilizado e quantidade atribuída à OP;
- sugestão inicial de 1 etiqueta pequena e 2 grandes, editável no topo da aba, com prévia dos dois modelos;
- impressão ou salvamento em PDF pelo navegador.
- textos fixos editáveis no modelo: texto regulatório, fabricante e slogan.
- descrição do produto, alérgicos, glúten, modo de uso e conservação vêm do cadastro/snapshot do produto; texto regulatório e slogan permanecem no modelo.

Quando a OP ainda não possui lote produzido, o lote usa a data atual e a validade textual vem do cadastro do produto. Não existe campo separado de fabricação. A forma definitiva de calcular e formatar a validade ainda requer homologação regulatória.

## Regras demonstradas

- a etiqueta é vinculada ao produto da OP, não a uma digitação independente;
- a lista de ingredientes impressa usa o texto “Contém” construído somente com os ingredientes marcados no produto/versão;
- a lista começa pelas bases da fórmula em ordem decrescente; os demais itens são agrupados por categoria funcional, também da maior para a menor participação;
- somente sal, nitrito de sódio (INS 250) e nitrato de sódio (INS 251) podem exibir o percentual calculado sobre o rendimento da fórmula;
- a etiqueta grande pode ser aberta diretamente em cada item do pedido, antes da OP;
- na abertura da etiqueta, o lote corresponde à data atual; fabricação não aparece como campo separado;
- a validade usa o lote final quando disponível e, antes disso, o cadastro do produto;
- o modelo pode ser consultado no cadastro de Etiquetas;
- a OP pode ter quantidades atribuídas por modelo;
- a consulta do Documento da OP mantém a ficha de demonstração e a etiqueta em abas separadas;
- a impressão atual usa o diálogo do navegador e não gera arquivo armazenado no sistema.

## Critérios de aceite do sistema futuro

1. O modelo possui dimensões físicas, orientação e impressora de destino.
2. O conteúdo oficial é versionado e aprovado pela Qualidade e pelo responsável técnico.
3. Lote/data de impressão, validade e peso ficam congelados no evento de emissão; a origem definitiva da validade deve ser homologada.
4. O sistema define quantidade, sequência e agrupamento da impressão.
5. O PDF e a impressão térmica preservam escala, margens e legibilidade.
6. Código de barras ou QR Code, quando exigido, tem regra de origem e validação.
7. A emissão registra usuário, data, modelo, versão e OP na auditoria.

## Pendências para homologação

- confirmar medidas da etiqueta pequena e grande;
- confirmar se o formato demonstrado de 180 × 160 mm corresponde à mídia e às margens reais da impressora;
- confirmar ingredientes, alergênicos, conservação, instruções e textos regulatórios;
- confirmar código de barras, QR Code, formato da data usada como lote e cálculo/formato da validade;
- confirmar quantidade por embalagem e quantidade por folha/rolo;
- confirmar impressora, papel, margens e necessidade de impressão em lote;
- definir se a etiqueta pode ser emitida antes da aprovação do lote;
- definir permissões para alterar modelos, quantidades e emitir etiquetas.

## Impacto futuro

A API/banco deverão preservar modelo e versão usados na emissão, snapshot dos dados do produto e lote, vínculo com OP e arquivo/resultado da impressão quando houver armazenamento. A implementação atual é somente demonstrativa e local.
