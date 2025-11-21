# Projeto de Redes — Segundo Bimestre

Repositório do projeto de redes (segundo bimestre).

## Conteúdo
- `server.js` — servidor principal
- `public/` — arquivos públicos (ex: `failover.js`)
- `init_db.sql` — script de inicialização do banco
- `package.json` — dependências e scripts

## Como rodar (local)
1. Instale dependências:

```powershell
npm install
```

2. Rode o servidor:

```powershell
node server.js
```

3. Abra o navegador em http://localhost:3000 (ou na porta configurada no `server.js`).

## Notas
- `node_modules/` está incluído no `.gitignore`.
- Ajuste a configuração (porta, variáveis de ambiente) conforme necessário.

---
Feito automaticamente por script de ajuda — atualize este arquivo com descrição e instruções detalhadas do projeto.