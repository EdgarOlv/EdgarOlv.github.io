# Contrato funcional — Etiquetas

**Status:** referências visuais confirmadas em 30/09/2026; pequena corrigida pela empresa em 01/10/2026 para 105 × 58 mm, substituindo 105 × 98 mm. Grande permanece 105 × 105 mm. Redações regulatórias variáveis continuam sujeitas à Qualidade.

## Objetivo e acesso

A etiqueta grande pode ser consultada em cada item do pedido; na OP, o botão Etiquetas abre as duas prévias, separadamente da Fórmula para produção; também há acesso pelo módulo Etiquetas. O sistema usa um modelo previamente cadastrado e preenche a prévia com os dados do pedido, produto e OP, evitando redigitação.

No módulo `Etiquetas`, a lista de etiquetas preparadas mostra cada modelo com quantidade maior que zero por OP. A busca localiza por OP, pedido, cliente ou produto, e a ação abre o modelo correspondente à linha selecionada.

## Conteúdo demonstrado

- marca e identificação REALTECH;
- nome do produto;
- cliente do pedido somente no modelo grande;
- descrição dos dados previstos no modelo;
- ingredientes derivados da fórmula da OP;
- lote preenchido com a data atual na abertura da impressão e validade obtida do lote final ou do produto;
- peso líquido por unidade e embalagem;
- modelo utilizado e quantidade atribuída à OP;
- sugestão inicial de 1 etiqueta pequena e 2 grandes, editável no topo da aba, com as prévias pequena e grande separadas verticalmente;
- impressão ou salvamento em PDF pelo navegador, com uma ação independente para cada tamanho.
- etiqueta grande oficial em 105 × 105 mm, com cliente destacado e pictograma de alergênicos;
- etiqueta pequena oficial em 105 × 58 mm, sem bloco de cliente e com composição horizontal própria;
- textos fixos editáveis no modelo: texto regulatório, fabricante e slogan.
- descrição do produto, alérgicos, glúten, modo de uso e conservação vêm do cadastro/snapshot do produto; texto regulatório e slogan permanecem no modelo.

Quando a OP ainda não possui lote produzido, o lote usa a data atual e a validade textual vem do cadastro do produto. Não existe campo separado de fabricação. A forma definitiva de calcular e formatar a validade ainda requer homologação regulatória.

## Regras demonstradas

- a etiqueta é vinculada ao produto da OP, não a uma digitação independente;
- a lista de ingredientes impressa usa o texto “Contém” construído somente com os ingredientes marcados no produto/versão;
- a lista começa pelas bases da fórmula em ordem decrescente; os demais itens são agrupados por categoria funcional, também da maior para a menor participação;
- somente sal, nitrito de sódio (INS 250) e nitrato de sódio (INS 251) podem exibir o percentual calculado sobre o rendimento da fórmula;
- aromatizantes são exibidos somente como “Aromatizantes”, sem identificar os componentes;
- especiarias são exibidas somente como “Especiarias” até 25% da fórmula; acima de 25%, seus nomes aparecem entre parênteses, em ordem decrescente e sem percentuais;
- a etiqueta grande pode ser aberta diretamente em cada item do pedido, antes da OP;
- na abertura da etiqueta, o lote corresponde à data atual; fabricação não aparece como campo separado;
- a validade usa o lote final quando disponível e, antes disso, o cadastro do produto;
- o modelo pode ser consultado no cadastro de Etiquetas;
- a OP pode ter quantidades atribuídas por modelo;
- a prévia reproduz os blocos da referência física: identificação e texto regulatório, ingredientes, alergênicos, uso/conservação, cliente, fabricante, lote, validade, peso e slogan;
- Fórmula para produção e Etiquetas possuem ações separadas na OP;
- a impressão atual usa o diálogo do navegador e não gera arquivo armazenado no sistema.

O protótipo não importa nem exporta arquivos `.nlbl`. A saída disponível é a impressão/salvamento em PDF do navegador; o arquivo de modelo nativo continua dependente do aplicativo que o criou.

A quantidade atribuída ao modelo é configurável, mas a impressão atual renderiza uma prévia por tamanho: não há geração automática de N cópias. Não há emissão persistida/auditada nem PDF armazenado. O formato demonstrado é lote `DDMMAAAA` e validade de lote `MMM/AAAA`; validade textual do produto é preservada. Conferir HF-10 do roteiro final, inclusive medição física e escala 100%.

## Critérios de aceite do sistema futuro

1. O modelo preserva as dimensões físicas confirmadas: grande 105 × 105 mm e pequena 105 × 58 mm; a impressora de destino ainda deve ser definida.
2. O conteúdo oficial é versionado e aprovado pela Qualidade e pelo responsável técnico.
3. Lote/data de impressão, validade e peso ficam congelados no evento de emissão; a origem definitiva da validade deve ser homologada.
4. O sistema define quantidade, sequência e agrupamento da impressão.
5. O PDF e a impressão térmica preservam escala, margens e legibilidade.
6. Código de barras ou QR Code, quando exigido, tem regra de origem e validação.
7. A emissão registra usuário, data, modelo, versão e OP na auditoria.

## Pendências para homologação

- confirmar ingredientes, alergênicos, conservação, instruções e textos regulatórios;
- confirmar código de barras, QR Code, formato da data usada como lote e cálculo/formato da validade;
- confirmar quantidade por embalagem e quantidade por folha/rolo;
- confirmar impressora, papel, margens e necessidade de impressão em lote;
- definir se a etiqueta pode ser emitida antes da aprovação do lote;
- definir permissões para alterar modelos, quantidades e emitir etiquetas.

## Impacto futuro

A API/banco deverão preservar modelo e versão usados na emissão, snapshot dos dados do produto e lote, vínculo com OP e arquivo/resultado da impressão quando houver armazenamento. A implementação atual é somente demonstrativa e local.

## Ajuste do cliente — 01/10/2026 (RN-ETQ-006)

O bloco reserva espaço para CLIENTE e adapta a fonte do nome completo à largura e altura restantes, após carregar a fonte e ao redimensionar a janela. A escala usa cqw para preservar proporções na impressão. Critério: nomes curtos, o exemplo ALIMENTOS DO NORTE — DEMONSTRAÇÃO e nomes extensos devem permanecer entre as divisórias, sem reticências. Ajuste visual demonstrado; legibilidade física depende da calibração da impressora.

