import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../../graphql/profileQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ProfileTile from "./ProfileTile.tsx";
import TileExpanded from "../tiles/TileExpanded.tsx";
import AudioPlayer from "../AudioPlayer.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

const ProfileMain = ({ username }) => {
  const [expandedTile, setExpandedTile] = useState(null);
  const [shownPublication, setShownPublication] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [message, setMessage] = useState({
    tileId: NaN,
    isError: false,
    text: "",
  });
  const { loading, error, data, refetch } = useQuery(PROFILE_QUERY, {
    variables: { username },
  });
  const handleExpandTile = (i) => {
    (i === expandedTile) ? setExpandedTile(null) : setExpandedTile(i);
  }
  const refetchProfile = () => {
    refetch();
  };
  const profile = data?.profile;

  return (
    <div className="flex flex-col md:flex-row gap-2 max-h-[calc(80vh)]">
      <MainBlock styleClass="w-full md:w-2/3 h-1/3 md:h-[calc(80vh)] overflow-y-auto">
        <div className="text-center">
          <div className="flex justify-center items-center text-white space-x-4">
            {loading && <LoadingIcon />}
            <h1 className="text-3xl font-bold text-white cursor-default">User Profile {profile?.user?.username ? ` - ${profile.user.username}` : username ? ` - ${username}` : ""}</h1>
          </div>
          {error && <p className="text-center text-red-500 cursor-default">{error.message}</p>}
          {profile?.isSelf && (
            <p className="mt-2 text-sm text-gray-400 cursor-default">This is your profile</p>
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4 cursor-default">Publications</h2>
          <ul className="space-y-4">
            {profile?.publications.map((p, i) => (
              <ProfileTile
                key={i}
                author={profile.user.username}
                publication={p}
                index={i} 
                isSelf={profile.isSelf}
                onEdit={() => { handleExpandTile(i) }}
                onCloseTile={() => { setExpandedTile(null) }}
                isExpanded={ i === expandedTile }
                message={i === message.tileId ? {isError: message.isError, text: message.text} : null}
                onSetMessage={(m) => { setMessage(m) }}
                onProfileUpdate={refetchProfile}
                onPublicationClick={setShownPublication}
                onPlayAudio={() => { setCurrentAudio(p.id) }}
              />
            ))}
          </ul>
        </div>
      </MainBlock>
      <MainBlock styleClass="w-full md:w-auto h-1/3 md:h-[calc(80vh)] overflow-y-auto">
        <div className="h-full overflow-y-auto">
          {shownPublication && <TileExpanded tileId={shownPublication} />}
        </div>
        <AudioPlayer audio={currentAudio} />
      </MainBlock>
    </div>
  );
};

export default ProfileMain;
