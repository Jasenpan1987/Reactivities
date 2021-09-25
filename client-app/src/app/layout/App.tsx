import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { Container } from "semantic-ui-react";
import { IActivity } from "../models/Activity";
import Navbar from "./Navbar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";

function App() {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<
    IActivity | undefined
  >();
  const [editMode, setEditMode] = useState(false);

  const loadActivities = async () => {
    const response = await axios.get<IActivity[]>(
      "http://localhost:5000/api/Activities"
    );
    setActivities(response.data);
  };

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.find((act) => act.id === id));
  };

  const handleCancelSelectActivity = () => {
    setSelectedActivity(undefined);
  };

  const handleFormOpen = (id?: string) => {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  };

  const handleFormClose = () => {
    setEditMode(false);
  };

  const handleCreateOrEditActivity = (activity: IActivity) => {
    activity.id
      ? setActivities((prev) => [
          ...prev.filter((x) => x.id !== activity.id),
          activity,
        ])
      : setActivities((prev) => [...prev, { ...activity, id: uuid() }]);

    setEditMode(false);
    setSelectedActivity(activity);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => [...prev.filter((x) => x.id !== id)]);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <>
      <Navbar openForm={handleFormOpen} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard
          activities={activities}
          selectedActivity={selectedActivity}
          selectActivity={handleSelectActivity}
          cancelSelectActivity={handleCancelSelectActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEdit={handleCreateOrEditActivity}
          deleteActivity={handleDeleteActivity}
        />
      </Container>
    </>
  );
}

export default App;
