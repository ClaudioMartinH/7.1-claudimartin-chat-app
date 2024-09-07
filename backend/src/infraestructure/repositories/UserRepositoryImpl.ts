import { User } from "../../domain/entities/User.js";
import { UserRepository } from "../../domain/repositories/UserRepository.js";
import UserDoc, { IUser } from "../../models/userDoc.model.js";
import mongoose, { Model } from "mongoose";

export class UserRepositoryImpl implements UserRepository {
  private userModel: Model<IUser>;

  constructor() {
    this.userModel = UserDoc;
  }

  private toDomain(userDoc: IUser): User {
    return new User(
      (userDoc._id as mongoose.Types.ObjectId).toString(), // Aserción explícita
      userDoc.userName,
      userDoc.password,
      userDoc.fullName,
      userDoc.email,
      userDoc.profilePic,
      userDoc.isActive,
      userDoc.userType
    );
  }

  private toDocument(user: User): Partial<IUser> {
    return {
      userName: user.userName,
      password: user.password,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isActive: user.isActive,
      userType: user.userType,
      rooms: user.rooms,
    };
  }

  async createUser(user: User): Promise<User> {
    try {
      const userDoc = new this.userModel(this.toDocument(user));
      const savedUser = await userDoc.save();
      return this.toDomain(savedUser);
    } catch (error: any) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid user ID format: ${id}`);
      }
      const userDoc = await this.userModel.findById(id).exec();
      return userDoc ? this.toDomain(userDoc) : null;
    } catch (error: any) {
      throw new Error(`Error finding user with id ${id}: ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid user ID format: ${id}`);
      }
      await this.userModel.findByIdAndDelete(id).exec();
    } catch (error: any) {
      throw new Error(`Error deleting user with id ${id}: ${error.message}`);
    }
  }

  async updateUser(user: User): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(user.id)) {
        throw new Error(`Invalid user ID format: ${user.id}`);
      }
      const existingUser = await this.userModel.findById(user.id).exec();
      if (!existingUser) {
        throw new Error(`User with id ${user.id} not found`);
      }
      await this.userModel
        .findByIdAndUpdate(
          user.id,
          {
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            profilePic: user.profilePic,
          },
          { new: true }
        )
        .exec();
      console.log(`User with id ${user.id} updated successfully.`);
    } catch (error: any) {
      throw new Error(
        `Error updating user with id ${user.id}: ${error.message}`
      );
    }
  }

  async findUserByName(name: string): Promise<User | null> {
    try {
      const userDoc = await this.userModel.findOne({ userName: name }).exec();
      return userDoc ? this.toDomain(userDoc) : null;
    } catch (error: any) {
      throw new Error(`Error finding user with name ${name}: ${error.message}`);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = await this.userModel.findOne({ email }).exec();
      return userDoc ? this.toDomain(userDoc) : null;
    } catch (error: any) {
      throw new Error(
        `Error finding user with email ${email}: ${error.message}`
      );
    }
  }
  async saveUser(user: User): Promise<void> {
    try {
      await this.userModel.create(this.toDocument(user));
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const usersDocs = await this.userModel.find().exec();
      return usersDocs.map(this.toDomain.bind(this));
    } catch (error: any) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }
}
