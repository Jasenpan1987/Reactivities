import React, { useEffect } from "react";
import { Container } from "semantic-ui-react";
import Navbar from "./Navbar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import { observer } from "mobx-react-lite";
import HomePage from "../../features/home/HomePage";
import { Route, Switch, useLocation } from "react-router";
import ActivityForm from "../../features/activities/form/ActivityForm";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import TestErrors from "../../features/errors/TestError";
import { ToastContainer } from "react-toastify";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";
import { useStore } from "../stores/store";
import LoadingComponent from "./LoadingComponent";
import ModalContainer from "../common/modals/ModalContainer";
import ProfilePage from "../../features/profiles/ProfilePage";
import PrivateRoute from "./PrivateRoute";

function App() {
  const location = useLocation();
  const { commonStore, userStore } = useStore();
  useEffect(() => {
    if (commonStore.token) {
      userStore.getUser().finally(() => {
        commonStore.setAppLoaded();
      });
    } else {
      commonStore.setAppLoaded();
    }
  }, [commonStore, userStore]);

  if (!commonStore.appLoaded) {
    return <LoadingComponent content="Loading App..." />;
  }

  return (
    <>
      <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
      <ModalContainer />
      <Route exact path="/" component={HomePage} />
      <Route
        path={"/(.+)"}
        render={() => (
          <>
            <Navbar />
            <Container style={{ marginTop: "7em" }}>
              <Switch>
                <PrivateRoute
                  exact
                  path="/activities"
                  component={ActivityDashboard}
                />
                <PrivateRoute
                  exact
                  path="/activities/:id"
                  component={ActivityDetails}
                />
                <PrivateRoute
                  exact
                  path={["/createActivity", "/manage/:id"]}
                  component={ActivityForm}
                  key={location.key}
                />
                <PrivateRoute
                  exact
                  path="/profiles/:username"
                  component={ProfilePage}
                />
                <Route exact path="/errors" component={TestErrors} />
                <Route path="/servererror" component={ServerError} />
                <Route component={NotFound} />
              </Switch>
            </Container>
          </>
        )}
      />
    </>
  );
}

export default observer(App);
