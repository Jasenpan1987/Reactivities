import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Image } from "semantic-ui-react";
import { Profile } from "../../app/models/Profile";
import FollowButton from "./FollowButton";

interface IProps {
  profile: Profile;
}

const getShortenText = (numOfChars: number, text?: string) => {
  if (!text) {
    return null;
  }

  if (numOfChars >= text.length) {
    return text;
  }
  const words = text.split(" ");

  let newText = "";

  words.forEach((word) => {
    if (newText.length + word.length <= numOfChars) {
      newText += word + " ";
    }
  });
  return newText + "...";
};

export default observer(function ProfileCard({ profile }: IProps) {
  return (
    <Card as={Link} to={`/profiles/${profile.username}`}>
      <Image src={profile.image || "/assets/user.png"} />
      <Card.Content>
        <Card.Header>{profile.displayName}</Card.Header>
        <Card.Description>{getShortenText(40, profile.bio)}</Card.Description>
      </Card.Content>
      <Card.Content>
        <Icon name="user" />
        {profile.followerCount} followers
      </Card.Content>
      <FollowButton profile={profile} />
    </Card>
  );
});
