import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import CREATE_VIEW_MUTATION from "../../graphql/createViewMutation.ts";
import PopupWrapper from "../PopupWrapper.tsx";
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
    <div className="flex flex-col md:flex-row md:gap-2 max-h-[calc(80vh)]">
      <MainBlock styleClass="overflow-y-auto">
        <div className="h-full flex sm:flex-col items-center justify-center m-1 sm:m-2 md:m-3 lg:m-4">
          {error && <Alert type="error" text={error} onClose={() => { setError("") }} />}
          {SORT_TYPES.map((orderBy) => {
            let groupTitle="Unexpected"
            if(orderBy==="-created_at") {
              groupTitle="Recent music"
            } else if (orderBy==="-vote_count") {
              groupTitle="Popular music"
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
      {expandedTile && (
        <PopupWrapper
          onClose={() => { setExpandedTile(null); }}
          styleClass="lg:max-h-[calc(80vh)]"
        >
          <MainBlock styleClass="w-full h-full max-h-[calc(80vh)]">
            <div className="h-full">
              <TileExpanded
                tileId={expandedTile}
                onRefreshBadge={onRefreshBadge}
                onClose={() => { setExpandedTile(null); }}
              />
            </div>
            <AudioPlayer audio={expandedTile} />
          </MainBlock>
        </PopupWrapper>
      )}
    </div>
  );
};

export default TileMain;

