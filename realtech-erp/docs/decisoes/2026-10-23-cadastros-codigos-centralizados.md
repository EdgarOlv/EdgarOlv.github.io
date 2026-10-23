# Cadastros centralizados e códigos estruturados - v27
Data: 23/10/2026. Origem: reunião de P&D relatada por Edgar e tabela enviada no chat. Alteração restrita ao protótipo e contratos; não executa migração SQL ou Flutter.

## Confirmado pelo pedido
- RN-CAD-001: apresentar simultaneamente duas alternativas: grupo Cadastros com acessos independentes e Central de cadastros com abas. Ambos consultam e editam as mesmas entidades; não duplicar cadastros.
- RN-CAD-002: formato GG-SNNN (00-0000). GG identifica o tipo de cadastro, S o subgrupo e NNN a sequência gerada ao salvar. Usuário escolhe grupo/subgrupo; não digita o sufixo.
- RN-CAD-003: localizar cadastros por código, inclusive em outros módulos, respeitando permissões e carteira.

## Taxonomia recebida
| Grupo | Cadastro | Subgrupos |
|---|---|---|
| 01 | Clientes | 1 São Paulo; 2 Minas Gerais; 3 Rio de Janeiro; 4 Espírito Santo; 5 Sul; 6 Centro-Oeste; 7 Nordeste; 8 Norte; 9 Distrito Federal |
| 02 | Fornecedores | 1 Matéria-prima; 2 Especiarias; 3 Embalagens; 4 Diversos |
| 03 | Representantes | 1 Direta; 2 Representantes; 3 Revendas |
| 04 | Matéria-prima | 1 Aditivos; 2 Especiarias; 3 Óleos; 4 Diversos |
| 05 | Embalagens | 1 Plásticas; 2 Papel/Papelão; 3 Bombonas; 4 Frascos; 5 Potes; 6 Diversos |
| 07 | Produtos acabados | 1 Commodities (aditivos, especiarias e insumos); 2 Condimentos; 3 Aditivos e blends; 4 Mix e Max; 5 Fumaças, óleos e corantes; 6 Molhos e pastas; 7 Linha especial (PET e outros) |

06 não foi informado. Não criar um grupo Itens gerais por suposição. Diversos é subgrupo dos cadastros indicados.

## Proposta demonstrada
- Sequência independente por GG+S, inicial 001, máximo 999. Exemplos: 02-1001, 02-1002 e 02-3001. Prévia não reserva número; execução calcula novamente ao salvar. Inativação/exclusão não devolve número. Estouro bloqueia sem gravação parcial.
- Código consolidado imutável na edição. Classificação antiga demonstrativa pode ser confirmada ou corrigida uma vez; correção preserva alias pesquisável. Reclassificação operacional após confirmação continua pendente de regra.
- Campo codigoCadastro é aditivo. IDs e FKs permanecem. Campo codigo anterior de ingrediente/embalagem/produto é preservado como referência anterior (RT-3650, ING-..., etc.). Novos registros desses tipos recebem também codigo igual ao código gerado, preservando os consumidores legados.
- Migração local cadastrosVersion=1, idempotente e no mesmo ambiente v26 (sem reiniciar pedidos). Classificação sugerida por nome/tipo/UF quando disponíveis; todos os exemplos migrados exibem Classificação a revisar. Fallback de cliente SP e demais subgrupos é apenas demonstrativo, nunca classificação oficial da empresa. Confirmar ao editar. Não adotar heurística para base real.
- Clientes reutilizam a entidade existente e passam a permitir editar nome, dados fiscais e contato, preservando vendedor, limite, exposição, histórico e IDs usados em pedidos. Exige CNPJ válido ao salvar, inclusive para exemplos antigos fictícios sem DV válido.
- Representantes são lista comercial independente: nome, documento opcional, contato, ativo e código. Três exemplos no modo demonstrativo; nenhum no modo sem histórico. Não cria usuário, não concede login nem vincula comissões/carteira automaticamente.
- Produto acabado reutiliza produtos. Fórmula, ficha, custos e estoque continuam em seus módulos; não cria tabela duplicada de produto acabado. Editar dados técnicos segue autorização existente.
- Central usa tabelas com criação, edição/consulta e busca; abas mantêm tipo no hash. Clientes/fornecedores/matérias-primas/embalagens continuam com formulários completos existentes. Para produto acabado reutilizar criação P&D e edição técnica; edição do nome preserva snapshots anteriores.
- Busca global no cabeçalho aceita 02-1005, 021005 ou 02 1 0 0 5, nomes, códigos antigos e aliases; sem acentos; lista até 30 resultados com contagem. Resultado abre edição autorizada ou consulta resumida. Perfil Comercial vê apenas sua carteira. Central não concede permissões novas de outros módulos.
- A classificação dos códigos não substitui grupos de rotulagem nem grupoPadronizacao industrial: são dimensões diferentes e permanecem separadas.

