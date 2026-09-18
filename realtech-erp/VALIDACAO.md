# Validação da demonstração

## Cobertura do escopo de negócio

| Critério do refinamento    | Situação neste protótipo                                                                                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Usuários e perfis       | Perfis predefinidos, login demo, ativação/desativação e ações restritas. Sem cadastro completo ou segurança real.                                                                                                     |
| 2. Cadastros               | Cliente básico e recebimento de lotes; demais cadastros são dados de consulta. Parcial.                                                                                                                               |
| 3. Fórmulas e versões      | Consulta, criação de nova versão, ativação e preservação de histórico. Sem inativação/obsolescência via UI.                                                                                                           |
| 4. Custos e preços         | Simulação de insumos/embalagem e margem sobre venda; liberação de tabela. Sem tributos/despesas completos.                                                                                                            |
| 5. Produto e fórmula       | Valida fórmula ativa, produto ativo e preço liberado; vínculo atualizado ao ativar versão. Sem edição geral de produto.                                                                                               |
| 6. Pedidos e análises      | Criação multi-item como entrada oficial, prioridade, prazo de produção e condições de pagamento com uma ou mais parcelas definidas por dias e valor automático. Texto de condições comerciais é opcional e adicional. |
| 7. OP por item             | Geração independente, sem duplicação e bloqueada enquanto lotes válidos/liberados não cobrirem a necessidade agregada de matérias-primas.                                                                             |
| 8. Documento da OP         | Geração registrada, consulta da ficha de demonstração e aba de etiquetas com prévia baseada no modelo e nos dados da OP; impressão/PDF pelo navegador. Não confundir com Ficha Técnica da Qualidade.                  |
| 8a. Etiqueta no pedido     | Cada item do pedido abre a etiqueta grande com produto, cliente, ingredientes e peso; lote e datas ficam `A definir` antes da produção. Textos fixos são editáveis no módulo Etiquetas.                              |
| 9. Produção/perdas/consumo | Apontamento parcial, múltiplos lotes, perdas, sobras e custos de insumos. Sem reaproveitamento de sobras.                                                                                                             |
| 10. Estoque                | Entradas, ajustes justificados, validade, saldo, movimentos e fila de pedidos aguardando lote. Sem inventário completo, reserva ou prioridade entre pedidos.                                                          |
| 11. Qualidade              | Inspeção pendente/aprovada/reprovada, motivo e laudo; Ficha Técnica demonstrativa por pedido/lote, com itens e nutrição. Sem assinatura ou conteúdo regulatório homologado.                                           |
| 12. Faturamento            | Abre parcelas previstas no pedido, divide o total exatamente e conclui após todas as baixas. Despacho independente; sem NF-e.                                                                                         |
| 13. Frete/despacho         | Transportadora, tomador emitente/destinatário, valor, prazo, saída, rastreamento, baixa do lote final e confirmação auditada de entrega.                                                                              |
| 14. Rastreabilidade        | Consulta de lote de entrada até OP/lote final/pedido/cliente/despacho e caminho reverso.                                                                                                                              |
| 15. Relatórios             | Recortes básicos por perfil, histórico anual de atraso por cliente e comissão final baseada em recebimentos do mês. Sem conciliação bancária, BI completo ou filtros temporais avançados.                             |
| 16. Auditoria              | Antes/depois, usuário, perfil, ação e horário. Consulta; sem imutabilidade real de servidor.                                                                                                                          |
| 17. Versões do protótipo   | Página de atualizações disponível a todos os perfis, com v3 atual, histórico v2, IDs de regras e atalhos para as áreas afetadas.                                                                                      |

## Testes executados em 14/09/2026

### Revisão incremental em 17/09/2026

- Sintaxe dos quatro arquivos JavaScript de execução verificada.
- Suíte de domínio: **30 testes passaram, zero falhas**, incluindo persistência dos textos editáveis do modelo grande.
- Fluxo de navegador validado como Administrador: pedido `PED-01001` → item → `Abrir etiqueta`.
- Editor do modelo grande aberto com todos os campos fixos separados; logotipo carregado e console sem erros.
- Comparação visual registrada em `design-qa.md`, com resultado aprovado para demonstração.

### Domínio

Suíte Node nativa em `tests/domain.test.cjs`: **25 testes passaram, zero falhas**. Verificação de sintaxe dos quatro arquivos JavaScript de execução também passou. A cobertura inclui divisão exata das parcelas, criação sem texto de condições comerciais adicionais, baixas individuais e despacho com faturamento em andamento.

### Interface no navegador

Executado pela UI, sem injetar estados no app:

- Login Comercial, Financeiro e Administrador; indicadores e menus diferentes; credencial inválida recusada.
- Criação do PED-01004 com dois itens, R$ 2.300,00 e 200 kg, sem antecipar comissão ao Comercial.
- Envio pelo Comercial; liberação pelo Financeiro; aprovação comercial e desaparecimento da edição.
- Geração das OP-00002 e OP-00003; emissão de fichas e início de produção.
- Apontamento integral de ambas; primeira fórmula consome dois lotes de ácido cítrico.
- Inspeção dos PA-00001 e PA-00002; faturamento liberado apenas para o pedido elegível.
- Registro de faturamento e despacho; transportadora/rastreio presentes no pedido.
- Consulta da rastreabilidade do PA-00001, incluindo cinco consumos, dois lotes de ácido cítrico, fornecedores, versão da fórmula e despacho.
- Recarga, novo login e recuperação do pedido despachado.
- Abertura de módulos administrativos; consulta de erros do navegador sem erros registrados no recorte inspecionado.
- Revisão visual do login e dashboard desktop; dashboard 390 × 844, valor monetário corrigido para não quebrar centavos; menu móvel abre e fecha.
- Flag de dados ligada por padrão; desligada mantém os nove logins, zera os indicadores, oculta “Novo pedido” sem cadastros e exibe tabelas vazias. Ao religar, o conjunto com dados reaparece sem mistura entre os modos.

### Não validado / não entregue

- Não foi executado build, teste ou alteração do Flutter.
- A Ficha Técnica teve sintaxe e regressão do domínio verificadas, mas ainda requer homologação visual e de conteúdo pela Qualidade; os nutrientes são sintéticos.
- Não houve publicação nem teste em hospedagem externa.
- Não foi validado fluxo compartilhado entre computadores: não existe backend nesta demo.
- A suíte não testa concorrência real, segurança em produção ou integração fiscal.
- A inspeção visual não é uma auditoria completa de acessibilidade ou compatibilidade em todos os navegadores.
- Etiquetas: ainda não foram homologadas as medidas físicas, conteúdo regulatório, código de barras, quantidade por impressão, impressão em lote ou integração com impressora térmica.
- Etiqueta grande: o formato de impressão 180 × 160 mm é demonstrativo e deve ser conferido na impressora e mídia reais antes do uso.
- Testes de domínio de P&D, estoque e cadastro não substituem homologação operacional completa de seus formulários pela empresa.

Antes de enviar à empresa, revisar `REFERENCIA_FLUTTER.md` e confirmar que as premissas demonstrativas estão adequadas. Dados de teste criados no navegador de revisão não fazem parte do seed distribuído: nova origem/navegador começa com os três cenários iniciais.
