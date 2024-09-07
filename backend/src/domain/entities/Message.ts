export class Message {
  public _id!: string;
  public senderId!: string;
  public senderName: string;
  public content!: string;
  public roomName!: string;
  constructor(
    senderId: string,
    senderName: string,
    content: string,
    roomName: string
  ) {
    this.senderId = senderId;
    this.senderName = senderName;
    this.content = content;
    this.roomName = roomName;
  }
}
