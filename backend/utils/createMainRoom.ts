import RoomModelMongoose from "../src/models/room.model.js";
export async function createMainRoom() {
  const mainRoomName = "Principal";
  try {
    const roomExists = await RoomModelMongoose.findOne({
      roomName: mainRoomName,
    });

    if (!roomExists) {
      const newRoom = new RoomModelMongoose({
        roomName: mainRoomName,
        messages: [],
      });
      await newRoom.save();
      console.log(`Sala '${mainRoomName}' creada correctamente.`);
    } else {
      console.log(`Sala '${mainRoomName}' ya existe.`);
    }
  } catch (error) {
    console.error("Error al inicializar la sala principal:", error);
  }
}
