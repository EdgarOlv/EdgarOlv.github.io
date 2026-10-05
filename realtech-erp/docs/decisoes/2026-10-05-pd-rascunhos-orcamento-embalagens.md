# Ajustes de P&D discutidos em reunião — 05/10/2026

Fonte: decisões relatadas por Edgar no chat durante a reunião. Nome dos demais participantes não informado. Esclarecimento confirmado no chat: embalagens em litros usam peso líquido manual em kg, sem densidade automática.

## RN-PD-006 — Editar rascunho; numerar ao ativar
Confirmada. Substitui o momento de versionamento descrito anteriormente para RN-PD-002/003: salvar composição não gera a próxima versão publicada.
- Uma fórmula nova começa como rascunho, sem número publicado (versao 0 internamente). Salvar repetidamente mantém ID e rascunho; editar fórmula ativa cria/reutiliza um rascunho separado.
- Ativação atribui maior versão já publicada da família + 1. Primeira ativação de fórmula nova = v1. Fórmula ativa v2, editada várias vezes, continua v2 até ativar o rascunho como v3.
- Composição continua dinâmica, cinco casas decimais e soma igual ao rendimento para salvar. Orçamento preliminar pode mostrar composição ainda incompleta, com aviso.
- Preço precisa de liberação após ativação. Fórmulas ativas, pedidos e OPs anteriores preservam composição e embalagem. Dados anteriores no navegador não são apagados nem têm versões reescritas.
- Histórico legado pode conter múltiplos rascunhos gerados pelo comportamento antigo; eles são preservados. Novas edições não criam outros rascunhos para a mesma família.
- Removido “Criar a partir deste produto” do detalhe de P&D. O atalho na lista foi preservado, pois a solicitação se refere ao botão dentro do produto.
Aceite: editar três vezes, conferir mesmo ID/número de fórmulas, ativar e conferir incremento único. Nova fórmula deve receber v1 na primeira ativação. Auditar cada salvamento e ativação.

## RN-PD-007 — Orçamento antes de salvar produto/fórmula
Confirmada. O editor calcula ingredientes conforme composição atual e rendimento; soma custo da embalagem por peso líquido, custos e encargos da formação de preço existente e lucratividade informada. Exibe preço/kg, preço por embalagem final, número inteiro de embalagens para a batida e custo dessas embalagens. Simulação usa estado temporário e não cria produto, fórmula, pedido ou liberação comercial.
Aceite: alterar um ingrediente sem salvar e ver custo mudar; trocar embalagem e ver custo/preço mudar sem alterar rendimento; comparar simulação com preço depois de salvar/ativar com os mesmos parâmetros. Permanece preço estimado, não proposta comercial/documento enviado ao cliente.

## RN-EMB-001 — Cadastro e apresentação final
Confirmada. P&D e Administrador cadastram/editam/inativam embalagem com código único, nome, tipo, capacidade positiva, unidade KG/L e custo unitário não negativo. Sem exclusão física. Catálogo inicial sintético: balde 5 kg, saco 20 kg, bombona 20 L e pote 1 kg.
No produto novo, edição de dados e edição da fórmula há lista para escolher embalagem. Seleção registra nome, custo unitário, capacidade, peso líquido e snapshot. A embalagem não aparece como ingrediente e não altera massa/percentuais/declaração Contém.
- KG: peso líquido deve caber na capacidade em kg.
- L: volume preenchido deve caber na capacidade em litros; peso líquido em kg é obrigatório e manual. Não assumir 1 L = 1 kg.
- Embalagem entra no custo por kg por custo unitário / peso líquido. A quantidade estimada para a batida é ceil(rendimento / peso líquido); a última pode ficar incompleta.
- Salvar embalagem no rascunho não muda a apresentação ativa; a ativação aplica a escolha ao produto editado. Produtos que compartilhem a fórmula não herdam sua embalagem.
- Edição direta da apresentação do produto invalida preço liberado quando muda embalagem/peso/custo. Pedidos e OPs novos congelam embalagem e peso; antigos não são reescritos. Cadastro de embalagem editado não altera automaticamente snapshots existentes.
Aceite: capacidade excedida, peso ausente, unidade inválida, código duplicado e perfil comercial devem ser recusados. Inativação impede nova seleção e ativação de rascunho com essa embalagem.

## RN-EMB-002 — Sugestão de embalagem
Solicitação de sugestão confirmada; algoritmo demonstrado. Menor capacidade ativa que comporte o conteúdo na mesma unidade; empate pelo menor custo unitário. Ação explícita “Sugerir embalagem” aplica a proposta, mas o profissional pode escolher outra. Criação oferece opção inicial compatível; edição de produto legado mantém apresentação atual até escolha explícita.
Pendente, P&D/empresa: compatibilidade técnica de material/tipo com produto, exigências de barreira e fechamento. A sugestão atual considera capacidade e custo, não valida adequação industrial.

## Testes e impacto
- tests/pd.test.cjs: versionamento incremental, novo produto v1, orçamento sem escrita, custo/volume/peso, cadastro/permissões, sugestão, snapshots e migração.
- Navegador, origem isolada localhost:8766: novo produto de 20 L / 18 kg, orçamento antes de salvar, duas edições seguidas, v1 na primeira ativação, rascunho posterior sem alterar v1 e v2 apenas na próxima ativação; cadastro de saco 10 kg a R$ 2,35. Testes não alteram a origem usual localhost:8765.
- Flutter: possui entidade/cadastro Embalagem e vínculo na fórmula, mas precisa alinhar ciclo rascunho/ativação, orçamento em memória, capacidade/unidade/peso manual e snapshots. Não foi modificado nem executado.
- API futura: salvar rascunho com autorização/revisão concorrente; ativar e atribuir versão em transação com unicidade por família; orçamento sem gravação; catálogo com autorização e auditoria.
- Banco futuro: catálogo de embalagem, capacidade/unidade/custo, vínculo com apresentação, volume/peso líquido, rascunho separado da versão publicada e snapshots de pedido/OP. SQL não alterado nesta entrega.
- Pendente: estoque/consumo real de embalagens, múltiplas camadas (embalagem interna/externa), cadastro de preços reais e adequação técnica. Não introduzidos como regras homologadas.
Próximo cenário: editar fórmula ativa v2, comparar orçamento com balde e saco, salvar duas vezes, ativar v3 e conferir a OP anterior com embalagem original.
