import React from "react";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../graphql/profileQuery.ts";

const ProfileMain = ({ username }) => {
  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: { username },
  });
  const profile = data?.profile;

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error loading profile.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">{profile.user.username}</h1>
        {profile.isSelf && (
          <p className="mt-2 text-sm text-gray-400">This is your profile</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Publications</h2>
        <ul className="space-y-4">
          {profile.publications.map((p, index) => (
            <li key={index} className="p-4 bg-gray-700 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-white">{p.title}</h3>
              {/* Vous pouvez ajouter plus de détails ici, comme la description, la date, etc. */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileMain;