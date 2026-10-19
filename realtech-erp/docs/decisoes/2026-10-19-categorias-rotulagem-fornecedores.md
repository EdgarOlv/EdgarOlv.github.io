# Categorias de rotulagem compartilhadas — 19/10/2026 (v20)

Origem: Edgar esclareceu que as categorias a selecionar no fornecedor são as categorias para rotulagem já existentes nos ingredientes. Pediu segunda tabela em Grupos de ingredientes para inserir/editar e manter também as opções gerais Ingredientes/Embalagens. Este esclarecimento substitui a pendência de granularidade registrada na decisão v18/RN-FOR-002.

## RN-ING-005 e adendo RN-FOR-002

**Confirmado:** catálogo gerenciável de categorias de rotulagem, segunda tabela na página de grupos e uso da mesma lista nos ingredientes e fornecedores, preservando as categorias gerais. **Demonstrado:** inativação sem exclusão, contagem de vínculos, perfis herdados dos grupos e agrupamento genérico para categorias novas. **Pendente:** aceite visual, permissões finais e eventuais regras especiais de declaração para categorias novas; não paralisa outros módulos.

- Página Grupos de ingredientes mantém Grupos padronizados e acrescenta Categorias para rotulagem. A segunda tabela mostra nome, quantidades de ingredientes/fornecedores vinculados, status e Editar; botão Nova categoria. Criar, renomear, inativar e reativar são auditados. Nomes duplicados são bloqueados após normalizar acentos, caixa e espaços.
- Catálogo inicial preserva as 14 opções existentes: Base da fórmula, Acidulantes, Antioxidantes, Conservadores, Espessantes, Reguladores de acidez, Corantes, Umectantes, Realçadores de sabor, Estabilizantes, Antiumectantes, Especiarias, Aromatizantes e Outros.
- Ingrediente seleciona uma categoria; fornecedor seleciona várias. Fornecedor mantém `categorias` gerais (`ingredientes`, `embalagens`) e acrescenta `categoriasRotulagem` com IDs do catálogo, sem confundir os dois conceitos. Checkboxes gerais e de rotulagem têm blocos próprios. Lista de fornecedores mostra ambos.
- O nome pode mudar sem alterar o ID. IDs legados preservam os valores anteriores de categoriaRotulagem; novos IDs são gerados. Não renomear a identidade quando mudar texto. Ingrediente mantém categoriaRotulagem como referência e categoria como nome de compatibilidade; renomeação sincroniza esse nome nos cadastros atuais.
- Inativação impede novos vínculos nos dois formulários e no domínio. Cadastros já vinculados mostram a opção inativa e podem preservá-la/removê-la. Depois de removida, não é possível adicioná-la novamente enquanto inativa. Sem exclusão física.
- IDs canônicos mantêm as regras especiais existentes: Base da fórmula não vira grupo na declaração; Aromatizantes não abre composição; Especiarias só abre nomes acima de 25%. Renomear muda a denominação exibida no grupo, sem alterar a regra pelo nome. Categorias novas usam agrupamento genérico, sem inferir regra especial pela grafia do nome.
- Declarações/textos aprovados já salvos em produto/pedido/OP não são reescritos. Novas sugestões de Contém leem nome atual do catálogo. Nome/categoria são configuráveis; isso não constitui aprovação regulatória de conteúdo.
- Categorias de fornecedor continuam descritivas: esta solicitação não autoriza bloquear recebimento por categoria. Fornecedor ativo continua sendo revalidado no recebimento como antes.
- Schema local 12 preservado; validateState cria catálogo aditivamente quando ausente, sem resetar ingredientes, fornecedores ou operações. Não fabrica vínculos para fornecedores antigos. Sem dados reais novos.

## Aceite e testes

Criar categoria na segunda tabela; verificar mesma opção no ingrediente e fornecedor; salvar fornecedor com Ingredientes + Embalagens + duas categorias de rotulagem; reabrir e conferir seleção. Renomear categoria vinculada e verificar identidade preservada. Inativar, conferir preservação do vínculo antigo e rejeição de vínculo novo. Comparar históricos e declaração de Aromatizantes/Especiarias antes/depois.

`node --test tests/*.test.cjs`: 85 aprovados, zero falhas. Suíte nova `label-categories.test.cjs`: CRUD/status, normalização/duplicidade, permissões/auditoria, relação compartilhada, vínculo ativo/inativo, migração aditiva, regras especiais e histórico intacto, declaração de categoria nova. Quatro JS com node --check aprovados. Log em ../../Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v20-testes.txt.

QA navegador, origem isolada localhost:8773: segunda tabela e nova categoria; fornecedor salvo com duas opções gerais + Acidulantes + categoria nova; novo ingrediente com a categoria nova; tabela contou 1 ingrediente e 1 fornecedor; edição do fornecedor conservou checkboxes. Screenshot ../v20-fornecedor-categorias.png. Só dados sintéticos. Não equivale a homologação empresarial.

## Matriz de impacto

| Camada | Impacto |
|---|---|
| Protótipo | domain: catálogo, CRUD, validações, declaração por ID e migração aditiva; interactions/views: segunda tabela e seleção comum; script: auditoria; CSS: grade de checkboxes |
| Flutter | Ingrediente/Fornecedor em core/models/models.dart ainda sem paridade do catálogo. Incluir CategoriaRotulagem (id/nome/ativo), referência no ingrediente e relação múltipla no fornecedor; ViewModels/repositórios compartilham fonte. Portar por etapas após recorte, sem lista literal duplicada em tela |
| API | CRUD autorizado de categorias e validação de vínculo ativo, preservação dos inativos existentes, unicidade normalizada e auditoria. Recebimento não ganha trava por categoria |
| Banco lógico | categorias_rotulagem + ingrediente.categoria_rotulagem_id + fornecedor_categoria_rotulagem; manter categorias gerais separadas. IDs estáveis e status. Migrar strings anteriores sem alterar snapshots |

Dart/SQL/backend não alterados. Próxima demonstração: editar o nome de categoria vinculada, inativar e abrir os dois cadastros para demonstrar preservação e impedir nova seleção. Regras especiais adicionais, se necessárias, devem ser especificadas por P&D antes de portar; não definir por semelhança do nome.
