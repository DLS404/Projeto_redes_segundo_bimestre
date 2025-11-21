📌 Projeto: Sistema Web com Failover usando Node.js, PostgreSQL e DNS Local

Este projeto implementa um sistema web com 3 servidores independentes, balanceados via failover automático no frontend.
Se um servidor cair, o navegador detecta a falha e redireciona automaticamente para o próximo servidor disponível — sem perder a sessão.

O objetivo é demonstrar conceitos de:

Redundância

Tolerância a falhas

DNS local

Sessões persistentes em banco de dados

Failover no frontend utilizando Healthcheck

🚀 Tecnologias Utilizadas
Componente	Tecnologia
Backend	Node.js + Express
Banco de Dados	PostgreSQL
Autenticação	Cookies + Sessions armazenadas no PostgreSQL
DNS Local	Arquivo hosts do Windows
Failover	JavaScript no cliente (failover.js)
Gerenciamento de Senhas	Função nativa crypt() do PostgreSQL com salt
Infraestrutura	3 instâncias independentes do mesmo servidor
📁 Estrutura do Projeto
📦 projeto
 ┣ 📂 public
 ┃ ┣ 📜 failover.js
 ┃ ┗ 📜 styles.css (opcional)
 ┣ 📜 server.js
 ┣ 📜 init_db.sql
 ┣ 📜 package.json
 ┗ 📜 README.md

🗄️ Banco de Dados

O arquivo init_db.sql cria:

✔ Tabela de usuários

Com usuários de exemplo: alice e bob

✔ Tabela de sessões

Armazena o ID da sessão, o usuário e a data/hora do login.

Para criar o banco:

CREATE DATABASE trabalho;
\c trabalho

\i init_db.sql

🌐 Configuração do DNS Local (Windows)

Edite o arquivo:

C:\Windows\System32\drivers\etc\hosts


Adicione:

127.0.0.1 server1.meutrabalho.com.br
127.0.0.1 server2.meutrabalho.com.br
127.0.0.1 server3.meutrabalho.com.br


Limpe o cache DNS:

ipconfig /flushdns


E no Chrome:

chrome://net-internals/#dns
→ Clear host cache

🖥️ Rodando os 3 Servidores
Pré-requisitos

Node.js 18+

PostgreSQL 14+

NPM instalado

Instale as dependências:

npm install

▶️ Iniciar cada servidor (VSCode Terminals)
Servidor 1
$env:PORT="3001"; node server.js

Servidor 2
$env:PORT="3002"; node server.js

Servidor 3
$env:PORT="3003"; node server.js


Todos devem exibir:

Servidor rodando na porta XXXX

🌍 Acessar o Sistema

Sempre use:

http://server1.meutrabalho.com.br:3001


Usuários disponíveis:

Usuário	Senha
alice	123
bob	123
🔁 Failover Automático

O frontend monitora o servidor através de:

/health


O arquivo public/failover.js executa:

Detecta se o servidor caiu

Testa os outros servidores

Redireciona automaticamente para o próximo online

Mantém a sessão ativa (persistida no banco de dados)

Não exige novo login

Exemplo:

Você acessa server1

O servidor 3001 cai

O navegador automaticamente redireciona para:

server2.meutrabalho.com.br:3002


E depois para o server3, se necessário.

🧪 Healthcheck

Todos os servidores expõem:

GET /health


Retornando:

{
  "ok": true,
  "host": "NOME_DO_SERVIDOR"
}

🔒 Sessão Persistente

A sessão é armazenada no PostgreSQL:

O usuário faz login

O servidor gera um session_id

O ID é salvo no banco

Um cookie sid é enviado

Durante o failover, o novo servidor valida o mesmo cookie

➡ O usuário permanece logado mesmo trocando de servidor.

📑 Funcionalidades Implementadas

✔ Login com autenticação real
✔ Sessão persistente em banco
✔ 3 servidores independentes
✔ DNS local com hosts do Windows
✔ Failover automático via JavaScript
✔ Healthcheck periódico
✔ Perfil com nome, data do login, sessão e hostname
✔ Logout
✔ Detecção de falha de conexão
✔ Redirecionamento inteligente

🛠️ Comandos Utilizados

Criar DB:

createdb trabalho


Rodar PostgreSQL:

psql -U postgres -d trabalho


Rodar servidor:

node server.js

🙌 Contribuições

Sinta-se livre para abrir issues ou PRs.

📜 Licença

Este projeto pode usar a licença MIT ou outra de sua preferência.
