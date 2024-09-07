import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Mongoose } from "mongoose";
import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";
import { Message } from "../../domain/entities/Message.js";
import { MessageRepositoryImpl } from "../../infraestructure/repositories/MessageRepositoryImpl.js";
import MessageModelMongoose from "../../models/message.model.js";

const messageRepository = new MessageRepositoryImpl();

let mongoServer: MongoMemoryServer;

describe("MessageRepositoryImplementation", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });
  beforeEach(async () => {
    await MessageModelMongoose.deleteMany({});
  });

  describe("save", () => {
    it("should create a new message", async () => {
      const senderId = new mongoose.Types.ObjectId().toString();
      const newMessage = new Message(
        senderId,
        "john.doe",
        "Hello, World!",
        "room1"
      );
      await messageRepository.save(newMessage);
      expect(newMessage.senderId).toBe(senderId);
      expect(newMessage.senderName).toBe("john.doe");
      expect(newMessage.content).toBe("Hello, World!");
      expect(newMessage.roomName).toBe("room1");
    });
    it("should throw an error if any field is missing or invalid", async () => {
      const newMessage = new Message("", "john.doe", "Hello, World!", "room1");
      await expect(messageRepository.save(newMessage)).rejects.toThrowError();
    });
  });
  describe("findAll", () => {
    it("should return all messages", async () => {
      const senderId = new mongoose.Types.ObjectId().toString();
      const newMessage = new Message(
        senderId,
        "john.doe",
        "Hello, World!",
        "room1"
      );
      await messageRepository.save(newMessage);
      const messages = await messageRepository.findAll();
      expect(messages).toHaveLength(1);
    });
    it("should should return an empty array if there are no messages to show", async () => {
      const messages = await messageRepository.findAll();
      expect(messages).toHaveLength(0);
    });
  });
  describe("delete", () => {
    it("should delete a message", async () => {
      const senderId = new mongoose.Types.ObjectId().toString();
      const newMessage = new Message(
        senderId,
        "john.doe",
        "Hello, World!",
        "room1"
      );
      const savedMessage = await messageRepository.save(newMessage);
      console.log("Saved Message:", savedMessage);

      // Verifica que _id esté presente
      expect(savedMessage._id).toBeDefined();

      // Eliminar el mensaje usando la instancia guardada
      await messageRepository.delete(savedMessage);

      // Verificar que el mensaje fue eliminado
      const allMessagesAfterDeletion = await messageRepository.findAll();
      expect(allMessagesAfterDeletion).toHaveLength(0);
    });

    it("should throw an error if the message does not exist", async () => {
      const fakeMessageId = new mongoose.Types.ObjectId().toString(); // Usar un ID que no existe
      const fakeMessage = new Message(
        fakeMessageId,
        "john.doe",
        "Hello, World!",
        "room1"
      );

      await expect(
        messageRepository.delete(fakeMessage)
      ).rejects.toThrowError();

      const message = await messageRepository.findById(fakeMessageId);
      expect(message).toBe(null);
    });
  });

  describe("findById", () => {
    it("should find a message by id", async () => {});

    it("should return null if the message does not exist", async () => {
      return messageRepository
        .findById("123")
        .catch((err) =>
          expect(err.message).toBe("Message with id 123 not found")
        );
    });
  });
});
