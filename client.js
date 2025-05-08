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

client.createUser({ name: "Igor Miskic", email: "igor.miskic@gmail.com" }, (err, response) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("Created User:", response.user);

  client.getUsers({}, (err, response) => {
    if (err) {
      console.error("Error:", err);
      return;
    }
    console.log("User List:", response.users);
  });
});
