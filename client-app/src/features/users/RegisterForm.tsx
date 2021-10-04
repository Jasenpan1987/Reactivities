import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import React from "react";
import { Button, Header } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import * as Yup from "yup";
import ValidationErrors from "../errors/ValidationErrors";

export default observer(function RegisterForm() {
  const { userStore, modalStore } = useStore();

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        displayName: "",
        username: "",
        error: null,
      }}
      validationSchema={Yup.object({
        displayName: Yup.string().required(),
        username: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      })}
      onSubmit={(values, { setErrors }) => {
        return userStore
          .register(values)
          .then(() => {
            modalStore.closeModal();
          })
          .catch((errors: string[]) => {
            console.log("catch:: ", errors);
            setErrors({ error: errors.join("||") });
          });
      }}
    >
      {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
        <Form
          className="ui form error"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <Header
            as="h2"
            content="Sign up to Reactivities"
            color="teal"
            textAlign="center"
          />
          <MyTextInput name="username" placeholder="Username" />
          <MyTextInput name="displayName" placeholder="Display Name" />
          <MyTextInput name="email" placeholder="Email" />
          <MyTextInput name="password" placeholder="Password" type="password" />
          <ErrorMessage
            name="error"
            render={() => (
              <ValidationErrors errors={errors.error?.split("||") || []} />
            )}
          />
          <Button
            loading={isSubmitting}
            disabled={!isValid || !dirty || isSubmitting}
            positive
            content="Register"
            type="submit"
            fluid
          />
        </Form>
      )}
    </Formik>
  );
});
