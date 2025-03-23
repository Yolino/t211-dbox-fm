import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import Tile from "./Tile.tsx";
import PUBLICATIONS_QUERY from "../../graphql/publicationsQuery.ts";
import ShowMoreIcon from "../../svg/ShowMoreIcon.tsx";

interface TileGroupProps {
  orderBy: string;
}

const TileGroup = ({ groupTitle="Default", orderBy="-created_at", onPlayAudio, onTileClick }: TileGroupProps) => {
  const [count, setCount] = useState(6);
  const { loading, error, data } = useQuery(PUBLICATIONS_QUERY, {
    variables: { orderBy, count },
  });
  const pubs = data?.publications || [];
  
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  return (
    <div id={orderBy} className="my-4">
      <p className="text-black text-3xl font-semibold mb-2">{groupTitle}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {pubs.map((p) => (
          <Tile
            key={p.id}
            publication={p}
            group={orderBy}
            onPlayAudio={onPlayAudio}
            onTileClick={onTileClick}
          />
        ))}
        <button
          onClick={() => setCount(count + 6)}
          className="flex justify-center items-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none"
        >
          <ShowMoreIcon />
        </button>
      </div>
    </div>
  );
};

export default TileGroup;
