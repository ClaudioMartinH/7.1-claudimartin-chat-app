import mongoose, { Schema } from "mongoose";
import { User } from "../domain/entities/User.js";

const guestUserSchema = new Schema<User>(
  {
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
      default: `https://anonymous-animals.azurewebsites.net/avatar/guest`,
    },
    userType: {
      type: String,
      default: "guest",
    },
  },
  { timestamps: true }
);

const GuestUserModelMongoose = mongoose.model("guest-user", guestUserSchema);

export default GuestUserModelMongoose;
