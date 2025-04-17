import React, { useState } from "react";
import MainBlock from "../MainBlock.tsx";
import TileGroup from "./TileGroup.tsx";
import TileExpanded from "./TileExpanded.tsx";
import { useMutation } from "@apollo/client";
import CREATE_VIEW_MUTATION from "../../graphql/createViewMutation.ts";

const TileMain = ({ onPlayAudio }) => {
  const SORT_TYPES = ["-created_at", "-vote_count"];
  const [expandedTile, setExpandedTile] = useState(1);
  const [error, setError] = useState(null);
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
  const handleError = (message) => {
    setError(message);
  };

  return (
    <div className="flex gap-10 h-[calc(100vh-250px)] min-h-96">
      <MainBlock styleClass="w-2/3 h-full overflow-y-auto">
        {error && <p className="text-red-500">{error}</p>}
        {SORT_TYPES.map((orderBy) => {
	        let groupTitle="Unexpected"
	        if(orderBy==="-created_at") {
		        groupTitle="Recent"
	        } else if (orderBy==="-vote_count") {
		        groupTitle="Most voted"
		      }
	        return (
            <React.Fragment key={orderBy}>
              <TileGroup
	              groupTitle={groupTitle}
                orderBy={orderBy}
                onPlayAudio={handlePlayAudio}
                onTileClick={handleExpandTile}
                onError={handleError}
              />
            </React.Fragment>
	        );
        })}
      </MainBlock>
      <MainBlock styleClass="w-1/3 h-full overflow-y-auto">
        {expandedTile && <TileExpanded tileId={expandedTile.tileId} onError={handleError} />}
      </MainBlock>
    </div>
  );
};

export default TileMain;

