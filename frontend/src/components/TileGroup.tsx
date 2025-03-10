import React from "react";
import { useQuery } from "@apollo/client";
import Tile from "./Tile.tsx";
import PUBLICATIONS_QUERY from "../graphql/publicationsQuery.ts";

interface TileGroupProps {
  orderBy: string;
}

const TileGroup = ({ orderBy="-created_at", onPlayAudio, onTileClick }: TileGroupProps) => {
  const { loading, error, data } = useQuery(PUBLICATIONS_QUERY, {
    variables: { orderBy },
  });
  const pubs = data?.publications || [];
  
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  return (
    <div id={orderBy} className="my-4">
      <p className="text-black text-3xl font-semibold mb-2">{orderBy}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {pubs.map((p) => (
          <Tile
            publication={p}
            group={orderBy}
            onPlayAudio={onPlayAudio}
            onTileClick={onTileClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TileGroup;
