import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import REVIEW_REPORT_MUTATION from "../../graphql/reviewReportMutation.ts";
import UNBAN_CONTENT_MUTATION from "../../graphql/unbanContentMutation.ts";
import ApproveIcon from "../../svg/ApproveIcon.tsx";
import CloseIcon from "../../svg/CloseIcon.tsx";

interface ModerationTileProps {
  reportedId: number;
  reportType: "user" | "publication" | "comment";
  title: string;
  reportCount: number;
  banned: boolean;
  onExpandTile: () => void;
  onDecision: () => void;
  onTileClick: () => void;
}

const ModerationTile = ({ reportedId, reportType, title, reportCount, banned=false, onDecision, onTileClick }: ModerationTileProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewReport, { loading: reviewLoading }] = useMutation(REVIEW_REPORT_MUTATION);
  const handleReview = (isSafe: boolean) => {
    setErrorMessage("");
    reviewReport({
      variables: {
        reportedId: +reportedId,
        reportType,
        isSafe
      },
      onCompleted: (data) => {
        if (data.reviewReport.success) onDecision();
      },
      onError: (err) => {
        setErrorMessage(err.message);
      },
    });
  };
  const [unbanContent, { loading: unbanLoading }] = useMutation(UNBAN_CONTENT_MUTATION);
  const handleUnban = () => {
    setErrorMessage("");
    unbanContent({
      variables: {
        bannedId: +reportedId,
        contentType: reportType,
      },
      onCompleted: (data) => {
        if (data.unbanContent.success) onDecision();
      },
      onError: (err) => {
        setErrorMessage(err.message);
      },
    });
  };

  return (
    <div
      onClick={onTileClick}
      className={`p-4 mb-4 ${banned ? "bg-red-200 text-red-800" : "bg-white text-gray-800"} rounded-lg shadow-md border-l-4 border-gray-300 hover:shadow-lg transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {reportCount && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded cursor-default">
              {reportCount} report{reportCount > 1 ? "s" : ""}
            </span>}
            <h3 className="text-lg font-semibold cursor-default">{title}</h3>
          </div>
        </div>
        {banned ? (
          <button
            onClick={handleUnban}
            disabled={unbanLoading}
            className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors flex items-center gap-1 ${unbanLoading ? "opacity-50" : ""}`}
          >
            {unbanLoading ? (
              "Unbanning..."
            ) : (
              <>
                <ApproveIcon />
                Unban
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => handleReview(true)}
              disabled={reviewLoading}
              className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors flex items-center gap-1 ${reviewLoading ? "opacity-50" : ""}`}
            >
              {reviewLoading ? (
                "Approving..."
              ) : (
                <>
                  <ApproveIcon />
                  Approve
                </>
              )}
            </button>
            <button
              onClick={() => handleReview(false)}
              disabled={reviewLoading}
              className={`px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors flex items-center gap-1 ${reviewLoading ? "opacity-50" : ""}`}
            >
              {reviewLoading ? (
                "Banning..."
              ) : (
                <>
                  <CloseIcon />
                  Ban
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
    </div>
  );
};

export default ModerationTile;
