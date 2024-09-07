import { Room } from "../domain/entities/Room.js";
import { User } from "../domain/entities/User.js";
import { RoomRepository } from "../domain/repositories/RoomRepository.js";
import { RoomService } from "./services/RoomService.js";
import { UserConversionService } from "./UserConversionService.js";
export class RoomServiceImpl implements RoomService {
  roomRepository: RoomRepository;
  userConversionService: UserConversionService;
  constructor(
    roomRepository: RoomRepository,
    userConversionService: UserConversionService
  ) {
    this.roomRepository = roomRepository;
    this.userConversionService = userConversionService;
  }
  async createRoom(name: string): Promise<Room> {
    const newRoom = new Room([], [], name);
    const exists = await this.getRoomByName(name);
    if (exists) {
      throw new Error("Room with the same name already exists.");
    }
    const savedRoom = await this.roomRepository.save(newRoom);
    return savedRoom;
  }

  async getRoomById(id: string): Promise<Room | null> {
    return await this.roomRepository.findById(id);
  }

  async getRoomByName(name: string): Promise<Room | null> {
    const foundRoom = await this.roomRepository
      .findAll()
      .then((rooms) => rooms.find((room) => room.roomName === name));
    if (!foundRoom) {
      return null;
    }
    return foundRoom;
  }

  async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }
  async saveRoom(room: Room): Promise<Room> {
    await this.roomRepository.save(room);
    return room;
  }
}
