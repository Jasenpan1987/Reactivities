import React, { useState } from "react";
import { Button, Form, Segment } from "semantic-ui-react";
import { IActivity } from "../../../app/models/Activity";

interface IProps {
  activity?: IActivity;
  closeForm: () => void;
  createOrEdit: (activity: IActivity) => void;
}

export default function ActivityForm({
  createOrEdit,
  activity,
  closeForm,
}: IProps) {
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

  const handleSubmit = () => {
    createOrEdit(values);
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
        <Button floated="right" type="submit" content="Submit" positive />
        <Button
          floated="right"
          type="button"
          content="Cancel"
          onClick={closeForm}
        />
      </Form>
    </Segment>
  );
}
