import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { history } from "../..";
import { ActivityFormValues, Activity } from "../models/Activity";
import { PaginatedResult } from "../models/Pagination";
import { Photo, Profile } from "../models/Profile";
import { IUser, IUserFormValues } from "../models/User";
import { UserActivity } from "../models/UserActivity";
import { store } from "../stores/store";

const sleep = (delay: number) =>
  new Promise((resolve) => {
    return setTimeout(resolve, delay);
  });

axios.interceptors.request.use(async (request) => {
  const token = store.commonStore.token;
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

axios.interceptors.response.use(
  async (response) => {
    if (process.env.NODE_ENV === "development") {
      await sleep(1000);
    }

    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = new PaginatedResult(
        response.data,
        JSON.parse(pagination)
      );

      return response as AxiosResponse<PaginatedResult<any>>;
    }
    return response;
  },
  (error: AxiosError) => {
    const { data, status, config } = error.response!;
    switch (status) {
      case 400:
        if (typeof data === "string") {
          toast.error(data);
        }

        if (config.method === "get" && data.errors.hasOwnProperty("id")) {
          history.push("/notfound");
        }

        if (data.errors) {
          const modelStateErrors = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }

          throw modelStateErrors.flat();
        }
        break;

      case 401:
        toast.error("Unauthorized");
        break;

      case 404:
        history.push("/notfound");
        break;

      case 500:
        store.commonStore.setServerError(JSON.parse(data));
        history.push("/servererror");
        break;

      default:
        return Promise.reject(error);
    }
  }
);

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const request = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const Activities = {
  list: (params: URLSearchParams) =>
    axios
      .get<PaginatedResult<Activity[]>>("/activities", {
        params,
      })
      .then(responseBody),
  details: (id: string) => request.get<Activity>(`/activities/${id}`),
  create: (activity: ActivityFormValues) =>
    request.post<ActivityFormValues>("/activities", activity),
  update: (activity: ActivityFormValues) =>
    request.put<ActivityFormValues>(`/activities/${activity.id}`, activity),
  delete: (id: string) => request.del<void>(`/activities/${id}`),
  attend: (id: string) => request.post<void>(`/activities/${id}/attend`, {}),
};

const Account = {
  current: () => request.get<IUser>("/account"),
  login: (user: IUserFormValues) => request.post<IUser>("/account/login", user),
  register: (user: IUserFormValues) =>
    request.post<IUser>("/account/register", user),
  fbLogin: (accessToken: string) =>
    request.post<IUser>(`/account/fbLogin?accessToken=${accessToken}`, {}),
};

const Profiles = {
  get: (username: string) => request.get<Profile>(`/profiles/${username}`),
  uploadPhoto: (file: Blob) => {
    let formData = new FormData();
    formData.append("File", file);
    return axios.post<Photo>("/photos", formData, {
      headers: { "Content-type": "multipart/form-data" },
    });
  },
  setMainPhoto: (photoId: string) =>
    request.post(`/photos/${photoId}/setmain`, {}),
  deletePhoto: (photoId: string) => request.del(`/photos/${photoId}`),
  updateProfile: (profile: Pick<Profile, "displayName" | "bio" | "username">) =>
    request.put(`/profiles`, {
      displayName: profile.displayName,
      bio: profile.bio,
    }),
  updateFollowing: (username: string) =>
    request.post(`/follow/${username}`, {}),
  listFollowings: (username: string, predicate: string) =>
    request.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
  listActivities: (username: string, predicate: string) =>
    request.get<UserActivity[]>(
      `/profiles/${username}/activities?predicate=${predicate}`
    ),
};

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
