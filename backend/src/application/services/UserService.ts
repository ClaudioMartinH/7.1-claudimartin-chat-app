import { User } from "../../domain/entities/User.js";

export interface UserService {
  getUsers(): Promise<User[]>;
  getUserIdByUsername(userName: string): Promise<string | null>;
  createUser(
    fullName: string,
    userName: string,
    email: string,
    password: string,
    profilePic: string
  ): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
  searchUsersByName(name: string): Promise<User[]>;
  loginRegisteredUser(username: string, password: string): Promise<User | null>;
  loginGuestUser(userName: string): Promise<User | null>;
}
