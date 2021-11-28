import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import agent from "../../app/api/agent";
import useQueryString from "../../app/common/util/hooks";
import { useStore } from "../../app/stores/store";
import LoginForm from "./LoginForm";

export default function ConfirmEmail() {
  const { modalStore } = useStore();
  const email = useQueryString().get("email") as string;
  const token = useQueryString().get("token") as string;

  enum Status {
    Verifying = "Verifying",
    Failed = "Failed",
    Success = "Success",
  }

  const [status, setStatus] = useState<Status>(Status.Verifying);

  const handleConfirmResendEmail = async () => {
    try {
      await agent.Account.resendEmailConfirm(email);
      toast.success("verification email resend, please check your email");
    } catch (error) {
      toast.error("Unable to resend verification email.");
      console.log(error);
    }
  };

  useEffect(() => {
    agent.Account.verifyEmail(token, email)
      .then(() => {
        setStatus(Status.Success);
      })
      .catch((error) => {
        console.log(error);
        setStatus(Status.Failed);
      });
  }, [email, token, Status.Failed, Status.Success]);

  const getBody = () => {
    switch (status) {
      case Status.Verifying: {
        return <p>Verifying...</p>;
      }

      case Status.Failed: {
        return (
          <div>
            <p>Verification failed, you can try resend verification email.</p>
            <Button
              size="huge"
              primary
              content="Resend email"
              onClick={handleConfirmResendEmail}
            />
          </div>
        );
      }

      case Status.Success: {
        return (
          <div>
            <p>Email has been verified, you can login</p>
            <Button
              primary
              content="Sign In"
              size="huge"
              onClick={() => modalStore.openModal(<LoginForm />)}
            />
          </div>
        );
      }
    }
  };

  return (
    <Segment placeholder textAlign="center">
      <Header icon>
        <Icon name="envelope" /> Email Verification
      </Header>
      <Segment.Inline>{getBody()}</Segment.Inline>
    </Segment>
  );
}
