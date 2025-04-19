import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import PUBLICATION_DETAIL_QUERY from "../../graphql/publicationDetailQuery.ts";
import CREATE_REPORT_MUTATION from "../../graphql/createReportMutation.ts"
import CommentMain from "./CommentMain.tsx";
import AudioIcon from "../../svg/AudioIcon.tsx";

interface TileExpandedProps {
  tileId: number;
  showEditButton: boolean;
}

const TileExpanded = ({ tileId, showEditButton=true }: TileExpandedProps) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [createReport] = useMutation(CREATE_REPORT_MUTATION);
  const { loading, error, data } = useQuery(PUBLICATION_DETAIL_QUERY, {
    variables: { publicationId: +tileId },
  });
  const publication = data?.publication || {};

  const handleError = (err) => {
    setErrorMessage(err.message);
  };
  const handleReportPublication = async () => {
    try {
      const { data } = await createReport({
        variables: {
          reportedId: +tileId,
          contentType: "publication"
        }
      });

      if (data?.createReport?.success) {
        setReportMessage("Publication successfully reported");
      } else {
        setReportMessage("You have already reported this publication");
      }
    } catch (err) {
      setReportMessage(`Error raised while submitting report : ${err.message}`);
    }
  };
  const handleReportAuthor = async () => {
    try {
      const { data } = await createReport({
        variables: {
          reportedId: +publication.author.id,
          contentType: "user"
        }
      });
      if (data?.createReport?.success) {
        setReportMessage("User successfully reported");
      } else {
        setReportMessage("You have already reported this user");
      }
    } catch (err) {
      setReportMessage(`Error raised while submitting report : ${err.message}`);
    }
  };
  const handleReportComment = async (i) => {
    try {
      const { data } = await createReport({
        variables: {
          reportedId: +i,
          contentType: "comment"
        }
      });
      if (data?.createReport?.success) {
        setReportMessage("Comment successfully reported");
      } else {
        setReportMessage("You have already reported this comment");
      }
    } catch (err) {
      setReportMessage(`Error raised while submitting report : ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  const date = new Date(publication.createdAt);
  const formattedDatePublication = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

  return (
    <div className="flex gap-2 flex-col">
      <div className={`w-full p-6 ${publication.isBanned ? "bg-red-200" : "bg-gray-100"} rounded-lg shadow-md mt-4 animate-fade-in`}>
        {reportMessage && <p className="text-red-500">{reportMessage}</p>}
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
        <div className={`flex flex-col flex-1 ${publication.isBanned ? "text-red-800" : "text-gray-800"}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold cursor-default">{publication.title}</h2>
            {!publication.isBanned && <button
              onClick={handleReportPublication}
              className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
              title="Report this Publication"
            >
              Report Publication
            </button>}
          </div>
          <div className="flex justify-between items-center">
            <p className="cursor-default">
              by <span 
                   className={`${!publication.author.isActive && "bg-red-200 p-1 rounded-md"} cursor-pointer`}
                   onClick={() => { navigate(`/profile/${publication.author.username}`) }}>{publication.author.username}
                 </span> on {formattedDatePublication}
            </p>
            {publication.author.isActive && <button
              onClick={handleReportAuthor}
              className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
              title="Report the Author"
            >
              Report Author
            </button>}
          </div>
          <p className="text-sm mt-2 cursor-default">{publication.description || "No description available."}</p>
          <p className="text-xs mt-2 cursor-default">{publication.viewCount} {+publication.viewCount === 1 ? "view" : "views"}</p>
          <p className="text-xs mt-2 cursor-default">{publication.voteCount} {+publication.voteCount === 1 ? "vote" : "votes"}</p>
          {publication.isOwner && showEditButton && <button
              onClick={() => { navigate(`/profile/${publication.author.username}`, {state: { expanded: tileId }}) }}
              className="text-sm mt-1 p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Edit Publication
          </button>} 
        </div>
      </div>
    </div>
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md mt-4 animate-fade-in">
      <CommentMain publicationId={tileId} onError={handleError} onReportComment={handleReportComment} />
    </div>
    </div>
  );
};

export default TileExpanded;
