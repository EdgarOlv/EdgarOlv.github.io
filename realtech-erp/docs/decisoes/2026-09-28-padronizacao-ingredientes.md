# Padronização da declaração de ingredientes

**Data:** 28/09/2026  
**Origem:** orientação do usuário e imagem da tabela “Padronização de grupos de produtos Realtech 2026”.  
**Regras:** RN-ING-004, RN-ING-005, RN-ING-006 e RN-ETQ-005.

## Decisões confirmadas

- A declaração considera somente os ingredientes marcados para aparecer no rótulo.
- As bases da fórmula, como água, sal e açúcar, aparecem primeiro e em ordem decrescente de quantidade.
- Os demais itens são agrupados por categoria funcional. Os grupos e seus itens são ordenados da maior para a menor participação na fórmula.
- Categorias funcionais cadastráveis: acidulantes, antioxidantes, conservadores, espessantes, reguladores de acidez, corantes, umectantes, realçadores de sabor, estabilizantes e antiumectantes. A repetição de “espessantes” na lista recebida foi consolidada em uma única opção.
- Percentuais são permitidos somente para sal, nitrito de sódio (INS 250) e nitrato de sódio (INS 251), calculados sobre o rendimento da fórmula.
- Aromatizantes são declarados somente pelo nome do grupo, sem identificar seus componentes.
- Especiarias são declaradas somente pelo grupo quando representam até 25% da fórmula. Quando a soma ultrapassa 25%, seus nomes são listados em ordem decrescente, sem percentuais.
- Ingredientes registram categoria funcional e grupo padronizado; produtos também registram o grupo.

## Grupos interpretados da imagem

| Grupo | Itens padronizados |
| --- | --- |
| 01 | Matéria-prima, aditivos únicos e especiarias |
| 02 | Condimentos, aditivos gerais, blends, mix e Max |
| 03 | Fumaças, óleos e corantes |
| 04 | Pastas e molhos |

## Confirmação complementar

O usuário confirmou que a anotação “Max” integra oficialmente o grupo 02.

## Impacto de implementação futura

O gerador deve ser uma regra de domínio versionada, e não texto montado somente pela interface. Assim, etiquetas, fichas e demais documentos reutilizam a mesma declaração. O pedido e a OP devem preservar um snapshot do grupo, dos ingredientes selecionados e do texto gerado para manter o histórico mesmo após alterações cadastrais.
