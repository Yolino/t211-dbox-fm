import React from "react";
import Tile from "./Tile.tsx";

interface TilesGroupProps {
  group: string;
  tilesData: Array<{
    id: string;
    title: string;
    artist: string;
    likes: number;
    coverImage: string;
  }>;
}

const TilesGroup = ({ group = "Recent", tilesData }: TilesGroupProps) => {

  return (
    <div id={group} className="my-4">
      <p className="text-black text-3xl font-semibold mb-2">{group}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {tilesData.map((tile) => (
          <Tile
            id={tile.id}
            title={tile.title}
            artist={tile.artist}
            likes={tile.likes}
            coverImage={tile.coverImage}
          />
        ))}
      </div>
    </div>
  );
};

export default TilesGroup;