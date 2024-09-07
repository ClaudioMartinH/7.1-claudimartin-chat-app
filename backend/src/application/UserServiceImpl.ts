import { User } from "../domain/entities/User.js";
import { UserRepository } from "../domain/repositories/UserRepository.js";
import GuestUserModelMongoose from "../models/guestUser.model.js";
import { UserService } from "./services/UserService.js";
import bcrypt from "bcrypt";

export class UserServiceImpl implements UserService {
  private UserRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.UserRepository = userRepository;
  }

  async createUser(
    fullName: string,
    userName: string,
    email: string,
    password: string,
    userType: "registered" | "guest" | "google",
    profilePic: string = ""
  ): Promise<User> {
    try {
      if (!password) {
        throw new Error("Password is required");
      }

      const validUserTypes: Array<"registered" | "guest" | "google"> = [
        "registered",
        "guest",
        "google",
      ];
      if (!validUserTypes.includes(userType)) {
        throw new Error(`Invalid user type: ${userType}`);
      }

      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User(
        "",
        userName,
        hashedPassword,
        fullName,
        email,
        profilePic,
        false,
        userType
      );
      return await this.UserRepository.createUser(newUser);
    } catch (error: any) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.UserRepository.findUserById(id);
  }

  async getUsers(): Promise<User[]> {
    return await this.UserRepository.findAll();
  }
  async getUserByUserName(userName: string): Promise<User | null> {
    const user = await this.UserRepository.findUserByName(userName);
    return user ? user : null;
  }

  async getUserIdByUsername(userName: string): Promise<string | null> {
    const user = await this.UserRepository.findUserByName(userName);
    return user ? user.id.toString() : null;
  }

  async updateUser(user: User): Promise<User> {
    const validUserTypes: Array<"registered" | "guest" | "google"> = [
      "registered",
      "guest",
      "google",
    ];
    if (!validUserTypes.includes(user.userType)) {
      throw new Error(`Invalid user type: ${user.userType}`);
    }
    await this.UserRepository.updateUser(user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.UserRepository.deleteUser(id);
  }

  async searchUsersByName(name: string): Promise<User[]> {
    return this.UserRepository.findAll().then((users) =>
      users.filter((user) =>
        user.fullName.toLowerCase().includes(name.toLowerCase())
      )
    );
  }
  async saveUser(user: User) {
    const existingUser = await this.UserRepository.findUserByName(
      user.userName
    );
    if (existingUser) {
      await this.UserRepository.updateUser(user);
    } else {
      console.error("User doesn't esist");
    }
  }

  async loginRegisteredUser(
    userName: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await this.UserRepository.findUserByName(userName);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return null;
      }
      user.isActive = true; // Marca el usuario como activo si es necesario
      return user;
    } catch (error: any) {
      console.error("Error logging in registered user:", error);
      throw new Error(`Error logging in registered user: ${error.message}`);
    }
  }

  async loginGuestUser(userName: string): Promise<User | null> {
    try {
      const guestUser = await GuestUserModelMongoose.findOne({ userName });
      if (!guestUser) {
        throw new Error("Guest user not found");
      }
      return guestUser;
    } catch (error: any) {
      console.error("Error logging in guest user:", error);
      throw new Error(`Error logging in guest user: ${error.message}`);
    }
  }
}
