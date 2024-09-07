import mongoose, { Schema } from "mongoose";
import { isEmailValid } from "../../utils/emailValidator.js";
import { User } from "../domain/entities/User.js";

const userSchema = new Schema<User>(
  {
    isActive: {
      type: Boolean,
      default: false,
    },
    rooms: [String],
    userName: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 20,
      match: /^[a-zA-Z0-9]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: isEmailValid,
        message: "Invalid email address",
      },
    },
    profilePic: {
      type: String,
      default: ``,
    },
    userType: {
      type: String,
      enum: ["guest", "google", "registered"],
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function next() {
  if (this.userType === "registered") {
    if (!this.password || !this.email || !this.fullName || !this.userName) {
      throw new Error("All fields are required for registered user type");
    }
  } else if (this.userType === "guest") {
    if (!this.userName) {
      throw new Error("UserName is required for a guest user");
    }
  } else if (this.userType === "google") {
  } else {
    throw new Error("Invalid user type");
  }
});
const UserModelMongoose =
  mongoose.models.User || mongoose.model("User", userSchema);

export default UserModelMongoose;
