import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Photo, Profile } from "../models/Profile";
import { UserActivity } from "../models/UserActivity";
import { store } from "./store";

export default class ProfileStore {
  profile: Profile | null = null;
  loadingProfile: boolean = false;
  uploading: boolean = false;
  loading: boolean = false;
  loadingFollowings: boolean = false;
  followings: Profile[] = [];
  activities: UserActivity[] = [];
  loadingActivities = false;
  activeTab = 0;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? "followers" : "following";
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }

  setActiveTab = (activeTab: any) => {
    this.activeTab = activeTab;
  };

  get isCurrentUser() {
    if (store.userStore.user && this.profile) {
      return store.userStore.user.username === this.profile.username;
    }
    return false;
  }

  loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
      });
    } catch (error) {
      console.log("error:: ", error);
    } finally {
      runInAction(() => {
        this.loadingProfile = false;
      });
    }
  };

  uploadPhoto = async (file: Blob) => {
    this.uploading = true;
    try {
      const response = await agent.Profiles.uploadPhoto(file);
      const photo = response.data;
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo);
          if (photo.isMain && store.userStore.user) {
            store.userStore.setImage(photo.url);
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.uploading = false));
    }
  };

  setMainPhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.forEach((photo) => {
            if (photo.isMain) {
              photo.isMain = false;
            }
          });
          photo.isMain = true;
          this.profile.image = photo.url;
          store.userStore.setImage(photo.url);
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  deletePhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      const photoId = photo.id;
      await agent.Profiles.deletePhoto(photoId);
      runInAction(() => {
        if (this.profile) {
          this.profile.image = undefined;
          this.profile.photos = this.profile.photos?.filter(
            (photo) => photo.id !== photoId
          );
          store.userStore.setImage(undefined);
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateProfile = async (
    profile: Pick<Profile, "displayName" | "bio" | "username">
  ) => {
    this.loading = true;
    try {
      await agent.Profiles.updateProfile(profile);
      runInAction(() => {
        this.profile!.displayName = profile.displayName;
        this.profile!.bio = profile.bio || this.profile!.bio;

        store.userStore.user!.displayName = profile.displayName;
        store.activityStore.activityRegistry.forEach((activity) => {
          activity.attendees.forEach((attendee) => {
            if (attendee.username === profile.username) {
              attendee.displayName = profile.displayName;
              attendee.bio = profile.bio || attendee.bio;
            }
          });
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateFollowing = async (username: string, following: boolean) => {
    this.loading = true;
    try {
      await agent.Profiles.updateFollowing(username);
      store.activityStore.updateAttendeeFollowing(username);
      runInAction(() => {
        if (
          this.profile &&
          this.profile.username !== store.userStore.user?.username &&
          this.profile.username === username
        ) {
          following
            ? (this.profile.followerCount += 1)
            : (this.profile.followerCount -= 1);
          this.profile.following = !this.profile.following;
        }

        if (
          this.profile &&
          this.profile.username === store.userStore.user?.username
        ) {
          following
            ? (this.profile.followingCount += 1)
            : (this.profile.followingCount -= 1);
        }

        this.followings.forEach((profile) => {
          if (profile.username === username) {
            profile.following
              ? (profile.followerCount -= 1)
              : (profile.followerCount += 1);
            profile.following = !profile.following;
          }
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  loadFollowings = async (predicate: string) => {
    this.loadingFollowings = true;
    try {
      const followings = await agent.Profiles.listFollowings(
        this.profile!.username,
        predicate
      );
      runInAction(() => {
        this.followings = followings;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loadingFollowings = false));
    }
  };

  loadUserActivities = async (username: string, predicate: string) => {
    this.loadingActivities = false;
    try {
      const activities = await agent.Profiles.listActivities(
        username,
        predicate
      );
      this.activities = activities;
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loadingActivities = false));
    }
  };
}
