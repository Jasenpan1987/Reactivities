import axios, { AxiosResponse } from "axios";
import { IActivity } from "../models/Activity";

const sleep = (delay: number) =>
  new Promise((resolve) => {
    return setTimeout(resolve, delay);
  });

axios.interceptors.response.use(async (response) => {
  await sleep(1000);
  return response;
});

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
