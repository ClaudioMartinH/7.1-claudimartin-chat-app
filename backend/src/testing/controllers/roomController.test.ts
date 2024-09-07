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
import RoomController from "../../infraestructure/controllers/RoomController.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const roomController = new RoomController();

app.post("/create", (req, res) => roomController.createRoom(req, res));
app.get("/all", (req, res) => roomController.getAllRooms(req, res));
app.get("/name/:name", (req, res) => roomController.getRoomByName(req, res));
app.get("/id/:id", (req, res) => roomController.getRoomById(req, res));
app.post("/private", (req, res) =>
  roomController.privateConversationRoom(req, res)
);

describe("roomController", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });
  describe("create a new room", () => {
    it("should create a new room", async () => {
      const response = await request(app).post("/create").send({
        name: "testRoom",
        participants: [],
        messages: [],
        isPrivate: false,
      });
      expect(response.status).toBe(201);
      expect(response.body.name).toBe("testRoom");
    });
    it("should return 400 if the room name is empty", async () => {
      const response = await request(app).post("/create").send({
        name: "",
        participants: [],
        messages: [],
        isPrivate: false,
      });
      expect(response.status).toBe(400);
    });
  });
  describe("find a room by name", () => {
    it("should find a room by name", async () => {
      const roomPost = await request(app).post("/create").send({
        name: "testRoom",
        participants: [],
        messages: [],
        isPrivate: false,
      });
      const response = await request(app).get(`/name/testRoom`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("testRoom");
    });
    it("should return 404 if the room does not exist", async () => {
      const response = await request(app).get(`/name/nonExistentRoom`);
      expect(response.status).toBe(404);
    });
  });
  describe("find a room by id", () => {
    it("should find a room by id", async () => {
      const roomPost = await request(app).post("/create").send({
        name: "testRoom",
        participants: [],
        messages: [],
        isPrivate: false,
      });
      const roomGet = await request(app).get(`/id/${roomPost.body.id}`);
      expect(roomGet.status).toBe(200);
    });
  });
  describe("get all rooms", () => {
    it("should get all rooms", async () => {
      await request(app).post("/create").send({
        name: "testRoom1",
        participants: [],
        messages: [],
        isPrivate: false,
      });
      await request(app).post("/create").send({
        name: "testRoom2",
        participants: [],
        messages: [],
        isPrivate: false,
      });
      const response = await request(app).get("/all");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
    it("should return an empty array if there are no rooms", async () => {
      const response = await request(app).get("/all");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });
  // describe("private conversation room", () => {
  //   it("should create a privare room", async () => {
  //     const user1Id = new mongoose.Types.ObjectId();
  //     const user2Id = new mongoose.Types.ObjectId();
  //     const user1 = new User(
  //       user1Id.toString(),
  //       "user1",
  //       "pass1",
  //       "User 1",
  //       "user1@email.com",
  //       "https://example.com/user1.jpg",
  //       false
  //     );
  //     const user2 = new User(
  //       user2Id.toString(),
  //       "user2",
  //       "pass2",
  //       "User 2",
  //       "user2@email.com",
  //       "https://example.com/user2.jpg",
  //       false
  //     );
  //     const response = await request(app)
  //       .post("/private")
  //       .send({
  //         participants: [user1Id, user2Id],
  //       });
  //     expect(response.status).toBe(201);
  //     expect(response.body.participants).toEqual([user1.id, user2.id]);
  //   });
  // });
});
