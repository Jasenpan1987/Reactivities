import { makeAutoObservable, reaction, runInAction } from "mobx";
import { format } from "date-fns";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/Activity";
import { store } from "./store";
import { Profile } from "../models/Profile";
import { Pagination, PagingParams } from "../models/Pagination";

export enum PredicateKeys {
  all = "all",
  startDate = "startDate",
  isHost = "isHost",
  isGoing = "isGoing",
}

type PredicateValues = boolean | Date;

type PredicateMap = Map<PredicateKeys, PredicateValues>;

export default class ActivityStore {
  activityRegistry: Map<string, Activity> = new Map();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;
  pagination: Pagination | null = null;
  pagingParams = new PagingParams();
  predicate: PredicateMap = new Map().set(PredicateKeys.all, true);

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.predicate.keys(),
      () => {
        this.pagingParams = new PagingParams();
        this.activityRegistry.clear();
        this.loadActivities();
      }
    );
  }

  setPagingParams = (pagingParams: PagingParams) => {
    this.pagingParams = pagingParams;
  };

  setPredicate = (predicate: PredicateKeys, value: PredicateValues) => {
    const resetPredicate = () =>
      this.predicate.forEach((value, key) => {
        if (key !== PredicateKeys.startDate) {
          this.predicate.delete(key);
        }
      });
    switch (predicate) {
      case PredicateKeys.all: {
        resetPredicate();
        this.predicate.set(PredicateKeys.all, true);
        break;
      }

      case PredicateKeys.isGoing: {
        resetPredicate();
        this.predicate.set(PredicateKeys.isGoing, true);
        break;
      }

      case PredicateKeys.isHost: {
        resetPredicate();
        this.predicate.set(PredicateKeys.isHost, true);
        break;
      }

      case PredicateKeys.startDate: {
        this.predicate.delete(PredicateKeys.startDate);
        this.predicate.set(PredicateKeys.startDate, value);
        break;
      }
    }
  };

  get axiosParams() {
    const params = new URLSearchParams();
    params.append("pageNumber", this.pagingParams.pageNumber.toString());
    params.append("pageSize", this.pagingParams.pageSize.toString());

    this.predicate.forEach((value, key) => {
      if (key === PredicateKeys.startDate) {
        params.append(PredicateKeys.startDate, (value as Date).toISOString());
      } else {
        params.append(key, (value as boolean).toString());
      }
    });
    return params;
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
      }, {} as { [key: string]: Activity[] })
    );
  }

  loadActivities = async () => {
    this.setLoadingInitial(true);
    try {
      const { data, pagination } = await agent.Activities.list(
        this.axiosParams
      );
      const activities = data.map((act) => ({
        ...act,
        date: new Date(act.date!),
      }));

      runInAction(() => {
        activities.forEach((act) => {
          this.setActivity(act);
          this.setPagination(pagination);
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

  private setPagination = (pagination: Pagination) => {
    this.pagination = pagination;
  };

  private getActivityFromMemory = (id: string) => {
    return this.activityRegistry.get(id);
  };

  private setActivity = (activity: Activity) => {
    const { user } = store.userStore;
    if (user) {
      activity.isGoing = activity.attendees!.some(
        (a) => a.username === user.username
      );
      activity.isHost = activity.hostUsername === user.username;
      activity.host = activity.attendees?.find(
        (a) => a.username === activity.hostUsername
      );
    }

    activity.date = new Date(activity.date!);
    // console.log(activity);
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

  createActivity = async (activity: ActivityFormValues) => {
    const user = store.userStore.user;
    const attendee = new Profile(user!);
    const newActivity = new Activity(activity);
    newActivity.hostUsername = user!.username;
    newActivity.attendees = [attendee];
    this.setActivity(newActivity);
    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.selectedActivity = newActivity;
      });
    } catch (error) {
      console.log("Create failed");
    }
  };

  updateActivity = async (activity: ActivityFormValues) => {
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        if (activity.id) {
          let updatedActivity = {
            ...this.getActivityFromMemory(activity.id),
            ...activity,
          };
          this.activityRegistry.set(activity.id, updatedActivity as Activity);
          this.selectedActivity = updatedActivity as Activity;
        }
      });
    } catch (error) {
      console.log("Update failed");
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

  updateAttendance = async () => {
    const user = store.userStore.user;
    this.loading = true;

    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) {
          this.selectedActivity.attendees =
            this.selectedActivity.attendees?.filter(
              (a) => a.username !== user?.username
            );
          this.selectedActivity.isGoing = false;
        } else {
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }

        this.activityRegistry.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  cancelActivityToggle = async () => {
    this.loading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        this.selectedActivity!.isCancelled =
          !this.selectedActivity?.isCancelled;
        this.activityRegistry.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  clearSelectedActivity = () => {
    this.selectedActivity = undefined;
  };

  updateAttendeeFollowing = (username: string) => {
    this.activityRegistry.forEach((activity) => {
      activity.attendees.forEach((attendee) => {
        if (attendee.username === username) {
          attendee.following
            ? (attendee.followerCount -= 1)
            : (attendee.followerCount += 1);
          attendee.following = !attendee.following;
        }
      });
    });
  };
}
