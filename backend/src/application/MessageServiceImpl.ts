import { Message } from "../domain/entities/Message.js";
import { MessageRepository } from "../domain/repositories/MessageRepository.js";
import { MessageService } from "./services/MessageService.js";

export class MessageServiceImpl implements MessageService {
  private messageRepository: MessageRepository;
  constructor(messageRepository: MessageRepository) {
    this.messageRepository = messageRepository;
  }

  async createMessage(
    content: string,
    senderId: string,
    senderName: string,
    roomName: string
  ): Promise<Message> {
    if (!content || content === "") {
      throw new Error("Content cannot be empty");
    }
    const message = new Message(senderId, senderName, content, roomName);
    return await this.messageRepository.save(message);
  }
  async getAllMessages(): Promise<Message[]> {
    return await this.messageRepository.findAll();
  }

  async getRoomMessages(roomName: string): Promise<Message[]> {
    return await this.messageRepository.findByRoomId(roomName);
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    const messages = await this.getAllMessages();
    const foundMessages = messages.filter(
      (message) => message.senderId === userId
    );
    if (!foundMessages) {
      throw new Error("User messages not found.");
    }
    return foundMessages;
  }
  async deleteMessage(messageId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new Error("Message not found.");
    }
    await this.messageRepository.delete(message);
  }
}
