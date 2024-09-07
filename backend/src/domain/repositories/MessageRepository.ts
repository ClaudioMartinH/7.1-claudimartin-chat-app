import { Message } from "../entities/Message.js";

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findAll(): Promise<Message[]>;
  findByRoomId(roomId: string): Promise<Message[]>;
  save(message: Message): Promise<Message>;
  delete(message: Message): Promise<void>;
}
