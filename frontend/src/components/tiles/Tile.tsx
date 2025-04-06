import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import CREATE_VOTE_MUTATION from "../../graphql/createVoteMutation.ts";
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
}

const Tile = ({ publication, group, onPlayAudio, onTileClick, onTileVote }: TileProps) => {
  const navigate = useNavigate();
  const [vote] = useMutation(CREATE_VOTE_MUTATION);
  
  const handleVote = (type, e) => {
    e.stopPropagation(); // Empêche la propagation du clic
    vote({
      variables: {
        publicationId: +publication.id,
        voteType: type,
      },
      onCompleted: onTileVote,
    });
  };

  return (
    <div
      className="group flex-shrink-0 w-48 p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:scale-105 hover:shadow-lg transition-all duration-300 relative"
      onClick={() => onTileClick(publication.id, group)}
    >
      {/* Image de couverture */}
      {(publication.cover) ? <img
          className="w-full h-32 object-cover rounded mb-2"
          src={`http://localhost:8000${publication.cover}`}
          alt={`Cover for ${publication.title}`}
        /> : <div
          className="w-full h-32 flex items-center justify-center rounded mb-2 bg-gray-100"
        >
          <AudioIcon styleClass="w-12 h-12 text-gray-800" />
        </div>
      }
      {/* Bouton Play au survol */}
      <div className="absolute inset-x-0 top-1/4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-400 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation(); // Empêche la propagation du clic
            onPlayAudio({
              id: publication.id,
              title: publication.title,
              author: publication.author.username,
            });
          }}
        >
          <PlayIcon />
        </button>
      </div>

      {/* Contenu de la tuile */}
      <div className="p-4">
        <p className="text-black font-bold text-lg truncate cursor-default">{publication.title}</p>
        <p
          className="text-gray-600 text-sm truncate cursor-pointer"
          onClick={() => { navigate(`/profile/${publication.author.username}`) }}
        >
          {publication.author.username}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-xs cursor-default">{publication.voteCount} votes</p>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className={`p-1 ${publication.visitorVote > 0 ? "bg-green-300" : "bg-gray-200"} rounded-full hover:bg-gray-300 transition-colors duration-200`}
              onClick={(e) => handleVote(1, e)}
            >
              <UpvoteIcon />
            </button> 

            <button
              className={`p-1 ${publication.visitorVote < 0 ? "bg-red-300" : "bg-gray-200"} rounded-full hover:bg-gray-300 transition-colors duration-200`}
              onClick={(e) => handleVote(-1, e)}
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
