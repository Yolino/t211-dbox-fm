import React from "react";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../graphql/profileQuery.ts";

const ProfileMain = ({ username }) => {
  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: { username },
  });
  const profile = data?.profile;

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  return (
    <div>
      <p>{profile.user.username}</p>
      <ul>
        {profile.publications.map((p) => (<li>{p.title}</li>))}
      </ul>
      {profile.isSelf && <h2>This is your profile</h2>}
    </div>
  );
};

export default ProfileMain;
