import { IUser } from "./User";

export interface Profile {
  username: string;
  displayName: string;
  image?: string;
  bio?: string;
}

export class Profile implements Profile {
  constructor(user: IUser) {
    this.username = user.username;
    this.displayName = user.displayName;
    this.image = user.image;
  }
}
