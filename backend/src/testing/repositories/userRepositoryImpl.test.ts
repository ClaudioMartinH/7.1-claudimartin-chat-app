import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { UserRepositoryImpl } from "../../infraestructure/repositories/UserRepositoryImpl.js";
import { User } from "../../domain/entities/User.js";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  test,
  it,
  expect,
} from "vitest";

describe("UserRepositoryImpl", () => {
  let mongoServer: MongoMemoryServer;
  let userRepo: UserRepositoryImpl;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    userRepo = new UserRepositoryImpl();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it("createUser", async () => {
    const newUser = new User(
      "66c89bec306caa833b1a4c8a",
      "claudimartin",
      "password123",
      "Claudio Martin",
      "claudio@test.com",
      "example.jpg",
      true,
      "registered"
    );
    const createdUser = await userRepo.createUser(newUser);
    expect(createdUser).toMatchObject({
      id: expect.any(String),
      userName: newUser.userName,
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isActive: newUser.isActive,
      googleId: newUser.googleId,
    });
  });
  it("findUserById", async () => {
    const newUser = await userRepo.createUser(
      new User(
        "66c89bec306caa833b1a4c8a",
        "claudimartin",
        "password123",
        "Claudio Martin",
        "claudio@test.com",
        "example.jpg",
        true,
        "registered"
      )
    );
    const foundUser = await userRepo.findUserById(newUser.id);
    expect(foundUser).toMatchObject({
      id: newUser.id,
      userName: newUser.userName,
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isActive: newUser.isActive,
      googleId: newUser.googleId,
    });
  });
  it("deleteUser", async () => {
    const newUser = await userRepo.createUser(
      new User(
        "66c89bec306caa833b1a4c8a",
        "claudimartin",
        "password123",
        "Claudio Martin",
        "claudio@test.com",
        "example.jpg",
        true,
        "registered"
      )
    );
    await userRepo.deleteUser(newUser.id);
    const foundUser = await userRepo.findUserById(newUser.id);
    expect(foundUser).toBeNull();
  });
  it("updateUser", async () => {
    const newUser = await userRepo.createUser(
      new User(
        "66c89bec306caa833b1a4c8a",
        "claudimartin",
        "password123",
        "Claudio Martin",
        "claudio@test.com",
        "example.jpg",
        true,
        "registered"
      )
    );
    newUser.fullName = "New Claudio Martin";
    await userRepo.updateUser(newUser);
    const foundUser = await userRepo.findUserById(newUser.id);
    expect(foundUser).toMatchObject({
      id: newUser.id,
      userName: newUser.userName,
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isActive: newUser.isActive,
      googleId: newUser.googleId,
    });
  });

  it("findUserByEmail", async () => {
    const newUser = new User(
      "66c89bec306caa833b1a4c8a",
      "claudimartin",
      "password123",
      "Claudio Martin",
      "claudio@test.com",
      "example.jpg",
      true,
      "registered"
    );
    const createdUser = await userRepo.createUser(newUser);
    const foundUser = await userRepo.findUserByEmail("claudio@test.com");
    expect(foundUser).toMatchObject({
      userName: newUser.userName,
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isActive: newUser.isActive,
      googleId: newUser.googleId,
    });
    expect(foundUser?.id).toBe(createdUser.id);
  });
  it("findUserByName", async () => {
    const newUser = new User(
      "66c89bec306caa833b1a4c8a",
      "claudimartin",
      "password123",
      "Claudio Martin",
      "claudio@test.com",
      "example.jpg",
      true,
      "registered"
    );
    const createdUser = await userRepo.createUser(newUser);
    const foundUser = await userRepo.findUserByName("claudimartin");
    expect(foundUser).toMatchObject({
      userName: newUser.userName,
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isActive: newUser.isActive,
      googleId: newUser.googleId,
    });
    expect(foundUser?.id).toBe(createdUser.id);
  });
  it("saveUser", async () => {
    const newUser = new User(
      "66c89bec306caa833b1a4c8a",
      "claudimartin",
      "password123",
      "Claudio Martin",
      "claudio@test.com",
      "example.jpg",
      true,
      "registered"
    );
    await userRepo.saveUser(newUser);
    const foundUser = await userRepo.findUserByName(newUser.userName);
    expect(foundUser).toMatchObject({
      userName: newUser.userName,
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isActive: newUser.isActive,
      googleId: newUser.googleId,
    });
  });
  it("findAll", async () => {
    const newUser1 = await userRepo.createUser(
      new User(
        "66c89bec306caa833b1a4c8a",
        "claudimartin",
        "password123",
        "Claudio Martin",
        "claudio@test.com",
        "example.jpg",
        true,
        "registered"
      )
    );
    const newUser2 = await userRepo.createUser(
      new User(
        "66c89bec306caa833b1a4c8b",
        "juanpablo",
        "password456",
        "Juan Pablo",
        "juan@test.com",
        "example2.jpg",
        true,
        "registered"
      )
    );
    const allUsers = await userRepo.findAll();
    expect(allUsers).toHaveLength(2);
    expect(allUsers).toContainEqual(
      expect.objectContaining({
        id: newUser1.id,
        userName: newUser1.userName,
        password: newUser1.password,
        fullName: newUser1.fullName,
        email: newUser1.email,
        profilePic: newUser1.profilePic,
        isActive: newUser1.isActive,
        googleId: newUser1.googleId,
      })
    );
  });
});
