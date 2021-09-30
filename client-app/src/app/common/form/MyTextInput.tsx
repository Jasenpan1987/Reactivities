import { useField } from "formik";
import React from "react";
import { Form, Label } from "semantic-ui-react";

interface IProps {
  placeholder: string;
  name: string;
  label?: string;
  type?: string;
}

export default function MyTextInput(props: IProps) {
  const [field, meta] = useField(props.name);
  return (
    <Form.Field error={!!meta.error && meta.touched}>
      <label>{props.label}</label>
      <input {...field} {...props} />
      {meta.touched && meta.error ? (
        <Label basic color="red">
          {meta.error}
        </Label>
      ) : null}
    </Form.Field>
  );
}
