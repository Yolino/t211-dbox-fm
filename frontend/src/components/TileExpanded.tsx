import React from "react";
import { useQuery } from "@apollo/client";
import PUBLICATION_DETAIL_QUERY from "../graphql/publicationDetailQuery.ts";
import CommentMain from "./CommentMain.tsx";

const TileExpanded = ({ tileId }) => {
  const { loading, error, data } = useQuery(PUBLICATION_DETAIL_QUERY, {
    variables: { publicationId: +tileId },
  });

  const publication = data?.publication || {};

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md mt-4 animate-fade-in">
      <div className="flex gap-4">
        {/* Cover Image */}
        <img
          className="w-32 h-32 object-cover rounded-lg shadow-md"
          src={`http://localhost:8000${publication.cover}`}
          alt={`Cover for ${publication.title}`}
        />

        {/* Text Content */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">{publication.title}</h2>
            <button className="text-gray-600 hover:text-black transition-colors"></button>
          </div>
          <p className="text-gray-700">by {publication.author.username} on {publication.createdAt}</p>
          <p className="text-gray-600 text-sm mt-2">{publication.description || "No description available."}</p>
          <p className="text-gray-400 text-xs mt-2">{publication.viewCount} views</p>
          <p className="text-gray-400 text-xs mt-2">{publication.voteCount} votes</p>
        </div>
      </div>
      <CommentMain publicationId={tileId} />
    </div>
  );
};

export default TileExpanded;
