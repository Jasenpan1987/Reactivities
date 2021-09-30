import { useField } from "formik";
import React from "react";
import { Form, Label, Select } from "semantic-ui-react";

interface IProps {
  placeholder: string;
  name: string;
  label?: string;
  options: any;
}

export default function MySelectInput(props: IProps) {
  const [field, meta, helpers] = useField(props.name);
  return (
    <Form.Field error={!!meta.error && meta.touched}>
      <label>{props.label}</label>
      <Select
        clearable
        options={props.options}
        value={field.value || null}
        onChange={(e, data) => {
          helpers.setValue(data.value);
        }}
        onBlur={() => {
          helpers.setTouched(true);
        }}
        placeholder={props.placeholder}
      />
      {meta.touched && meta.error ? (
        <Label basic color="red">
          {meta.error}
        </Label>
      ) : null}
    </Form.Field>
  );
}
