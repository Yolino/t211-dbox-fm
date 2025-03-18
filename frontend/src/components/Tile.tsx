import React from "react";

interface Author {
  username: string;
}

interface Publication {
  id: number;
  title: string;
  cover: string;
  voteCount: number;
  author: Author;
}

interface TileProps {
  publication: Publication;
  group: string;
}

const Tile = ({ publication, group, onPlayAudio, onTileClick }: TileProps) => {
  return (
    <div
      className="group flex-shrink-0 w-48 p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:scale-105 hover:shadow-lg transition-all duration-300 relative"
      onClick={() => onTileClick(publication.id, group)}
    >
      {/* Image de couverture */}
      <img
        className="w-full h-32 object-cover rounded mb-2"
        src={`http://localhost:8000${publication.cover}`}
        alt={`Cover for ${publication.title}`}
      />

      {/* Bouton Play au survol */}
      <div className="absolute inset-x-0 top-1/4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200"
          onClick={() => onPlayAudio(publication.id)}
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
        <p className="text-black font-bold text-lg truncate">{publication.title}</p>
        <p className="text-gray-600 text-sm truncate">{publication.author.username}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-xs">{publication.voteCount} votes</p>

          {/* Boutons Like et Menu au survol */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Bouton vote déplacé légèrement à gauche */}
            <button
              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                console.log("Liked!");
              }}
            >
              <svg className="w-4 h-4 text-gray-600" 
	      	      aria-hidden="true" 
		            xmlns="http://www.w3.org/2000/svg" 
		            fill="none"
		            viewBox="0 0 10 14">
    	          <path stroke="currentColor" 
	      	        strokeLinecap="round" 
		              strokeLinejoin="round" 
		              strokeWidth="2" 
		              d="M5 13V1m0 0L1 5m4-4 4 4"
                />
              </svg>
            </button>

            {/* Bouton Down vote déplacé légèrement à gauche */}

            <button
              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                console.log("Liked!");
              }}
            >
              <svg className="w-4 h-4 text-gray-600" 
	      	      aria-hidden="true" 
		            xmlns="http://www.w3.org/2000/svg" 
		            fill="none"
		            viewBox="0 0 10 14">
    	          <path stroke="currentColor" 
	      	        strokeLinecap="round"
		              strokeLinejoin="round" 
		              strokeWidth="2" 
		              d="M5 1v12m0 0 4-4m-4 4L1 9"
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
