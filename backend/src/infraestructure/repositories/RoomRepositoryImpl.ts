import { Room } from "../../domain/entities/Room.js";
import { RoomRepository } from "../../domain/repositories/RoomRepository.js";
import RoomModelMongoose from "../../models/room.model.js";

export class RoomRepositoryImpl implements RoomRepository {
  async findById(id: string): Promise<Room> {
    try {
      const room = await RoomModelMongoose.findById(id);
      if (!room) {
        throw new Error(`Room Not found `);
      }
      return room;
    } catch (error: any) {
      if (error.message === "Room Not found") {
        throw error;
      }
      throw new Error(`Couldn't find room with id ${id}`);
    }
  }
  async findByName(name: string): Promise<Room> {
    try {
      const room = await RoomModelMongoose.findOne({ roomName: name });
      if (!room) {
        throw new Error(`Room not found with name ${name}`);
      }
      return room;
    } catch (error) {
      throw new Error(`Couldn't find room with name ${name}`);
    }
  }
  async findAll(): Promise<Room[]> {
    try {
      const rooms = await RoomModelMongoose.find();
      return rooms;
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`Couldn't find rooms`);
    }
  }
  async save(room: Room): Promise<Room> {
    try {
      const newRoom = await RoomModelMongoose.create(room);
      return newRoom;
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`Couldn't save room`);
    }
  }
  async remove(room: Room): Promise<void> {
    try {
      await RoomModelMongoose.findOneAndDelete(room);
    } catch (error) {
      throw new Error(`Couldn't remove room`);
    }
  }
  async update(room: Room): Promise<void> {
    try {
      await RoomModelMongoose.findByIdAndUpdate(room.id, room, { new: true });
    } catch (error) {
      throw new Error(`Couldn't update room`);
    }
  }
}