## Aceite e validação
1. Recarregar dados existentes sem perder pedidos, OPs, lotes, fórmulas, auditoria e IDs.
2. Menu Cadastros e Central/abas acessam os mesmos registros. Editar em uma alternativa e consultar na outra após salvar/recarregar.
3. Criar dois representantes em 03-2 e um em 03-3; sequências independentes, preservação na edição e na inativação.
4. Criar ingrediente, embalagem e produto com prefixo escolhido; código final gerado no domínio, sem herdar código do produto-base.
5. Confirmar classificação migrada; corrigir subgrupo de exemplo mantém alias. Código consolidado não muda silenciosamente.
6. Pesquisa global por código formatado, compacto e com espaços encontra o mesmo ID; perfil sem acesso não encontra o cadastro.
7. Contador 999, prefixo inválido, gravação não autorizada e duplicidade persistida são recusados. Estado anterior preservado em falha.
8. Verificado: 117/117 testes aprovados (10 específicos em tests/registrations.test.cjs), regressão dos demais módulos e node --check em todos os scripts JS. QA visual pendente: a política do navegador bloqueou a observação do protótipo em file:// na sessão. Não contornar o bloqueio.

## Impacto Flutter, API e banco
| Camada | Contrato / impacto |
|---|---|
| Flutter | Modelos existentes e módulos clientes/fornecedores/ingredientes/produtos reaproveitados; não há feature representantes na estrutura inspecionada. Portar codigoCadastro, subgrupo e aliases, duas propostas de navegação e busca após homologação. Nenhum Dart modificado. |
| API | Reservar incremento e inserir registro em transação no servidor; validar prefixo, autorização e unicidade. Prévia de número não é reserva. API pública de busca deve filtrar carteira/perfil e excluir fórmulas/custos protegidos. Concorrência local atual verifica revision. |
| Banco | PK/FK por ID imutável; código comercial com UNIQUE e formato, subgrupo por FK/catálogo; contador por (tipo, subgrupo), operação atômica e limite 999. Avaliar tabela representantes separada de usuarios. Produto acabado reutiliza produto, sem tabela duplicada. DDL somente após fechar contrato. |
| Migração | Confirmar código de origem e classificação de cada cadastro real, preservar aliases e relatórios de conflitos. Não transformar receitas/preços ou heurísticas demonstrativas em dados de produção. |

## Pendências para P&D / empresa / Edgar
- Qual das navegações será definitiva? Ambas são propostas demonstradas nesta entrega.
- Início em 001 confirmado por Edgar em 23/10/2026 (v28). Permanecem a confirmar: reinício por subgrupo como demonstrado e códigos já existentes a importar/reservar.
- Regra para cliente mudar de UF; fornecedor atender vários grupos; produto mudar de linha. Código permanece, alias ou reclassificação autorizada? Não inferir pelo endereço a cada edição.
- Regra após 999 registros e destino do grupo 06/itens gerais, se necessário.
- Quem confirma classificação, quem mantém representantes e sua relação com vendedor, revenda e comissão? Permissões atuais são demonstração, não aprovação de um cadastro regulatório/fiscal novo.
- Comparação comercial: navegação reaproveita escopo de cadastros. Numeração central e representantes trazem contrato adicional a confirmar; não presumir cobrança, prazo ou inclusão comercial. Ver registro em Docs/PONTOS_A_NEGOCIAR.md.

Próxima demonstração à empresa: criar fornecedor no subgrupo 02-3, encontrá-lo pelo código no recebimento via busca global, editar pela central e conferir no acesso independente; criar representante, editar e conferir sequência preservada.

Atualização v28: início 001 confirmado. Seletores de cadastros pesquisáveis por código/nome conforme [contrato](2026-10-23-seletores-pesquisaveis.md).
