import React from "react";

interface TileProps {
  id?: string;
  title: string;
  artist: string;
  likes: number;
  coverImage?: string;
}

const Tile = ({ id, title, artist, likes, coverImage }: TileProps) => {
  return (
    <div className="flex-shrink-0 w-48 p-4 bg-gray-100 rounded-lg shadow-md">
      <img
        className="w-full h-32 object-cover rounded mb-2"
        src={coverImage}
        alt={`Cover for ${title}`}
      />
      <div className="p-4">
        <p className="text-black font-bold text-lg truncate">{title}</p>
        <p className="text-gray-600 text-sm truncate">{artist}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-xs">{likes} likes</p>
        </div>
      </div>
    </div>
  );
};


export default Tile;
