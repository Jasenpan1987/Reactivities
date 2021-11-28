import { makeAutoObservable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { IUser, IUserFormValues } from "../models/User";
import { store } from "./store";

export default class UserStore {
  user: IUser | null = null;
  fbAccessToken: string | null = null;
  fbLoading = false;
  refreshTokenTimeout: any;

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
        this.startRefreshTokenTimer(user);
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
          this.startRefreshTokenTimer(user);
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
      this.startRefreshTokenTimer(user);
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
      await agent.Account.register(creds);
      runInAction(() => {
        history.push(`/account/registerSuccess?email=${creds.email}`);
        store.modalStore.closeModal();
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

  refreshToken = async () => {
    this.stopRefreshTokenTimer();
    try {
      const user = await agent.Account.refreshToken();
      runInAction(() => (this.user = user));
      store.commonStore.setToken(user.token);
      this.startRefreshTokenTimer(user);
    } catch (error) {
      console.log(error);
    }
  };

  private startRefreshTokenTimer(user: IUser) {
    const jwtToken = JSON.parse(atob(user.token.split(".")[1]));

    var expires = new Date(jwtToken.exp * 1000);
    // set the timer 30s before the actual expire time
    const timeout = expires.getTime() - Date.now() - 60 * 1000;

    this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
