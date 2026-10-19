# Custos e totais na composição — 19/10/2026 (v19.1)

Origem: Edgar pediu, nos detalhes do produto, substituir Custo vigente por custo unitário na fórmula e custo de produção, somando cada coluna ao final, como Excel.

## RN-PD-009

Solicitação **confirmada**. Interpretação/apresentação **demonstrada**: custo unitário é o custo líquido vigente do ingrediente em R$/kg (já com créditos do recebimento conforme RN-EST-008); custo de produção é quantidade kg × esse custo. Não é novo motor de preço.

Tabela com cinco colunas: ingrediente, quantidade kg, participação %, custo unitário na fórmula R$/kg, custo de produção R$. Rodapé soma as quatro colunas numéricas; participação total é soma das quantidades ÷ rendimento ×100, sem forçar 100% se legado inconsistente. Total monetário de produção considera ingredientes da fórmula inteira, sem embalagem ou adicionais. Totais calculados antes do arredondamento visual, como em planilha.

Soma dos custos unitários é apenas soma aritmética, não custo/kg do produto. Nota abaixo identifica isso e apresenta custo real da matéria-prima/kg = soma dos custos de produção ÷ rendimento. Exemplo sintético: 100 kg, 100%, soma unitária R$70,50/kg, custo de produção R$545,00 e matéria-prima R$5,45/kg. Ácido 10 kg × R$8,50/kg = R$85,00.

Composição ocupa a largura do detalhe para legibilidade das cinco colunas; formação do preço fica abaixo. Sem escrita, alteração de fórmula/estoque ou preço aprovado. Não reaplicar créditos sobre custo líquido.

## Aceite e evidências

Abrir produto com fórmula e verificar valores linha a linha, totais de cada coluna e diferença entre soma unitária e custo da mistura. Produto sem fórmula mantém aviso existente. Teste budget-ui.test.cjs cobre as cinco colunas, cálculo de uma linha, todas as somas, nota explicativa e ausência de mutação; regressão total: 79 aprovados, zero falhas. Sintaxe JS aprovada. Log: ../../Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v19-1-testes.txt. QA visual no navegador localhost:8773; captura ../v19-1-composicao-totais.png.

## Impacto e continuidade

| Camada | Impacto |
|---|---|
| Protótipo | interactions.js: productCompositionTable reutiliza table com tfoot; flows.css: largura/rodapé; versão v19.1 |
| Flutter | Detalhe do produto deve portar tabela e totais com semântica/unidades explícitas; usar custos do caso de uso, sem duplicar regra de créditos |
| API/banco | Nenhuma nova entidade/campo/mutação; projeção de leitura dos dados vigentes |

Pendente: aceite da interpretação do nome custo unitário e apresentação pela empresa; conteúdo/rastreabilidade de recebimentos legados segue v18. Próximo cenário: demonstrar ingrediente com novo recebimento e conferir unitário/produção/totais. Flutter/Dart/SQL não alterados. Ajuste refina a apresentação já solicitada de P&D, sem presumir ampliação comercial.
