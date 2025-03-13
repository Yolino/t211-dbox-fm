import React from "react";
import { useMutation } from "@apollo/client";
import CREATE_PUBLICATION_MUTATION from "../graphql/createPublicationMutation.tsx";

const PublishButton = () => {
  const [mutate] = useMutation(CREATE_PUBLICATION_MUTATION);
  const handleSubmit = () => {
    mutate({
      variables: {
        audio: file,
      },
    });
  }

  return (
    <div>
      <h2>Create a new publication</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" required />
        <input type="submit" />
      </form>
    </div>
  );
}

export default PublishButton;
