import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import REPORTED_CONTENT_QUERY from "../../graphql/reportedContentQuery.ts";
import BANNED_CONTENT_QUERY from "../../graphql/bannedContentQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ModerationTile from "./ModerationTile.tsx";
import TileExpanded from "../tiles/TileExpanded.tsx";
import ProfilePublications from "../profile/ProfilePublications.tsx";
import AudioPlayer from "../AudioPlayer.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

const ModerationMain = () => {
  const { privileges } = usePrivileges();
  const [expandedTile, setExpandedTile] = useState({
    tileType: null,
    tileId: null,
  });
  const [panelSwitch, setPanelSwitch] = useState(false);
  const notAllowed = !privileges?.isModerator;
  const { data: reportedData, error: reportedError, refetch: reportedRefetch } = useQuery(REPORTED_CONTENT_QUERY, {
    skip: notAllowed,
  });
  const { data: bannedData, error: bannedError, refetch: bannedRefetch } = useQuery(BANNED_CONTENT_QUERY, {
    skip: notAllowed,
  });
  const onDecision = () => {
    reportedRefetch();
    bannedRefetch();
  };

  if (notAllowed) return <p className="text-xl text-center text-red-600 font-bold">You cannot access the moderation panel</p>;
  return (
    <div className="flex flex-col lg:flex-row gap-10 h-[calc(80vh)] min-h-96">
      <MainBlock styleClass="w-full lg:w-2/3 h-96 lg:h-full overflow-y-auto">
        <h2
          onClick={() => { setPanelSwitch(!panelSwitch) }}
          className="text-2xl font-bold text-white mb-6 cursor-default"
        >
          <span className={`${panelSwitch ? "text-gray-600" : "text-white"} cursor-pointer`}>
            Content to review
          </span>
          <span> / </span>
          <span className={`${panelSwitch ? "text-white" : "text-gray-600"} cursor-pointer`}>
            Banned content
          </span>
        </h2>
        <div className="m-4 p-4 bg-gray-200 rounded-md">
          <h3 className="text-xl font-bold mb-2 cursor-default">Users</h3>
          {panelSwitch ? (
            bannedData?.bannedContent.users.map((u, i) => (
              <ModerationTile
                key={i}
                reportedId={u.id}
                title={u.username}
                reportType="user"
                onDecision={onDecision}
                onTileClick={() => { setExpandedTile({tileType: "user", tileId: u.username}) }}
                banned={true}
              />
            ))
          ) : (
            reportedData?.reportedContent.users.map((u, i) => (
              <ModerationTile
                key={i}
                reportedId={u.id}
                title={u.username}
                reportType="user"
                reportCount={u.reportCount}
                onDecision={onDecision}
                onTileClick={() => { setExpandedTile({tileType: "user", tileId: u.username}) }}
              />
            ))
          )}
        </div>
        <div className="m-4 p-4 bg-gray-200 rounded-md">
          <h3 className="text-xl font-bold mb-2 cursor-default">Publications</h3>
          {panelSwitch ? (
            bannedData?.bannedContent.publications.map((p, i) => (
              <ModerationTile
                key={i}
                reportedId={p.id}
                title={p.title}
                reportType="publication"
                onDecision={onDecision}
                onTileClick={() => { setExpandedTile({tileType: "publication", tileId: p.id}) }}
                banned={true}
              />
            ))
          ) : (
            reportedData?.reportedContent.publications.map((p, i) => (
              <ModerationTile
                key={i}
                reportedId={p.id}
                title={p.title}
                reportType="publication"
                reportCount={p.reportCount}
                onDecision={onDecision}
                onTileClick={() => { setExpandedTile({tileType: "publication", tileId: p.id}) }}
              />
            ))
          )}
        </div>
        <div className="m-4 p-4 bg-gray-200 rounded-md">
          <h3 className="text-xl font-bold mb-2 cursor-default">Comments</h3>
          {panelSwitch ? (
            bannedData?.bannedContent.comments.map((c, i) => (
              <ModerationTile
                key={i}
                reportedId={c.id}
                title={c.text}
                reportType="comment"
                onDecision={onDecision}
                onTileClick={() => { setExpandedTile({tileType: "publication", tileId: c.publication.id}) }}
                banned={true}
              />
            ))
          ) : (
            reportedData?.reportedContent.comments.map((c, i) => (
              <ModerationTile
                key={i}
                reportedId={c.id}
                title={c.text}
                reportType="comment"
                reportCount={c.reportCount}
                onDecision={onDecision}
                onTileClick={() => { setExpandedTile({tileType: "publication", tileId: c.publication.id}) }}
              />
            ))
          )}
        </div>
      </MainBlock>
      <MainBlock styleClass="w-full lg:w-1/3 h-96 lg:h-full overflow-y-auto">
        <div className="h-full overflow-y-auto">
          {expandedTile.tileType === "user" ? (
            <ProfilePublications
              username={expandedTile.tileId}
              onPublicationClick={(tileId) => { setExpandedTile({tileType: "publication", tileId}) }}
              isModerationContext={true}
            />
          ) : (
            <div>
              <TileExpanded
                tileId={expandedTile.tileId}
                isModerationContext={true}
                setExpandedAuthor={(username) => { setExpandedTile({tileType: "user", tileId: username}) }}
              />
              <AudioPlayer audio={expandedTile.tileId} />
            </div>
          )}
        </div>
      </MainBlock>
    </div>
  );
};

export default ModerationMain;
