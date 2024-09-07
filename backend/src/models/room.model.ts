import mongoose, { Schema } from "mongoose";
import { Room } from "../domain/entities/Room.js";

const roomSchema = new Schema<Room>(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    roomName: { type: String, required: true, unique: true },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RoomModelMongoose = mongoose.model<Room>("Room", roomSchema);

export default RoomModelMongoose;
