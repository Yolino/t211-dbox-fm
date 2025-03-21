import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import { useMutation, useQuery } from "@apollo/client";
import CREATE_PUBLICATION_MUTATION from "../graphql/createPublicationMutation.tsx";
import TAGS_QUERY from "../graphql/tagsQuery.ts";
import MainBlock from "./MainBlock.tsx";

const PublishButton = () => {
  const navigate = useNavigate();
  const { privileges } = usePrivileges();
  const [errorMessage, setErrorMessage] = useState("");
  const [mutate] = useMutation(CREATE_PUBLICATION_MUTATION);
  const { data, loading, error } = useQuery(TAGS_QUERY);

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

  const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPublication({
      ...publication,
      tag: Number(event.target.value),
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    mutate({
      variables: {
        audio: publication.audio,
        title: publication.title,
        tag: publication.tag,
        description: publication.description,
        cover: publication.cover,
      },
    }).then((response) => {
      const message = `You successfully published "${response?.data.createPublication.publication.title}"`;
        navigate("/", {state: { message }});
    }).catch((err) => {
      setErrorMessage(err.message);
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!privileges?.isLoggedIn) return <p>You cannot publish if you are not authentified</p>;

  return (
    <MainBlock>
      <h2 className="text-2xl font-bold text-white mb-6">Create a new publication</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Audio File</label>
          <input
            type="file"
            name="audio"
            required
            onChange={handleFileChange}
            className="mt-1 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Tag</label>
          <select
            name="tag"
            required
            onChange={handleTagChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a tag</option>
            {data.tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Cover Image</label>
          <input
            type="file"
            name="cover"
            onChange={handleFileChange}
            className="mt-1 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>
        {errorMessage && <p className="mb-4 text-sm text-red-600 text-center">{errorMessage}</p>}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Publish
          </button>
        </div>
      </form>
    </MainBlock>
  );
};

export default PublishButton;
