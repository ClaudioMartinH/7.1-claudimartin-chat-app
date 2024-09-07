import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    senderName: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" },
    roomName: { type: String, required: true },
  },
  { timestamps: true }
);

const MessageModelMongoose = mongoose.model("Message", messageSchema);

export default MessageModelMongoose;
