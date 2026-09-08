# Protótipo interativo REALTECH

Preserva o estilo visual original e conecta os módulos com estado local. **Somente demonstração com dados sintéticos.** Não publicar documentos de negócio, banco, Flutter ou credenciais reais junto aos arquivos estáticos.

## Abrir localmente

Na pasta `Sistema/Prototipo`, execute:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8765`. Também é possível abrir `index.html`, mas a persistência em `file://` depende do navegador. Use servidor local para testar persistência de forma previsível.

## Perfis

Os três atalhos do login preenchem usuário e senha, mas o usuário ainda confirma “Entrar”.

No login, a flag **Dados de demonstração** escolhe entre dois ambientes locais independentes:

- ligada: abre os cenários, cadastros e movimentações sintéticos;
- desligada: abre todas as telas sem pedidos ou movimentações históricas, mantendo cadastros-base sintéticos para criar e percorrer um novo fluxo.

Alternar a flag não apaga nem mistura os registros do outro modo. A escolha fica lembrada no navegador.

| Perfil             | Usuário    | Senha pública de demonstração |
| ------------------ | ---------- | ----------------------------- |
| Administrador      | admin      | admin123                      |
| Comercial          | vendedor   | vend123                       |
| Financeiro         | financeiro | fin123                        |
| Produção           | producao   | prod123                       |
| Qualidade          | qualidade  | qual123                       |
| Fiscal / Expedição | fiscal     | fisc123                       |
| P&D                | quimica    | pd123                         |
| Estoque            | estoque    | esto123                       |
| Diretor            | diretor    | dir123                        |

Essas credenciais não protegem o protótipo. Todos os dados podem ser inspecionados no navegador. Não reutilize as senhas no sistema oficial.

## Percurso de demonstração

Use o **Guia de demonstração** dentro do app. Há três pedidos iniciais: dois na análise financeira (um com cliente em restrição) e um com OP aguardando. Para um teste novo:

1. Comercial cria pedido AlimNorte com 20 UN de Tempero 5 kg e 5 UN de Realçador 20 kg. Total R$ 2.300; massa 200 kg. A criação não antecipa comissão.
2. Envia ao Financeiro; nesse momento a edição já fica bloqueada. Troca perfil e registra análise.
3. Comercial aprova; edição fica bloqueada.
4. Administrador ou Produção gera duas OPs, gera/consulta os Documentos da OP, define quantidades preliminares de etiquetas, inicia e aponta cada produção.
5. Qualidade aprova todos os lotes finais.
6. Administrador ou Fiscal registra faturamento interno, frete e despacho.
7. Confere movimentos, rastreabilidade, histórico financeiro do cliente, comissão final por recebimentos e auditoria.

Produção parcial cria um lote por apontamento. Lotes reprovados bloqueiam o pedido. Não há faturamento parcial ou retrabalho implementado.

## Verificação automatizada

Sem instalação de dependências:

```powershell
node --test tests/domain.test.cjs
node --check domain.js
node --check script.js
node --check views.js
node --check interactions.js
```

Os testes cobrem regras do domínio. Não equivalem aos 16 critérios integrais de homologação dos documentos. Veja `VALIDACAO.md` para a cobertura real e `REFERENCIA_FLUTTER.md` para a tradução.

## Preparação para publicar — ainda não executada

Hospedar apenas estes sete arquivos estáticos, mantendo-os na mesma pasta:

- `index.html`
- `styles.css`
- `flows.css`
- `domain.js`
- `script.js`
- `views.js`
- `interactions.js`

Não é necessário build. Rotas usam hash e não exigem regra de rewrite. Não existem chamadas externas. Definir hospedagem/URL e proteção de acesso com o usuário antes da publicação. Se o público precisar compartilhar pedidos entre computadores, este pacote estático não atende: é preciso ambiente de homologação com backend.

Cada navegador recebe uma cópia independente. “Trocar perfil” preserva os dados; “Reiniciar demonstração”, disponível no guia para Administrador, repõe os três cenários iniciais após confirmação. Limpar dados do navegador ou trocar de origem também separa/remove o armazenamento.

