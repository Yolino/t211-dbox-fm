import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PUBLICATION_DETAIL_QUERY from "../../graphql/publicationDetailQuery.ts";
import GET_MEDIA from "../../context/mediaUrl.ts";
import CommentMain from "./CommentMain.tsx";
import AudioIcon from "../../svg/AudioIcon.tsx";

interface TileExpandedProps {
  tileId: number;
  onError: () => void;
}

const TileExpanded = ({ tileId, onError }: TileExpandedProps) => {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(PUBLICATION_DETAIL_QUERY, {
    variables: { publicationId: +tileId },
  });

  const publication = data?.publication || {};

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  const date = new Date(publication.createdAt);
  const formattedDatePublication = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md mt-4 animate-fade-in">
      <div className="flex gap-4">
      {(publication.cover) ? <img
          className="w-32 h-32 object-cover rounded-lg shadow-md"
          src={GET_MEDIA(publication.cover)}
          alt={`Cover for ${publication.title}`}
        /> : <div
          className=" w-32 h-32 object-cover rounded-lg shadow-md flex items-center justify-center"
        >
          <AudioIcon styleClass="w-12 h-12 text-gray-800" />
        </div>
      }

        {/* Text Content */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">{publication.title}</h2>
            <button className="text-gray-600 hover:text-black transition-colors"></button>
          </div>
          <p className="text-gray-700 cursor-default">
            by <span className="cursor-pointer" onClick={() => { navigate(`/profile/${publication.author.username}`) }}>{publication.author.username}</span> on {formattedDatePublication}</p>
          <p className="text-gray-600 text-sm mt-2 cursor-default">{publication.description || "No description available."}</p>
          <p className="text-gray-400 text-xs mt-2 cursor-default">{publication.viewCount} views</p>
          <p className="text-gray-400 text-xs mt-2 cursor-default">{publication.voteCount} votes</p>
        </div>
      </div>
      <CommentMain publicationId={tileId} onError={onError} />
    </div>
  );
};

export default TileExpanded;
