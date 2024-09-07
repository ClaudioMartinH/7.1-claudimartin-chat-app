import { Room } from "../entities/Room.js";

export interface RoomRepository {
  findById(id: string): Promise<Room>;
  findAll(): Promise<Room[]>;
  findByName(name: string): Promise<Room>;
  save(room: Room): Promise<Room>;
  remove(room: Room): Promise<void>;
  update(room: Room): Promise<void>;
}
