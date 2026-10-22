# Recebimentos preços e fornecedores

Entrega v22 de 22/10/2026. Origem: três ajustes de P&D informados por Edgar neste chat. Protótipo e documentação autorizados; Flutter/SQL/backend sem implementação nesta entrega. Complementa v18/v20 e preserva v21.

## Regras confirmadas

- RN-EMB-005: recebimento de embalagem inicia pela seleção do código de embalagem ativa do cadastro. Nomenclatura e apresentação (tipo, medida quando houver, capacidade e unidade) preenchidas automaticamente, somente leitura. Identidade enviada é embalagemId, validada no domínio, nunca um nome livre. O código é do item do catálogo de embalagens, não do produto acabado e não do lote recebido. Não permite seleção vazia; não cria embalagem pelo recebimento.
- RN-EST-009: preço de compra e custo separados nos lotes de embalagem e de ingredientes/insumos/matérias-primas, e na projeção de saldo/cadastro do último recebimento. Compra bruta R$ e custo R$ líquido de créditos selecionados. Mantém RN-EST-008: só ICMS/IPI marcados para crédito reduzem custo. Soma dos créditos no máximo 100%; zero crédito mantém custo igual ao bruto.
- RN-FOR-003: CNPJ obrigatório em novo cadastro e na edição de fornecedor; inscrição estadual opcional; endereço, bairro, cidade, estado e CEP separados. Rejeitar formato e DV incorretos, normalizar identidade e impedir duplicata. Complementa RN-FOR-002; substitui CNPJ opcional e endereço único do editor anterior.

## Comportamento demonstrado e escolhas reversíveis

- Código da embalagem é selecionado numa lista, sem consulta externa; nome/apresentação vêm do cadastro local. Apresentação composta pelos campos já existentes, sem inventar dimensões ausentes.
- Valores das tabelas são unitários: embalagem R$/UN e ingrediente R$/kg. Para entrada em L, manter o bruto original R$/L no lote e normalizar preço de compra para kg = bruto/L × quantidade L / peso kg; custo usa a mesma base para comparação. Exemplo sintético: 10 L a R$10/L e 8 kg = compra R$12,50/kg; ICMS18% creditado e IPI5% não creditado = custo R$10,25/kg. Não subtrair impostos outra vez na projeção.
- Nos saldos, preço de compra aponta para ultimoRecebimentoId, não média de lotes ou estoque valorizado. Custo atual permanece a projeção já existente do cadastro. Lotes antigos não são recalculados quando chega nova compra.
- Lote legado sem preço bruto: Não informado (legado). Não inferir impostos ou preço de compra a partir do custo atual. Custos legados preservam a limitação documentada na v18.
- CNPJ aceita 14 caracteres sem pontuação ou máscara exata XX.XXX.XXX/XXXX-XX; letras das primeiras 12 posições são preservadas e normalizadas em maiúsculas. Dois DVs numéricos pelo módulo11/ASCII-48; números iguais rejeitados. Máscara exibida ao editar/na lista e aplicada ao sair de um campo válido; erro nativo durante digitação e validação final no domínio. Validade matemática não consulta situação cadastral na Receita.
- Inscrição estadual é texto opcional, inclusive ISENTO; sem validação estadual inferida. Endereço e complementos permanecem opcionais nesta proposta, pois somente CNPJ foi solicitado como obrigatório. UF preenchida deve pertencer à lista brasileira; CEP preenchido aceita 8 dígitos ou XXXXX-XXX, salva sem hífen. Obrigatoriedade dos componentes de endereço permanece para validação da empresa.

## Fontes técnicas do CNPJ

- Receita Federal, perguntas e respostas: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
- Serpro, cálculo dos dígitos: https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf
- Exemplo oficial de teste 12.ABC.345/01DE-35, nunca cadastro real do protótipo. Não retirar letras com replace de não dígitos. Validador compartilhado também preserva formato/identidade em saveClient, sem ampliar outros campos de cliente.

## Aceite e evidências

