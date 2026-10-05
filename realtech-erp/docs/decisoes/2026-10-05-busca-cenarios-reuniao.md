# Busca e cenários da reunião — 05/10/2026

Pedido do usuário: busca em Ordens de produção, Clientes e Produtos; enriquecer o cenário com dados para apresentar os fluxos. Participante: Edgar, via chat.

## RN-UX-001 — Busca nas listas
Status: confirmado como pedido de interface; implementação demonstrada.
Busca imediata, sem distinguir maiúsculas ou acentos. Clientes: nome, razão social, CNPJ (com ou sem pontuação), vendedor e campos visíveis. Produtos: código, nome, categoria e campos visíveis. Produção: OP, pedido, cliente, produto e campos visíveis, incluindo pedidos aprovados aguardando OP. Termos separados por espaço devem ocorrer na mesma linha. Limpar restaura as linhas e a ordenação existente; nenhum registro é alterado. Exibe contagem e mensagem sem resultados. Respeita as listas já filtradas por perfil; não acessa fórmulas/custos ocultos.
Aceite: digitar nome sem acento, CNPJ apenas numérico, código e pedido; conferir resultados, ausência de resultados e restauração ao limpar. Teste automatizado da filtragem e renderização em tests/search.test.cjs; homologação visual permanece manual.

## RN-DEMO-001 — Cenários conectados e sintéticos
Status: demonstrado; exemplos não homologam regras novas.
Oito pedidos: análise regular, restrição financeira, OP aguardando, rascunho, produção parcial 3/6, qualidade pendente, pronto para faturar e despachado com uma de duas parcelas paga. Cadastros adicionais mostram clientes regulares, produto em desenvolvimento e produto inativo. Fórmulas, preços e pessoas continuam sintéticos. Todos os estados operacionais são gerados por execute, com auditoria e consumos reais da simulação.
Aceite: cenário 5 mantém saldo a produzir; 6 bloqueia faturamento; 7 permite faturar; 8 mantém despacho e parcela aberta. Guia lista objetivo e etapa atual, com link para cada pedido. Cobertura em domain.test.cjs.
Persistência: novo armazenamento do modo com dados realtech.prototype.meeting-2026-10-05; dados antigos ficam preservados na chave anterior e o modo vazio mantém a chave existente. Reabrir o protótipo carrega os novos cenários sem exigir reinicialização do modo antigo.

## Impacto e pendências
Flutter: Clientes/Produtos já possuem busca; revisar paridade de acentos e adicionar busca na Produção após validação. Nenhuma alteração Dart nesta entrega. API: no futuro, busca deve respeitar autorização e paginação no servidor. Banco: nenhuma mudança de esquema ou importação dos seeds.
Confirmado: solicitação das buscas. Demonstrado: dados e narrativa dos oito exemplos. Pendente: homologação presencial do comportamento e das regras operacionais já catalogadas; Edgar/empresa na reunião. Prioridade/capacidade, retrabalho, baixa parcial e integração fiscal continuam abertas. Próximo cenário: PED-01005, completar apontamento e conferir dois lotes antes da inspeção.
