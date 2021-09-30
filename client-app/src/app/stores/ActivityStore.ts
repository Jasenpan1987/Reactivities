import { makeAutoObservable, runInAction } from "mobx";
import { format } from "date-fns";
import agent from "../api/agent";
import { IActivity } from "../models/Activity";

export default class ActivityStore {
  activityRegistry: Map<string, IActivity> = new Map();
  selectedActivity: IActivity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort((a1, a2) => {
      return a1.date!.getTime() - a2.date!.getTime();
    });
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, "dd MMM yyyy");
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
        date: new Date(act.date!),
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
    activity.date = new Date(activity.date!);
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
