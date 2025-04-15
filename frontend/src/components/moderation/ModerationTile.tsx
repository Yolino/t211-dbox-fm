import React from "react";

interface ModerationTileProps {
  reportedId: number;
  title: string;
}

const ModerationTile = ({ reportedId, title }: ModerationTileProps) => {
  return (
    <div className="p-4 m-2 bg-gray-800 text-white rounded-md">
      <h3>{title}</h3>
      <button>Mark as safe</button>
      <button>Ban</button>
    </div>
  );
};

export default ModerationTile;
