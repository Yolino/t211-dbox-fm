import React from "react";
import TileGroup from "./TileGroup.tsx";

const SORT_TYPES = ["-created_at", "-vote_count"];

const TileMain = ({ onPlayAudio }) => {
  return (
    <div>
      {SORT_TYPES.map((orderBy) => (
        <TileGroup orderBy={orderBy} onPlayAudio={onPlayAudio} />
      ))}
    </div>
  );
};

export default TileMain;
