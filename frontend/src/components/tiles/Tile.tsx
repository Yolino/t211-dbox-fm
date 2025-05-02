import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import CREATE_VOTE_MUTATION from "../../graphql/createVoteMutation.ts";
import GET_MEDIA from "../../context/mediaUrl.ts";
import UPDATE_VOTE_MUTATION from "../../graphql/updateVoteMutation.ts";
import DELETE_VOTE_MUTATION from "../../graphql/deleteVoteMutation.ts";
import AudioIcon from "../../svg/AudioIcon.tsx";
import PlayIcon from "../../svg/PlayIcon.tsx";
import UpvoteIcon from "../../svg/UpvoteIcon.tsx";
import DownvoteIcon from "../../svg/DownvoteIcon.tsx";

interface Author {
  username: string;
}

interface Publication {
  id: number;
  title: string;
  cover: string;
  voteCount: number;
  author: Author;
  visitorVote: number;
}

interface TileProps {
  publication: Publication;
  group: string;
  onPlayAudio: () => void;
  onTileClick: () => void;
  onTileVote: () => void;
  onError: () => void;
}

const Tile = ({ publication, group, onPlayAudio, onTileClick, onTileVote, onError }: TileProps) => {
  const navigate = useNavigate();
  const { privileges } = usePrivileges();
  const [createVote] = useMutation(CREATE_VOTE_MUTATION);
  const [updateVote] = useMutation(UPDATE_VOTE_MUTATION);
  const [deleteVote] = useMutation(DELETE_VOTE_MUTATION);

  const handleCreateVote = (type, e) => {
    onError("");
    createVote({
      variables: {
        publicationId: +publication.id,
        voteType: type,
      },
      onCompleted: (data) => {
        if (data.createVote.voteCount !== null) onTileVote();
      },
      onError: (err) => {
        onError(err.message);
      },
    });
  };
  
  const handleUpdateVote = (type, e) => {
    onError("");
    updateVote({
      variables: {
        publicationId: +publication.id,
        voteType: type,
      },
      onCompleted: (data) => {
        if (data.updateVote.voteCount !== null) onTileVote();
      },
      onError: (err) => {
        onError(err.message);
      },
    });
  }
  
  const handleDeleteVote = (e) => {
    onError("");
    deleteVote({
      variables: {
        publicationId: +publication.id,
      },
      onCompleted: (data) => {
        if (data.deleteVote.voteCount !== null) onTileVote();
      },
      onError: (err) => {
        onError(err.message);
      },
    });
  }
  
  const handleUpvote = (e) => {
    e.stopPropagation();
    if (!privileges?.isLoggedIn) {
      onError("You must be logged in to submit votes");
      return;
    }
    if (publication.visitorVote > 0) {
      handleDeleteVote(e);
    } else if (publication.visitorVote < 0) {
      handleUpdateVote(1, e);
    } else {
      handleCreateVote(1, e);
    }
  };
  
  const handleDownvote = (e) => {
    e.stopPropagation();
    if (!privileges?.isLoggedIn) {
      onError("You must be logged in to submit votes");
      return;
    }
    if (publication.visitorVote > 0) {
      handleUpdateVote(-1, e);
    } else if (publication.visitorVote < 0) {
      handleDeleteVote(e);
    } else {
      handleCreateVote(-1, e);
    }
  };

  return (
    <div
      className={`${publication.isBanned ? "bg-red-200 hover:bg-red-300" : "bg-gray-100 hover:bg-gray-200"} group flex-grow m-1 md:m-2 w-32 sm:w-40 md:w-44 lg:w-48 p-2 sm:p-3 md:p-4 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 relative`}
      onClick={() => onTileClick(publication.id)}
    >
      {/* Image de couverture */}
      {(publication.cover) ? <img
          className="w-full h-24 lg:h-32 object-cover rounded mb-1 sm:mb-2"
          src={GET_MEDIA(publication.cover)}
          alt={`Cover for ${publication.title}`}
        /> : 
        <div
          className="w-full h-24 lg:h-32 flex items-center justify-center rounded mb-1 sm:mb-2 bg-gray-100"
        >
          <AudioIcon styleClass={`${publication.isBanned ? "text-red-800" : "text-gray-800"} w-8 sm:w-10 md:w-12 h-10 md:h-12`} />
        </div>
      }
      
      {/* Play button on hover */}
      <div className="absolute inset-x-0 top-1/4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-gray-400 transition-colors duration-200"
          onClick={(e) => { onPlayAudio(publication.id) }}
          aria-label="Play audio"
        >
          <PlayIcon />
        </button>
      </div>

      {/* Tile content */}
      <div className={`${publication.isBanned ? "text-red-800" :  "text-gray-800"} p-2 sm:p-3 md:p-4`}>
        <div className="flex justify-between">
          <p className="font-bold text-sm sm:text-base md:text-lg truncate cursor-default">{publication.title}</p>
          {publication.isBanned && <span className="ml-1 px-2 py-1 bg-red-300 text-red-800 text-xs font-medium rounded">Banned</span>}
        </div>
        <div className="flex justify-between">
          <p>
            <span
              className={`text-xs sm:text-sm ${!publication.author.isActive && "bg-red-200 p-1 rounded-md"} truncate cursor-pointer hover:underline`}
              onClick={(e) => { 
                e.stopPropagation();
                navigate(`/profile/${publication.author.username}`);
              }}
            >
              {publication.author.username}
            </span>
          </p>
          {!publication.author.isActive && <span className="ml-1 px-2 py-1 bg-red-300 text-red-800 text-xs font-medium rounded">Banned</span>}
        </div>
        <div className="flex items-center justify-between mt-1 sm:mt-2">
          <p className="text-xs cursor-default">{publication.voteCount} {+publication.voteCount === 1 ? "vote" : "votes"}</p>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className={`p-1 ${publication.visitorVote > 0 && "bg-green-500"} rounded-full hover:bg-gray-300 transition-colors duration-200`}
              onClick={(e) => handleUpvote(e)}
              aria-label="Upvote"
            >
              <UpvoteIcon />
            </button> 

            <button
              className={`p-1 ${publication.visitorVote < 0 && "bg-red-500"} rounded-full hover:bg-gray-300 transition-colors duration-200`}
              onClick={(e) => handleDownvote(e)}
              aria-label="Downvote"
            >
              <DownvoteIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tile;
