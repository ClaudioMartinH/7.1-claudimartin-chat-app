import { Message } from "./Message.js";
import { User } from "./User.js";

export class Room {
  public id!: string;
  public participants: User[] = [];
  public messages: Message[] = [];
  public roomName: string;
  public isPrivate: boolean = false;

  constructor(
    participants: User[],
    messages: Message[],
    roomName: string,
    isPrivate: boolean = false
  ) {
    this.participants = participants;
    this.messages = messages;
    this.roomName = roomName;
    this.isPrivate = isPrivate;
  }

  sendMessage(message: Message): void {
    this.messages.push(message);
  }
  addParticipant(user: User): void {
    this.participants.push(user);
  }
  removeParticipant(userId: string): void {
    this.participants = this.participants.filter(
      (participant) => participant.id !== userId
    );
  }
}
