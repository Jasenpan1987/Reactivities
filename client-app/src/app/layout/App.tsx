import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Container } from "semantic-ui-react";
import { IActivity } from "../models/Activity";
import Navbar from "./Navbar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import agent from "../api/agent";
import LoadingComponent from "./LoadingComponent";

function App() {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<
    IActivity | undefined
  >();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadActivities = async () => {
    const activities = (await agent.Activities.list()).map((act) => ({
      ...act,
      date: act.date ? act.date.split("T")[0] : "",
    }));

    setActivities(activities);
    setLoading(false);
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

  const handleCreateOrEditActivity = async (activity: IActivity) => {
    setSubmitting(true);
    try {
      let activityForSave: IActivity = activity;
      if (activityForSave.id) {
        await agent.Activities.update(activityForSave.id, activityForSave);
        setActivities((prev) =>
          prev.map((act) =>
            act.id === activityForSave.id ? activityForSave : act
          )
        );
      } else {
        activityForSave.id = uuid();
        await agent.Activities.create(activityForSave);
        setActivities((prev) => [...prev, activityForSave]);
      }
      setEditMode(false);
      setSelectedActivity(activity);
    } catch (error) {
      console.log("unable to save:: ", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    setSubmitting(true);
    try {
      await agent.Activities.delete(id);
      setActivities((prev) => [...prev.filter((x) => x.id !== id)]);
    } catch (error) {
      console.log("unable to delete:: ", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

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
          submitting={submitting}
        />
      </Container>
    </>
  );
}

export default App;
