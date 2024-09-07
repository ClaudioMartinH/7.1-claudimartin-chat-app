import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { RoomRepositoryImpl } from "../../infraestructure/repositories/RoomRepositoryImpl.js";
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
import { Room } from "../../domain/entities/Room.js";

describe("RoomRepositoryImpl", () => {
  let mongoServer: MongoMemoryServer;
  let roomRepository: RoomRepositoryImpl;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });
  beforeEach(async () => {
    roomRepository = new RoomRepositoryImpl();
  });
  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test("findRoomByName", async () => {
    const room = new Room([], [], "Test Room", false);
    await roomRepository.save(room);
    const foundRoom = await roomRepository.findByName("Test Room");

    // Comparación de objetos basada en los valores de sus propiedades
    expect(foundRoom).toMatchObject({
      roomName: room.roomName,
      isPrivate: room.isPrivate,
      participants: room.participants,
      messages: room.messages,
    });
  });
  test("findRoomById", async () => {
    const room = new Room([], [], "Test Room", false);
    const savedRoom = await roomRepository.save(room);
    room.id = savedRoom.id;
    const foundRoom = await roomRepository.findById(room.id);
    expect(foundRoom).toMatchObject({
      roomName: room.roomName,
      isPrivate: room.isPrivate,
      participants: room.participants,
      messages: room.messages,
    });
    expect(foundRoom?.id).toBeDefined();
  });
  test("findAllRooms", async () => {
    const room1 = new Room([], [], "Room 1", false);
    const room2 = new Room([], [], "Room 2", false);
    await roomRepository.save(room1);
    await roomRepository.save(room2);
    const allRooms = await roomRepository.findAll();
    expect(allRooms).toHaveLength(2);
  });
  test("saveRoom", async () => {
    const room = new Room([], [], "Test Room", false);
    const savedRoom = await roomRepository.save(room);
    expect(savedRoom.id).toBeDefined();
  });
  test("removeRoom", async () => {
    const room = new Room([], [], "Test Room", false);
    const savedRoom = await roomRepository.save(room);
    expect(savedRoom).toBeDefined();
    expect(savedRoom.id).toBeDefined();
    await roomRepository.remove(savedRoom);
    const foundRooms = await roomRepository.findAll();
    expect(foundRooms).toHaveLength(0);
  });

  test("updateRoom", async () => {
    const room = new Room([], [], "Test Room", false);
    const savedRoom = await roomRepository.save(room);
    savedRoom.roomName = "Updated Room";
    await roomRepository.update(savedRoom);
    const updatedRoom = await roomRepository.findById(savedRoom.id);
    expect(updatedRoom?.roomName).toBe("Updated Room");
  });
});
