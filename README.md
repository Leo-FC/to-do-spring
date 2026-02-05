

<div align="center">
  <h1>Align To-Do</h1>
  <img src="https://i.imgur.com/OpZnh8X.png" alt="Logo Align To-Do" width="120">  <br>
  <br>
  
  ![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
  ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.2-green?style=for-the-badge&logo=spring-boot)
  ![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker)
  ![MySQL](https://img.shields.io/badge/MySQL-8-005C84?style=for-the-badge&logo=mysql)
  ![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?style=for-the-badge&logo=bootstrap)
</div>

<br>

<p align="center">
  <strong>Gerenciamento de tarefas simples e eficiente.</strong><br>
  Classifique por urgência, acompanhe o status em tempo real com Kanban e mantenha o seu fluxo de trabalho alinhado.
</p>

---

## 📸 Telas do Projeto

### 🖥️ Dashboard & Kanban
<img width="1525" height="796" alt="Image" src="https://github.com/user-attachments/assets/64e46998-bcb8-44e2-a8cc-0be93aea56b6" />
<img width="1582" height="798" alt="image" src="https://github.com/user-attachments/assets/e1c6f15f-062e-4590-8495-7f8c43a0581e" />
<img width="1643" height="825" alt="image" src="https://github.com/user-attachments/assets/c79c3bbf-f168-487b-a995-89a7bf69cf43" />



### 🔐 Login & Cadastro
<img width="1692" height="848" alt="image" src="https://github.com/user-attachments/assets/32291d0d-cc6c-41cd-9771-0fe8904cbdc2" />
<img width="1649" height="767" alt="image" src="https://github.com/user-attachments/assets/a461806b-e5d5-4ce6-af20-3028d82ecb21" />


---

## ✨ Funcionalidades

- **Autenticação Segura:** Login e Registro com **JWT (JSON Web Tokens)** e criptografia de senhas (BCrypt).
- **Quadro Kanban Interativo:** Arraste e solte (*drag-and-drop*) tarefas entre colunas para atualizar status.
- **Gestão de Tarefas Completa:**
  - Criação, edição e exclusão.
  - Definição de **Prioridades** (Baixa, Média, Alta, Urgente).
  - Prazos de entrega (Deadlines).
- **Projetos:** Organize suas tarefas vinculando-as a projetos específicos.
- **Painel Administrativo:** Usuários com perfil `ADMIN` podem visualizar e gerenciar tarefas de todos os usuários.
- **Interface Responsiva:** Desenvolvida com Bootstrap 5 para funcionar bem em desktop e mobile.

---

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **Java 17**
- **Spring Boot 3.2.2** (Web, Security, Data JPA, Validation)
- **MySQL** (Banco de dados de Produção)
- **H2 Database** (Banco em memória para testes)
- **Hibernate** (ORM)
- **Lombok**
- **Docker** & **Docker Compose**

### Frontend (Client)
- **HTML5 & CSS3**
- **JavaScript (Vanilla JS)**
- **Bootstrap 5**
- **Fetch API** (Integração com Backend)

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados.
- **Ou** Java 17 e Maven (para rodar localmente sem Docker).

### 🐳 Opção 1: Via Docker (Recomendada)

A forma mais rápida de subir a aplicação completa (API + Banco de Dados).

1. Clone o repositório:
   ```bash
   git clone https://github.com/Leo-FC/align-todo.git
   cd align-todo
   ```

2. Crie um arquivo `.env` na raiz do projeto com as configurações do banco (ou ajuste o `docker-compose.yml`):
   ```env
   MYSQLDB_ROOT_PASSWORD=admin
   MYSQLDB_DATABASE=aligntodo
   MYSQLDB_LOCAL_PORT=3307
   MYSQLDB_DOCKER_PORT=3306
   SPRING_LOCAL_PORT=8080
   SPRING_DOCKER_PORT=8080
   MYSQLDB_USER=root
   JWT_SECRET=sua_chave_secreta_aqui
   ```

3. Suba os containers:
   ```bash
   docker-compose up --build
   ```

4. Acesse:
   - **Frontend:** Abra o arquivo `view/index.html` no navegador (ou use o Live Server).
   - **API:** `http://localhost:8080`

### 💻 Opção 2: Rodar Manualmente (Local)

1. Configure o banco de dados no arquivo `src/main/resources/application-dev.properties`.
2. Execute o comando Maven para baixar dependências:
   ```bash
   ./mvnw clean install
   ```
3. Rode a aplicação:
   ```bash
   ./mvnw spring-boot:run
   ```

---

## 🔌 Endpoints Principais (API)
⚠️ Atenção: A maioria dos endpoints é protegida. Caso queira testar as rotas através do Postman/Insomnia, você deve primeiro realizar o login para obter o token JWT. Inclua o token no Header das requisições protegidas: Authorization: Bearer <SEU_TOKEN_AQUI>

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/login` | 🔓 Autenticação de usuário |
| `POST` | `/user` | 🔓 Cadastro de novo usuário |
| `GET` | `/task/user` |🔒 Listar tarefas do usuário logado |
| `POST` | `/task` | 🔒 Criar nova tarefa |
| `PUT` | `/task/{id}` | 🔒 Atualizar tarefa (Status/Prioridade) |
| `GET` | `/project/user` | 🔒 Listar projetos do usuário |

🔒 = Requer Token JWT no Header 🔓 = Acesso Público
