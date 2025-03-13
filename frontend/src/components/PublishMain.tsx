import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import CREATE_PUBLICATION_MUTATION from "../graphql/createPublicationMutation.tsx";

const PublishButton = () => {
  const [mutate] = useMutation(CREATE_PUBLICATION_MUTATION);

  const [publication, setPublication] = useState({
    audio: null as File | null,
    title: "",
    tag: NaN,
    description: "",
    cover: null as File | null,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPublication({
      ...publication,
      [event.target.name]: event.target.type === "number" ? Number(event.target.value) : event.target.value,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPublication({
        ...publication,
        [event.target.name]: event.target.files[0],
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    mutate({
      variables: {
        audio: publication.audio,
        title: publication.title,
        tag: publication.tag,
        description: publication.description,
        cover: publication.cover,
      },
    });
  };

  return (
    <div>
      <h2>Create a new publication</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" name="audio" required onChange={handleFileChange} />
        <input type="text" name="title" placeholder="Title" required onChange={handleInputChange} />
        <input type="number" name="tag" placeholder="Tag" required onChange={handleInputChange} />
        <input type="text" name="description" placeholder="Description" onChange={handleInputChange} />
        <input type="file" name="cover" onChange={handleFileChange} />
        <input type="submit" value="Publish" />
      </form>
    </div>
  );
};

export default PublishButton;
