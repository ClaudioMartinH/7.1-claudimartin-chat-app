import { MessageRepository } from "../../domain/repositories/MessageRepository.js";
import { Message } from "../../domain/entities/Message.js";
import MessageModelMongoose from "../../models/message.model.js";
import RoomModelMongoose from "../../models/room.model.js";
import mongoose, { ObjectId } from "mongoose";

export class MessageRepositoryImpl implements MessageRepository {
  async findByRoomId(roomId: string): Promise<Message[]> {
    try {
      const roomObjectId = mongoose.Types.ObjectId.isValid(roomId)
        ? new mongoose.Types.ObjectId(roomId)
        : null;
      if (!roomObjectId) {
        throw new Error("Invalid roomId format.");
      }
      const room = await RoomModelMongoose.findById(roomId).populate(
        "messages"
      );
      if (!room) {
        throw new Error("Room not found.");
      }

      const messages = await MessageModelMongoose.find({ roomId }).sort({
        createdAt: -1,
      });
      const messageObjects = messages.map((message) =>
        message.toObject<Message>()
      );
      return messageObjects;
    } catch (error) {
      throw error;
    }
  }
  async findById(id: string): Promise<Message | null> {
    try {
      const message = await MessageModelMongoose.findById(id);
      return message ? message.toObject() : null;
    } catch (error) {
      throw new Error(`Message with id ${id} not found`);
    }
  }

  async findAll(): Promise<Message[]> {
    try {
      const messages = await MessageModelMongoose.find({});
      return messages.map((message) => message.toObject());
    } catch (error) {
      throw new Error("Error fetching messages");
    }
  }

  async save(message: Message): Promise<Message> {
    try {
      const savedMessage = await MessageModelMongoose.create(message);
      return savedMessage.toObject();
    } catch (error) {
      throw new Error("Error saving message");
    }
  }

  async delete(message: Message): Promise<void> {
    const result = await MessageModelMongoose.findByIdAndDelete(message._id);

    if (!result) {
      throw new Error(`Message with id ${message._id} not found`);
    }
  }
}
