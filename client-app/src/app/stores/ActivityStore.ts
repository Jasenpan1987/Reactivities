import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { IActivity } from "../models/Activity";
import { v4 as uuid } from "uuid";

export default class ActivityStore {
  activityRegistry: Map<string, IActivity> = new Map();
  selectedActivity: IActivity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = true;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a1, a2) => Date.parse(a1.date) - Date.parse(a2.date)
    );
  }

  loadActivities = async () => {
    try {
      (await agent.Activities.list())
        .map((act) => ({
          ...act,
          date: act.date ? act.date.split("T")[0] : "",
        }))
        .forEach((act) => {
          this.activityRegistry.set(act.id, act);
        });
    } catch (error) {
      console.log("error initial load:: ", error);
    } finally {
      this.setLoadingInitial(false);
    }
  };

  setLoadingInitial = (isLoading: boolean) => {
    this.loadingInitial = isLoading;
  };

  selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
  };

  cancelSelectActivity = () => {
    this.selectedActivity = undefined;
  };

  openForm = (id?: string) => {
    id ? this.selectActivity(id) : this.cancelSelectActivity();
    this.editMode = true;
  };

  closeForm = () => {
    this.editMode = false;
  };

  createActivity = async (activity: IActivity) => {
    this.loading = true;
    activity.id = uuid();

    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
      });
    } catch (error) {
      console.log("Create failed");
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateActivity = async (activity: IActivity) => {
    this.loading = true;
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
      });
    } catch (error) {
      console.log("Update failed");
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  deleteActivity = async (id: string) => {
    this.loading = true;
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
        if (this.selectedActivity?.id === id) {
          this.selectedActivity = undefined;
        }
      });
    } catch (error) {
      console.log("Delete failed");
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}
