import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  it,
  expect,
} from "vitest";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import MessageController from "../../infraestructure/controllers/MessageController.js";
import { MessageRepositoryImpl } from "../../infraestructure/repositories/MessageRepositoryImpl.js";
import { Message } from "../../domain/entities/Message.js";
import { MessageServiceImpl } from "../../application/MessageServiceImpl.js";
import MessageModelMongoose from "../../models/message.model.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const messageController = new MessageController();
const messageRepository = new MessageRepositoryImpl();
const messageService = new MessageServiceImpl(messageRepository);
app.get("/all", (req, res) => messageController.getAllMessages(req, res));
app.get("/rooms/messages/:name", (req, res) =>
  messageController.getRoomMessages(req, res)
);
app.get("/users/messages/:id", (req, res) =>
  messageController.getRoomMessages(req, res)
);
app.post("/create", (req, res) => messageController.createMessage(req, res));
app.delete("/messages/delete/:id", (req, res) =>
  messageController.deleteMessage(req, res)
);
app.delete("/users/delete/:id", (req, res) =>
  messageController.deleteMessage(req, res)
);
describe("messagesController", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection:", reason);
      throw reason; // Re-throw to fail the test
    });
    await MessageModelMongoose.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropCollection("messages");
    await mongoose.connection.db.dropCollection("users");
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe("get all messages", () => {
    it("Should get all messages in DB", async () => {
      const message1 = new Message(
        new mongoose.Types.ObjectId().toString(),
        "User 1",
        "Hello!",
        "Room 1"
      );
      const message2 = new Message(
        new mongoose.Types.ObjectId().toString(),
        "User 2",
        "Hi!",
        "Room 1"
      );
      messageRepository.save(message1);
      messageRepository.save(message2);
      let messageArray = [];
      messageArray.push(message1);
      messageArray.push(message2);
      let allMessages = await messageRepository.findAll();
      allMessages.forEach((message) => {
        for (let i = 0; i < allMessages.length; i++) {
          expect(allMessages[i].content).to.equal(messageArray[i].content);
        }
      });
    });
  });
  describe("save a message", () => {
    it("Should save a message in DB", async () => {
      const message = new Message(
        new mongoose.Types.ObjectId().toString(),
        "User 1",
        "Hello!",
        "Room 1"
      );
      await messageRepository.save(message);
      const savedMessage = await messageRepository.findAll();
      savedMessage.forEach((message) => {
        for (let i = 0; i < savedMessage.length; i++) {
          expect(savedMessage[i].toString()).to.equal(message.toString());
        }
      });
    });
  });
  describe("delete a message", () => {
    it("Should delete a message from DB", async () => {
      const message = new Message(
        new mongoose.Types.ObjectId().toString(),
        "User 1",
        "Hello!",
        "Room 1"
      );
      await messageRepository.save(message);
      const savedMessage = await messageRepository.findAll();
      savedMessage.forEach((message) => {
        for (let i = 0; i < savedMessage.length; i++) {
          messageRepository.delete(savedMessage[i]);
          messageRepository.findAll().then((allMessages) => {
            expect(allMessages.length).to.equal(0);
          });
        }
      });
    });
    it("should throw an error when trying to delete a non-existent message", async () => {
      const nonExistentMessage: Message = {
        _id: "66ccf39ca44cd0127d7c21ce",
        senderId: "User 1",
        senderName: "User 1",
        content: "Hello!",
        roomName: "Room 1",
      };

      await expect(
        messageRepository.delete(nonExistentMessage)
      ).rejects.toThrow("Message with id 66ccf39ca44cd0127d7c21ce not found");
    });
  });
});
