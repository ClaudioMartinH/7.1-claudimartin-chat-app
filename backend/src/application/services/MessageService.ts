import { Message } from "../../domain/entities/Message.js";

export interface MessageService {
  createMessage(
    content: string,
    senderId: string,
    senderName: string,
    roomName: string
  ): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  getRoomMessages(roomId: string): Promise<Message[]>;
  getUserMessages(userId: string): Promise<Message[]>;
}
