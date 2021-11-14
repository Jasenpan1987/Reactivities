import { observer } from "mobx-react-lite";
import React, { SyntheticEvent } from "react";
import { Button, Reveal } from "semantic-ui-react";
import { Profile } from "../../app/models/Profile";
import { useStore } from "../../app/stores/store";

interface IProps {
  profile: Profile;
}

export default observer(function FollowButton({ profile }: IProps) {
  const { profileStore, userStore } = useStore();
  const { loading, updateFollowing } = profileStore;

  const handleFollow = (e: SyntheticEvent, username: string) => {
    e.preventDefault();
    profile.following
      ? updateFollowing(username, false)
      : updateFollowing(username, true);
  };

  if (userStore.user?.username === profile.username) {
    return null;
  }

  return (
    <Reveal animated="move">
      <Reveal.Content visible style={{ width: "100%" }}>
        <Button
          fluid
          color="teal"
          content={profile.following ? "Following" : "Not following"}
        />
      </Reveal.Content>
      <Reveal.Content hidden style={{ width: "100%" }}>
        <Button
          fluid
          basic
          color={profile.following ? "red" : "green"}
          content={profile.following ? "Unfollow" : "Following"}
          loading={loading}
          onClick={(e) => handleFollow(e, profile.username)}
        />
      </Reveal.Content>
    </Reveal>
  );
});
