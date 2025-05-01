import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import CREATE_VIEW_MUTATION from "../../graphql/createViewMutation.ts";
import MainBlock from "../MainBlock.tsx";
import TileGroup from "./TileGroup.tsx";
import TileExpanded from "./TileExpanded.tsx";
import AudioPlayer from "../AudioPlayer.tsx";
import Alert from "../Alert.tsx";

const TileMain = ({ onRefreshBadge }) => {
  const SORT_TYPES = ["-created_at", "-vote_count"];
  const [expandedTile, setExpandedTile] = useState(null);
  const [error, setError] = useState("");
  const [incrementViewCount] = useMutation(CREATE_VIEW_MUTATION);
  const handlePlayAudio = (tileId) => {
    setExpandedTile(tileId);
    incrementViewCount({
      variables: {publicationId: +tileId},
    });
  };
  const handleError = (message) => {
    setError(message);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-[calc(80vh)] min-h-96">
      <MainBlock styleClass="w-full lg:w-2/3 h-96 lg:h-full overflow-y-auto">
        <div className="h-full overflow-y-auto">
          {error && <Alert type="error" text={error} onClose={() => { setError("") }} />}
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
                  onTileClick={(tileId) => { setExpandedTile(tileId) }}
                  onError={handleError}
                />
              </React.Fragment>
            );
          })}
        </div>
      </MainBlock>
      <MainBlock styleClass="w-full lg:w-1/3 h-96 lg:h-full overflow-y-auto">
        <div className="h-full overflow-y-auto">
          {expandedTile && <TileExpanded tileId={expandedTile} onRefreshBadge={onRefreshBadge} />}
        </div>
        <AudioPlayer audio={expandedTile} />
      </MainBlock>
    </div>
  );
};

export default TileMain;

