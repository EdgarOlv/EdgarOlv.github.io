# Seleção de ingredientes na composição

## Ajuste P&D na v21 — ingrediente único durante a edição

RN-PD-010 (confirmada por Edgar em 22/10/2026): impedir ingrediente duplicado já na seleção da composição, tanto em novo produto quanto em criação/edição de fórmula. Não esperar o salvamento final.

Correção: cada seletor mantém sua escolha atual e desabilita ingredientes usados nas outras linhas, identificando-os como já incluídos. Adicionar também rejeita ID repetido; trocar a seleção atualiza todas as opções; remover libera a opção novamente. Seleção duplicada recebida por evento é revertida imediatamente com aviso para editar a quantidade existente. Quantidades, filtro de estoque e validação final do domínio permanecem.

Aceite: selecionar A na primeira linha e conferir A desabilitado nas outras; trocar A por C e conferir A disponível; remover uma linha e conferir liberação; adicionar até esgotar opções sem repetir; salvar segue a validação de integridade existente. Cobertura em tests/formula-choices.test.cjs (seleção/troca/remoção/reversão e estoque). 92 testes passam; sintaxe JS aprovada. QA visual pendente. Não há nova regra comercial ou cálculo: correção preventiva de uma duplicidade já rejeitada pelo domínio.

Impacto Flutter/API/banco: na etapa de telas, derivar opções disponíveis dos IDs selecionados no ViewModel e atualizar ao adicionar/trocar/remover; manter validação de unicidade no caso de uso/API e futura restrição composta (revisão da fórmula, ingrediente). Não remover opção atual ao reconstruir formulário. Sem novo campo, DDL ou Dart nesta entrega. Próximo cenário: demonstrar duas linhas e troca/remoção para P&D; não há pendência funcional para este bloqueio.
