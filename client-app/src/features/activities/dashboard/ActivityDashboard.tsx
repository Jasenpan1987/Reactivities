import React from "react";
import { Grid, List } from "semantic-ui-react";
import { IActivity } from "../../../app/models/Activity";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";
import ActivityList from "./ActivityList";

interface IProps {
  activities: IActivity[];
  selectedActivity?: IActivity;
  selectActivity: (id: string) => void;
  cancelSelectActivity: () => void;
  editMode: boolean;
  openForm: (id: string) => void;
  closeForm: () => void;
  createOrEdit: (activity: IActivity) => void;
  deleteActivity: (id: string) => void;
}

const ActivityDashboard = ({
  activities,
  selectedActivity,
  selectActivity,
  cancelSelectActivity,
  editMode,
  openForm,
  closeForm,
  createOrEdit,
  deleteActivity,
}: IProps) => {
  return (
    <Grid>
      <Grid.Column width={10}>
        <List>
          <ActivityList
            activities={activities}
            selectedActivity={selectedActivity}
            selectActivity={selectActivity}
            deleteActivity={deleteActivity}
          />
        </List>
      </Grid.Column>
      <Grid.Column width={6}>
        {selectedActivity && !editMode && (
          <ActivityDetails
            activity={selectedActivity}
            cancelSelectActivity={cancelSelectActivity}
            openForm={openForm}
          />
        )}
        {editMode && (
          <ActivityForm
            closeForm={closeForm}
            activity={selectedActivity}
            createOrEdit={createOrEdit}
          />
        )}
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDashboard;
