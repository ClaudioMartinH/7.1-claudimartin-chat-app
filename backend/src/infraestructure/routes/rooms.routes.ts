import { Router } from "express";
import RoomController from "../controllers/RoomController.js";

const roomRouter = Router();
const roomController = new RoomController();

roomRouter.get("/all", roomController.getAllRooms);
roomRouter.post("/create", roomController.createRoom);
roomRouter.get("/id/:id", roomController.getRoomById);
roomRouter.get("/name/:name", roomController.getRoomByName);
roomRouter.post(
  "/private",

  roomController.privateConversationRoom
);

export default roomRouter;
