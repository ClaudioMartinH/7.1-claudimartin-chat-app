import { Router } from "express";
import MessageController from "../controllers/MessageController.js";

const messageRouter = Router();
const messageController = new MessageController();

messageRouter.get("/all", messageController.getAllMessages);
messageRouter.get("/rooms/messages/:name", messageController.getRoomMessages);
messageRouter.get("/users/messages/:id", messageController.getUserMessages);
messageRouter.post("/create", messageController.createMessage);
messageRouter.delete("/messages/delete/:id", messageController.deleteMessage);
messageRouter.delete("/users/delete/:id", messageController.deleteMessage);

export default messageRouter;
