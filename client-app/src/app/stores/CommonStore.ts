import { makeAutoObservable } from "mobx";
import { IServerError } from "../models/ServerError";

export default class CommonStore {
  error: IServerError | null | undefined;

  constructor() {
    makeAutoObservable(this);
  }

  setServerError = (error: IServerError) => {
    this.error = error;
  };
}
