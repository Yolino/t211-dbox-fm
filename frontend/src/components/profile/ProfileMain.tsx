import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../../graphql/profileQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ProfileTile from "./ProfileTile.tsx";

const ProfileMain = ({ username }) => {
  const [expandedTile, setExpandedTile] = useState(null);
  const { loading, error, data, refetch } = useQuery(PROFILE_QUERY, {
    variables: { username },
  });
  const refetchProfile = () => {
    refetch();
  };
  const profile = data?.profile;

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error</p>;

  return (
    <MainBlock>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">{profile.user.username}</h1>
        {profile.isSelf && (
          <p className="mt-2 text-sm text-gray-400">This is your profile</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Publications</h2>
        <ul className="space-y-4">
          {profile.publications.map((p, i) => (
            <ProfileTile
              publication={p}
              index={i} 
              isSelf={profile.isSelf}
              onEdit={() => { setExpandedTile(i) }}
              isExpanded={ i === expandedTile }
              onDeletePublication={refetchProfile}
            />
          ))}
        </ul>
      </div>
    </MainBlock>
  );
};

export default ProfileMain;
