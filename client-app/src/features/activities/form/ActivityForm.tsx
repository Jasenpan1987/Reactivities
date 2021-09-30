import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Button, FormField, Header, Label, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from "uuid";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/options/CategoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import { IActivity } from "../../../app/models/Activity";

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

  const [values, setValues] = useState<IActivity>({
    id: "",
    title: "",
    description: "",
    category: "",
    date: null,
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

  const handleFormSubmit = async (values: IActivity) => {
    console.log(values);
    if (values?.id) {
      await updateActivity(values);
      push(`/activities/${values.id}`);
    } else {
      let id = uuid();
      await createActivity({ ...values, id });
      push(`/activities/${id}`);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Activity title is required."),
    description: Yup.string().required("Activity description is required."),
    category: Yup.string().required(),
    date: Yup.string().required("Date is required.").nullable(),
    venue: Yup.string().required(),
    city: Yup.string().required(),
  });

  if (loadingInitial && id) {
    return <LoadingComponent content="Loading Activity..." />;
  }

  return (
    <Segment clearing>
      <Header content="Activity Details" sub color="teal" />
      <Formik
        enableReinitialize
        initialValues={values}
        onSubmit={(values: IActivity) => handleFormSubmit(values)}
        validationSchema={validationSchema}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          dirty,
        }) => (
          <Form
            className="ui form"
            autoComplete="false"
            onSubmit={handleSubmit}
          >
            <MyTextInput name="title" placeholder="Title" />
            <MyTextArea rows={3} placeholder="Description" name="description" />
            <MySelectInput
              options={categoryOptions}
              placeholder="Category"
              name="category"
            />
            <MyDateInput
              placeholderText="Date"
              name="date"
              showTimeSelect
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
            <Header content="Location Details" sub color="teal" />
            <MyTextInput placeholder="City" name="city" />
            <MyTextInput placeholder="Venue" name="venue" />
            <Button
              floated="right"
              type="submit"
              content="Submit"
              positive
              loading={loading}
              disabled={isSubmitting || !dirty || !isValid}
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
        )}
      </Formik>
    </Segment>
  );
};

export default observer(ActivityForm);
