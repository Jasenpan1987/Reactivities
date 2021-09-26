import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Button, Form, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from "uuid";

const ActivityForm = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useHistory();
  const {
    activityStore: {
      loading,
      loadingInitial,
      createActivity,
      updateActivity,
      loadActivity,
    },
  } = useStore();

  const [values, setValues] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    date: "",
    city: "",
    venue: "",
  });

  useEffect(() => {
    if (id) {
      loadActivity(id).then((activity) => {
        setValues(activity!);
      });
    }
  }, [id, loadActivity]);

  const handleSubmit = async () => {
    if (values?.id) {
      await updateActivity(values);
      push(`/activities/${values.id}`);
    } else {
      let id = uuid();
      await createActivity({ ...values, id });
      push(`/activities/${id}`);
    }
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

  if (loadingInitial && id) {
    return <LoadingComponent content="Loading Activity..." />;
  }

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
          disabled={loading}
          as={Link}
          to={id ? `/activities/${id}` : "activities"}
        />
      </Form>
    </Segment>
  );
};

export default observer(ActivityForm);
