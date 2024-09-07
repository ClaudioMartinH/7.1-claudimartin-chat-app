import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Message } from "../../domain/entities/Message.js";
import { MessageRepositoryImpl } from "../../infraestructure/repositories/MessageRepositoryImpl.js";
import {
  describe,
  test,
  beforeAll,
  afterAll,
  afterEach,
  it,
  expect,
} from "vitest";
import RoomModelMongoose from "../../models/room.model.js";
import MessageModelMongoose from "../../models/message.model.js";

describe("MessageRepositoryImpl", () => {
  const messageRepository = new MessageRepositoryImpl();
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe("create", () => {
    it("should save a message", async () => {
      const message = new Message(
        new mongoose.Types.ObjectId().toString(),
        "johndoe",
        "Hello, World!",
        "Room 1"
      );
      const savedMessage = await MessageModelMongoose.create(message);
      const savedMessages = await messageRepository.findAll();
      expect(savedMessages).toHaveLength(1);
      expect(savedMessages[0]._id.toString()).toEqual(
        savedMessage._id.toString()
      );
    });

    it("should throw an error if a field is invalid or missing", async () => {
      const message = new Message(
        new mongoose.Types.ObjectId().toString(),
        "johndoe",
        "",
        "Room 1"
      );
      await expect(MessageModelMongoose.create(message)).rejects.toThrow();
    });
  });

  describe("deleteOne", () => {
    it("should delete a message", async () => {
      const message = new Message(
        new mongoose.Types.ObjectId().toString(),
        "johndoe",
        "Hello, World!",
        "Room 1"
      );
      const savedMessage = await MessageModelMongoose.create(message);
      const messages = await messageRepository.findAll();
      expect(messages.length).toEqual(1);

      // Elimina usando el _id correcto
      await MessageModelMongoose.deleteOne({ _id: savedMessage._id });

      const updatedMessages = await messageRepository.findAll();
      expect(updatedMessages).toHaveLength(0);
    });
    it("should throw an error if the message does not exist", async () => {
      const messageId = new mongoose.Types.ObjectId().toString(); // Usar un ID que no existe

      const messageMock = new Message(
        messageId,
        "john.doe",
        "Hello, World!",
        "room1"
      );
      await messageRepository.save(messageMock);
      // Intentar eliminar el mensaje inexistente y capturar el error
      await expect(messageRepository.delete(messageMock)).rejects.toThrow(
        `Message with id ${messageMock._id} not found`
      );

      const messages = await messageRepository.findById(messageId);
      expect(messages).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all messages", async () => {
      const messages = [
        new Message(
          new mongoose.Types.ObjectId().toString(),
          "johndoe",
          "Hello, World!",
          "Room 1"
        ),
        new Message(
          new mongoose.Types.ObjectId().toString(),
          "jane",
          "Hi, there!",
          "Room 2"
        ),
      ];
      await MessageModelMongoose.insertMany(messages);
      const savedMessages = await messageRepository.findAll();
      expect(savedMessages).toHaveLength(2);
    });
    it("should return an empty array if there are no messages", async () => {
      const messages = await messageRepository.findAll();
      expect(messages).toHaveLength(0);
    });
  });
  describe("findByRoomId", () => {
    it("should return all messages in a specific room", async () => {
      const room = new RoomModelMongoose({
        participants: [],
        messages: [],
        roomName: "Room 1",
        isPrivate: false,
      });
      await room.save();
      const messages = [
        new MessageModelMongoose({
          senderName: "johndoe",
          content: "Hello, World!",
          roomId: room._id,
          roomName: "Room 1",
        }),
        new MessageModelMongoose({
          senderName: "jane",
          content: "Hi, there!",
          roomId: room._id,
          roomName: "Room 1",
        }),
      ];
      await MessageModelMongoose.insertMany(messages);

      const savedMessages = await messageRepository.findByRoomId(room.id);
      expect(savedMessages).toHaveLength(2);
    });
    it("should return an empty array if there are no messages in a specific room", async () => {
      const room = new RoomModelMongoose({
        participants: [],
        messages: [],
        roomName: "Room 1",
        isPrivate: false,
      });
      await room.save();
      const savedMessages = await messageRepository.findByRoomId(room.id);
      expect(savedMessages).toHaveLength(0);
    });
  });
});
