import mongoose, { Schema, Document } from "mongoose";

interface IRoom extends Document {
  participants: string[];
  messages: any[];
  name: string;
  isPrivate: boolean;
}

const roomSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: Schema.Types.Mixed }],
  name: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: true },
});

const RoomModelMongoose = mongoose.model<IRoom>("Room", roomSchema);
export default RoomModelMongoose;
