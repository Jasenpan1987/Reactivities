import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { history } from "../..";
import { IActivity } from "../models/Activity";
import { store } from "../stores/store";

const sleep = (delay: number) =>
  new Promise((resolve) => {
    return setTimeout(resolve, delay);
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
  post: <T>(url: string, body: T) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: T) => axios.put<T>(url, body).then(responseBody),
  del: (url: string) => axios.delete(url).then(responseBody),
};

const Activities = {
  list: () => request.get<IActivity[]>("/activities"),
  details: (id: string) => request.get<IActivity>(`/activities/${id}`),
  create: (activity: IActivity) =>
    request.post<IActivity>("/activities", activity),
  update: (activity: IActivity) =>
    request.put<IActivity>(`/activities/${activity.id}`, activity),
  delete: (id: string) => request.del(`/activities/${id}`),
};

const agent = {
  Activities,
};

export default agent;
