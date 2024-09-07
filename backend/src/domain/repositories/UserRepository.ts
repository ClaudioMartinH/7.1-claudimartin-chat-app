import { User } from "../entities/User.js";

export interface UserRepository {
  createUser(user: User): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  deleteUser(id: string): Promise<void>;
  updateUser(user: User): Promise<void>;
  saveUser(user: User): Promise<void>;
  findUserByName(name: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}
