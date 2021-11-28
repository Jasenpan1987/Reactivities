import React from "react";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import agent from "../../app/api/agent";
import useQueryString from "../../app/common/util/hooks";

export default function RegisterSuccess() {
  const email = useQueryString().get("email") as string;

  const handleConfirmResendEmail = async () => {
    try {
      await agent.Account.resendEmailConfirm(email);
      toast.success("verification email resend, please check your email");
    } catch (error) {
      toast.error("Unable to resend verification email.");
      console.log(error);
    }
  };
  return (
    <Segment placeholder textAlign="center">
      <Header icon color="green">
        <Icon name="check" />
        Register success!
      </Header>
      <p>
        Please check your email including junk mail for the verification email
      </p>
      {email && (
        <>
          <p>Didn't receive the email? Click the button to resend</p>
          <Button
            primary
            onClick={handleConfirmResendEmail}
            content="Resend Email"
            size="huge"
          />
        </>
      )}
    </Segment>
  );
}
