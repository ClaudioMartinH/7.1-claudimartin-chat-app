import { Request, Response } from "express";
import { MessageServiceImpl } from "../../application/MessageServiceImpl.js";
import { MessageRepositoryImpl } from "../repositories/MessageRepositoryImpl.js";

const messageRepository = new MessageRepositoryImpl();
const messageService = new MessageServiceImpl(messageRepository);

export default class MessageController {
  public async createMessage(req: Request, res: Response) {
    try {
      const { content, senderId, senderName, roomName } = req.body;
      if (!content || !senderId || !senderName || !roomName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const message = await messageService.createMessage(
        content,
        senderId,
        senderName,
        roomName
      );
      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating message" });
    }
  }
  public async getAllMessages(req: Request, res: Response) {
    try {
      const messages = await messageService.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error getting all messages" });
    }
  }
  public async getRoomMessages(req: Request, res: Response) {
    try {
      const roomName = req.params.name;
      const messages = await messageService.getRoomMessages(roomName);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error getting room messages" });
    }
  }

  public async getUserMessages(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const messages = await messageService.getUserMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error getting user messages" });
    }
  }
  public async deleteMessage(req: Request, res: Response) {
    try {
      const messageId = req.params.id;
      await messageService.deleteMessage(messageId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting message" });
    }
  }
}
