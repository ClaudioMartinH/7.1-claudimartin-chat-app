import { User } from "../domain/entities/User.js";
import { UserRepository } from "../domain/repositories/UserRepository.js";
import { ConversionService } from "./services/ConversionService.js";

export class UserConversionService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async getUsersFromIds(ids: string[]): Promise<User[]> {
    if (!ids || ids.length === 0) {
      throw new Error("No user IDs provided");
    }

    // Verificar que los IDs sean válidos
    const validIds = ids.filter(
      (id) => id !== undefined && id !== null && id.trim() !== ""
    );
    if (validIds.length === 0) {
      throw new Error("No valid user IDs provided");
    }

    // Obtener usuarios por IDs
    const users = await Promise.all(
      validIds.map((id) => this.userRepository.findUserById(id))
    );
    return users.filter((user) => user !== null) as User[];
  }
}
