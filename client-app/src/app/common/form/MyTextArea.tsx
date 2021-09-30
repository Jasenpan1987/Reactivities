import { useField } from "formik";
import React from "react";
import { Form, Label } from "semantic-ui-react";

interface IProps {
  placeholder: string;
  name: string;
  label?: string;
  rows: number;
}

export default function MyTextArea(props: IProps) {
  const [field, meta] = useField(props.name);
  return (
    <Form.Field error={!!meta.error && meta.touched}>
      <label>{props.label}</label>
      <textarea {...field} {...props} />
      {meta.touched && meta.error ? (
        <Label basic color="red">
          {meta.error}
        </Label>
      ) : null}
    </Form.Field>
  );
}
