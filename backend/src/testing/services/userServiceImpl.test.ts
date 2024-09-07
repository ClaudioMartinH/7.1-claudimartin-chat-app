import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { UserServiceImpl } from "../../application/UserServiceImpl.js";
import { UserRepositoryImpl } from "../../infraestructure/repositories/UserRepositoryImpl.js";
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
import { User } from "../../domain/entities/User.js";

const userRepository = new UserRepositoryImpl();
const userService = new UserServiceImpl(userRepository);

describe("User Service", () => {
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
  describe("createUser", () => {
    it(" should create a new user", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      expect(user).toBeTruthy();
      expect(user.id).toBeTruthy();
      expect(user.fullName).toBe("John Doe");
      expect(user.userName).toBe("john.doe");
      expect(user.email).toBe("john.doe@example.com");
    });
    it("should throw an error if any field is missing or invalid", async () => {
      return userService
        .createUser(
          "John Doe",
          "john.doe",
          "john.doe@example.com",
          "",
          "registered"
        )
        .catch((err) => {
          expect(err.message).toContain("Password is required");
        });
    });
  });
  describe("getUserById", () => {
    it("should return the user with the given ID", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      const foundUser = await userService.getUserById(user.id);
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.fullName).toBe("John Doe");
      expect(foundUser?.userName).toBe("john.doe");
      expect(foundUser?.email).toBe("john.doe@example.com");
    });
    it("should throw an error if the user does not exist", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      await userService.deleteUser(user.id);
      return userService.getUserById(user.id).catch((err) => {
        expect(err.message).toContain("User not found");
      });
    });
  });

  describe("updateUser", () => {
    it("should update the user with the given ID", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      user.fullName = "Jane Doe";
      await userService.updateUser(user);
      const foundUser = await userService.getUserById(user.id);
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.fullName).toBe("Jane Doe");
      expect(foundUser?.userName).toBe("john.doe");
      expect(foundUser?.email).toBe("john.doe@example.com");
    });
    it("should throw an error if the user does not exist", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      await userService.deleteUser(user.id);
      return userService.updateUser(user).catch((err) => {
        expect(err.message).toContain("Error updating user with id");
      });
    });
  });
  describe("getUsers", () => {
    it("should return all users", async () => {
      const user1 = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      const user2 = await userService.createUser(
        "Jane Doe",
        "jane.doe",
        "jane.doe@example.com",
        "password456",
        "registered"
      );
      const users = await userService.getUsers();
      expect(users).toBeTruthy();
      expect(users.length).toBeGreaterThan(1);
    });
  });
  describe("deleteUser", () => {
    it("should delete the user with the given ID", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      await userService.deleteUser(user.id);
      return userService.getUserById(user.id).then((foundUser) => {
        expect(foundUser).toBeNull();
      });
    });
    it("should throw an error if the user does not exist", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      await userService.deleteUser(user.id);
      await userService.deleteUser(user.id).catch((err) => {
        expect(err.message).toContain("User not found");
      });
    });
  });
  describe("getUSersByUserNAme", () => {
    it("should return the user with the given username", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      const foundUser = await userService.getUserByUserName("john.doe");
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.fullName).toBe("John Doe");
      expect(foundUser?.userName).toBe("john.doe");
      expect(foundUser?.email).toBe("john.doe@example.com");
    });
    it("should throw an error if the user does not exist", async () => {
      return userService.getUserByUserName("nonexistent.user").catch((err) => {
        expect(err.message).toContain("User not found");
      });
    });
  });

  describe("getUserIdByUsername", () => {
    it("should return the user ID with the given username", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      const userId = await userService.getUserIdByUsername("john.doe");
      expect(userId).toBe(user.id);
    });
    it("should return null if the user does not exist", async () => {
      const userId = await userService.getUserIdByUsername("nonexistent.user");
      expect(userId).toBeNull();
    });
  });

  describe("searchUsersBYName", () => {
    it("should get users by username", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      const users = await userService.searchUsersByName("John");
      expect(users).toBeTruthy();
      expect(users.length).toBeGreaterThan(0);
      expect(users.map((u) => u.userName)).toContain("john.doe");
    });
    it("should return empty array if no users found", async () => {
      const users = await userService.searchUsersByName("nonexistent");
      expect(users).toBeTruthy();
      expect(users.length).toBe(0);
    });
  });
  describe("login", () => {
    it("should return user if valid credentials", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      const foundUser = await userService.loginRegisteredUser(
        "john.doe",
        "password123"
      );
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.fullName).toBe("John Doe");
      expect(foundUser?.userName).toBe("john.doe");
      expect(foundUser?.email).toBe("john.doe@example.com");
    });
    it("shouldthrow an error if invalid credentials", async () => {
      return userService
        .loginRegisteredUser("john.doe", "wrongpassword")
        .catch((err) => {
          expect(err.message).toContain("Invalid credentials");
        });
    });
    it("should throw an error if user does not exist", async () => {
      const foundUser = await userService
        .loginRegisteredUser("john.doe", "password123")
        .catch((err) => {
          expect(err.message).toContain("Invalid credentials");
        });
    });
  });
  describe("saveUser", () => {
    it("should save the user to the database", async () => {
      const user = await userService.createUser(
        "John Doe",
        "john.doe",
        "john.doe@example.com",
        "password123",
        "registered"
      );
      expect(user.id).toBeTruthy();
    });
    it("should throw an error if the user already exists", async () => {
      return await userService
        .createUser(
          "John Doe",
          "john.doe",
          "john.doe@example.com",
          "password123",
          "registered"
        )
        .catch((err) => {
          expect(err.message).toContain("User already exists");
        });
    });
  });
});
