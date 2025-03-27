import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import TAGS_QUERY from "../../graphql/tagsQuery.ts";
import UPDATE_PUBLICATION_MUTATION from "../../graphql/updatePublicationMutation.ts";
import DELETE_PUBLICATION_MUTATION from "../../graphql/deletePublicationMutation.ts";
import GET_MEDIA from "../../context/mediaUrl.ts";
import DeletePublicationCard from "./DeletePublicationCard.tsx";
import EditIcon from "../../svg/EditIcon.tsx";
import DeleteIcon from "../../svg/DeleteIcon.tsx";

interface Publication {
  id: number;
  title: string;
  cover: string;
  viewCount: number;
  voteCount: number;
};

interface ProfileTileProps {
  publication: Publication;
  index: number;
  isSelf: boolean;
  onEdit: () => void;
  isExpanded: boolean;
  onDeletePublication: () => void;
};

const ProfileTile = ({ publication, index, isSelf, onEdit, isExpanded, onProfileUpdate }: ProfileTileProps) => {
  const [isDeleteCardOpen, setIsDeleteCardOpen] = useState(false);
  const handleDeleteClick = () => {
    setIsDeleteCardOpen(true);
  };
  const handleCloseCard = () => {
    setIsDeleteCardOpen(false);
  };

  const [editedPublication, setEditedPublication] = useState({
    title: "",
    tag: NaN,
    description: "",
    cover: null as File | null,
  });
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPublication({
      ...editedPublication,
      [event.target.name]: event.target.value,
    });
  };
  const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPublication({
      ...editedPublication,
      tag: Number(event.target.value),
    });
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setEditedPublication({
        ...editedPublication,
        [event.target.name]: event.target.files[0],
      });
    }
  };

  const { loading, error, data } = useQuery(TAGS_QUERY);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatePublication] = useMutation(UPDATE_PUBLICATION_MUTATION, {
    onCompleted: (data) => {
      if (data.updatePublication.success) {
        setErrorMessage("");
        onProfileUpdate();
      }
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });
  const [deletePublication] = useMutation(DELETE_PUBLICATION_MUTATION, {
    onCompleted: (data) => {
      if (data.deletePublication.success) {
        setErrorMessage("");
        setIsDeleteCardOpen(false);
        onProfileUpdate();
      }
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });
  const handleEditPublication = (event: React.FormEvent) => {
    event.preventDefault();
    updatePublication({ variables: {
      publicationId: +publication.id,
      title: editedPublication.title === "" ? null : editedPublication.title,
      tag: editedPublication.tag === +publication.tag.id ? null : editedPublication.tag,
      description: editedPublication.description === "" ? null : editedPublication.description,
      cover: editedPublication.cover,
    }});
  };
  const handleDeletePublication = (id) => {
    deletePublication({ variables: { publicationId: +id } });
  };

  return (
    <div className="p-4 bg-gray-200 rounded-lg shadow-sm">
      <li key={index} className="flex justify-between items-center">
        {publication.cover && <img
          className="h-16 object-cover rounded mb-2"
          src={GET_MEDIA(publication.cover)}
          alt={`Cover for ${publication.title}`}
        />}
        <h3 className="text-lg font-bold text-gray-800">{publication.title}{isExpanded && " - Edit publication"}</h3>
        {isSelf && <div className="flex gap-2">
          <EditIcon onClick={onEdit} />
          <DeleteIcon onClick={handleDeleteClick} />
        </div>}
      </li>
      {isExpanded && (
        <form onSubmit={handleEditPublication} className="space-y-4 mt-4">
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold text-gray-800 whitespace-nowrap">Title</label>
            <input
              type="text"
              name="title"
              placeholder={publication.title}
              onChange={handleInputChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold text-gray-800 whitespace-nowrap">Tag</label>
            <select
              name="tag"
              defaultValue={publication.tag.id}
              onChange={handleTagChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading && <option disabled>Loading...</option>}
              {error && <option disabled>Error</option>}
              {data.tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold text-gray-800 whitespace-nowrap">Description</label>
            <input
              type="text"
              name="description"
              placeholder={publication.description}
              onChange={handleInputChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold text-gray-800 whitespace-nowrap">Cover Image</label>
            <input
              type="file"
              name="cover"
              onChange={handleFileChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="submit"
            value="Edit"
            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          />
        </form>
      )}
      {errorMessage && <p className="mb-4 mt-1 text-sm text-center text-red-600">{errorMessage}</p>}
      {isDeleteCardOpen && (
        <DeletePublicationCard
          id={publication.id}
          title={publication.title}
          onDeletePublication={() => { handleDeletePublication(publication.id) }}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
};

export default ProfileTile;
