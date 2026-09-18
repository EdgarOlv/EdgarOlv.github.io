# Modelo de precificação do protótipo

## Visão geral

Este módulo simplifica a regra de precificação usada no protótipo para produtos com fórmula e composição fixa. A ideia é partir do custo real da produção e depois acrescentar encargos operacionais e margem de lucro, mantendo a estrutura legível para uso diário por comercial, P&D e gestão.

A regra principal é:

- custo de matéria-prima = soma dos ingredientes por participação na fórmula
- materiais = matéria-prima + embalagem
- custo primário = materiais + financeiro + mão de obra/custo fixo + outros custos
- base com lucro = custo primário × (1 + lucratividade/100)
- preço de venda por kg = base com lucro / (1 − encargos sobre venda/100)

Em termos práticos, se o custo primário é 100 e a margem é 60%, o cálculo é:

$$
	ext{preço} = \frac{100 \times (1 + 0{,}60)}{1 - 0{,}205} = \frac{160}{0{,}795} = 201{,}26
$$

Com isso, a planilha de referência continua sendo a base da lógica, mas a implementação deixa o modelo simples e configurável.

## Estrutura recomendada por produto

Cada produto pode guardar:

- nome
- fórmula ativa
- custo dos ingredientes por porcentagem de composição
- embalagem ou custos indiretos fixos
- taxa de margem desejada
- listagem de encargos fixos (nota fiscal, comissão técnica, comissão comercial, etc.)

No protótipo, os parâmetros compartilhados ficam em `configuracoes.precificacao`. O produto guarda apenas a lucratividade escolhida, a embalagem específica e o histórico:

```js
precificacao: {
  margemPercentual: 60,
  historico: [],
  embalagemCentavosKg: 103.654,
}

configuracoes: {
  precificacao: {
    margemPadrao: 60,
    cenariosLucratividade: [10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80],
    financeiroCentavosKg: 125,
    maoDeObraCentavosKg: 75,
    outrosCustosCentavosKg: 0,
    encargosFixos: [
      { nome: 'Nota fiscal', percentual: 10.5 },
      { nome: 'Comissão técnica', percentual: 5 },
      { nome: 'Comissão comercial', percentual: 5 },
      { nome: 'Comissão extra cliente', percentual: 0 }
    ]
  }
}
```

## Como a regra funciona no sistema

1. O P&D seleciona o produto em uma tela única de fórmula e precificação.
2. O sistema lê a fórmula ativa do produto.
3. Calcula o custo base dos ingredientes por peso/percentual da fórmula.
4. Soma a embalagem ou custo do pacote.
5. Soma financeiro, mão de obra e outros custos fixos por kg.
6. Aplica a lucratividade como markup sobre o custo primário.
7. Aplica gross-up de nota fiscal e comissões sobre o preço de venda.
8. Gera o preço por kg e os preços das apresentações.

Fórmula e preço aparecem juntos no mesmo painel. Os percentuais fixos e a tabela de lucratividade são editados no modal **Parâmetros de precificação**, aberto pelo botão da tela de produtos e fórmulas. Cada produto escolhe um cenário de lucratividade e compõe o preço com a política global vigente.

## Versionamento da fórmula

Uma fórmula ativa não é editada diretamente quando já está vinculada a um produto. A ação **Editar fórmula / criar versão** abre uma cópia em desenvolvimento. Depois da revisão dos ingredientes e do rendimento, o P&D ativa a nova versão.

Ao ativar uma nova versão:

- pedidos e ordens de produção existentes preservam a fórmula antiga;
- o preço do produto fica pendente de nova liberação;
- novos pedidos passam a usar somente a fórmula ativa e o preço liberado correspondente.

Esse comportamento evita que uma alteração técnica retroativamente modifique pedidos já aprovados.

A lógica já compara com o comportamento solicitado: quando o pedido usa o produto "mix apresuntado RT-3650", o nome do produto e sua composição trazem o custo e a margem, e o sistema retorna um preço final pronto para venda.

## Conceito de custo primário, custo final e preço de venda

### Custo primário

É o custo direto do produto, composto pelos ingredientes e pela embalagem. Esta parte é a base da composição técnica.

### Custos adicionais

São custos internos adicionados antes do lucro:

- financeiro
- mão de obra/custo fixo
- outros custos fixos

### Lucratividade e gross-up

Os 60% da planilha são markup sobre o custo primário, não margem líquida sobre a venda. Depois do lucro, nota fiscal e comissões são aplicadas por gross-up:

```text
precoVendaKg = custoPrimario * (1 + lucratividade)
                / (1 - notaFiscal - comissoes)
```

O protótipo também apresenta cenários de 10% a 80% de lucratividade e permite escolher outro percentual na simulação.

## Catálogo e detalhe

A entrada de P&D é uma lista enxuta de produtos e fórmulas, com busca por nome ou código. O botão **Novo produto** fica no canto superior direito. Cada produto também oferece **Criar a partir**, que copia os dados e a fórmula para uma nova versão em desenvolvimento.

Ao abrir um produto, o detalhe reúne:

- formulação e participação de cada ingrediente;
- custo vigente da matéria-prima;
- embalagem e custos adicionais;
- parâmetros comerciais editáveis;
- preço calculado por kg e por apresentação;
- histórico de precificações aprovadas.

O preço calculado e o preço comercial aprovado são armazenados separadamente. Um ajuste manual exige motivo e não apaga o cálculo original.

## Como aplicar para produtos diferentes

A ideia do sistema é simples:

- cada produto tem sua própria fórmula
- cada produto pode ter uma `margemPercentual` específica
- cada produto pode ter uma lista própria de `encargosFixos`
- quando novo pedido for criado, o usuário escolhe o produto e o sistema usa essas regras para calcular o preço final automaticamente

Isso elimina a necessidade de recalcular manualmente em planilha para cada venda.

## Observações de uso

- O protótipo continua sendo uma simulação de negócios, não uma ferramenta de custo industrial oficial.
- A precificação demonstrada usa dados sintéticos e mantém foco em fluxo, decisão e aprovação.
- Em produção real, vale adicionar campos como imposto, frete, perdas, ajustes de lote e custo real por fornecedor.

## Vínculo com a planilha

A planilha anexada continua sendo a referência operativa para validar:

- quantidade a produzir
- custo primário
- percentuais fixos
- comissão técnica e comercial
- margem de lucro
- preço de venda final

A implementação foi desenhada para refletir esse fluxo sem exigir toda a complexidade da planilha diretamente na tela do usuário.
