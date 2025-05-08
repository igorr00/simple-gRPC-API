const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Pool } = require('pg');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const userProto = grpc.loadPackageDefinition(packageDefinition).users;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'simple-grpc',
  password: 'root',
  port: 5432,
});

async function initializeDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("Database is initialized.");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

async function createUser(call, callback) {
  const { name, email } = call.request;
  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return callback(null, { user: existing.rows[0] });
    }

    const insertQuery = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *';
    const result = await pool.query(insertQuery, [name, email]);
    const user = result.rows[0];
    callback(null, { user });
  } catch (err) {
    console.error("Error creating user:", err);
    callback({
      code: grpc.status.INTERNAL,
      message: err.message,
    });
  }
}

async function getUsers(call, callback) {
  try {
    const selectQuery = 'SELECT * FROM users order by id';
    const result = await pool.query(selectQuery);
    callback(null, { users: result.rows });
  } catch (err) {
    console.error("Error retrieving users:", err);
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

async function deleteUser(call, callback) {
  const { email } = call.request;
  try {
    const result = await pool.query('DELETE FROM users WHERE email = $1', [email]);
    const success = result.rowCount > 0;
    callback(null, { success });
  } catch (err) {
    console.error("Error deleting user:", err);
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

async function main() {
  await initializeDb();

  const server = new grpc.Server();
  server.addService(userProto.UserService.service, { createUser, getUsers, deleteUser });

  const bindAddress = '0.0.0.0:50051';
  server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Server binding error:", err);
      return;
    }
    console.log(`gRPC server running on ${bindAddress}`);
    server.start();
  });
}

main();
