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
      <div className="m-4 p-4 bg-gray-200 rounded-md">
        <h3>Users</h3>
        {data?.reportedContent.users.map((u, i) => (
          <ModerationTile
            key={i}
            reportedId={u.id}
            title={u.username}
          />
        ))}
      </div>
      <div className="m-4 p-4 bg-gray-200 rounded-md">
        <h3>Publications</h3>
        {data?.reportedContent.publications.map((p, i) => (
          <ModerationTile
            key={i}
            reportedId={p.id}
            title={p.title}
          />
        ))}
      </div>
      <div className="m-4 p-4 bg-gray-200 rounded-md">
        <h3>Comments</h3>
        {data?.reportedContent.comments.map((c, i) => (
          <ModerationTile
            key={i}
            reportedId={c.id}
            title={c.text}
          />
        ))}
      </div>
    </MainBlock>
  );
};

export default ModerationMain;
