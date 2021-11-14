import { observer } from "mobx-react-lite";
import React from "react";
import { Tab } from "semantic-ui-react";
import { Profile } from "../../app/models/Profile";
import { useStore } from "../../app/stores/store";
import ProfileAbout from "./ProfileAbout";
import ProfileFollowings from "./ProfileFollowings";
import ProfilePhotos from "./ProfilePhotos";

interface IProps {
  profile: Profile;
}

export default observer(function ProfileContent({ profile }: IProps) {
  const { profileStore } = useStore();
  const panes = [
    { menuItem: "About", render: () => <ProfileAbout profile={profile} /> },
    { menuItem: "Photos", render: () => <ProfilePhotos profile={profile} /> },
    { menuItem: "Event", render: () => <Tab.Pane>Event Content</Tab.Pane> },
    {
      menuItem: "Followers",
      render: () => <ProfileFollowings />,
    },
    {
      menuItem: "Following",
      render: () => <ProfileFollowings />,
    },
  ];

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition="right"
      panes={panes}
      onTabChange={(e, data) => {
        profileStore.setActiveTab(data.activeIndex);
      }}
    />
  );
});
