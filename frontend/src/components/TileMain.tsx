import React, { useState } from "react";
import TileGroup from "./TileGroup.tsx";
import TileExpanded from "./TileExpanded.tsx";

const TileMain = ({ onPlayAudio }) => {
  const SORT_TYPES = ["-created_at", "-vote_count"];
  const [expandedTile, setExpandedTile] = useState(null);

  return (
    <div>
      {SORT_TYPES.map((orderBy) => (
        <React.Fragment key={orderBy}>
          <TileGroup
            orderBy={orderBy}
            onPlayAudio={onPlayAudio}
            onTileClick={(tileId, groupId) =>
              setExpandedTile(
                expandedTile?.tileId === tileId && expandedTile.groupId === groupId ? null : { tileId, groupId }
              )
            }
          />
          {expandedTile?.groupId === orderBy && <TileExpanded tileId={expandedTile.tileId} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TileMain;