1. Abrir Receber embalagem: código sem escolha inicial, nome/apresentação vazios. Selecionar código ativo preenche exatamente seu cadastro; trocar atualiza; seleção inexistente/inativa é recusada pelo domínio.
2. Receber embalagem a R$5/UN com ICMS18% creditado: lote e último saldo exibem compra R$5 e custo R$4,10; desmarcar crédito conserva R$5. Repetir ingrediente KG e exemplo L acima.
3. Receber nova compra não muda lote anterior. Legado sem bruto mostra ausência de informação.
4. Fornecedor sem CNPJ ou com caracteres/pontuação/DV incorretos não salva nem altera estado. Com/sem máscara reconhecem a mesma identidade para duplicidade. Aceitar identificador alfanumérico válido, preservar zeros iniciais e campos de endereço na reabertura.
5. Testar IE vazia e preenchida, UF inválida, CEP inválido, categorias anteriores, permissões e fornecedor inativo no recebimento.

98 testes Node aprovados, zero falhas; sintaxe dos cinco JS ativa aprovada. Novos testes em tests/receipt-supplier-v22.test.cjs cobrem os formulários em VM, lookup, cálculo KG/L/UN, imutabilidade do lote, formato/DV/unicidade/atomicidade/CNPJ alfa, endereço e projeções de tabela. Fixtures antigas DOC-001/DEMO-CNPJ substituídas por identificadores sintéticos matematicamente válidos; não flexibilizar validação para seeds. Log: Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v22-testes.txt. QA visual de navegador não executada, impressão física e homologação empresarial não recebidas nesta rodada.

## Matriz de impacto Flutter API banco

| Área | Etapa 1 dados | Etapa 2 casos de uso/API | Etapa 3 UI e aceite |
|---|---|---|---|
| Embalagem | Embalagem id/código/nome/tipo/medida/capacidade/unidade; DTO para apresentação | ReceberEmbalagem valida ID ativo; lookup por código; rejeita ID inexistente; não confiar em campos readonly enviados | Código primeiro, nome/apresentação somente leitura e atualização na troca; inicial vazio |
| Preços | Lote: preço bruto decimal por unidade de origem, quantidade, unidade, peso kg, taxas/flags/custo líquido; projeção comparável por kg/UN | Calcular uma vez e congelar compra/custo no recebimento; transação/idempotência; projeção de último recebimento separada do custo do consumo | Colunas Compra R$ e Custo R$ em saldos/lotes/cadastro de ingredientes; unidade explícita, legado nulo, origem em L preservada |
| Fornecedor | documento legado → cnpj string, inscricaoEstadual, endereco, bairro, cidade, estado, cep; categorias/IDs intactos | Validador puro CNPJ numérico/alfa com DV e formato, normalização e unique na persistência; CEP/UF; autorização server-side | Required no CNPJ, feedback antes de salvar, máscara, campos separados e IE opcional |
| Migração | Adição de campos sem reset, sem preencher documentos ou preços desconhecidos | Fornecedor legado incompleto pode ser lido/recebimento histórico preservado; ao salvar exige corrigir CNPJ; não mudar FKs | Sinalizar ausência e solicitar preenchimento na edição; não decompor endereço histórico por heurística |

Flutter inspecionado: Fornecedor em core/models/models.dart já tem cnpj/endereco/cidade/estado, faltam bairro/CEP/IE e validação equivalente; Embalagem tem codigo/nome/descricao/unidadeMedida/custo, faltam contrato completo da apresentação e lotes de recebimento. Portar via modelos/repositórios/casos de uso/ViewModels conforme plano, sem copiar doubles como contrato monetário definitivo. SQL físico somente após arquitetura/DDL aprovados. Arquivos Dart e banco não alterados.

## Pendências e próximo cenário

Confirmar com P&D/Estoque apresentação por tipo e se preço em saldos continuará último recebimento (mantido do contrato vigente), validar obrigatoriedade de endereço com empresa e tratamento cadastral de fornecedores legados. Nenhuma pendência exige bloquear os ajustes confirmados. Demonstrar código → apresentação → recebimento com crédito → duas colunas → novo fornecedor inválido/válido e reabertura. Correção de validação de CNPJ e projeção de dados existentes não significam automaticamente escopo comercial adicional.
