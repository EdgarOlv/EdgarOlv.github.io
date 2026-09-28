# Como registrar mudanças da empresa

Após cada apresentação:

1. crie ou atualize um registro em `decisoes/`, usando o nome `AAAA-MM-DD-tema-curto.md`;
2. registre data, participantes e pedido na linguagem da empresa;
3. classifique como confirmado, demonstrado ou pendente;
4. crie/atualize um ID em `REGRAS_DE_NEGOCIO.md`;
5. descreva cenário, bloqueios, exceções, dados e permissões;
6. ajuste protótipo e teste aplicável;
7. atualize impacto em Flutter/API/banco;
8. registre a entrega no histórico global;
9. inclua o registro nos índices cronológico e por área de [`decisoes/README.md`](decisoes/README.md).

```md
### RN-AREA-000 — Nome curto
- Data e participantes:
- Pedido da empresa:
- Status: confirmado | demonstrado | pendente
- Regra, exceções e bloqueios:
- Dados obrigatórios:
- Perfis/permissões:
- Efeitos em outros módulos:
- Auditoria:
- Critérios de aceite:
- Evidência no protótipo/teste:
- Impacto no Flutter/API/banco:
- Pendências e responsável pela resposta:
```

Um botão aprovado valida a conversa, mas não valida sozinho segurança, cálculo, integração ou conformidade. Antes de portar, fechar responsável, dados, estados, exceções, efeitos, auditoria e critérios de aceite.
