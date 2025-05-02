import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import TAGS_QUERY from "../../graphql/tagsQuery.ts";
import UPDATE_PUBLICATION_MUTATION from "../../graphql/updatePublicationMutation.ts";
import DELETE_PUBLICATION_MUTATION from "../../graphql/deletePublicationMutation.ts";
import GET_MEDIA from "../../context/mediaUrl.ts";
import DeleteContentCard from "./DeleteContentCard.tsx";
import PlayIcon from "../../svg/PlayIcon.tsx";
import EditIcon from "../../svg/EditIcon.tsx";
import DeleteIcon from "../../svg/DeleteIcon.tsx";

interface Publication {
  id: number;
  title: string;
  cover: string;
  viewCount: number;
  voteCount: number;
  isBanned: boolean;
};

interface ProfileTileProps {
  publication: Publication;
  index: number;
  isSelf: boolean;
  onEdit: (event) => void;
  isExpanded: boolean;
  onDeletePublication: () => void;
  onPlayAudio: () => void;
  onPublicationClick: (i: number) => void;
  isModerationContext: boolean;
};

const ProfileTile = ({ author, publication, index, isSelf, onEdit, onCloseTile, isExpanded, onSetMessage, onProfileUpdate, onPlayAudio, onPublicationClick, isModerationContext=false }: ProfileTileProps) => {
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
    removeCover: false,
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
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPublication({
      ...editedPublication,
      removeCover: event.target.checked,
    });
  };

  const { loading: loadingTags, error, data } = useQuery(TAGS_QUERY);
  const [updatePublication, { loading: loadingUpdate }] = useMutation(UPDATE_PUBLICATION_MUTATION, {
    onCompleted: (data) => {
      if (data.updatePublication.success) {
        onSetMessage({
          isError: false,
          text: "Publication successfully updated",
        });
        onProfileUpdate();
      }
    },
    onError: (err) => {
      onSetMessage({
        isError: true,
        text: err.message,
      });
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
      removeCover: editedPublication.removeCover,
    }});
  };

  const [deletePublication] = useMutation(DELETE_PUBLICATION_MUTATION, {
    onCompleted: (data) => {
      if (data.deletePublication.success) {
        onSetMessage({
          isError: false,
          text: "",
        });
        setIsDeleteCardOpen(false);
        onProfileUpdate();
        onPublicationClick(null);
      }
    },
    onError: (err) => {
      onSetMessage({
        isError: true,
        text: err.message,
      });
    },
  });
  const handleDeletePublication = (id) => {
    deletePublication({ variables: { publicationId: +id } });
    onCloseTile();
  };

  return (
    <div
      onClick={() => { onPublicationClick(publication.id); onPlayAudio(publication.id); }}
      className={`p-4 bg-gray-200 rounded-lg shadow-sm group ${publication.isBanned ? "bg-red-200 hover:bg-red-300 text-red-800" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
    >
      <li key={index} className="relative flex items-center justify-between"> 
        <div className="flex items-center">
          {publication.cover && (
            <img
              className="h-16 object-cover rounded mr-2"
              src={GET_MEDIA(publication.cover)}
              alt={`Cover for ${publication.title}`}
            />
          )}
          <h3 className="text-lg font-bold cursor-default">
            {publication.title}
            {isExpanded && " - Edit publication"}
          </h3>
        </div>
        <div className="flex items-center gap-3 ml-4">
          {!isModerationContext && (
            <button
              className={`p-3 rounded-full shadow-lg transition-colors duration-200 ${publication.isBanned ? "hover:bg-red-400" : "hover:bg-gray-500"}`}
            >
              <PlayIcon />
            </button>
          )}
          {isSelf && (
            <>
              <EditIcon onClick={onEdit} styleClass={publication.isBanned && "text-red-800 hover:text-gray-800"} />
              <DeleteIcon onClick={handleDeleteClick} styleClass={publication.isBanned && "text-red-800 hover:text-gray-800"} />
            </>
          )}
        </div>
      </li>
      {isExpanded && (
        <form onSubmit={handleEditPublication} className="space-y-4 mt-4">
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold whitespace-nowrap">Title</label>
            <input
              type="text"
              name="title"
              defaultValue={publication.title}
              onChange={handleInputChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold whitespace-nowrap">Tag</label>
            <select
              name="tag"
              defaultValue={publication.tag.id}
              onChange={handleTagChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loadingTags && <option disabled>Loading...</option>}
              {error && <option disabled>Error</option>}
              {data?.tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold whitespace-nowrap">Description</label>
            <input
              type="text"
              name="description"
              defaultValue={publication.description}
              onChange={handleInputChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4 w-full">
            <label className="w-1/6 font-bold whitespace-nowrap">Cover image</label>
            <input
              type="file"
              name="cover"
              onChange={handleFileChange}
              className="mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {publication.cover && (
            <div className="flex items-center gap-4 w-full">
              <label className="w-1/6 font-bold">Remove current cover image</label>
              <input
                type="checkbox"
                name="remove-cover"
                onChange={handleCheckboxChange}
                className="h-4 w-4 bg-gray-800 border border-gray-600 rounded-md text-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
          <input
            type="submit"
            value={loadingUpdate ? "Editing..." : "Edit"}
            className="w-full px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200"
            disabled={loadingUpdate}
          />
        </form>
      )}
      {isDeleteCardOpen && (
        <DeleteContentCard
          title={publication.title}
          onDeleteContent={() => { handleDeletePublication(publication.id) }}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
};

export default ProfileTile;
