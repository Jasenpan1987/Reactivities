import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { IActivity } from "../models/Activity";

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

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const { date } = activity;
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: IActivity[] })
    );
  }

  loadActivities = async () => {
    try {
      const activities = (await agent.Activities.list()).map((act) => ({
        ...act,
        date: act.date ? act.date.split("T")[0] : "",
      }));

      runInAction(() => {
        activities.forEach((act) => {
          this.activityRegistry.set(act.id, act);
        });
      });
    } catch (error) {
      console.log("error initial load:: ", error);
    } finally {
      runInAction(() => {
        this.setLoadingInitial(false);
      });
    }
  };

  private getActivityFromMemory = (id: string) => {
    return this.activityRegistry.get(id);
  };

  private setActivity = (activity: IActivity) => {
    activity.date = activity.date.split("T")[0];
    this.activityRegistry.set(activity.id, activity);
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivityFromMemory(id);
    if (activity) {
      this.selectedActivity = activity;
    } else {
      this.setLoadingInitial(true);
      try {
        activity = await agent.Activities.details(id);
        runInAction(() => {
          this.setActivity(activity!);
          this.selectedActivity = activity;
        });
      } catch (error) {
        console.log("Unable to get activity");
      } finally {
        runInAction(() => {
          this.setLoadingInitial(false);
        });
      }
    }
    return activity;
  };

  setLoadingInitial = (isLoading: boolean) => {
    this.loadingInitial = isLoading;
  };

  createActivity = async (activity: IActivity) => {
    this.loading = true;

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
