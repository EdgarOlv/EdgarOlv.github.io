# Apresentação integrada com um único pedido

Entrega v23 em 22/10/2026. Origem: Edgar pediu dados de pedidos, fornecedores e demais módulos para a empresa visualizar o sistema sem poluição, com um fluxo conectado. RN-DEMO-002: solicitação confirmada; cenário sintético e estágio inicial demonstrados, sem criar regra operacional nova.

## Cenário entregue

- 1 cliente AlimNorte, 2 fornecedores (insumos e embalagens), 1 produto Condimento demonstração 5 kg, 1 fórmula, 4 ingredientes e 1 embalagem.
- Recebimentos via casos de uso: quatro lotes de ingredientes somando 200 kg e um lote de 40 baldes, com preço bruto e ICMS18% creditado. Fornecedores têm CNPJ matematicamente válido e endereço estruturado; nomes, endereços, documentos, preços e fórmulas são exemplos, não representam operações reais.
- Pedido de 100 kg a R$11/kg = R$1.100; 20 baldes de 5 kg, 2 caixas de 10 baldes. Preço comercial manual com motivo registrado na liberação; não afirmar que R$11 decorre automaticamente do custo calculado.
- Uma OP gerada pelas transições reais do domínio, documento emitido, duas batidas planejadas de 50 kg, um apontamento de 100 kg, lote inspecionado e liberado. Consumo de 100 kg de ingredientes e 20 embalagens: saldo 100 kg e 20 baldes. Lote acabado tem saldo zero após despacho.
- Uma ficha técnica de produto aprovada como demonstração, sem percentuais públicos e sem nutrientes oficiais; documento legado por pedido permanece separado conforme v21.
- Faturamento gera duas parcelas de R$550; primeira paga e segunda aberta. Frete R$120 por conta do destinatário, sem somar ao valor do pedido. Despachado com entrega pendente; pode demonstrar confirmar entrega e baixar segunda parcela sem criar outros pedidos.
- Auditoria, movimentos, consumo, OP, lote, pedido e cliente compartilham IDs de vínculos reais gerados pelo domínio. Datas relativas ao dia da criação da base para evitar lotes vencidos ao iniciar nova demonstração.

## Apresentação e preservação

A opção Dados de demonstração passa a usar meetingSeed(), base separada na chave local realtech.prototype.meeting-single-flow-v23. A chave anterior realtech.prototype.meeting-2026-10-05 permanece intacta no navegador: nenhum dado antigo é migrado, apagado ou misturado silenciosamente. Reabrir mantém os dados salvos da nova base. Reiniciar demonstração exige a confirmação já existente e repõe somente a nova base. Modo sem histórico/empty continua independente e não foi limpo.

A antiga demoSeed() com oito cenários permanece no código para testes de regressão; não é a apresentação padrão. Guia mostra percurso único e números do pedido. Novos registros feitos manualmente continuam permitidos; a ausência de outros pedidos no seed não restringe o sistema. Grupos/categorias/usuários/modelos de etiqueta continuam como cadastros de referência necessários, sem criar movimentações fictícias adicionais.

## Critérios e validação

- Uma única cadeia pedido→OP→lote→despacho e duas parcelas cuja soma coincide com total.
- Soma dos consumos mais saldo igual às entradas, ingredientes e embalagem; sem saldo negativo ou lote órfão.
- Produto/embalagem/peso/volumes/validade/fornecedores coerentes. Cada fornecedor pode ser reaberto com CNPJ válido.
- Recarregar preserva base atual; inicialização em chave separada preserva a antiga; reset não afeta modo vazio.
- 100 testes Node aprovados, zero falhas. Tests/meeting-seed.test.cjs cobre tamanho, dinheiro, relações, qualidade, ficha, financeiro, despacho e conservação de saldo. Log Docs/MIGRACAO_FLUTTER_2026-10-13/evidencias/prototipo-v23-testes.txt. Sintaxe dos cinco JS verificada. QA visual no navegador continua pendente; não afirmar homologação empresarial.

## Impacto Flutter API banco

Somente dados demonstrativos e roteiro nesta entrega. Documentar futura factory de fixtures separada dos repositórios reais, criada pelos casos de uso e isolada por ambiente; nenhum seed deve entrar em banco de produção. Etapa1: fixtures isoladas e IDs relacionais; etapa2: reproduzir transições existentes e asserções de conservação/valores; etapa3: guia curto e poucos registros. Não adicionar tabelas, cálculos ou estado operacional por causa desta apresentação. E1/E2/E3 e Dart/SQL/backend não executados.

Próximo cenário: entrar com Dados de demonstração habilitado e Administrador; percorrer Fornecedores, P&D, Estoque, Pedido, OP, Qualidade, Financeiro, Expedição e Auditoria seguindo o Guia. Escolha do estágio despachado é demonstrada, podendo ser ajustada após apresentação; não há pendência de negócio nova.
