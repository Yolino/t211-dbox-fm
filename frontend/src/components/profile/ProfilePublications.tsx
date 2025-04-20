import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../../graphql/profileQuery.ts";
import ProfileTile from "./ProfileTile.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

interface ProfilePublicationsProps {
  username: string;
  defaultExpandedTile: number | null;
  onPublicationClick: () => void;
  onPlayAudio: (i: number) => void | null;
  isModerationContext: boolean;
}

const ProfilePublications = ({ username, defaultExpandedTile, onPublicationClick, onPlayAudio, isModerationContext=false }: ProfilePublicationsProps) => {
  const [expandedTile, setExpandedTile] = useState(defaultExpandedTile);
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
    <div>
    <div className="text-center">
      <div className="flex justify-center items-center text-white space-x-4">
        <h1 className="text-3xl font-bold text-white cursor-default">User Profile {profile?.user?.username ? ` - ${profile.user.username}` : username ? ` - ${username}` : ""}</h1>
        {error && <p className="text-center text-red-500 cursor-default">{error.message}</p>}
        {profile?.isSelf && (
          <p className="mt-2 text-sm text-gray-400 cursor-default">This is your profile</p>
        )}
      </div>
    </div>
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-white mb-4 cursor-default">
        {loading && <LoadingIcon />}
        Publications
      </h2>
      <ul className="space-y-4">
        {profile?.publications.map((p, i) => (
          <ProfileTile
            key={i}
            author={profile.user.username}
            publication={p}
            index={i} 
            isSelf={profile.isSelf}
            onEdit={() => { handleExpandTile(p.id) }}
            onCloseTile={() => { handleExpandTile(null) }}
            isExpanded={ p.id === expandedTile }
            message={i === message.tileId ? {isError: message.isError, text: message.text} : ""}
            onSetMessage={(m) => { setMessage(m) }}
            onProfileUpdate={refetchProfile}
            onPublicationClick={onPublicationClick}
            onPlayAudio={() => { onPlayAudio(p.id) }}
            isModerationContext={isModerationContext}
          />
        ))}
      </ul>
    </div>
    </div>
  );
};

export default ProfilePublications;
