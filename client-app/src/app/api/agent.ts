import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { history } from "../..";
import { ActivityFormValues, Activity } from "../models/Activity";
import { Photo, Profile } from "../models/Profile";
import { IUser, IUserFormValues } from "../models/User";
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
    await sleep(1000);
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

axios.defaults.baseURL = "http://localhost:5000/api";

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const request = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const Activities = {
  list: () => request.get<Activity[]>("/activities"),
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
};

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
