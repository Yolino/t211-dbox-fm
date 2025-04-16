import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import REPORTED_CONTENT_QUERY from "../../graphql/reportedContentQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ModerationTile from "./ModerationTile.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

const ModerationMain = () => {
  const { privileges } = usePrivileges();
  const notAllowed = !privileges?.isModerator;
  const { data, error, refetch } = useQuery(REPORTED_CONTENT_QUERY, {
    skip: notAllowed,
  });
  const onDecision = () => {
    refetch();
  };

  if (notAllowed) return <p>You cannot access the moderation panel</p>;
  return (
    <MainBlock>
      <h2 className="text-2xl font-bold text-white mb-6">Moderation Panel</h2>
      <div className="m-4 p-4 bg-gray-200 rounded-md">
        <h3 className="text-xl font-bold mb-2">Users</h3>
        {data?.reportedContent.users.map((u, i) => (
          <ModerationTile
            key={i}
            reportedId={u.id}
            title={u.username}
            reportType="user"
            reportCount={u.reportCount}
            onDecision={onDecision}
          />
        ))}
      </div>
      <div className="m-4 p-4 bg-gray-200 rounded-md">
        <h3 className="text-xl font-bold mb-2">Publications</h3>
        {data?.reportedContent.publications.map((p, i) => (
          <ModerationTile
            key={i}
            reportedId={p.id}
            title={p.title}
            reportType="publication"
            reportCount={p.reportCount}
            onDecision={onDecision}
          />
        ))}
      </div>
      <div className="m-4 p-4 bg-gray-200 rounded-md">
        <h3 className="text-xl font-bold mb-2">Comments</h3>
        {data?.reportedContent.comments.map((c, i) => (
          <ModerationTile
            key={i}
            reportedId={c.id}
            title={c.text}
            reportType="comment"
            reportCount={c.reportCount}
            onDecision={onDecision}
          />
        ))}
      </div>
    </MainBlock>
  );
};

export default ModerationMain;
