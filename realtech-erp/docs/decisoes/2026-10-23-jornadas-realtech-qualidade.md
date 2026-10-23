# 23/10/2026 - v26: jornadas Realtech e Qualidade

Origem: solicitação de Edgar no chat, planilha RT-3650. Ajuste demonstrativo dentro do fluxo existente, sem nova regra industrial/comercial.

## Confirmado
- RN-DEMO-003: disponibilizar vários pedidos/estados e catálogo inspirado em RealMix/RealMax para testar jornadas.
- RN-QUA-006: corrigir ficha em lotes produzidos e permitir recolher fichas para manter a consulta organizada.

## Demonstrado
- 13 pedidos/amostras, 13 produtos, 24 ingredientes, recebimentos e estoque adicional; cenário em desenvolvimento sem preço liberado. Todos os avanços dos cenários são feitos pelo domínio.
- Estados: rascunho, análise, bloqueio financeiro, aprovado sem OP, OP aguardando, produção parcial, inspeção pendente, reprovação, pronto para faturar, faturado sem despacho, despachado com parcela aberta, entregue/pago e amostra sem OP.
- Lotes primeiro em largura completa, pendentes primeiro, busca por lote/OP/produto e filtro por situação. Fichas abaixo em seção recolhível, busca por código/nome, produto recolhível, revisão, prévia e edição.
- Correção: o botão do lote abre productSheet por produtoId. Ação technicalSheet legada reconhece lote de produto antes de buscar pedido, preservando permissões. Documentos legados por pedido continuam distintos.
- Consulta de ficha é do cadastro atual do produto, NÃO revisão congelada na data da produção. Vincular revisão à emissão/lote continua pendente. A interface usa “Ficha do produto”.
- Nova chave local v26 preserva anteriores e modo vazio. Recarregar com Dados de demonstração ligado abre a base nova. Reiniciar apaga somente esta versão no navegador.
- Planilha: nomes e contexto dos ingredientes usados como inspiração. Conteúdo C4 diz RealMix Apresuntado RT-3650; nome do arquivo diz RealMax. Não assumir qual é oficial. Demais produtos, receitas, preços, dados regulatórios e pessoas são fictícios. Não importar proporções industriais da fonte para o seed.

## Aceite e testes
- Testes de regressão em tests/realtech-journeys.test.cjs: integridade, diversidade dos estados, impedimento de faturar reprovado, referência lote/produto e restrição de acesso, organização e ações de fichas.
- Verificado: node --test tests/*.test.cjs, 107/107 aprovados; node --check nos cinco scripts alterados aprovado.
- QA visual e impressão pendentes: inspeção de file:// bloqueada pela política do navegador. Não contornar o bloqueio.
- Demonstrar à Qualidade: filtrar pendentes, abrir ficha do produto a partir do lote, recolher catálogo e consultar revisão por produto; depois reprovação impedindo faturamento.

## Impacto Flutter / API / banco
| Camada | Impacto |
|---|---|
| Flutter UI | QualidadeScreen atual usa abas e não implementa ficha versionada equivalente. Portar busca, filtro, ordenação e expansão em etapa de telas após homologação. Nenhum Dart alterado. |
| API | Resolver explicitamente lote.produtoId para consulta do cadastro da ficha; aplicar autorização. Associação histórica de revisão continua pendente. Nenhum endpoint criado. |
| Banco | Nenhum campo/DDL novo. Seeds estritamente demonstrativos; nunca migrar receitas/preços fictícios. |
| Testes | Cobertura JS de vínculos, bloqueio e ações. Paridade Flutter planejada, não executada. |

## Pendências
Qualidade e responsável técnico devem confirmar nomes oficiais das linhas, composições, apresentação final e vínculo histórico ficha/lote. Cards recolhíveis são proposta visual para validação. Não altera E1/E2/E3 nem autoriza implementação Flutter.
