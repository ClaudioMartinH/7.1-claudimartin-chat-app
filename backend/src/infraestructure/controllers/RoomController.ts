import { Request, Response } from "express";
import { RoomServiceImpl } from "../../application/RoomServiceImpl.js";
import { RoomRepositoryImpl } from "../repositories/RoomRepositoryImpl.js";
import { Room } from "../../domain/entities/Room.js";
import { UserConversionService } from "../../application/UserConversionService.js";
import { UserRepositoryImpl } from "../repositories/UserRepositoryImpl.js";

const roomRepository = new RoomRepositoryImpl();
const userConversionService = new UserConversionService(
  new UserRepositoryImpl()
); // Inyectando el repositorio de usuarios
const roomService = new RoomServiceImpl(roomRepository, userConversionService);
export default class RoomController {
  public async createRoom(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }
    try {
      const room = await roomService.createRoom(name);
      await roomRepository.save(room);
      res.status(201).json({ id: room.id, name: room.roomName });
    } catch (error) {
      res.status(500).json({ error: "Error creating chat room" });
    }
  }
  public async findByName(req: Request, res: Response) {
    const { name } = req.params;
    try {
      const foundRoom = roomService.getRoomByName(name);
      if (!foundRoom) {
        throw new Error("Room not found");
      }
      return foundRoom;
    } catch (error) {
      res.status(404).json({ error: "Room not found" });
    }
  }

  public async getRoomById(req: Request, res: Response) {
    try {
      const room = await roomService.getRoomById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room Not found" });
      }
      return res.status(200).json(room);
    } catch (error: any) {
      if (error.message === "Room Not Found") {
        return res.status(404).json({ message: "Room Not found" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  }
  public async getRoomByName(req: Request, res: Response) {
    const { name } = req.params;
    try {
      const room = await roomService.getRoomByName(name);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json({ name: room.roomName, id: room.id });
    } catch (error) {
      res.status(500).json({ error: "Error retrieving room by name" });
    }
  }

  public async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await roomService.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving all rooms" });
    }
  }
  public async privateConversationRoom(req: Request, res: Response) {
    const { sender, recipient } = req.body;
    if (!sender || !recipient) {
      return res
        .status(400)
        .json({ error: "Sender and recipient IDs are required" });
    }

    try {
      const participants = await userConversionService.getUsersFromIds([
        sender,
        recipient,
      ]);
      if (participants.length !== 2) {
        return res.status(404).json({ error: "One or both users not found" });
      }
      const [senderUser, recipientUser] = participants;
      const roomNameGenerator = [senderUser.userName, recipientUser.userName]
        .sort()
        .join("-");
      const roomName = `${roomNameGenerator}`;
      let room = await roomService.getRoomByName(roomName);
      if (!room) {
        room = new Room([sender, recipient], [], roomName, true);
        await roomService.saveRoom(room);
      }
      res.status(200).json({ roomName: room.roomName });
    } catch (error) {
      console.error("Error creating private room:", error);
      res.status(500).json({ error: "Error creating private room" });
    }
  }
}
