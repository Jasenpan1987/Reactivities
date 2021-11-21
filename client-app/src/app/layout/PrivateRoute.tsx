import React, { ComponentType } from "react";
import { Redirect, RouteComponentProps, RouteProps } from "react-router";
import { Route } from "react-router-dom";
import { useStore } from "../stores/store";

interface IProps extends RouteProps {
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any>;
}

export default function PrivateRoute({
  component: Component,
  ...rest
}: IProps) {
  const {
    userStore: { isLoggedIn },
  } = useStore();
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
}
