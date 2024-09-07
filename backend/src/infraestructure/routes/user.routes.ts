import { Router } from "express";
import UserController from "../controllers/UserController.js";
import multer from "multer";
import passport from "../../../utils/passport.config.js";
import authMiddlewareJWT from "../../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";

const userRouter = Router();
const userController = new UserController();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

userRouter.get("/all", userController.getUsers);
userRouter.get("/search/id/:id", userController.getUserById);
userRouter.get("/search/userName/:userName", userController.getUserByUserName);
userRouter.post("/login", userController.login);
userRouter.post(
  "/signup",
  upload.single("profilePic"),
  userController.createUser
);
userRouter.post("/guest-login", userController.guestUserLogin);
userRouter.post("/logout", userController.logout);
userRouter.put(
  "/update/:id",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  userController.updateUser
);

userRouter.delete("/delete/:id", userController.deleteUser);

export default userRouter;
