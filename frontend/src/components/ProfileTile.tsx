import React, { useState } from "react";
import DeletePublicationCard from "./DeletePublicationCard.tsx";

interface Publication {
  id: number;
  title: string;
  cover: string;
  viewCount: number;
  voteCount: number;
};

interface ProfileTileProps {
  publication: Publication;
  index: number;
  isSelf: boolean;
  onEdit: () => void;
  isExpanded: boolean;
};

const ProfileType = ({ publication, index, isSelf, onEdit, isExpanded }: ProfileTileProps) => {
  const [isDeleteCardOpen, setIsDeleteCardOpen] = useState(false);
  const handleDeleteClick = () => {
    setIsDeleteCardOpen(true);
  };
  const handleCloseCard = () => {
    setIsDeleteCardOpen(false);
  };
  
  const handleDeletePublication = (id) => {
    console.log(id);
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-sm">
      <li key={index} className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">{publication.title}</h3>
        {isSelf && <div className="flex gap-2">
          <button onClick={onEdit} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</button>
          <button onClick={handleDeleteClick} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">Delete</button>
        </div>}
      </li>
      {isExpanded && <p>This tile is expanded</p>}
      {isDeleteCardOpen && (
        <DeletePublicationCard
          id={publication.id}
          title={publication.title}
          onDeletePublication={() => { handleDeletePublication(publication.id) }}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
};

export default ProfileType;
