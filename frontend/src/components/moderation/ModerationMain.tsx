import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import REPORTED_CONTENT_QUERY from "../../graphql/reportedContentQuery.ts";
import BANNED_CONTENT_QUERY from "../../graphql/bannedContentQuery.ts";
import MainBlock from "../MainBlock.tsx";
import ModerationTile from "./ModerationTile.tsx";
import TileExpanded from "../tiles/TileExpanded.tsx";
import ProfilePublications from "../profile/ProfilePublications.tsx";
import AudioPlayer from "../AudioPlayer.tsx";
import Alert from "../Alert.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

interface ModerationMainProps {
  onRefreshBadge: () => void;
}

const ModerationMain = ({ onRefreshBadge }: ModerationMainProps) => {
  const navigate = useNavigate();
  const { privileges } = usePrivileges();
  const [expandedTile, setExpandedTile] = useState({
    tileType: null,
    tileId: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    onRefreshBadge();
  };

  useEffect(() => {
    if (notAllowed) {
      navigate("/", {state: { message: "This page does not exist" }});
    }
  }, [notAllowed, navigate])
  if (notAllowed) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-[calc(80vh)] min-h-96">
      {successMessage && <Alert type="success" text={successMessage} onClose={() => { setSuccessMessage(""); }} />}
      {errorMessage && <Alert type="error" text={errorMessage} onClose={() => { setErrorMessage(""); }} />}
      <MainBlock styleClass="w-full lg:w-2/3 h-96 lg:h-full overflow-y-auto">
        <div className="mb-6 flex gap-5">
          <h2 className="text-2xl font-bold text-white mb-4">Select View</h2>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPanelSwitch(false)}
              className={`px-4 py-2 text-sm font-medium border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!panelSwitch ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400'}`}
            >
              Content to review
            </button>
            <button
              type="button"
              onClick={() => setPanelSwitch(true)}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${panelSwitch ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400'}`}
            >
              Banned content
            </button>
          </div>
        </div>
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
                onSuccess={setSuccessMessage}
                onError={setErrorMessage}
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
                onSuccess={setSuccessMessage}
                onError={setErrorMessage}
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
                onSuccess={setSuccessMessage}
                onError={setErrorMessage}
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
                onSuccess={setSuccessMessage}
                onError={setErrorMessage}
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
                onSuccess={setSuccessMessage}
                onError={setErrorMessage}
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
                onSuccess={setSuccessMessage}
                onError={setErrorMessage}
                onTileClick={() => { setExpandedTile({tileType: "publication", tileId: c.publication.id}) }}
              />
            ))
          )}
        </div>
      </MainBlock>
      <MainBlock styleClass="w-full lg:w-1/3 h-96 lg:h-full overflow-y-auto">
        <div className="h-full overflow-y-auto">
          {expandedTile?.tileType === "user" ? (
            <ProfilePublications
              username={expandedTile.tileId}
              onPublicationClick={(tileId) => { setExpandedTile({tileType: "publication", tileId}) }}
              isModerationContext={true}
            />
          ) : (
            <div>
              <TileExpanded
                tileId={expandedTile.tileId}
                showEditButton={false}
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
