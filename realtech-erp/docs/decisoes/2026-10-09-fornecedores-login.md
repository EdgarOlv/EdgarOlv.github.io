# Fornecedores e login — 09/10/2026

Solicitação: Edgar, via chat. Cadastro simples que alimenta o select do recebimento e login com um card e instruções sob demanda.

## RN-FOR-001 — Cadastro ligado ao recebimento
Confirmado: existência do módulo e uso da lista no recebimento de matéria-prima.
Demonstrado: nome/razão social obrigatório, documento e contato opcionais; editar e inativar/reativar; busca; Administrador, Estoque e P&D podem cadastrar. Documento informado não pode repetir após normalização. Não há validação fiscal do documento nem exclusão física. Fornecedores antigos sem status continuam ativos, preservando IDs e armazenamento. Recebimento lista somente ativos e o domínio revalida essa condição; histórico mantém vínculo por ID. Auditoria registra criação e alteração.
Aceite: criar fornecedor, encontrá-lo na seleção do recebimento, registrar lote, editar nome, inativar e conferir retirada das novas entradas e preservação do lote; reativar e conferir retorno. Sem ativos, orientar cadastro antes da entrada.
Teste: tests/suppliers.test.cjs cobre vínculo, duplicidade, permissões, auditoria, bloqueio, reativação e legado. QA visual de modal/tabela ainda depende de navegador.
Pendente (empresa/Edgar): campos fiscais obrigatórios, homologação de fornecedores, permissões definitivas e necessidade de preservar nome/documento como snapshot no recebimento. Nesta proposta, edição do nome se reflete nas consultas históricas que usam o ID.

## RN-UX-003 — Login principal
Confirmado: card único e botão de instruções. Demonstrado: ajuda em dialog nativo com perfis, credenciais, modo de dados e percurso; fechar por botão ou Escape. O formulário principal mantém usuário, senha e Entrar. Dados e credenciais continuam sintéticos; apresentação não constitui autenticação real.
Aceite: abrir ajuda, escolher perfil, escolher modo de dados, fechar e entrar; conferir login inválido e troca de perfil. Verificação estrutural/sintaxe; validação visual e teclado pendentes.

## Matriz de impacto
| Camada | Impacto |
| --- | --- |
| Protótipo | Nova rota/menu/tabela, saveSupplier, seleção ativa, ajuda no login; sem troca da chave local. |
| Flutter | Já tem cadastro de fornecedores; revisar paridade após homologação. Login ainda possui banner e atalhos. Nenhum Dart alterado. |
| API | Futuro CRUD autorizado, unicidade do documento e validação de fornecedor ativo na transação de recebimento. |
| Banco | Futuro status ativo e FK do lote; decidir snapshots e documento antes de migrar. SQL não alterado. |

Próxima demonstração: Estoque cadastra fornecedor, recebe matéria-prima, inativa e consulta rastreabilidade do lote. Para sistema final, persistência multiusuário, autorização efetiva, concorrência/reserva de estoque, integrações fiscal/bancária e exceções operacionais permanecem abertas.
