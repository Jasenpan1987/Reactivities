import { Formik } from "formik";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Button, Form, Header, Icon, Segment } from "semantic-ui-react";
import MyTextArea from "../../app/common/form/MyTextArea";
import MyTextInput from "../../app/common/form/MyTextInput";
import { Profile } from "../../app/models/Profile";
import { useStore } from "../../app/stores/store";

interface IProps {
  profile: Profile;
}

interface IProfile {
  displayName: string;
  bio: string;
}

export default observer(function ProfileAbout({ profile }: IProps) {
  const {
    profileStore: { loading, updateProfile },
  } = useStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSubmit = async ({ bio, displayName }: IProfile) => {
    await updateProfile({ bio, displayName, username: profile.username });
    setIsEditMode(false);
  };

  return (
    <Segment clearing>
      <Segment clearing>
        <Header floated="left">
          <Icon name="user" /> About {profile.displayName}
        </Header>
        {isEditMode ? (
          <Button
            content="Cancel"
            floated="right"
            color="grey"
            onClick={() => setIsEditMode(!isEditMode)}
          />
        ) : (
          <Button
            content="Edit"
            floated="right"
            color="green"
            primary
            onClick={() => setIsEditMode(!isEditMode)}
          />
        )}
      </Segment>
      {isEditMode ? (
        <Segment clearing>
          <Formik<IProfile>
            initialValues={{
              bio: profile.bio || "",
              displayName: profile.displayName || "",
            }}
            onSubmit={(values: IProfile) => handleSubmit(values)}
          >
            {({
              values,
              isSubmitting,
              errors,
              dirty,
              isValid,
              resetForm,
              handleSubmit,
            }) => {
              return (
                <Form
                  className="ui form"
                  autoComplete="false"
                  onSubmit={handleSubmit}
                >
                  <MyTextInput name="displayName" placeholder="Display Name" />
                  <MyTextArea name="bio" placeholder="Bio" rows={5} />

                  <Button
                    floated="right"
                    type="submit"
                    content="Submit"
                    positive
                    loading={loading}
                    disabled={isSubmitting || !dirty || !isValid}
                  />
                  <Button
                    floated="right"
                    type="button"
                    content="Cancel"
                    disabled={loading}
                    onClick={() => {
                      resetForm();
                      setIsEditMode(false);
                    }}
                  />
                </Form>
              );
            }}
          </Formik>
        </Segment>
      ) : (
        <>
          {profile.bio?.split("\n").map((bio, idx) => (
            <p key={idx}>{bio}</p>
          ))}
        </>
      )}
    </Segment>
  );
});
