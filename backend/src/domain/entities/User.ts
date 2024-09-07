export class User {
  public id: string;
  public googleId?: string;
  public userName: string;
  public password: string;
  public fullName: string;
  public email: string;
  public profilePic: string;
  public userType: "registered" | "guest" | "google";
  isActive: boolean;
  rooms: string[];

  constructor(
    id: string,
    userName: string,
    password: string,
    fullName: string,
    email: string,
    profilePic: string,
    isActive: boolean,
    userType: "registered" | "guest" | "google",
    googleId?: string
  ) {
    this.id = id;
    this.userName = userName;
    this.password = password;
    this.fullName = fullName;
    this.email = email;
    this.isActive = isActive;
    this.userType = userType;
    this.profilePic = profilePic;
    this.rooms = [];
    if (googleId) {
      this.googleId = googleId;
    }
  }
  toggleIsActive() {
    this.isActive = !this.isActive;
  }
}
