import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import Tile from "./Tile.tsx";
import PUBLICATIONS_QUERY from "../../graphql/publicationsQuery.ts";
import LoadingIcon from "../../svg/LoadingIcon.tsx";
import ShowMoreIcon from "../../svg/ShowMoreIcon.tsx";

interface TileGroupProps {
  groupTitle: string;
  orderBy: string;
  onPlayAudio: () => void;
  onTileClick: () => void;
  onError: () => void;
}

const TileGroup = ({ groupTitle="Default", orderBy="-created_at", onPlayAudio, onTileClick, onError }: TileGroupProps) => {
  const [count, setCount] = useState(3);
  const { loading, error, data, refetch } = useQuery(PUBLICATIONS_QUERY, {
    variables: { orderBy, count },
  });
  const onTileVote = () => {
    refetch();
  };
  const pubs = data?.publications || [];

  return (
    <div id={orderBy} className="my-4">
      <p className="text-white text-3xl font-semibold mb-2">{groupTitle}</p>
      <div className="flex">
        {(loading || error) ? (
          <div className="group flex-shrink-0 w-48 p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:scale-105 hover:shadow-lg transition-all duration-300 relative">
            <div
              className="h-32 flex items-center justify-center rounded mb-2 bg-gray-100"
            >
              <LoadingIcon />
            </div>
            <div className="p-10">
              {loading && <p>Loading...</p>}
              {error && <p>{error}</p>}
            </div>
          </div>
        ) : (
          <>
            {pubs.map((p) => (
              <Tile
                key={p.id}
                publication={p}
                group={orderBy}
                onPlayAudio={onPlayAudio}
                onTileClick={onTileClick}
                onTileVote={onTileVote}
                onError={onError}
              />
            ))}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setCount(count + 3)}
                className="flex justify-center items-center w-8 h-16 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none"
              >
                <ShowMoreIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TileGroup;
