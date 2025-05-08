# simple-gRPC-API

This project is a simple **gRPC API built with Node.js** and backed by a **PostgreSQL** database. It provides functionality to create new users and retrieve all users.

##  Technologies Used

- **Node.js** – Server runtime
- **gRPC** – Remote procedure calls (communication layer)
- **Protocol Buffers** – Interface definition language for gRPC
- **PostgreSQL** – Relational database for storing users
- **pg** – PostgreSQL client for Node.js
- **@grpc/grpc-js** – Node.js gRPC implementation
- **@grpc/proto-loader** – Loads `.proto` definitions

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/igorr00/simple-gRPC-API.git
cd simple-gRPC-API
```
### 2. Install Dependencies

```bash
npm install
```
### 3. Set Up PostgreSQL
Make sure you have PostgreSQL running and create a database (e.g., users_db). Then set your credentials in the server.js file:
```js
const pool = new Pool({
  user: 'your_postgres_username',
  host: 'localhost',
  database: 'users_db',
  password: 'your_postgres_password',
  port: 5432,
});
```
The server will automatically create the **users** table if it doesn't exist.

## Running the Server
```bash
node server.js
```
Server listens on 0.0.0.0:50051 by default.

## Running the Client
```bash
node client.js
```
The client will:
  1. Create new users while checking if a user with the same email already exists
  2. Delete one user
  3. Fetch and display all users
