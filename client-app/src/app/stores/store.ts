import { createContext, useContext } from "react";
import ActivityStore from "./ActivityStore";

interface IStore {
  activityStore: ActivityStore;
}

export const store: IStore = {
  activityStore: new ActivityStore(),
};

export const StoreContext = createContext(store);

export const useStore = () => {
  return useContext(StoreContext);
};
