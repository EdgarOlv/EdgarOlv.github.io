# 05/10/2026 — Pedidos em kg, batidas e navegação (v15)

## Confirmado pelo usuário
Novos pedidos comerciais e amostras escolhem produto e quantidade em kg, com base de 1 kg. A quantidade pode ser pequena, por exemplo 1 kg para amostra. Embalagens e volumes seguem o cadastro, sem converter o histórico em UN. Limite máximo e número de batidas devem recalcular entre si. Linhas de tabelas abrem registros; INS precede o nome dos ingredientes. Fórmula de produção apresenta etiquetas registradas sem medidas, lote DDMMAAAA e somatórios.

## Demonstrado e critérios de aceite
- RN-PED-007: novo pedido inicia com 1 kg; 100 kg de Tempero e 100 kg de Realçador totalizam 200 kg e R$ 2.300,00. Quantidade aceita três casas decimais; preço em centavos por kg. OP, apontamento, lote e despacho preservam KG. Registros antigos permanecem UN.
- RN-OP-003: 100 kg / máximo 50 = duas batidas. Alterar para três calcula máximo necessário de 33,33333 kg. Alterar máximo recalcula número inteiro por teto. Produção e Qualidade (somente amostras), além de Administrador, podem ajustar antes de iniciar. Documento já emitido recebe revisão de planejamento e auditoria; versão da fórmula permanece congelada.
- RN-OP-002: documento soma percentual, kg da fórmula, kg por batida e kg total da OP. Resíduo de arredondamento de cinco casas é aplicado somente na apresentação ao maior ingrediente; consumo de estoque mantém precisão de três casas. Etiquetas com quantidade positiva são relacionadas sem dimensões.
- RN-UX-002: clique em dados da linha, Enter e Espaço abrem detalhe ou formulário existente. Ações de aprovação, início, exclusão e geração continuam dependentes do botão explícito. Linhas sem detalhe próprio apresentam consulta genérica.
- RN-ETQ-003: lote utiliza DDMMAAAA nas prévias e na fórmula. Data-base mantém o comportamento anterior de emissão; não foi homologada mudança da identidade persistida do lote.

## Pendências concretas
50 kg é referência sintética editável, não capacidade homologada de todas as máquinas. Produção deve informar os limites reais e regras de alteração após o início. Batidas representam planejamento, não registros individuais de execução. Embalagem parcial é arredondada para cima no transporte; para total abaixo da capacidade, a prévia usa o peso real. Modelos específicos para a última embalagem parcialmente preenchida de uma OP maior dependem de definição da Qualidade.

## Validação e impacto
57 testes automatizados: domínio, P&D, busca e qualidade; amostra fracionada 1,25 kg, preservação UN, divisão e soma de batidas, impedimento após início. Navegador isolado confirmou pedido em kg, abertura pela célula, 100 kg/3, documento, lote e etiquetas.
Flutter experimental não foi alterado. PedidoItem já possui quantidade double e unidadeMedida, mas falta congelar base kg/preço kg, capacidade líquida da embalagem e volumes. OP/API/banco precisam plano de batidas, revisões, controle de permissões e snapshots. Migração futura deve distinguir explicitamente KG/UN, nunca reinterpretar quantidades antigas.

### Ajuste de apresentação — 05/10/2026
RN-OP-003: botão **Modificar** imediatamente ao lado de **Gerar fórmula para produção**, na OP aguardando início. O modal informa máximo em kg e batidas; o valor salvo alimenta os kg por ingrediente/batida na ficha. Sem alteração de fórmula, consumo ou versão. Cache dos recursos atualizado para v15.1.

## Correção v15.2 — 05/10/2026
A captura da OP em produção evidenciou uma restrição indevida da v15/v15.1. RN-OP-003 passa a permitir **Modificar** ao lado da fórmula em OP aguardando ou em produção. Substitui a limitação anterior ao início. Ajuste revisa planejamento da ficha para o total da OP, com auditoria; não modifica produção, lotes, consumos ou versão da fórmula já registrados. OP concluída permanece bloqueada. Capacidades reais seguem pendentes. 58 testes, incluindo preservação após apontamento parcial.
