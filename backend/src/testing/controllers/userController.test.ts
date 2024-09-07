import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { describe, beforeAll, afterAll, afterEach, it, expect } from "vitest";
import { UserRepositoryImpl } from "../../infraestructure/repositories/UserRepositoryImpl.js";
import { UserServiceImpl } from "../../application/UserServiceImpl.js";
import UserController from "../../infraestructure/controllers/UserController.js";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { User } from "../../domain/entities/User.js";
import FormData from "form-data";
import fs from "fs"; // Si estás enviando un archivo

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const userRepository = new UserRepositoryImpl();
const userService = new UserServiceImpl(userRepository);
const userController = new UserController();

app.post("/users", (req, res) => userController.createUser(req, res));
app.get("/users", (req, res) => userController.getUsers(req, res));
app.get("/users/:id", (req, res) => userController.getUserById(req, res));
app.get("/users/search/userName/:userName", (req, res) =>
  userController.getUserByUserName(req, res)
);
app.put("/users/:id", (req, res) => userController.updateUser(req, res));
app.delete("/users/:id", (req, res) => userController.deleteUser(req, res));
app.post("/login", (req, res) => userController.login(req, res));
app.post("/guest-login", (req, res) => userController.guestUserLogin(req, res));

describe("userController", () => {
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

  describe("creating a user POST /users", () => {
    it("should return 400 when missing required fields", async () => {
      const response = await request(app).post("/users").send({
        userType: "registered",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "All fields are required");
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app).post("/users").send({
        userName: "john_doe",
        password: "password123",
        fullName: "John Doe",
        email: "",
        userType: "registered",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "All fields are required");
    });
    it("should create a user", async () => {
      const response = await request(app).post("/users").send({
        userName: "john_doe",
        password: "password123",
        fullName: "John Doe",
        email: "john.doe@example.com",
        userType: "registered",
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("user.userName", "john_doe");
    });
  });
  describe("getting users with GET request to /users", () => {
    it("should get all users", async () => {
      const newUserPost = await request(app).post("/users").send({
        userName: "john_doe",
        password: "password123",
        fullName: "John Doe",
        email: "john.doe@example.com",
        userType: "registered",
      });
      const responseGet = await request(app).get("/users");
      expect(responseGet.status).toBe(200);
      expect(responseGet.body).toHaveLength(1);
    });
    it("should return 404 when no users found", async () => {
      const responseGet = await request(app).get("/users");
      expect(responseGet.status).toBe(404);
      expect(responseGet.body).toHaveProperty("error", "No users found");
    });
  });
  describe("get users by id", () => {
    // it("should get a user by id", async () => {
    //   const userID = new mongoose.Types.ObjectId();
    //   const newUser = new User(
    //     userID.toString(),
    //     "paquita",
    //     "password123",
    //     "Paquita Fdez",
    //     "paqui.fdez@example.com",
    //     "paquita.jpg",
    //     true,
    //     "registered"
    //   );
    //   const newUserPost = await request(app).post("/users").send(newUser);
    //   await userService.saveUser(newUser);
    //   const responseGet = await request(app).get(`/users/${userID}`);
    //   expect(responseGet.status).toBe(200);
    //   expect(responseGet.body).toHaveProperty("userName", "paquita");
    // });
    it("should return 404 when user not found", async () => {
      const responseGet = await request(app).get(
        `/users/${mongoose.Types.ObjectId.toString()}`
      );
      expect(responseGet.status).toBe(404);
      expect(responseGet.body).toHaveProperty("error", "Invalid user id");
    });
    it("should return 404 when id is invalid", async () => {
      const responseGet = await request(app).get(`/users/invalidId`);
      expect(responseGet.status).toBe(404);
      expect(responseGet.body).toHaveProperty("error", "Invalid user id");
    });
  });
  describe("get users by userName", () => {
    it("should get a user by username", async () => {
      const newUser = new User(
        mongoose.Types.ObjectId.toString(),
        "johndoe",
        "password123",
        "John Doe",
        "john.doe@example.com",
        "",
        false,
        "registered"
      );
      await request(app).post("/users").send(newUser);
      const responseGet = await request(app).get(
        `/users/search/userName/${newUser.userName}`
      );
      expect(responseGet.status).toBe(200);
    });
    it("should return 404 when user not found", async () => {
      const responseGet = await request(app).get(
        `/users/search/userName/invalidUser`
      );
      expect(responseGet.status).toBe(404);
      expect(responseGet.body).toHaveProperty("error", "User not found");
    });
  });

  // describe("update user", () => {
  //   it("should update a user", async () => {
  //     const userID = new mongoose.Types.ObjectId();
  //     const newUser = new User(
  //       userID.toString(),
  //       "johndoe",
  //       "password123",
  //       "John Doe",
  //       "john.doe@example.com",
  //       "",
  //       false,
  //       "registered"
  //     );
  //     await request(app).post("/users").send(newUser);
  //     const responseGet = await request(app).get(`/users/${userID.toString()}`);
  //     const updatedUser = new User(
  //       userID.toString(),
  //       "johndoe_updated",
  //       "password123",
  //       "John Doe Updated",
  //       "john.doe@example.com",
  //       "",
  //       true,
  //       "registered"
  //     );
  //     const responsePut = await request(app)
  //       .put(`/users/${userID.toString()}`)
  //       .send(updatedUser);
  //     expect(responsePut.status).toBe(200);
  //     expect(responsePut.body).toHaveProperty(
  //       "responsePut.body.userName",
  //       "johndoe_updated"
  //     );
  //   });
  //   it("should return 404 when user not found", async () => {
  //     const responsePut = await request(app)
  //       .put(`/users/${new mongoose.Types.ObjectId().toString()}`)
  //       .send({ userName: "johndoe_updated" }); // Enviando sin datos
  //   });

  //   // it("should return 400 when missing required fields", async () => {
  //   //   const newUserId = new mongoose.Types.ObjectId().toString();

  //   //   const responsePut = await request(app)
  //   //     .put(`/users/${newUserId}`)
  //   //     .send({}); // Enviando sin datos

  //   //   expect(responsePut.status).toBe(400);
  //   //   expect(responsePut.body).toHaveProperty(
  //   //     "error",
  //   //     "All fields are required"
  //   //   );
  //   // });
  // });
  describe("delete a user", () => {
    it("should return 404 when user not found", async () => {
      const responseDelete = await request(app).delete(
        `/users/${new mongoose.Types.ObjectId().toString()}`
      );
      expect(responseDelete.status).toBe(404);
      expect(responseDelete.body).toHaveProperty("error", "User not found");
    });
    it("should return 204 when user is deleted", async () => {
      const newUserPost = await request(app).post("/users").send({
        id: mongoose.Types.ObjectId.toString(),
        userName: "john_doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        profilePic: "",
        isActive: false,
        userType: "registered",
        rooms: [],
      });

      const responseDelete = await request(app).delete(
        `/users/${newUserPost.body.id}`
      );
      const responseGetAfterDelete = await request(app).get(
        `/users/${newUserPost.body.id}`
      );
      expect(responseGetAfterDelete.status).toBe(404);
    });
    it("should return 404 when user not found", async () => {
      const responseDelete = await request(app).delete(
        `/users/${new mongoose.Types.ObjectId().toString()}`
      );
      expect(responseDelete.status).toBe(404);
      expect(responseDelete.body).toHaveProperty("error", "User not found");
    });
    it("should delete a user", async () => {
      const newUserPost = await request(app).post("/users").send({
        id: mongoose.Types.ObjectId.toString(),
        userName: "john_doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        profilePic: "",
        isActive: false,
        userType: "registered",
        rooms: [],
      });

      await request(app).delete(`/users/${newUserPost.body.id}`);
      const responseGetAfterDelete = await request(app).get(
        `/users/${newUserPost.body.id}`
      );
      expect(responseGetAfterDelete.status).toBe(404);
    });
  });
  describe("user login", () => {
    it("should return 401 when user credentials are incorrect", async () => {
      const newUserPost = await request(app).post("/users").send({
        id: mongoose.Types.ObjectId.toString(),
        userName: "john_doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        profilePic: "",
        isActive: false,
        userType: "registered",
        rooms: [],
      });

      const response = await request(app).post("/login").send({
        userName: "john_doe",
        password: "noesunpassword@",
        userType: "registered",
      });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Credenciales incorrectas."
      );
    });
    it("should return 200 when user credentials are correct", async () => {
      const newUserPost = await request(app).post("/users").send({
        id: mongoose.Types.ObjectId.toString(),
        userName: "john_doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        profilePic: "",
        isActive: false,
        userType: "registered",
        rooms: [],
      });
      const response = await request(app).post("/login").send({
        userName: "john_doe",
        password: "password123",
        userType: "registered",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("userName", "john_doe");
    });
  });
  describe("guest user login", () => {
    it("should guest login", async () => {
      const newUserPost = await request(app).post("/users").send({
        _id: "guest1",
        userName: "Guest_1234567890",
      });

      const response = await request(app).post("/guest-login");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("userName");
    });
  });
});
