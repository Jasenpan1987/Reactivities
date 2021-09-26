import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Grid, List } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityFilters from "./ActivityFilters";
import ActivityList from "./ActivityList";

const ActivityDashboard = () => {
  const {
    activityStore: { loadActivities, loadingInitial, activityRegistry },
  } = useStore();

  useEffect(() => {
    if (activityRegistry.size <= 1) {
      loadActivities();
    }
  }, [loadActivities, activityRegistry.size]);

  if (loadingInitial) {
    return <LoadingComponent />;
  }
  return (
    <Grid>
      <Grid.Column width={10}>
        <List>
          <ActivityList />
        </List>
      </Grid.Column>
      <Grid.Column width={6}>
        <ActivityFilters />
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityDashboard);
