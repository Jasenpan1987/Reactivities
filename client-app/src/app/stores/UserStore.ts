import { makeAutoObservable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { IUser, IUserFormValues } from "../models/User";
import { store } from "./store";

export default class UserStore {
  user: IUser | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isLoggedIn() {
    return !!this.user;
  }

  login = async (creds: IUserFormValues) => {
    try {
      const user = await agent.Account.login(creds);
      runInAction(() => {
        store.commonStore.setToken(user.token);
        this.user = user;
        history.push("/activities");
      });
    } catch (error) {
      throw error;
    }
  };

  logout = () => {
    store.commonStore.setToken(null);
    this.user = null;
    history.push("/");
  };

  getUser = async () => {
    try {
      const user = await agent.Account.current();
      runInAction(() => {
        if (user) {
          this.user = user;
        }
      });
    } catch (error) {
      console.log("error:: ", error);
    }
  };

  register = async (creds: IUserFormValues) => {
    try {
      const user = await agent.Account.register(creds);
      runInAction(() => {
        store.commonStore.setToken(user.token);
        this.user = user;
        store.modalStore.closeModal();
        history.push("/activities");
      });
    } catch (error) {
      throw error;
    }
  };

  setImage = (image: string | undefined) => {
    if (this.user) {
      this.user.image = image;
    }
  };
}
