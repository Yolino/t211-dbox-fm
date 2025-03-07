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
    <div className="group flex-shrink-0 w-48 p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:scale-105 hover:shadow-lg transition-all duration-300 relative">
      {/* Image de couverture */}
      <img
        className="w-full h-32 object-cover rounded mb-2"
        src={`http://localhost:8000${coverImage}`}
        alt={`Cover for ${title}`}
      />

      {/* Bouton Play au survol */}
      <div className="absolute inset-x-0 top-1/4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            console.log("Play clicked!");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          </svg>
        </button>
      </div>

      {/* Contenu de la tuile */}
      <div className="p-4">
        <p className="text-black font-bold text-lg truncate">{title}</p>
        <p className="text-gray-600 text-sm truncate">{artist}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-xs">{likes} likes</p>

          {/* Boutons Like et Menu au survol */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Bouton Like déplacé légèrement à gauche */}
            <button
              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                console.log("Liked!");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Bouton Menu (trois petits points) */}
            <button
              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                console.log("Menu clicked!");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tile;
