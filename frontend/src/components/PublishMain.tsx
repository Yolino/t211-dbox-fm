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
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
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
          <input
            type="number"
            name="tag"
            placeholder="Tag"
            required
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  );
};


export default PublishButton;
