import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Button, Form, Segment } from "semantic-ui-react";
import { IActivity } from "../../../app/models/Activity";
import { useStore } from "../../../app/stores/store";

const ActivityForm = () => {
  const {
    activityStore: {
      selectedActivity: activity,
      closeForm,
      loading,
      createActivity,
      updateActivity,
    },
  } = useStore();
  const initValues =
    activity ??
    ({
      title: "",
      description: "",
      category: "",
      date: "",
      city: "",
      venue: "",
    } as IActivity);

  const [values, setValues] = useState(initValues);

  const handleSubmit = async () => {
    activity?.id ? await updateActivity(values) : await createActivity(values);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit} autoComplete="false">
        <Form.Input
          placeholder="Title"
          value={values.title}
          name="title"
          onChange={handleChange}
        />
        <Form.TextArea
          placeholder="Description"
          value={values.description}
          name="description"
          onChange={handleChange}
        />
        <Form.Input
          placeholder="Category"
          value={values.category}
          name="category"
          onChange={handleChange}
        />
        <Form.Input
          placeholder="Date"
          type="date"
          value={values.date}
          name="date"
          onChange={handleChange}
        />
        <Form.Input
          placeholder="City"
          value={values.city}
          name="city"
          onChange={handleChange}
        />
        <Form.Input
          placeholder="Venue"
          value={values.venue}
          name="venue"
          onChange={handleChange}
        />
        <Button
          floated="right"
          type="submit"
          content="Submit"
          positive
          loading={loading}
        />
        <Button
          floated="right"
          type="button"
          content="Cancel"
          onClick={closeForm}
          disabled={loading}
        />
      </Form>
    </Segment>
  );
};

export default observer(ActivityForm);
