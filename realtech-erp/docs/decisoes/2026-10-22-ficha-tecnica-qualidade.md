# Ficha técnica editável pela Qualidade

Data: 22/10/2026. Entrega v21. Origem: ficha REALFIX JBS 07 CH REF_nova.docx enviada por Edgar e esclarecimentos de 21–22/10 no chat. Somente dados sintéticos no aplicativo.

## Confirmado

- RN-FT-001: Qualidade recebe composição e percentuais exatos do P&D. A ficha começa pré-preenchida e permite edição manual dos percentuais públicos, incluindo faixa livre como `79,7% - 90%`, valor exato ou campo vazio para não exibir. Sem margem uniforme ou cálculo automático de abertura.
- RN-FT-002: fórmula e declaração pública são registros independentes. Editar a ficha nunca altera fórmula, etiquetas, pedidos, OP ou estoque. Aberta/fechada usa o mesmo modelo e não transforma automaticamente percentuais.

## Demonstrado no protótipo

- RN-FT-003: cadastro por produto em Qualidade > Fichas técnicas dos produtos; revisões rascunho, aprovada e substituída; nova revisão preserva aprovada; aprovação substitui a vigente sem apagar composição anterior. Permissão de edição/aprovação somente Qualidade/Administrador é provisória.
- Percentual interno somente leitura no editor. Nome e percentual público editáveis por ingrediente. Prévia exclui valores internos e snapshot da fórmula.
- Editor inclui descrição, registro, modo de uso, especificações, conservação, transporte, embalagem, alergênicos/glúten, nutrição revisada, validade e responsável técnico.
- Referência da fórmula congelada e comparação com fórmula atual sinalizam alteração. Não sobrescrever correções. Aprovação de rascunho desatualizado é bloqueada; botão explícito gera novo pré-preenchimento. Não mescla correções automaticamente.
- Prévia e aprovação usam a revisão SALVA: salvar antes de consultar ou aprovar. Rascunho também pode ser impresso com marcação demonstrativa.
- Persistência local aditiva `fichasTecnicas: []`, schema 12 preservado, sem seed oficial. Impressão pelo navegador; sem arquivo PDF armazenado, assinatura ou envio.
- Documento por produto segue a estrutura informativa do exemplo, não é reprodução gráfica homologada do Word. Nutrição é texto manual neste recorte; não calcular nutrientes ou copiar imagem não conferida.

## Evolução do contrato anterior

A ficha por pedido/lote existente permanece como consulta demonstrativa legada e ainda NÃO utiliza as revisões novas por produto. RN-QUA-002/003 e o antigo CONTRATO_FICHA_TECNICA descrevem esse legado. Não apresentar os dois botões como documentos equivalentes. Vincular revisão aprovada ao item/pedido e preservar o snapshot da emissão é trabalho futuro.

## Roteiro e aceite

1. Entrar como Qualidade e abrir Gerenciar ficha técnica para um produto com fórmula.
2. Conferir os percentuais internos, escolher tipo aberta e informar faixas diferentes por ingrediente; deixar um campo vazio.
3. Preencher informações técnicas e motivo; salvar, recarregar e reabrir.
4. Prévia deve mostrar apenas os textos públicos, omitindo campo vazio e os percentuais internos. Texto HTML deve aparecer escapado.
5. Aprovar a revisão salva, editar novamente e salvar nova revisão. A antiga não pode ser regravada; nova aprovação substitui anterior mantendo histórico/auditoria.
6. Alterar a fórmula no P&D: alertar sem alterar ficha anterior e bloquear aprovação desatualizada. Gerar novo pré-preenchimento explicitamente.
7. Comercial não pode executar gravação/aprovação. Não provar segurança corporativa em aplicação estática.

Cobertura: tests/technical-sheets.test.cjs verifica isolamento, percentual interno não confiável no payload, persistência serializada, permissão, revisão, substituição, auditoria, mudança do P&D e prévia escapada. QA visual e impressão física pendentes nesta entrega.

## Pendências com a Qualidade e responsável técnico

- Confirmar quem aprova, necessidade de revisão por segunda pessoa e acesso aos percentuais internos.
- Confirmar convenção dos nomes aberta/fechada; exemplos reais de cada uma e exibição ao Comercial.
- Validar conteúdo obrigatório, tabela nutricional e apresentação final conforme documento; assinatura e numeração.
- Confirmar se há variantes específicas por cliente e associação ao pedido/lote. Não criar identidade só pelo tipo aberta/fechada sem essa decisão.
- Aprovação atual não representa validação regulatória nem autorização de documento oficial.

## Impacto e contrato Flutter API banco

| Camada | Contrato para portar |
|---|---|
| Dados / etapa 1 | ProdutoFichaTecnica (id, produtoId, revisão, tipo, status, motivo, autor/data, aprovadoPor/data, formulaId/versão/snapshot, nome-produto snapshot, campos textuais) e linhas (ingredienteId, nome público, percentualExibicao string, referência interna decimal). Lista local vazia para legado; não inventar fichas antigas. |
| Casos de uso / etapa 2 | GerarRascunhoDaFormula, SalvarRascunho, CriarRevisao, AprovarRevisao, ListarHistorico, ObterPreviaPublica. Repositório próprio; validações e autorização no servidor. Concorrência por versão esperada e aprovação/substituição numa transação; uma vigente por produto no modelo demonstrado. |
| UI / etapa 3 | Qualidade com lista por produto, editor com duas colunas de percentuais, tipo, motivo, aviso de divergência, histórico e prévia/impressão. ViewModel Riverpod não recalcula faixas. Mostrar pré-preenchimento ainda não salvo como tal. |
| API futura | Permissões ficha_tecnica.editar/aprovar/consultar a validar; resposta pública contém somente declaração, nunca fórmula ou percentual interno. Evitar serialização genérica de entidade interna. Aprovação com referência imutável à revisão da fórmula. |
| Banco futuro | Revisão cabeçalho e linhas com FK para produto/ingrediente/fórmula; auditoria append-only e snapshots. Texto público não entra em somas, custos ou consumos. DDL somente após fechar contrato e arquitetura. |
| Pedidos/lotes | Posteriormente associar IDs de revisões aprovadas e snapshots de emissão por produto. Integração legada ainda pendente; não recalcular documentos antigos pelo cadastro atual. |

Estado Flutter inspecionado: QualidadeScreen possui duas abas e LocalDataService/modelos locais; não foi encontrada implementação equivalente da ficha editável/versionada. Esta entrega prepara contratos e aceite, não altera Dart/SQL/backend nem inicia E1/E2/E3.
