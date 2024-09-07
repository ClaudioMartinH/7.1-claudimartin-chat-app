import { User } from "../../domain/entities/User.js";

export interface ConversionService {
  getUsersFromIds(ids: string[]): Promise<User[]>;
}
