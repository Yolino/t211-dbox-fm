import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import PUBLICATION_DETAIL_QUERY from "../../graphql/publicationDetailQuery.ts";
import CREATE_REPORT_MUTATION from "../../graphql/createReportMutation.ts"
import CommentMain from "./CommentMain.tsx";
import Alert from "../Alert.tsx";
import AudioIcon from "../../svg/AudioIcon.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

interface TileExpandedProps {
  tileId: number;
  showEditButton: boolean;
  isModerationContext: boolean;
  setExpandedAuthor: (username: string) => void | null; // Used in moderation context to display the author without navigating
  onRefreshBadge: () => void;
}

const TileExpanded = ({ tileId, showEditButton=true, isModerationContext=false, setExpandedAuthor=null, onRefreshBadge }: TileExpandedProps) => {
  const navigate = useNavigate();
  const { privileges } = usePrivileges();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createReport] = useMutation(CREATE_REPORT_MUTATION);
  const { loading, error, data } = useQuery(PUBLICATION_DETAIL_QUERY, {
    skip: !tileId,
    variables: { publicationId: +tileId },
  });
  const publication = data?.publication || {};

  const handleError = (message) => {
    setErrorMessage(message);
  };
  const handleReportPublication = async () => {
    if (!privileges?.isLoggedIn) {
      setErrorMessage("You must be logged in to submit reports");
      return;
    }
    try {
      const { data } = await createReport({
        variables: {
          reportedId: +tileId,
          contentType: "publication"
        }
      });

      if (data?.createReport?.success) {
        setSuccessMessage("Publication successfully reported");
        onRefreshBadge();
      } else {
        setErrorMessage("You have already reported this publication");
      }
    } catch (err) {
      setErrorMessage(`Error raised while submitting report : ${err.message}`);
    }
  };
  const handleReportAuthor = async () => {
    if (!privileges?.isLoggedIn) {
      setErrorMessage("You must be logged in to submit reports");
      return;
    }
    try {
      const { data } = await createReport({
        variables: {
          reportedId: +publication.author.id,
          contentType: "user"
        }
      });
      if (data?.createReport?.success) {
        setSuccessMessage("User successfully reported");
        onRefreshBadge();
      } else {
        setErrorMessage("You have already reported this user");
      }
    } catch (err) {
      setErrorMessage(`Error raised while submitting report : ${err.message}`);
    }
  };
  const handleReportComment = async (i) => {
    if (!privileges?.isLoggedIn) {
      setErrorMessage("You must be logged in to submit reports");
      return;
    }
    try {
      const { data } = await createReport({
        variables: {
          reportedId: +i,
          contentType: "comment"
        }
      });
      if (data?.createReport?.success) {
        setSuccessMessage("Comment successfully reported");
        onRefreshBadge();
      } else {
        setErrorMessage("You have already reported this comment");
      }
    } catch (err) {
      setErrorMessage(`Error raised while submitting report : ${err.message}`);
    }
  };

  if (loading) return <LoadingIcon />;
  const date = new Date(publication.createdAt);
  const formattedDatePublication = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

  if (!tileId) return null;
  return (
    <div className="flex gap-2 flex-col">
      <div className={`w-full p-6 ${publication.isBanned ? "bg-red-200" : "bg-gray-100"} rounded-lg shadow-md mt-4 animate-fade-in`}>
        {errorMessage && <Alert type="error" text={errorMessage} onClose={() => { setErrorMessage("") }} />}
        {error && <Alert type="error" text={error.message} />}
        {successMessage && <Alert type="success" text={successMessage} onClose={() => { setSuccessMessage("") }} />}
        <div className="flex gap-4">
        {(publication.cover) ? <img
            className="w-32 h-32 object-cover rounded-lg shadow-md"
            src={`http://localhost:8000${publication.cover}`}
            alt={`Cover for ${publication.title}`}
          /> : <div
            className="w-32 h-32 object-cover rounded-lg shadow-md flex flex-shrink-0 items-center justify-center"
          >
            <AudioIcon styleClass={`p-4 w-full h-full ${publication.isBanned ? "text-red-800" : "text-gray-800"}`} />
          </div>
        }
        <div className={`flex flex-col flex-1 ${publication.isBanned ? "text-red-800" : "text-gray-800"} gap-1`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold cursor-default break-all">{publication.title}</h2>
            {publication.isBanned ? (
              <span className="ml-1 px-2 py-1 bg-red-300 text-red-800 text-xs font-medium rounded">Publication banned</span>
            ) : (
              <button
                onClick={handleReportPublication}
                className="ml-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                title="Report this Publication"
              >
                Report Publication
              </button>
            )}
          </div>
          <div className="flex justify-between items-center">
            <p className="cursor-default">
              by <span 
                   className={`${!publication?.author?.isActive && "bg-red-200 p-1 rounded-md"} cursor-pointer`}
                   onClick={isModerationContext ? (
                    () => { setExpandedAuthor(publication?.author?.username) }
                   ) : (
                    () => { navigate(`/profile/${publication?.author?.username}`) }
                   )}
                  >
                   {publication?.author?.username}
                 </span> on {formattedDatePublication}
            </p>
            {publication?.author?.isActive ? (
              <button
                onClick={handleReportAuthor}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                title="Report the Author"
              >
                Report Author
              </button>
            ) : (
              <span className="ml-1 px-2 py-1 bg-red-300 text-red-800 text-xs font-medium rounded">Author banned</span>
            )}
          </div>
          <p className="text-sm mt-2 cursor-default">{publication?.description || "No description available."}</p>
          <p className="text-xs mt-2 cursor-default">{publication?.viewCount} {+publication.viewCount === 1 ? "view" : "views"} / {publication.voteCount} {+publication.voteCount === 1 ? "vote" : "votes"}</p>
          {publication.isOwner && showEditButton && <button
              onClick={() => { navigate(`/profile/${publication?.author?.username}`, {state: { expanded: tileId }}) }}
              className="text-sm font-bold mt-1 p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Edit Publication
          </button>}
        </div>
      </div>
    </div>
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md mt-4 animate-fade-in">
      <CommentMain publicationId={tileId} onSubmit={(message) => { setSuccessMessage(message); }} onError={handleError} onReportComment={handleReportComment} />
    </div>
    </div>
  );
};

export default TileExpanded;
