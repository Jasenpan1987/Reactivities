import React from "react";
import { Message } from "semantic-ui-react";

interface IProps {
  errors: string[];
}

export default function ValidationErrors({ errors }: IProps) {
  return (
    <Message error>
      {errors && (
        <Message.List>
          {errors.map((err, idx) => (
            <Message.Item key={idx}>{err}</Message.Item>
          ))}
        </Message.List>
      )}
    </Message>
  );
}
