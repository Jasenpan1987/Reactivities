import { makeAutoObservable, reaction } from "mobx";
import { IServerError } from "../models/ServerError";

export default class CommonStore {
  error: IServerError | null | undefined;
  token: string | null = window.localStorage.getItem("jwt");
  appLoaded: boolean = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.token,
      (token) => {
        if (token) {
          localStorage.setItem("jwt", token);
        } else {
          localStorage.removeItem("jwt");
        }
      }
    );
  }

  setServerError = (error: IServerError) => {
    this.error = error;
  };

  setToken = (token: string | null) => {
    this.token = token;
  };

  setAppLoaded = () => {
    this.appLoaded = true;
  };
}
