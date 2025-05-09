const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
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

const client = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());

const users = [
  { name: "Igor Miskic", email: "igor.miskic@gmail.com" },
  { name: "Pera Peric", email: "pera.peric@gmail.com" },
  { name: "Mika Mikic", email: "mika.mikic@gmail.com" },
  { name: "Pera Petrovic", email: "pera.petrovic@gmail.com" },
  { name: "Marko Markovic", email: "marko.markovic@gmail.com" },
];

function createUser(user) {
  return new Promise((resolve, reject) => {
    client.createUser(user, (err, response) => {
      if (err) return reject(err);
      console.log("Created User:", response.user);
      resolve(response.user);
    });
  });
}

function getUsers() {
  return new Promise((resolve, reject) => {
    client.getUsers({}, (err, response) => {
      if (err) return reject(err);
      console.log("User List:", response.users);
      resolve(response.users);
    });
  });
}

function getUsersByName(name) {
  return new Promise((resolve, reject) => {
    client.getUsersByName({name}, (err, response) => {
      if (err) return reject(err);
      console.log("Users with the name " + name + ":", response.users);
      resolve(response.users);
    });
  });
}

function deleteUser(email) {
  return new Promise((resolve, reject) => {
    client.deleteUser({ email }, (err, response) => {
      if (err) return reject(err);
      console.log(`Delete Successful (email=${email})`);
      resolve(response.success);
    });
  });
}

async function run() {
  try {
    const createdUsers = [];
    for (const user of users) {
      try {
        const created = await createUser(user);
        createdUsers.push(created);
      } catch (err) {
        console.error("Error creating user:", err.message);
      }
    }

    const allUsers = await getUsers();

    if (allUsers.length > 0) {
      await deleteUser("igor.miskic@gmail.com");
    }

    await getUsers();

    await getUsersByName("Pera");
  } catch (err) {
    console.error("Unhandled Error:", err);
  }
}

run();