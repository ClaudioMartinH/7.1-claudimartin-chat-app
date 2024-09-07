import mongoose, { Schema } from "mongoose";
import { User } from "../domain/entities/User.js";

const googleUserSchema = new Schema<User>(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    rooms: [String],
    userName: {
      type: String,
    },
    password: {
      type: String,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    profilePic: {
      type: String,
      default: ``,
    },
    userType: {
      type: String,
      default: "google",
    },
  },
  { timestamps: true }
);

const GoogleUserModelMongoose = mongoose.model("google-user", googleUserSchema);

export default GoogleUserModelMongoose;
