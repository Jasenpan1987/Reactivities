import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { makeAutoObservable, runInAction } from "mobx";
import { ChatComment } from "../models/Comment";
import { store } from "./store";

export default class CommentStore {
  comments: ChatComment[] = [];
  hubConnection: HubConnection | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  createHubConnection = (activityId: string) => {
    if (store.activityStore.selectedActivity) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_CHAT_URL}?activityId=${activityId}`, {
          accessTokenFactory: () => store.userStore.user!.token,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      this.hubConnection.start().catch((error) => {
        console.log("Error on hub conn: ", error);
      });

      this.hubConnection.on("LoadComments", (comments: ChatComment[]) => {
        runInAction(() => {
          this.comments = comments.map((comment) => ({
            ...comment,
            createdAt: new Date(`${comment.createdAt}Z`),
          }));
        });
      });

      this.hubConnection.on("ReceiveComment", (comment: ChatComment) => {
        runInAction(() => {
          this.comments.unshift({
            ...comment,
            createdAt: new Date(comment.createdAt),
          });
        });
      });
    }
  };

  stopHubConnection = () => {
    this.hubConnection?.stop().catch((error) => {
      console.log("error on stop hub connection: ", error);
    });
  };

  clearComments = () => {
    this.comments = [];
    this.stopHubConnection();
  };

  addComment = async (values: any) => {
    values.activityId = store.activityStore.selectedActivity?.id;
    try {
      await this.hubConnection?.invoke("SendComment", values);
    } catch (error) {
      console.log(error);
    }
  };
}
