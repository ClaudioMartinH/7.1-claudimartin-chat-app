import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  userName: string;
  password: string;
  fullName: string;
  email: string;
  profilePic: string;
  isActive: boolean;
  userType: "registered" | "guest" | "google";
  rooms: string[];
}

const userSchema = new Schema<IUser>({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  profilePic: { type: String, default: "" },
  isActive: { type: Boolean, default: false },
  userType: {
    type: String,
    enum: ["registered", "guest", "google"],
    required: true,
  },
  rooms: { type: [String], default: [] },
});

const UserDoc = mongoose.model<IUser>("User", userSchema);

export default UserDoc;
