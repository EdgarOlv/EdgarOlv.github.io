# Decisão demonstrativa — cadastro de ingredientes

**Data:** 24/09/2026  
**Status:** demonstrada no protótipo; aguardando homologação da empresa.

## Solicitação incorporada

Dentro de **Operação**, o protótipo passa a apresentar o módulo **Ingredientes**. O cadastro-base contém nome, código, INS e categoria e é reutilizado no recebimento de matéria-prima e na composição inicial de novos produtos.

## Comportamento demonstrado

- Estoque, P&D e Administrador podem cadastrar e editar ingredientes; Produção possui consulta.
- O código do ingrediente é único e o INS é opcional.
- A exclusão é recusada quando o ingrediente já participa de uma fórmula ou possui lote, preservando a rastreabilidade.
- O recebimento de matéria-prima lista o cadastro central completo.
- A composição inicial de um novo produto lista somente ingredientes com saldo positivo em lote liberado e dentro da validade.
- Depois da criação, produção e consumo continuam operando por lote, não diretamente pelo cadastro-base.

## Critérios de aceite do protótipo

1. O menu **Operação > Ingredientes** abre a tabela com código, nome, INS, categoria e saldo disponível.
2. Um ingrediente novo pode ser cadastrado, editado e selecionado no recebimento de matéria-prima.
3. Código duplicado é recusado.
4. Ingrediente sem vínculos pode ser excluído; ingrediente com fórmula ou lote não pode.
5. O formulário **Novo produto** apresenta composição inicial dinâmica e somente ingredientes disponíveis em estoque.
6. A soma da composição inicial precisa coincidir com o rendimento da fórmula.

## Pendências para homologação

- Confirmar a lista oficial de categorias e se ela será fixa ou administrável.
- Confirmar quem pode criar, editar e excluir ingredientes no sistema final.
- Confirmar se “ter em estoque” significa somente saldo liberado e válido, como demonstrado, ou se lotes pendentes/bloqueados também devem aparecer com aviso.
- Definir cadastro e histórico do custo do ingrediente; nesta rodada, ingredientes novos entram com custo demonstrativo zero porque custo não foi solicitado como campo da tabela.
- Decidir se a exclusão definitiva continuará permitida para registros sem uso ou se todos deverão ser apenas inativados.

## Impacto futuro

Flutter, API e banco precisarão de CRUD, código único, INS opcional, categoria, permissões e integridade referencial com fórmulas e lotes. A disponibilidade usada na criação do produto deve ser calculada a partir dos lotes, sem duplicar saldo no cadastro-base.
