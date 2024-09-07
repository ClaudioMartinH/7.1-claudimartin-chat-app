import { Server } from "socket.io";
import MessageModelMongoose from "../src/models/message.model.js";
import RoomModelMongoose from "../src/models/room.model.js";
import mongoose from "mongoose";
import { UserRepositoryImpl } from "../src/infraestructure/repositories/UserRepositoryImpl.js";

// Función de throttle para limitar la frecuencia de actualizaciones
function throttle(fn: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

export function socketHandler(io: Server) {
  const connectedUsers: {
    [key: string]: {
      userName: string;
      socketId: string;
      userType: "registered" | "guest" | "google";
      profilePic: string;
    };
  } = {};
  const userRooms: {
    [key: string]: string[];
  } = {};
  const rooms: {
    [key: string]: { userId: string; userName: string }[];
  } = {};
  const userRepo = new UserRepositoryImpl();

  const updateAccessibleRoomsForAllUsers = async () => {
    try {
      const roomsInDB = await RoomModelMongoose.find({});
      const roomNames = roomsInDB.map((room) => room.roomName);

      for (const userId of Object.keys(connectedUsers)) {
        const user = connectedUsers[userId];
        const accessibleRooms = roomsInDB
          .filter((room) => {
            if (room.isPrivate) {
              if (user.userType === "registered") {
                const foundUser = room.participants.find(
                  (p) => p.userName === user.userName
                );
                return foundUser ? true : false;
              }
              return false;
            }
            return true;
          })
          .map((room) => room.roomName);
        userRooms[userId] = accessibleRooms;
        io.to(user.socketId).emit("rooms-available", accessibleRooms);
      }
    } catch (error) {
      console.error(
        "Error recuperando los nombres de las salas de la BD",
        error
      );
    }
  };

  const updateConnectedUsers = async () => {
    try {
      const users = Object.values(connectedUsers);
      io.emit("active users", users);
    } catch (error) {
      console.error(
        "Error actualizando la lista de usuarios conectados",
        error
      );
    }
  };

  const throttledUpdateConnectedUsers = throttle(updateConnectedUsers, 5000);
  const throttledUpdateAccessibleRoomsForAllUsers = throttle(
    updateAccessibleRoomsForAllUsers,
    5000
  );

  io.on("connection", (socket) => {
    socket.on(
      "user connected",
      async ({ userId, userName, userType, profilePic }) => {
        console.log(
          `User connected in socketHandler: ${userId}, ${userName}, ${userType}, ${profilePic}`
        );
        userName = userName || "Guest_" + socket.id;
        userType = userType || "guest";

        if (userType === "guest") {
          connectedUsers[userId] = {
            userName: userName,
            socketId: socket.id,
            userType: userType,
            profilePic: `https://anonymous-animals.azurewebsites.net/avatar/${userName}`,
          };
        } else {
          const user = await userRepo.findUserByName(userName);
          if (user) {
            connectedUsers[userId] = {
              userName: user.userName,
              socketId: socket.id,
              userType: user.userType || "registered",
              profilePic: `${user.profilePic}`,
            };
          } else {
            console.error(`User with ID ${userId} not found`);
          }
        }

        throttledUpdateConnectedUsers();
        await updateAccessibleRoomsForAllUsers();
        io.emit("active users", Object.values(connectedUsers));
        //console.log("connected users from backend", connectedUsers);
      }
    );

    socket.on("join room", async (data) => {
      const { roomId, roomName, userId, userName } = data;
      if (!userId || !userName) {
        console.error("Error: userId o userName es undefined");
        return;
      }

      const roomIdentifier = roomId || roomName;
      if (!roomIdentifier) {
        console.error("Error: roomIdentifier es undefined o null");
        return;
      }

      const roomIdentifierCleaned = roomIdentifier.trim();
      if (roomIdentifierCleaned) {
        socket.join(roomIdentifierCleaned);
        if (!rooms[roomIdentifierCleaned]) {
          rooms[roomIdentifierCleaned] = [];
        }
        const roomUsers = rooms[roomIdentifierCleaned];
        roomUsers.push({ userId, userName });

        console.log(`${userName} joined room ${roomIdentifierCleaned}`);

        try {
          const messagesDB = await MessageModelMongoose.find({
            roomName: roomIdentifierCleaned,
          });

          io.to(roomIdentifierCleaned).emit("chat-history", messagesDB);
        } catch (error) {
          console.error("Error getting messages from DB", error);
        }

        try {
          await updateAccessibleRoomsForAllUsers();
        } catch (error) {
          console.error("Error updating accessible rooms for users", error);
        }
      } else {
        console.error("Error: roomIdentifier no puede ser un string vacío");
      }
    });

    socket.on("disconnect", () => {
      const disconnectedUser = Object.keys(connectedUsers).find(
        (key) => connectedUsers[key].socketId === socket.id
      );
      if (disconnectedUser) {
        delete connectedUsers[disconnectedUser];
        io.emit("active users", Object.values(connectedUsers));
        console.log("Disconnected user: ", disconnectedUser);
        throttledUpdateAccessibleRoomsForAllUsers();
        throttledUpdateConnectedUsers();
      }
    });

    socket.on(
      "chat message",
      async (msg: {
        senderId: string;
        senderName: string;
        content: string;
        roomName: string;
      }) => {
        try {
          console.log("Message received on server:", msg);

          const newMessage = new MessageModelMongoose({
            senderId: new mongoose.Types.ObjectId(msg.senderId),
            senderName: msg.senderName,
            content: msg.content,
            roomName: msg.roomName,
          });
          await newMessage.save();
          console.log("Message saved to database");

          const roomDB = await RoomModelMongoose.findOne({
            roomName: msg.roomName,
          });
          if (!roomDB) {
            console.error("Error: roomDB es undefined");
            return;
          }
          roomDB.messages.push(newMessage.id);
          await roomDB.save();
          console.log("newMessage guardado en DB");

          const roomName = msg.roomName;
          socket.to(roomName).emit("chat message", msg);
        } catch (error) {
          console.error("Error saving message", error);
        }
      }
    );

    socket.on("userDeleted", (userId) => {
      socket.broadcast.emit("userDeleted", userId);
    });

    socket.on(
      "private message",
      async ({ userId, senderName, content, roomName }) => {
        try {
          const newMessage = new MessageModelMongoose({
            senderId: new mongoose.Types.ObjectId(userId),
            senderName: senderName,
            content: content,
            roomName: roomName,
          });
          await newMessage.save();

          io.to(roomName).emit("chat message", {
            senderId: userId,
            senderName,
            content,
            roomName,
          });
          io.to(roomName).emit("openPrivateChat", {
            roomName,
          });
        } catch (error) {
          console.error("Error handling private message", error);
        }
      }
    );
  });

  setInterval(throttledUpdateAccessibleRoomsForAllUsers, 60000);
  setInterval(throttledUpdateConnectedUsers, 10000);
}
