import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import MainBlock from "../MainBlock.tsx";
import ProfilePublications from "./ProfilePublications.tsx";
import TileExpanded from "../tiles/TileExpanded.tsx";
import AudioPlayer from "../AudioPlayer.tsx";

const ProfileMain = ({ username }) => {
  const location = useLocation();
  const [shownPublication, setShownPublication] = useState(location.state?.expanded || null);
  const [currentAudio, setCurrentAudio] = useState(null);

  return (
    <div className="flex flex-col md:flex-row gap-2 max-h-[calc(80vh)]">
      <MainBlock styleClass="w-full md:w-2/3 h-1/3 md:h-[calc(80vh)] overflow-y-auto">
        <ProfilePublications
          username={username}
          defaultExpandedTile={{
            tileId: location.state?.expanded || null,
            tileType: "publication",
          }}
          onPublicationClick={setShownPublication}
          onPlayAudio={setCurrentAudio}
        />
      </MainBlock>
      <MainBlock styleClass="w-full md:w-auto h-1/3 md:h-[calc(80vh)] overflow-y-auto">
        <div className="h-full overflow-y-auto">
          {shownPublication && <TileExpanded
            tileId={shownPublication}
            showEditButton={false}
          />}
        </div>
        <AudioPlayer audio={currentAudio} />
      </MainBlock>
    </div>
  );
};

export default ProfileMain;
