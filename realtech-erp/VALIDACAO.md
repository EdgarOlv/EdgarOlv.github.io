# Validação da demonstração

## Cobertura do escopo de negócio

| Critério do refinamento | Situação neste protótipo |
|---|---|
| 1. Usuários e perfis | Perfis predefinidos, login demo, ativação/desativação e ações restritas. Sem cadastro completo ou segurança real. |
| 2. Cadastros | Cliente básico e recebimento de lotes; demais cadastros são dados de consulta. Parcial. |
| 3. Fórmulas e versões | Consulta, criação de nova versão, ativação e preservação de histórico. Sem inativação/obsolescência via UI. |
| 4. Custos e preços | Simulação de insumos/embalagem e margem sobre venda; liberação de tabela. Sem tributos/despesas completos. |
| 5. Produto e fórmula | Valida fórmula ativa, produto ativo e preço liberado; vínculo atualizado ao ativar versão. Sem edição geral de produto. |
| 6. Pedidos e análises | Criação multi-item, revisão, análise financeira, aprovação, cancelamento pré-OP e complementar. |
| 7. OP por item | Geração independente, sem duplicação. |
| 8. Documento da OP | Geração registrada, consulta da ficha de demonstração e aba preliminar de etiquetas; impressão/PDF pelo navegador. Não confundir com Ficha Técnica da Qualidade. |
| 9. Produção/perdas/consumo | Apontamento parcial, múltiplos lotes, perdas, sobras e custos de insumos. Sem reaproveitamento de sobras. |
| 10. Estoque | Entradas, ajustes justificados, validade, saldo e movimentos. Sem inventário completo. |
| 11. Qualidade | Inspeção pendente/aprovada/reprovada, motivo e referência de laudo. Sem anexos/retrabalho. |
| 12. Faturamento | Bloqueios por todas as OPs, fichas, qualidade e liberações. Registro interno; sem NF-e. |
| 13. Frete/despacho | Transportadora, valor informativo, prazo, saída, rastreamento, comprovante textual e baixa do lote final. |
| 14. Rastreabilidade | Consulta de lote de entrada até OP/lote final/pedido/cliente/despacho e caminho reverso. |
| 15. Relatórios | Recortes básicos por perfil, histórico anual de atraso por cliente e comissão final baseada em recebimentos do mês. Sem conciliação bancária, BI completo ou filtros temporais avançados. |
| 16. Auditoria | Antes/depois, usuário, perfil, ação e horário. Consulta; sem imutabilidade real de servidor. |

## Testes executados em 27/08/2026

### Domínio

Suíte Node nativa em `tests/domain.test.cjs`: **17 testes passaram, zero falhas**. Verificação de sintaxe dos quatro arquivos JavaScript de execução também passou. Casos de fluxo completo com perfis distintos; cálculo de totais; conversão UN/kg; produção parcial; perdas/sobras; consumo de múltiplos lotes; saldo e atomicidade da simulação; restrições de acesso; cliente/produto inválido; análise e reanálise; bloqueio de edição; snapshot de fórmula/preço; geração duplicada; qualidade reprovada; saída/pagamento duplicados; ajustes; CNPJ; usuário inativo; segregação por vendedor; persistência JSON; revalidação de crédito.

### Interface no navegador

Executado pela UI, sem injetar estados no app:

- Login Comercial, Financeiro e Administrador; indicadores e menus diferentes; credencial inválida recusada.
- Criação do PED-01004 com dois itens, R$ 2.300,00 e R$ 109,00 de comissão.
- Envio pelo Comercial; liberação pelo Financeiro; aprovação comercial e desaparecimento da edição.
- Geração das OP-00002 e OP-00003; emissão de fichas e início de produção.
- Apontamento integral de ambas; primeira fórmula consome dois lotes de ácido cítrico.
- Inspeção dos PA-00001 e PA-00002; faturamento liberado apenas para o pedido elegível.
- Registro de faturamento e despacho; transportadora/rastreio presentes no pedido.
- Consulta da rastreabilidade do PA-00001, incluindo cinco consumos, dois lotes de ácido cítrico, fornecedores, versão da fórmula e despacho.
- Recarga, novo login e recuperação do pedido despachado.
- Abertura de módulos administrativos; consulta de erros do navegador sem erros registrados no recorte inspecionado.
- Revisão visual do login e dashboard desktop; dashboard 390 × 844, valor monetário corrigido para não quebrar centavos; menu móvel abre e fecha.

### Não validado / não entregue

- Não foi executado build, teste ou alteração do Flutter.
- Não houve publicação nem teste em hospedagem externa.
- Não foi validado fluxo compartilhado entre computadores: não existe backend nesta demo.
- A suíte não testa concorrência real, segurança em produção ou integração fiscal.
- A inspeção visual não é uma auditoria completa de acessibilidade ou compatibilidade em todos os navegadores.
- Testes de domínio de P&D, estoque e cadastro não substituem homologação operacional completa de seus formulários pela empresa.

Antes de enviar à empresa, revisar `REFERENCIA_FLUTTER.md` e confirmar que as premissas demonstrativas estão adequadas. Dados de teste criados no navegador de revisão não fazem parte do seed distribuído: nova origem/navegador começa com os três cenários iniciais.
