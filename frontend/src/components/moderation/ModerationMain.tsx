import React from "react";
import { useQuery } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import REPORTED_CONTENT_QUERY from "../../graphql/reportedContentQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ModerationTile from "./ModerationTile.tsx";

const ModerationMain = () => {
  const { privileges } = usePrivileges();
  const notAllowed = !privileges?.isModerator;
  const { data, loading, error } = useQuery(REPORTED_CONTENT_QUERY, {
    skip: notAllowed,
  });

  if (notAllowed) return <p>You cannot access the moderation panel</p>;
  return (
    <MainBlock>
      <h2 className="text-2xl font-bold text-white mb-6">Moderation Panel</h2>
      <div className="m-2 p-4 bg-gray-200 rounded-md">
        <h3>Users</h3>
        {data?.reportedContent.users.map((d) => (
          <ModerationTile />
        ))}
      </div>
      <div className="m-2 p-4 bg-gray-200 rounded-md">
        <h3>Publications</h3>
        {data?.reportedContent.publications.map((d) => (
          <ModerationTile />
        ))}
      </div>
      <div className="m-2 p-4 bg-gray-200 rounded-md">
        <h3>Comments</h3>
        {data?.reportedContent.comments.map((d) => (
          <ModerationTile />
        ))}
      </div>
    </MainBlock>
  );
};

export default ModerationMain;
