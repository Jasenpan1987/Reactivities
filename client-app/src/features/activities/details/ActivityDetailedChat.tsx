import { Formik, Form, Field, FieldProps } from "formik";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { Segment, Header, Comment, Loader } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { formatDistanceToNow } from "date-fns";

interface IProps {
  activityId: string;
}

export default observer(function ActivityDetailedChat({ activityId }: IProps) {
  const { commentStore } = useStore();

  useEffect(() => {
    if (activityId) {
      commentStore.createHubConnection(activityId);
    }
    return () => {
      commentStore.clearComments();
    };
  }, [commentStore, activityId]);

  return (
    <>
      <Segment
        textAlign="center"
        attached="top"
        inverted
        color="teal"
        style={{ border: "none" }}
      >
        <Header>Chat about this event</Header>
      </Segment>
      <Segment attached clearing>
        <Formik<{ body: string }>
          initialValues={{ body: "" }}
          onSubmit={async (values, { resetForm }) => {
            console.log("xxxxx");
            await commentStore.addComment(values);
            resetForm();
          }}
          validationSchema={Yup.object({ body: Yup.string().required() })}
        >
          {({ isSubmitting, isValid, handleSubmit, errors }) => {
            return (
              <Form className="ui-form">
                <Field name="body">
                  {({ field }: FieldProps) => (
                    <div style={{ position: "relative" }}>
                      <Loader active={isSubmitting} />
                      <textarea
                        style={{ width: "100%" }}
                        placeholder="Enter your comment (ENTER to submit, SHIFT + ENTER for new line)"
                        rows={4}
                        {...field}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.shiftKey) {
                            return;
                          }
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (isValid) {
                              handleSubmit();
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </Field>
              </Form>
            );
          }}
        </Formik>
        <Comment.Group>
          {commentStore.comments.map((comment) => {
            return (
              <Comment key={comment.id}>
                <Comment.Avatar src={comment.image || "/assets/user.png"} />
                <Comment.Content>
                  <Comment.Author
                    as={Link}
                    to={`/profiles/${comment.username}`}
                  >
                    {comment.displayName}
                  </Comment.Author>
                  <Comment.Metadata>
                    <div>{formatDistanceToNow(comment.createdAt)} ago</div>
                  </Comment.Metadata>
                  <Comment.Text style={{ whiteSpace: "pre-wrap" }}>
                    {comment.body}
                  </Comment.Text>
                </Comment.Content>
              </Comment>
            );
          })}
        </Comment.Group>
      </Segment>
    </>
  );
});
