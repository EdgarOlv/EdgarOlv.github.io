# Quatro cenários completos para apresentação

v24 — 22/10/2026. Correção solicitada por Edgar: a v23 reduziu demais o volume e o guia. RN-DEMO-002 passa a demonstrar quatro pedidos, etapas distintas e roteiro de ponta a ponta. Substitui a escolha de apenas um pedido da v23, preservando seu histórico.

## Base inicial

| Cenário | Pedido | Etapa | Dados e próximo passo |
|---|---|---|---|
| 1 | PED-01002 | Rascunho | 20 kg/R$220; revisar, enviar ao Financeiro e testar todo o ciclo |
| 2 | PED-01003 | Análise financeira | 20 kg/R$220; analisar, aprovar e gerar OP |
| 3 | PED-01004 | Produção parcial | 40 kg/R$440, OP em produção com 20 kg apontados e lote pendente de Qualidade; produzir outros 20 kg |
| 4 | PED-01001 | Despachado | 100 kg/R$1.100; uma parcela R$550 paga, outra aberta; confirmar entrega e concluir pagamento |

São quatro etapas de apresentação, não quatro valores distintos do enum Pedido: a etapa deriva também da OP, faturamento e despacho. Duas OPs e dois lotes acabados iniciais (um liberado/despachado, outro pendente). Mantidos 1 cliente, 2 fornecedores, 1 produto, 1 fórmula, 4 ingredientes e 1 embalagem. Entradas de 200 kg e 40 baldes suportam os 180 kg de todos os pedidos: após concluir os quatro restam 20 kg de ingredientes e 4 baldes. Novos testes de amostra/compras podem alterar saldos.

## Guia restaurado

Tabela de cenários com etapa atual e link ao pedido. Dez etapas explicam Comercial, Financeiro, aprovação, geração de OP, documento/etiquetas, apontamento parcial, inspeção de TODOS os lotes, faturamento, frete/despacho, entrega, pagamentos e auditoria. Percurso adicional de P&D/recebimentos/embalagens/ficha/amostra e etiquetas, com bloqueios esperados e cuidados ao reprovar ou ativar revisões. Use Administrador ou Trocar perfil. Links de cenários respeitam pedidos visíveis ao usuário.

## Preservação e aceite

Apresentação padrão usa meetingScenariosSeed() e nova chave realtech.prototype.meeting-four-scenarios-v24. Chaves v23/anteriores e modo vazio intactos. Não preencher a base salva com pedidos sem autorização nem apagar alterações do usuário. Habilitar Dados de demonstração e recarregar carrega base nova; recargas seguintes preservam registros. Reiniciar quatro cenários mantém a confirmação de reset já existente e afeta somente este modo/base.

102 testes Node aprovados; sintaxe dos cinco JS aprovada. tests/four-scenarios.test.cjs verifica quantidade/etapas, vínculos, guia com links e conclusão sequencial dos QUATRO cenários até entrega e pagamento de todas as parcelas, sem faltar estoque ou saldo negativo. Log Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v24-testes.txt. QA visual no navegador não executada, sem declarar homologação da empresa.

## Impacto Flutter API banco

Apenas fixture/guia demonstrativos, sem mudança de regra de negócio, schema12 mantido e Dart/SQL/backend sem alteração. Para Flutter: E1 factory isolada e referências; E2 reproduzir transições e teste sequencial de conservação/recebimento; E3 guia com ações e cenários por etapa calculada. Nunca carregar fórmulas, documentos ou preços sintéticos em produção. E1/E2/E3 continuam não iniciadas. Próxima validação com empresa: executar cenários 1–4 e roteiro complementar, verificando compreensão das etapas e dados; não há nova pendência funcional nesta correção.
