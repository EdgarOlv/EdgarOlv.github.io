# Datas das etiquetas e inspeção — 13/10/2026

Fonte: Edgar relatou no chat orientações da empresa. Solicitações confirmadas; implementação v17 no protótipo. Participantes empresariais não identificados. Nenhum Dart/SQL alterado nesta entrega.

## RN-ETQ-003 — Preservar lote da geração

Substitui a regra de 28/09 de recalcular lote ao abrir/imprimir. Lote DDMMAAAA é registrado na geração; consulta, quantidade atualizada e reimpressão em outro dia não mudam lote/data-base.

Primeira abertura da prévia registra `datasEtiqueta` no item e na OP relacionada, quando existente. OP criada depois herda datas já registradas no item. Dois tamanhos compartilham as datas. É metadado operacional, não desbloqueio de edição comercial. Nova consulta não gera nova auditoria/revisão. Persistência local mantém schemaVersion 12.

Legado sem datas próprias: usar data registrada do Documento da OP e marcar origem `documentoOP-legado`. É referência disponível, não prova do instante exato da impressão antiga. Sem documento/datas, registrar primeira geração da nova versão; não reconstruir história inexistente nem mudar ID/código PA do lote produzido.

## RN-ETQ-007 — Validade MMM/AAAA

Meses abreviados em português/maiúsculas. Prazo `12 meses` com geração em outubro/2026 → **OUT/2027**, por soma de meses de calendário. Prazo explícito em anos/dias ou data ISO/mês-ano também é formatado; texto ausente/não interpretável mostra **A definir**, sem data fictícia.

Origem anterior preservada: validade explícita do lote final disponível na geração tem precedência; sem lote, calcular pelo prazo congelado do produto e data de geração. Lote/validade calculados ficam preservados em `datasEtiqueta`; lote posterior/mudança cadastral não recalculam etiqueta pronta.

Pendências: política de nova emissão/correção e etiquetas por cada lote final de OP parcial. A preparação atual é por item/OP para os dois tamanhos; não introduz gestão avançada de impressão/PDF arquivado/arquivo .nlbl.

## RN-QUA-005 — Laudo oculto no formulário

Ocultar referência do laudo no formulário de inspeção; manter propriedade do domínio e dados históricos. Não remover coluna/tabela do banco futuro. Resultado e observações/motivo de reprovação continuam visíveis. Ajuste de apresentação, sem integração nova.

## Aceite e evidências

- Gerar em 13/10/2026, abrir em 20/11/2026 e restaurar JSON: lote 13102026 e validade OUT/2027 para 12 meses, sem nova auditoria.
- Pedido/OP/dois modelos reutilizam datas; rascunho do mesmo produto mantém geração ao salvar novamente.
- Dezembro +1 mês = JAN do próximo ano; validade explícita é formatada; texto desconhecido permanece A definir.
- Carteira/acesso/IDs inválidos são revalidados; não autorizar outro vendedor.
- Formulário com input oculto e histórico de laudo preservado.
- **68 testes aprovados**, incluindo `tests/labels.test.cjs`, sintaxe de quatro JS aprovada. Testes de renderização em VM; sem nova conferência visual integral no navegador ou impressão física.

## Flutter/API/banco e escopo

Etapa 1: metadados/data de geração/origem e validade calculada distinta do prazo textual. Etapa 2: preparação persistida/idempotente e autorizada, reuso do snapshot. Etapa 3: dois modelos com datas preservadas e laudo não visível, sem apagar campo.

Flutter continua esperando o OK do plano. Registrar este esclarecimento em NEG-001/003 porque etiquetas não são explícitas na base original; não presumir cobrança extra. A correção acompanha o recorte básico discutido no chat e não acrescenta motor de impressão.
