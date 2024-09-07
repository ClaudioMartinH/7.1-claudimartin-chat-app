import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { RoomServiceImpl } from "../../application/RoomServiceImpl.js";
import { RoomRepositoryImpl } from "../../infraestructure/repositories/RoomRepositoryImpl.js";
import { describe, beforeAll, afterAll, afterEach, it, expect } from "vitest";
import { Room } from "../../domain/entities/Room.js";
import { UserConversionService } from "../../application/UserConversionService.js";
import { UserRepositoryImpl } from "../../infraestructure/repositories/UserRepositoryImpl.js";

const roomRepository = new RoomRepositoryImpl();
const userConversionService = new UserConversionService(
  new UserRepositoryImpl()
);
const roomService = new RoomServiceImpl(roomRepository, userConversionService);
describe("Room Controller", () => {
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
  describe("createRoom", () => {
    it("create a new room", () => {
      const room = new Room([], [], "Test Room");
      return roomService.createRoom(room.roomName).then((createdRoom) => {
        expect(createdRoom.roomName).toBe("Test Room");
      });
    });
    it("should throw an error if any field is missing or incorrect parameters", () => {
      const room = new Room([], [], "");
      return roomService.createRoom(room.roomName).catch((error) => {
        expect(error.message).toBe("Couldn't save room");
      });
    });
  });
  describe("getRoomById", () => {
    it("should get a room by id", () => {
      const room = new Room([], [], "Test Room");
      return roomService.createRoom(room.roomName).then((createdRoom) => {
        return roomService.getRoomById(createdRoom.id).then((foundRoom) => {
          expect(foundRoom?.roomName).toBe("Test Room");
        });
      });
    });
    it("should throw an error if roomId is missing or invalid", () => {
      return roomService.getRoomById("invalid_id").catch((error) => {
        expect(error.message).toBe("Couldn't find room with id invalid_id");
      });
    });
  });
  describe("getRoomByName", () => {
    it("should get a room by name", () => {
      const room = new Room([], [], "Test Room");
      return roomService.createRoom(room.roomName).then((createdRoom) => {
        return roomService
          .getRoomByName(createdRoom.roomName)
          .then((foundRoom) => {
            expect(foundRoom?.roomName).toBe("Test Room");
          });
      });
    });
    it("should throw an error if roomName is missing or invalid", () => {
      return roomService.getRoomByName("").catch((error) => {
        expect(error.message).toBe("Couldn't find room with name");
      });
    });
  });
  describe("getAllRooms", () => {
    it("should get all rooms", () => {
      const room1 = new Room([], [], "Test Room 1");
      const room2 = new Room([], [], "Test Room 2");
      return roomService.createRoom(room1.roomName).then((createdRoom1) => {
        return roomService.createRoom(room2.roomName).then((createdRoom2) => {
          return roomService.getAllRooms().then((rooms) => {
            expect(rooms.length).toBe(2);
            expect(
              rooms.some((room) => room.roomName === "Test Room 1")
            ).toBeTruthy();
            expect(
              rooms.some((room) => room.roomName === "Test Room 2")
            ).toBeTruthy();
          });
        });
      });
    });
    it("should return an empty array if no rooms are found", () => {
      return roomService.getAllRooms().then((rooms) => {
        expect(rooms.length).toBe(0);
      });
    });
  });
  describe("saveRoom", () => {
    it("should save a room", () => {
      const room = new Room([], [], "Test Room");
      return roomService.createRoom(room.roomName).then((createdRoom) => {
        createdRoom.roomName = "Updated Room";
        return roomService.saveRoom(createdRoom).then((savedRoom) => {
          expect(savedRoom.roomName).toBe("Updated Room");
        });
      });
    });
    it("should throw an error if roomId is missing or invalid", () => {
      const room = new Room([], [], "Test Room");
      return roomService.saveRoom(room).catch((error) => {
        expect(error.message).toBe("Couldn't find room with id");
      });
    });
    it("should throw an error if roomName is missing or invalid", () => {
      const room = new Room([], [], "");
      return roomService.saveRoom(room).catch((error) => {
        expect(error.message).toBe("Couldn't save room");
      });
    });
  });
});
