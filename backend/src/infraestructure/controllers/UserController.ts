import { Request, Response } from "express";
import { UserServiceImpl } from "../../application/UserServiceImpl.js";
import { UserRepositoryImpl } from "../repositories/UserRepositoryImpl.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import GuestUserModelMongoose from "../../models/guestUser.model.js";
import GoogleUserModelMongoose from "../../models/googleUser.model.js";
import { User } from "../../domain/entities/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const userRepository = new UserRepositoryImpl();
const userService = new UserServiceImpl(userRepository);

export default class UserController {
  public async createUser(req: Request, res: Response) {
    try {
      const { userName, password, fullName, email, userType } = req.body;
      const profilePic = req.file ? req.file.path : "";

      if (userType !== "registered") {
        return res
          .status(400)
          .json({ error: "Invalid user type for this endpoint" });
      }
      if (!userName || !fullName || !email) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const user = await userService.createUser(
        fullName,
        userName,
        email,
        password,
        userType,
        profilePic
      );

      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Error creating user" });
    }
  }

  public async getUsers(req: Request, res: Response) {
    try {
      const users = await userService.getUsers();
      if (users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error getting users" });
    }
  }
  public async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: "Invalid user id" });
      }
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error getting user" });
    }
  }
  public async getUserByUserName(req: Request, res: Response) {
    try {
      const userName = req.params.userName;
      const user = await userService.getUserByUserName(userName);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error getting user by username" });
    }
  }
  public async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: "Invalid user ID" });
      }

      const { userName, fullName, email, password } = req.body;

      const profilePic = (req.files as { profilePic?: Express.Multer.File[] })
        .profilePic?.[0];

      if (!userName || !fullName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const updatedUser: User = new User(
        userId,
        userName,
        hashedPassword,
        fullName,
        email,
        profilePic ? profilePic.path : user.profilePic,
        true,
        user.userType,
        user.googleId
      );

      await userService.updateUser(updatedUser);
      await userRepository.updateUser(updatedUser);
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating user" });
    }
  }

  public async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: "Invalid user ID" });
      }
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }
  public async login(req: Request, res: Response) {
    try {
      const { userName, password, userType } = req.body;

      if (!userName || !password || !userType) {
        return res.status(400).json({
          error: "Nombre de usuario y contraseña son obligatorios.",
        });
      }

      const userToFind = await userService.loginRegisteredUser(
        userName,
        password
      );
      if (!userToFind) {
        return res.status(401).json({ error: "Credenciales incorrectas." });
      }

      const token = jwt.sign(
        { userId: userToFind.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      res.cookie("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res.status(200).json({
        token,
        userId: userToFind.id,
        userName: userToFind.userName,
        profilePic: userToFind.profilePic,
      });
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      res.status(500).json({ error: "Error en el inicio de sesión" });
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error);
      res.status(500).json({ error: "Error durante el cierre de sesión" });
    }
  }
  public async guestUserLogin(req: Request, res: Response) {
    try {
      const guestUserName = `Guest_${Date.now()}`;
      const guestUser = new GuestUserModelMongoose({
        userName: guestUserName,
      });
      await guestUser.save();
      const token = jwt.sign(
        { userId: guestUser.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "10h",
        }
      );
      res.cookie("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(200).json({
        userId: guestUser._id,
        userName: guestUser.userName,
        profilePic: `https://anonymous-animals.azurewebsites.net/avatar/${guestUser.userName}`,
        userType: "google",
        token: token,
      });
    } catch (error) {
      console.error("Error al iniciar sesión como invitado:", error);
      res.status(500).json({ error: "Error al iniciar sesión como invitado" });
    }
  }
  public async googleUserLogin(req: Request, res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      let existingUser = await GoogleUserModelMongoose.findOne({
        googleId: user.googleId,
      });

      if (!existingUser) {
        existingUser = new GoogleUserModelMongoose({
          googleId: user.googleId,
          userName: user.userName,
          email: user.email,
          profilePic: user.profilePic,
          isActive: true,
        });
        await existingUser.save();
      }

      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      res.cookie("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.cookie("userId", user.userId, { httpOnly: false });
      res.cookie("userName", user.userName, { httpOnly: false });

      res.redirect("/chat");
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      res.status(500).json({ error: "Error al iniciar sesión con Google" });
    }
  }
}
