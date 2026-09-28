# Decisões e propostas — 10/09/2026

### RN-EST-003 — Disponibilidade de estoque antes da OP

- Data e participantes: 10/09/2026; solicitação do usuário responsável pelo protótipo.
- Pedido da empresa: o Comercial deve visualizar “Aguardando lote” quando não houver estoque para produzir; a Produção não pode gerar OP até a chegada do estoque necessário.
- Status: demonstrado, aguardando homologação da empresa.
- Regra, exceções e bloqueios: pedido aprovado sem OP compara a necessidade agregada de matérias-primas com lotes liberados, dentro da validade e com saldo. A insuficiência bloqueia `createOps`. Uma nova entrada suficiente libera a etapa automaticamente.
- Dados obrigatórios: fórmula e peso congelados no item; quantidade pedida; lotes, saldos, status e validade.
- Perfis/permissões: Comercial consulta a etapa; Produção tenta gerar OP; Estoque consulta faltas e recebe lotes.
- Efeitos em outros módulos: dashboard e pedidos do Comercial; fila de OPs da Produção; painel de pendências do Estoque.
- Auditoria: a entrada de lote já é auditada; a tentativa bloqueada não cria OP nem mutação.
- Critérios de aceite: mostrar as faltas em kg; desabilitar e bloquear a geração; após entrada suficiente, mostrar “Gerar OPs” e permitir a operação.
- Evidência no protótipo/teste: `orderStockAvailability`, `stage`, bloqueio de `createOps` e teste automatizado de falta/entrada/liberação.
- Impacto no Flutter/API/banco: ainda não portar. A API deverá recalcular dentro da transação de geração; o banco precisará sustentar concorrência/reserva quando essa política for definida.
- Pendências e responsável pela resposta: empresa deve confirmar se embalagens entram na trava, se haverá reserva de estoque e qual pedido tem prioridade quando dois pedidos disputarem o mesmo saldo.

### RN-GOV-001 — Versão e histórico visíveis no protótipo

- Data e participantes: 10/09/2026; solicitação do usuário responsável pelo protótipo.
- Pedido da empresa: apresentar uma página de atualizações abaixo do Guia de demonstração, mostrar a versão v3 e relacionar entregas com regras de negócio e documentação.
- Status: demonstrado, aguardando validação da utilidade e linguagem com a empresa.
- Regra, exceções e bloqueios: toda versão exibida possui data, resumo, lista de alterações, maturidade, IDs de regras e atalhos para áreas acessíveis ao perfil.
- Dados obrigatórios: versão, data, título, descrição, área, situação, regras relacionadas e rota opcional.
- Perfis/permissões: página disponível para todos os perfis da demonstração; atalhos continuam respeitando o recorte de acesso.
- Efeitos em outros módulos: menu Gestão, identificação visual da versão e processo de atualização documental.
- Auditoria: não se aplica; conteúdo de versão é metadado estático do protótipo.
- Critérios de aceite: exibir v3 como atual; preservar v2 no histórico; abrir áreas relacionadas; funcionar em desktop e mobile.
- Evidência no protótipo/teste: coleção `releases`, rota `atualizacoes` e teste de integridade/versionamento.
- Impacto no Flutter/API/banco: não requer banco ou API; portar para Flutter somente se a empresa desejar essa página no produto final.
- Pendências e responsável pela resposta: empresa deve validar nomes, textos e quais entregas anteriores merecem constar no histórico.
