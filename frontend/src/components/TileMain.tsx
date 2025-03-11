import React, { useState } from "react";
import TileGroup from "./TileGroup.tsx";
import TileExpanded from "./TileExpanded.tsx";
import { useMutation } from "@apollo/client";
import CREATE_VIEW_MUTATION from "../graphql/createViewMutation.ts";

const TileMain = ({ onPlayAudio }) => {
  const SORT_TYPES = ["-created_at", "-vote_count"];
  const [expandedTile, setExpandedTile] = useState(null);

  const [incrementViewCount] = useMutation(CREATE_VIEW_MUTATION);

  const handlePlayAudio = (tileId) => {
    onPlayAudio(tileId);
  };

  const handleExpandTile = (tileId, groupId) => {
    setExpandedTile(
      expandedTile?.tileId === tileId && expandedTile.groupId === groupId ? null : { tileId, groupId }
    );
    if ((!expandedTile?.tileId) || (expandedTile?.tileId === +tileId)) incrementViewCount({variables : {publicationId: +tileId} }).catch(console.error);
  };

  return (
    <div>
      {SORT_TYPES.map((orderBy) => (
        <React.Fragment key={orderBy}>
          <TileGroup
            orderBy={orderBy}
            onPlayAudio={handlePlayAudio}
            onTileClick={handleExpandTile}
          />
          {expandedTile?.groupId === orderBy && <TileExpanded tileId={expandedTile.tileId} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TileMain;

