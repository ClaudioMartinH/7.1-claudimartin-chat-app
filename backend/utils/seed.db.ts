import mongoose from "mongoose";
import UserModelMongoose from "../src/models/user.model.js";
import MessageModelMongoose from "../src/models/message.model.js";
import RoomModelMongoose from "../src/models/room.model.js";

const seed = async () => {
  // Conexión a la base de datos
  await mongoose.connect(
    "mongodb+srv://klaudito46:GQVmoS8tTxRX9RBk@xat-app-itacademy.bzyox.mongodb.net/?retryWrites=true&w=majority&appName=xat-app-itacademy"
  );

  // Limpiar las colecciones
  await UserModelMongoose.deleteMany({});
  await MessageModelMongoose.deleteMany({});
  await RoomModelMongoose.deleteMany({});

  // Crear usuarios
  const users = await UserModelMongoose.insertMany([
    {
      isActive: true,
      rooms: [],
      userName: "user-1",
      password: "password1",
      fullName: "User One",
      email: "user1@example.com",
      profilePic: "https://robohash.org/user1",
    },
    {
      isActive: true,
      rooms: [],
      userName: "user-2",
      password: "password2",
      fullName: "User Two",
      email: "user2@example.com",
      profilePic: "https://robohash.org/user2",
    },
  ]);

  // Crear salas de chat (rooms)
  const rooms = await RoomModelMongoose.insertMany([
    {
      id: "room1",
      participants: [users[0]._id, users[1]._id],
      messages: [],
    },
  ]);

  // Crear mensajes
  await MessageModelMongoose.insertMany([
    {
      content: "Hello, User Two!",
      senderId: users[0]._id,
      roomId: rooms[0]._id,
    },
    {
      content: "Hi, User One!",
      senderId: users[1]._id,
      roomId: rooms[0]._id,
    },
  ]);

  console.log("Datos de prueba insertados correctamente.");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Error durante la carga de datos:", err);
  mongoose.disconnect();
});
