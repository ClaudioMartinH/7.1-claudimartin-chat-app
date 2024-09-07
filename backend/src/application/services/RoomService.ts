import { Room } from "../../domain/entities/Room.js";

export interface RoomService {
  createRoom(name: string): Promise<Room>;
  getRoomById(id: string): Promise<Room | null>;
  getRoomByName(name: string): Promise<Room | null>;
  getAllRooms(): Promise<Room[]>;
  saveRoom(room: Room): Promise<Room>;
}
