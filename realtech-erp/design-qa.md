# Design QA — etiqueta grande

- Source visual truth: `C:\Users\edgar\AppData\Local\Temp\codex-clipboard-a6b80512-c6e8-4e03-a22e-ab1f036cc70b.png`
- Implementation: `http://127.0.0.1:4173/Sistema/Prototipo/index.html`, pedido `PED-01001`, primeiro item, ação `Abrir etiqueta`
- Browser-rendered evidence: captura visual realizada no Codex In-app Browser durante esta revisão; o navegador não forneceu um caminho persistente para o arquivo da captura.
- Viewport used for the full label check: 1100 × 1000 CSS px; device scale factor 1.
- Source pixels: 850 × 733. Implementation label: 700 × 625 CSS px. A comparação considerou proporção normalizada, sem o fundo da fotografia e sem o contorno físico do pacote.
- State: prévia da etiqueta aberta a partir de um pedido, antes da produção, com lote e datas como `A definir`.

## Full-view comparison evidence

A composição preserva a hierarquia da referência: marca e produto no topo, linha regulatória, ingredientes e alergênicos, modo de uso e conservação, cliente em destaque, fabricante e lote em duas colunas e slogan no rodapé. A implementação usa o logotipo real disponível no projeto e conteúdo derivado do pedido, em vez de rasterizar a foto.

## Focused region comparison evidence

- Cabeçalho: logotipo carregado com largura natural de 1141 px, produto centralizado e texto secundário em caixa alta.
- Corpo: divisórias, centralização e pesos tipográficos reproduzem a leitura da etiqueta fotografada.
- Dados variáveis: cliente e peso foram preenchidos pelo pedido; lote, fabricação e validade ficaram explicitamente pendentes.
- Rodapé: bloco da fabricante, bloco de lote e slogan mantêm a mesma organização da referência.

## Findings

Não restaram diferenças P0, P1 ou P2 no escopo demonstrativo. A foto contém um pictograma triangular de alergênicos que não foi reproduzido nesta etapa; ele permanece como P3 até a empresa fornecer ou aprovar o ativo oficial. O conteúdo do pedido de demonstração naturalmente difere do produto e cliente fotografados.

## Interaction and console checks

- Login como Administrador.
- Abertura do pedido `PED-01001`.
- Abertura da etiqueta diretamente no primeiro item do pedido.
- Abertura do editor do modelo grande no módulo Etiquetas e conferência dos campos editáveis.
- Logotipo carregado com sucesso; nenhum erro ou aviso registrado no console.
- A ação de impressão foi mantida, mas o diálogo nativo não foi confirmado para evitar iniciar uma impressão durante a QA.

## Comparison history

1. Primeira captura: o caminho do logotipo estava incorreto e o ativo não carregou (P2).
2. Correção: caminho ajustado para o ativo real em `Imagens/logo-horizontal.png`.
3. Pós-correção: imagem carregada (`naturalWidth: 1141`) e nova comparação visual sem P0/P1/P2.

## Follow-up polish

- P3: inserir o pictograma oficial de alergênicos quando o arquivo for fornecido ou homologado.
- P3: calibrar família tipográfica, margens e escala após conhecer a impressora e a mídia reais.

final result: passed
