# Catálogos ampliados e acesso rápido à ficha técnica

v25 — 22/10/2026. Origem: Edgar pediu mais ingredientes/estoque/produtos e, em seguida, Visualizar ficha técnica no início do modal. RN-DEMO-002 ampliada e RN-FT-004 (solicitações confirmadas, apresentação demonstrada).

## Dados de apresentação

12 ingredientes (8 novos, incluindo alho/cebola/pimenta/páprica/orégano/cominho/amido/maltodextrina), 5 produtos, 5 fórmulas, 4 embalagens, 4 fornecedores, 3 clientes e 18 lotes. Ingredientes novos recebidos em lotes de 80 kg, compra/custo e ICMS creditado; embalagens adicionais com 60 UN por lote. Produtos adicionais: três ativos com fórmulas/embalagens e preço liberado, um piloto em desenvolvimento com fórmula rascunho e sem liberação de preço. Os quatro pedidos e as duas OPs iniciais da v24 permanecem, com o guia de ponta a ponta intacto.

Dados são sintéticos: não publicar fórmulas, preços ou fichas como oficiais. Perfil e catálogo continuam referências locais. Fornecedores com CNPJ matematicamente válido não representam as empresas reais associadas aos identificadores. Fórmulas somam rendimento, não repetem ingrediente e apontam para ingredientes existentes; produtos apontam para embalagem e fórmula. Base expandedMeetingSeed() usa nova chave realtech.prototype.meeting-expanded-v25; v24 e anteriores preservadas, sem misturar alterações ou resetar modo vazio. Recarregar com Dados de demonstração habilitado inicia a nova base na primeira abertura e preserva-a nas próximas.

## RN-FT-004 acesso rápido

No editor da ficha técnica, Visualizar ficha técnica passa a ser a primeira ação do corpo do modal, com estilo primário e identificação de revisão/status. Um clique abre a prévia da revisão salva, sem rolar os campos. O acesso duplicado no fim foi removido; aprovação e histórico preservados. Ficha ainda não salva exibe orientação para salvar o primeiro rascunho; não cria revisão nem aprova silenciosamente. Prévia continua lendo dados salvos, não alterações ainda não salvas; informar isso pelo rótulo Revisão salva. Sem alteração de permissões, conteúdo, estados ou banco.

## Aceite e evidência

104 testes aprovados, incluindo conclusão dos quatro cenários em sequência na base ampliada, vínculos/contagem do catálogo, fórmulas, estoque e elegibilidade de preços. Teste do editor verifica que previewProductSheet vem antes do primeiro campo de percentual. Sintaxe cinco JS verificada. Log Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v25-testes.txt. QA visual/navegador permanece pendente.

Demonstração: percorrer ingredientes/estoque/produtos, criar novo pedido com produto ativo e comparar com piloto indisponível; abrir Qualidade > Gerenciar ficha técnica do primeiro produto e usar o botão destacado no topo. Os produtos adicionais não recebem documentos técnicos aprovados automaticamente.

## Impacto Flutter API banco

RN-DEMO-002: ampliar somente fixtures isoladas, preservando IDs relacionais, casos de uso e valores monetários; não carregar em produção. RN-FT-004: na etapa3, ação primária de leitura no topo do modal, antes dos campos, com revisão/status e orientação para primeiro salvamento; mesma projeção pública/permissão/caso de uso de prévia. Não criar API/DDL por reposicionamento de botão. Etapas E1/E2/E3 e arquivos Dart/SQL/backend sem execução nesta entrega. Próximo: validação visual e roteiro de apresentação; não há pergunta impeditiva de negócio para estes ajustes.
