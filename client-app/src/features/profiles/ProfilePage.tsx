import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

export default observer(function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const {
    profileStore: { loadProfile, loadingProfile, profile, setActiveTab },
  } = useStore();

  useEffect(() => {
    loadProfile(username);
    return () => {
      setActiveTab(0);
    };
  }, [username, loadProfile, setActiveTab]);

  if (loadingProfile) {
    return <LoadingComponent content="Loading content..." />;
  }
  return (
    <Grid>
      <Grid.Column width="16">
        {profile && <ProfileHeader profile={profile} />}
        {profile && <ProfileContent profile={profile} />}
      </Grid.Column>
    </Grid>
  );
});
