# P&D, recebimentos e embalagens — 15/10/2026 (v18)

Origem: novas solicitações da empresa relatadas por Edgar neste chat; esclarecimentos: peso líquido manual para litros e custo do último recebimento. Autorizado ajustar primeiro o protótipo e preparar o contrato Flutter. Etapas Flutter/SQL/backend continuam sem execução autorizada nesta entrega.

## Confirmado

- **RN-EST-008:** receber ingredientes em KG ou L, valor unitário bruto na unidade recebida, ICMS/IPI entre 0 e 100%, checkbox independente de crédito. Custo líquido = bruto × (1 − (ICMS creditado + IPI creditado)/100). Sem crédito marcado, percentual não reduz custo. Para L, peso líquido total em kg obrigatório; saldo operacional em kg; custo/kg = custo líquido/L × litros recebidos ÷ peso kg. Orçamento usa o último recebimento registrado, inclusive se lote vencido/bloqueado (recorte demonstrado a confirmar). Não é cálculo fiscal oficial nem integração de impostos.
- **RN-ING-004:** módulo de grupos padronizados de ingredientes; criar, editar e inativar sem apagar vínculos. Código estável; grupos iniciais 01–04 preservados. Não confundir grupos com categoria de rotulagem. Não altera os grupos de apresentação de produtos.
- **RN-EMB-003:** medida da embalagem é texto livre, separado de capacidade e peso.
- **RN-FOR-002:** documento exibido como CNPJ, endereço, observação e seleção múltipla de categorias fornecidas. Chave interna `documento` mantida por compatibilidade; API futura mapeará para `cnpj`.
- **RN-EMB-004:** estoque de embalagens, recebimento por embalagem/lote/fornecedor, custo unitário, saldo e movimentações; produção vinculada ao pedido consome ingredientes e embalagens.

## Demonstrado e limites

- Categorias de fornecedor inicialmente `ingredientes` e `embalagens`; descritivas, sem restringir recebimentos. Empresa deve confirmar granularidade e se precisa travar fornecedor incompatível.
- Estoque de embalagem em UN inteira. Recebimento usa datas/lote e créditos do mesmo formulário; demonstrar se toda embalagem exige validade. Ajuste exige justificativa e UN inteira. Perfis: Estoque/Admin recebem e ajustam; P&D/Estoque/Admin gerenciam grupos; catálogo de embalagens continua P&D/Admin.
- Baixa de embalagem no apontamento, FEFO (menor validade), saldo liberado e não vencido. Sem reserva na aprovação/criação da OP. Uma camada de embalagem por produto.
- Quantidade cumulativa = ceil(kg produzidos acumulados ÷ peso por embalagem) − ceil(kg anteriores ÷ peso por embalagem). Perdas e sobras de ingrediente não geram embalagens. Esta proposta assume reaproveitamento da embalagem parcial entre apontamentos da mesma OP; empresa precisa confirmar ou exigir fechamento por apontamento.
- Falta de embalagem bloqueia apontamento inteiro. Executar copia o estado e só confirma ao terminar; backend precisará transação e concorrência real.
- Lote guarda bruto, taxas, flags, quantidade na origem, peso kg e custo líquido. Orçamento usa projeção do último recebimento; custo do consumo usa o lote. Preços comerciais dos produtos afetados por entrada de ingrediente pedem nova liberação; pedidos/OPs passados preservados.
- Estado local schema 12 recebe grupos aditivamente. Não cria estoques fictícios de embalagem nem vincula silenciosamente operações legadas. OP sem embalagemId mantém fluxo legado, com limitação explícita. Custos originais de lotes legados não existem: congelados pelo cadastro anterior ao primeiro novo recebimento e marcados como aproximação, nunca reconstrução fiscal.
- Soma creditada acima de 100% recusada para evitar custo negativo (proteção demonstrada). Custo líquido mantém 5 casas de centavo; valores exibidos em reais com 2 casas; produção arredonda total em centavos. Contrato final deve usar decimal exato, não copiar aritmética binária JS.

## Aceite e evidências

`node --test tests/*.test.cjs`: suítes existentes + pd-receipts.test.cjs. Cobertura nova: créditos separados, faixas/100%, último custo, histórico, L/kg, campos, grupos e migração, permissões, entrada/ajuste UN, falta de embalagem sem escrita e parcial 1+1+8 kg com embalagem 5 kg consumindo 2 UN.

Cenário para empresa: cadastrar grupo e fornecedor das duas categorias; receber 10 L a R$10 com peso 8 kg e ICMS18% creditado/IPI5% sem crédito: custo R$10,25/kg; nova entrada muda orçamento sem reescrever lote anterior. Cadastrar medida livre e receber 2 embalagens de 5 kg, produzir 10 kg em parciais e conferir saldos/movimentos. Tentar apontar sem saldo e confirmar que ingredientes não baixam.

## Matriz Flutter / API / banco

| Camada | Contrato / trabalho futuro |
|---|---|
| Protótipo | domain.js, interactions.js, views.js, script.js, index.html; migração aditiva; sem reset de dados |
| Flutter modelos | core/models/models.dart: Fornecedor já tem CNPJ/endereço, faltam categorias/observação; Ingrediente tem custo/saldo, faltam grupo e projeção do último recebimento; Embalagem tem custo/saldo, falta medida e controle por lote |
| Flutter casos de uso | ReceiveIngredientLot/ReceivePackagingLot, SaveIngredientGroup, AdjustLot e ReportProduction: validar antes de commit; custo do lote independente da projeção; ViewModels e repositórios conforme etapas 1/2/3 |
| API | Recebimento e consumo atômicos, grants efetivos, idempotência, revisão concorrente e fornecedor ativo. Não implementar imposto como cálculo fiscal automático |
| Banco lógico | ingredient_groups; supplier_categories; fornecedores.cnpj/endereco/observacao; embalagens.medida; lotes de embalagem com FK explícita; receipt bruto/unidade/quantidade/peso/taxas/flags/custo; consumos de embalagem por apontamento; IDs preservados e decimal exato |
| Migração | Preservar documento→cnpj e históricos; ausência de custos originais/vínculo de embalagem deve aparecer como legado, nunca preenchida com seed sintético |

## Pendências para fechar

Empresa/P&D/Estoque: parcial entre apontamentos, baixa/reserva e prioridade entre pedidos, perdas de embalagem/múltiplas camadas, validade de embalagem, taxonomia de fornecedor, permissões e política para lote bloqueado alterar orçamento. Edgar/empresa: escopo comercial em NEG-010. Flutter/backend ainda dependem do recorte/arquitetura descritos no pacote de migração; v18 não equivale a sistema pronto para produção.

## Esclarecimento posterior — 19/10/2026
A granularidade das categorias de fornecedor foi esclarecida por Edgar: manter Ingredientes/Embalagens e acrescentar categorias de rotulagem do mesmo catálogo dos ingredientes, gerenciável em segunda tabela de Grupos. Substitui a pendência desse item; permanece sem trava de recebimento por categoria. [Contrato v20](2026-10-19-categorias-rotulagem-fornecedores.md).
