# Contrato funcional — Ficha Técnica

**Status:** demonstrado; conteúdo oficial pendente de homologação da Qualidade.

## Objetivo e acesso

A Qualidade emite documento padronizado para o cliente. Ele pode ser aberto em `Qualidade > Lotes produzidos`, ao lado de Rastreabilidade, ou nos detalhes do pedido, próximo de Pedido complementar. Quando aberto pelo lote, o sistema resolve automaticamente OP, pedido e cliente.

## Conteúdo demonstrado

- identificador e data/hora de emissão;
- pedido, cliente, CNPJ, endereço, condição e entrega;
- lote e situação, quando aplicável;
- todos os itens, códigos, unidades, embalagens, pesos e volumes de transporte (tipo, quantidade e limite por volume);
- tabela nutricional de cada produto, atualmente por 100 g;
- marcação explícita de dados demonstrativos.

## Regras

- somente Qualidade e Administrador geram na demo;
- a ficha inclui todos os itens do pedido;
- produto sem nutrição mostra `Não informado`;
- os nutrientes atuais são sintéticos e não podem ser usados oficialmente;
- a saída atual é `Imprimir/Salvar como PDF`, sem assinatura, armazenamento ou envio.

## Critérios de aceite do sistema futuro

1. Pedido e lote geram o mesmo snapshot.
2. A API valida `ficha_tecnica.emitir`.
3. A versão nutricional usada fica preservada por item.
4. Reemissão mantém o original e registra motivo/auditoria.
5. PDF possui número, paginação e metadados estáveis.
6. Falta de tabela aprovada bloqueia documento oficial ou gera rascunho inequívoco, conforme decisão futura.
7. Testes cobrem múltiplos itens, acesso por lote, ausência de nutrição, permissão negada e reemissão.

## Modelo futuro sugerido

- `ProdutoNutricao`: produto, versão, status, porção, nutrientes, alergênicos, ingredientes, conservação, responsável e vigência.
- `FichaTecnica`: número, pedido, cliente-snapshot, emissor, emissão, status e versão do layout.
- `FichaTecnicaItem`: item-snapshot, lotes e versão nutricional imutável.
- `DocumentoArquivo`: hash, formato, localização, tamanho e geração.
- auditoria de emissão, reemissão, cancelamento e envio.

Ainda confirmar com a empresa: medida caseira, alergênicos, lista de ingredientes, conservação, validade, assinatura, responsável técnico, número/revisão e forma de envio.

