import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../../graphql/profileQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ProfileTile from "./ProfileTile.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

const ProfileMain = ({ username, onPlayAudio }) => {
  const [expandedTile, setExpandedTile] = useState(null);
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
    <MainBlock>
      <div className="text-center">
        <div className="flex justify-center items-center text-white space-x-4">
          {loading && <LoadingIcon />}
          <h1 className="text-3xl font-bold text-white">User Profile {profile?.user?.username ? ` - ${profile.user.username}` : username ? ` - ${username}` : ""}</h1>
        </div>
        {error && <p className="text-center text-red-500">{error.message}</p>}
        {profile?.isSelf && (
          <p className="mt-2 text-sm text-gray-400">This is your profile</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Publications</h2>
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
              onProfileUpdate={refetchProfile}
              onPlayAudio={onPlayAudio}
            />
          ))}
        </ul>
      </div>
    </MainBlock>
  );
};

export default ProfileMain;
