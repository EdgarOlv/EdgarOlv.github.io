# Seletores pesquisáveis e sequência inicial - v28
Data: 23/10/2026. Origem: Edgar confirmou 001 e pediu combobox pesquisável por código/nome no pedido e demais usos de cadastros.

## Confirmado
- RN-CAD-002: sequência inicial 001 confirmada; substitui a pendência 000/001 da v27. Código segue GG-SNNN. Não renumerar registros existentes.
- RN-UX-004: campos de seleção de cadastros permitem digitar e pesquisar código/nome, nos pedidos e em outros formulários que os utilizam.

## Demonstrado
- Componente único em searchable-selects.js aprimora selects clienteId, product, produtoId, sourceProductId, fornecedorId, ingredienteId, formulaIngredient, embalagemId e representanteId. Inclui formulaId/loteId quando presentes. Novos controles dinâmicos recebem o mesmo comportamento.
- Pedidos: cliente/produto. Recebimentos: fornecedor, ingrediente e embalagem. P&D: produto-base, ingredientes da fórmula e embalagem. Não criar relacionamento novo com representantes só para exibir um seletor.
- Pesquisa sem acentos por código formatado/compacto/com espaços, nome, referência legada e alias. Lista exibe código do cadastro e o rótulo original (que pode incluir apresentação e versão).
- Apenas as opções previamente permitidas pelo select original; não pesquisa indiscriminadamente a base. Carteira, status, estoque, preço liberado, fornecedor ativo e prevenção de ingrediente duplicado continuam definidos pelas regras existentes.
- Setas percorrem resultados, Enter confirma, Escape restaura a seleção e fecha. Clique/toque confirma. Lista vazia informa Nenhum registro encontrado. Foco seleciona o texto atual para facilitar substituição.
- Texto livre não vira cadastro nem ID. Enquanto digita, confirmação exige selecionar uma opção; Escape restaura o registro anterior. Sair do campo com texto não confirmado mantém erro de validação e impede salvar silenciosamente o registro anterior. Não criar ou salvar um item só porque seu nome foi digitado.
- Select nativo mantém nome, valor/ID e eventos change; campo de pesquisa não integra FormData. Escolher cadastro dispara os cálculos existentes. Leituras de quantidades em pedidos/fórmulas foram explicitadas por tipo/nome para não confundir pesquisa com quantidade.
- Campo desabilitado e opção indisponível não podem ser escolhidos. Estado aria-expanded/controls/activedescendant, rótulo acessível e anúncio da contagem. Observer acompanha linhas adicionadas e alteração de opções sem duplicar controles.
- Nenhum schema, API, FK, autorização ou cálculo comercial novo. Nenhuma alteração no Flutter nesta entrega.

## Aceite e validação
1. No pedido, digitar código compacto do cliente e selecionar por Enter; conferir vendedor. No produto, digitar código/nome, selecionar, alterar quantidade e conferir kg/preço/total.
2. Adicionar segunda linha e verificar seleção independente. Trocar cliente e confirmar os filtros existentes.
3. No recebimento, selecionar fornecedor/ingrediente/embalagem por código; nomenclatura/apresentação da embalagem continuam automáticas.
4. Na fórmula, pesquisar ingrediente e selecionar; itens usados em outra linha não podem ser selecionados. Trocar/remover linha atualiza as opções. Soma e orçamento usam exclusivamente quantidades numéricas.
5. Tentar texto desconhecido, verificar mensagem, Escape e restauração; sair com texto não confirmado deve bloquear salvamento. Verificar setas, Enter, clique, campo desabilitado, persistência por ID e lista sem resultados.
6. Testes específicos tests/searchable-selects.test.cjs exercitam busca, aliases, ID/evento, bloqueios, teclado, texto livre, listas dinâmicas e ausência de duplicação. Teste em registrations.test.cjs confirma o primeiro 001.
7. Verificado: 122/122 testes aprovados e sintaxe de todos os scripts JS aprovada. Após reforço da validação ao sair do campo, os quatro testes do componente foram executados novamente e aprovados. QA visual de navegador permanece pendente porque o acesso file:// do protótipo foi bloqueado nesta sessão; testes de interação usam DOM simulado, não representam validação visual/assistiva completa.

## Matriz de impacto e pendências
| Camada | Impacto |
|---|---|
| Protótipo | Componente compartilhado, inclusão no index e distribuição estática, CSS, seletores explícitos de quantidades e contrato 001 confirmado. Dados existentes preservados. |
| Flutter | Portar campo pesquisável controlado por ID com opções derivadas do ViewModel e filtro por código/nome. Preservar filtros e cálculo. Nenhum Dart alterado. |
| API | Sem endpoint novo no protótipo. No sistema real, busca paginada por código/nome deve manter autorização; texto digitado nunca é aceito como FK. |
| Banco | Sem DDL novo. Manter IDs/FKs e unicidade do código previstos na v27. Sequência começa em 001. |

Não há nova pendência de regra para o campo pesquisável. Validar ergonomia com P&D/Comercial; seleção e navegação por teclado são apresentação demonstrada. Pendências anteriores de reclassificação, limite 999 e migração real continuam. Reorganização/usabilidade dos seletores existentes, sem novo módulo comercial.
