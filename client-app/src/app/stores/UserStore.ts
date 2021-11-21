import { makeAutoObservable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { IUser, IUserFormValues } from "../models/User";
import { store } from "./store";

export default class UserStore {
  user: IUser | null = null;
  fbAccessToken: string | null = null;
  fbLoading = false;

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

  facebookLogin = () => {
    this.fbLoading = true;

    const apiLogin = (accessToken: string) => {
      agent.Account.fbLogin(accessToken)
        .then((user) => {
          store.commonStore.setToken(user.token);
          runInAction(() => {
            this.user = user;
            this.fbLoading = false;
          });
          history.push("/activities");
        })
        .catch((error) => {
          this.fbLoading = false;
        });
    };

    if (this.fbAccessToken) {
      apiLogin(this.fbAccessToken);
    } else {
      window.FB.login(
        (response) => {
          apiLogin(response.authResponse.accessToken);
        },
        { scope: "public_profile,email" }
      );
    }
  };

  getFacebookLoginStatus = async () => {
    window.FB.getLoginStatus((response) => {
      if (response.status === "connected") {
        this.fbAccessToken = response.authResponse.accessToken;
      }
    });
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
