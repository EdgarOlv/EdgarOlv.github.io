# Design QA — Etiquetas refeitas — 01/10/2026

**final result: passed**

## Evidência atual

- Referências: imagens oficiais `codex-clipboard-7dd9b3e4-d3ec-46bb-b49d-ac34d012336f.png` (740 × 738) e `codex-clipboard-72d9a4f4-a6af-4c0a-ab50-6b4710e6d351.png` (1228 × 696), recebidas em 30/09/2026.
- Captura renderizada: `assets/conferencia-etiquetas.png`, navegador integrado, viewport 1200 × 1400 CSS px; captura completa 1264 × 1489 px.
- Comparação conjunta: `assets/comparacao-etiquetas.png`, referências à esquerda e implementação à direita; cada etiqueta foi normalizada à mesma largura. Esse contato registra o passe anterior ao último alinhamento vertical do cabeçalho grande.
- Estado comparado: dados idênticos aos exemplos oficiais em página de conferência separada, sem alterar os cadastros da OP. Grande 25,0 KG, cliente Jussara; pequena 2,050 kg sem cliente.
- Integração verificada: login, OP-00001, emissão do documento e abertura das duas etiquetas preenchidas pelo snapshot real da demonstração.

## Comparação e ajustes

O primeiro modelo foi reconstruído em seis faixas, e o pequeno em cinco, preservando a proporção física corrigida de 105 × 58 mm. A grande mantém 105 × 105 mm. O logo e pictograma vêm da própria referência oficial, e a fonte condensada está incorporada.

Vista completa: divisórias, campos, proporções, centralização e hierarquia dos dois modelos acompanham as referências. Regiões focadas: cabeçalho, declaração de ingredientes com sal na primeira linha, pictograma, fabricante, lote/validade/peso e rodapés foram comparados conjuntamente.

Tipografia: Liberation Sans Narrow Bold incorporada, com ajuste óptico de peso; há pequenas diferenças de desenho em relação à fonte original não fornecida (P3). Espaçamento: faixas proporcionais e cabeçalho grande realinhado no passe final. Cores: branco/preto, logo vermelho e preto. Ativos: extraídos da imagem oficial, sem geração aproximada. Conteúdo: dados variáveis permanecem editáveis por cadastro/snapshot e os exemplos oficiais estão isolados na conferência.

Histórico: primeiro passe substituiu logo horizontal, fontes substituídas e proporções incorretas; segundo passe ajustou primeira linha dos ingredientes, separador de glúten e peso tipográfico; terceiro passe realinhou o cabeçalho e alergênicos da grande. A captura final confirma esses ajustes. Não há cortes nos dois modelos examinados.

Console sem erros ou avisos. Sintaxe validada e 39 testes de domínio passaram. Nome longo usa ajuste proporcional da fonte; dimensões corrigidas são migradas sem apagar o estado salvo. A impressão física não foi executada: permanece a conferência de escala 100% na mídia/impressora do cliente.

## Registro histórico — substituído pela revisão acima

Os resultados abaixo descrevem a implementação de 28/09/2026 e não representam o estado atual.

# Design QA — Fórmula para produção e etiquetas — 28/09/2026

**final result: blocked**

A implementação foi ajustada a partir das imagens fornecidas, mas a comparação final entre referência e renderização ficou bloqueada: o navegador de validação recusou abrir o protótipo local por política de URL. Sintaxe e testes de domínio foram validados; a fidelidade visual e as medidas físicas ainda precisam de conferência manual no navegador e na impressão.

## Escopo desta revisão

- Fórmula para produção com aparência de planilha, grade compacta, cabeçalho, totais, vistos e CSS de impressão.
- Etiqueta grande com hierarquia, divisórias e destaques variáveis próximos à foto.
- Modelo pequeno distinto e duas prévias na aba de etiquetas.
- Seleção no topo com padrão de 1 pequena e 2 grandes.

---

# Registro anterior — etiqueta grande

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
